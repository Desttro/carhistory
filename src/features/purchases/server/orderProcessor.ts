import { sql, eq, and, gte } from 'drizzle-orm'

import { analyticsActions } from '~/data/server/actions/analyticsActions'
import { getDb } from '~/database'
import { creditTransaction, order } from '~/database/schema-private'
import { userCredits } from '~/database/schema-public'

import { ensureUserCreditsExist } from './creditOperations'
import { isTransactionProcessed, resolveProduct } from './productQueries'

import type { Provider, PaymentMetadata, PurchaseResult, RefundResult } from '../types'

// atomic: balance + transaction + order in a single db.transaction
export async function processPurchase(
  userId: string,
  productId: string,
  provider: Provider,
  providerTransactionId: string,
  providerEventType: string,
  amountCents?: number,
  currency?: string,
  rawPayload?: unknown
): Promise<PurchaseResult> {
  // idempotency check (read-only, outside txn)
  const alreadyProcessed = await isTransactionProcessed(provider, providerTransactionId)
  if (alreadyProcessed) {
    console.info(
      `[purchases] skipping duplicate transaction: ${provider}/${providerTransactionId}`
    )
    return { success: true, alreadyProcessed: true }
  }

  // resolve credits from product ID via database (read-only, outside txn)
  const resolved = await resolveProduct(productId, provider)
  if (!resolved) {
    console.info(`[purchases] unknown product ID: ${productId} for ${provider}`)
    return { success: false, error: `Unknown product ID: ${productId}` }
  }

  await ensureUserCreditsExist(userId)

  const db = getDb()

  // atomic: balance + transaction + order in a single db.transaction
  const result = await db.transaction(async (tx) => {
    const balanceResult = await tx
      .update(userCredits)
      .set({
        balance: sql`${userCredits.balance} + ${resolved.credits}`,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(userCredits.userId, userId))
      .returning({ balance: userCredits.balance })

    const newBalance = balanceResult[0]?.balance ?? 0

    const creditTxId = crypto.randomUUID()
    await tx.insert(creditTransaction).values({
      id: creditTxId,
      userId,
      amount: resolved.credits,
      type: 'purchase',
      referenceId: providerTransactionId,
      description: `${resolved.credits} credits purchased via ${provider}`,
      platform: provider,
      platformTransactionId: providerTransactionId,
      platformEventType: providerEventType,
      productId,
      amountCents: amountCents ?? null,
      currency: currency ?? null,
      rawPayload: rawPayload ?? null,
    })

    await tx.insert(order).values({
      id: crypto.randomUUID(),
      userId,
      productId: resolved.productId,
      type: 'purchase',
      status: 'completed',
      credits: resolved.credits,
      amountCents: amountCents ?? null,
      currency: currency ?? null,
      provider,
      providerOrderId: providerTransactionId,
      providerEventType,
      creditTransactionId: creditTxId,
      rawPayload: rawPayload as Record<string, unknown> | null,
      createdAt: new Date().toISOString(),
    })

    return { newBalance }
  })

  // analytics (best-effort, outside txn)
  analyticsActions().logEvent(userId, 'credits_purchased', {
    userId,
    credits: resolved.credits,
    platform: provider,
    amountCents,
  })

  console.info(
    `[purchases] added ${resolved.credits} credits for user ${userId} via ${provider}`
  )

  return {
    success: true,
    creditsAdded: resolved.credits,
    newBalance: result.newBalance,
  }
}

// atomic: balance + transaction + order in a single db.transaction
export async function processRefund(
  userId: string,
  productId: string,
  provider: Provider,
  originalTransactionId: string,
  refundTransactionId: string,
  providerEventType: string,
  amountCents?: number,
  currency?: string,
  rawPayload?: unknown
): Promise<RefundResult> {
  // idempotency check using refund transaction ID
  const alreadyProcessed = await isTransactionProcessed(provider, refundTransactionId)
  if (alreadyProcessed) {
    console.info(
      `[purchases] skipping duplicate refund: ${provider}/${refundTransactionId}`
    )
    return { success: true, alreadyProcessed: true }
  }

  // resolve credits from product ID via database
  const resolved = await resolveProduct(productId, provider)
  if (!resolved) {
    console.info(`[purchases] unknown product ID for refund: ${productId}`)
    return { success: false, error: `Unknown product ID: ${productId}` }
  }

  await ensureUserCreditsExist(userId)

  const db = getDb()

  // atomic: balance + transaction + order in a single db.transaction
  const result = await db.transaction(async (tx) => {
    // deduct only if balance is sufficient
    const balanceResult = await tx
      .update(userCredits)
      .set({
        balance: sql`${userCredits.balance} - ${resolved.credits}`,
        updatedAt: new Date().toISOString(),
      })
      .where(and(eq(userCredits.userId, userId), gte(userCredits.balance, resolved.credits)))
      .returning({ balance: userCredits.balance })

    if (balanceResult.length === 0) {
      // insufficient credits — still log the refund attempt but return failure
      console.info(`[purchases] refund deduction failed for user ${userId}: insufficient credits`)
      return { success: false as const, creditsDeducted: 0 }
    }

    const newBalance = balanceResult[0].balance
    const creditTxId = crypto.randomUUID()

    await tx.insert(creditTransaction).values({
      id: creditTxId,
      userId,
      amount: -resolved.credits,
      type: 'refund',
      referenceId: originalTransactionId,
      description: `${resolved.credits} credits refunded via ${provider}`,
      platform: provider,
      platformTransactionId: refundTransactionId,
      platformEventType: providerEventType,
      productId,
      amountCents: amountCents ? -amountCents : null,
      currency: currency ?? null,
      rawPayload: rawPayload ?? null,
    })

    await tx.insert(order).values({
      id: crypto.randomUUID(),
      userId,
      productId: resolved.productId,
      type: 'refund',
      status: 'completed',
      credits: resolved.credits,
      amountCents: amountCents ? -amountCents : null,
      currency: currency ?? null,
      provider,
      providerOrderId: refundTransactionId,
      providerEventType,
      creditTransactionId: creditTxId,
      rawPayload: rawPayload as Record<string, unknown> | null,
      createdAt: new Date().toISOString(),
    })

    return { success: true as const, newBalance, creditsDeducted: resolved.credits }
  })

  if (!result.success) {
    return { success: false, error: 'Insufficient credits', creditsDeducted: 0 }
  }

  // analytics (best-effort, outside txn)
  analyticsActions().logEvent(userId, 'credits_refunded', {
    userId,
    credits: resolved.credits,
    platform: provider,
  })

  console.info(
    `[purchases] deducted ${resolved.credits} credits from user ${userId} due to refund`
  )

  return {
    success: true,
    creditsDeducted: result.creditsDeducted,
    newBalance: result.newBalance,
  }
}
