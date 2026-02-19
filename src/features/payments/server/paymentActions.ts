import { eq, and } from 'drizzle-orm'

import { getDb } from '~/database'
import { creditTransaction, order, productProvider } from '~/database/schema-private'
import { product } from '~/database/schema-public'
import {
  creditsActions,
  type PaymentMetadata,
  type PaymentPlatform,
} from '~/features/credits/server/creditsActions'

import type { Platform } from '../constants'

export interface PurchaseResult {
  success: boolean
  creditsAdded?: number
  newBalance?: number
  error?: string
  alreadyProcessed?: boolean
}

export interface RefundResult {
  success: boolean
  creditsDeducted?: number
  newBalance?: number
  error?: string
  alreadyProcessed?: boolean
}

// resolve a product from external provider product ID
async function resolveProduct(externalProductId: string, provider: string) {
  const db = getDb()
  const rows = await db
    .select({ credits: product.credits, productId: product.id })
    .from(productProvider)
    .innerJoin(product, eq(product.id, productProvider.productId))
    .where(
      and(
        eq(productProvider.provider, provider),
        eq(productProvider.externalProductId, externalProductId)
      )
    )
    .limit(1)
  return rows[0] ?? null
}

// check if a transaction has already been processed (idempotency)
export async function isTransactionProcessed(
  platform: PaymentPlatform,
  platformTransactionId: string
): Promise<boolean> {
  const db = getDb()

  const existing = await db
    .select({ id: creditTransaction.id })
    .from(creditTransaction)
    .where(
      and(
        eq(creditTransaction.platform, platform),
        eq(creditTransaction.platformTransactionId, platformTransactionId)
      )
    )
    .limit(1)

  return existing.length > 0
}

// process a credit purchase from a payment webhook
export async function processPurchase(
  userId: string,
  productId: string,
  platform: Platform,
  platformTransactionId: string,
  platformEventType: string,
  amountCents?: number,
  currency?: string,
  rawPayload?: unknown
): Promise<PurchaseResult> {
  // idempotency check
  const alreadyProcessed = await isTransactionProcessed(platform, platformTransactionId)
  if (alreadyProcessed) {
    console.info(
      `[payments] skipping duplicate transaction: ${platform}/${platformTransactionId}`
    )
    return { success: true, alreadyProcessed: true }
  }

  // resolve credits from product ID via database
  const resolved = await resolveProduct(productId, platform)
  if (!resolved) {
    console.info(`[payments] unknown product ID: ${productId} for ${platform}`)
    return { success: false, error: `Unknown product ID: ${productId}` }
  }

  const paymentMetadata: PaymentMetadata = {
    platform,
    platformTransactionId,
    platformEventType,
    productId,
    amountCents,
    currency,
    rawPayload,
  }

  const result = await creditsActions.addCreditsByUserId(
    userId,
    resolved.credits,
    'purchase',
    platformTransactionId,
    `${resolved.credits} credits purchased via ${platform}`,
    paymentMetadata
  )

  if (!result.success) {
    return { success: false, error: result.error }
  }

  // create order record
  const db = getDb()
  await db.insert(order).values({
    id: crypto.randomUUID(),
    userId,
    productId: resolved.productId,
    type: 'purchase',
    status: 'completed',
    credits: resolved.credits,
    amountCents: amountCents ?? null,
    currency: currency ?? null,
    provider: platform,
    providerOrderId: platformTransactionId,
    providerEventType: platformEventType,
    rawPayload: rawPayload as Record<string, unknown> | null,
    createdAt: new Date().toISOString(),
  })

  console.info(
    `[payments] added ${resolved.credits} credits for user ${userId} via ${platform}`
  )

  return {
    success: true,
    creditsAdded: resolved.credits,
    newBalance: result.newBalance,
  }
}

// process a refund from a payment webhook
export async function processRefund(
  userId: string,
  productId: string,
  platform: Platform,
  originalTransactionId: string,
  refundTransactionId: string,
  platformEventType: string,
  amountCents?: number,
  currency?: string,
  rawPayload?: unknown
): Promise<RefundResult> {
  // idempotency check using refund transaction ID
  const alreadyProcessed = await isTransactionProcessed(platform, refundTransactionId)
  if (alreadyProcessed) {
    console.info(
      `[payments] skipping duplicate refund: ${platform}/${refundTransactionId}`
    )
    return { success: true, alreadyProcessed: true }
  }

  // resolve credits from product ID via database
  const resolved = await resolveProduct(productId, platform)
  if (!resolved) {
    console.info(`[payments] unknown product ID for refund: ${productId}`)
    return { success: false, error: `Unknown product ID: ${productId}` }
  }

  const paymentMetadata: PaymentMetadata = {
    platform,
    platformTransactionId: refundTransactionId,
    platformEventType,
    productId,
    amountCents: amountCents ? -amountCents : undefined,
    currency,
    rawPayload,
  }

  const result = await creditsActions.deductCreditsByUserId(
    userId,
    resolved.credits,
    'refund',
    originalTransactionId,
    `${resolved.credits} credits refunded via ${platform}`,
    paymentMetadata
  )

  if (!result.success) {
    // if insufficient credits, still log it but don't fail the webhook
    console.info(`[payments] refund deduction failed for user ${userId}: ${result.error}`)
    return {
      success: true,
      error: result.error,
      creditsDeducted: 0,
      newBalance: result.newBalance,
    }
  }

  // create order record for refund
  const db = getDb()
  await db.insert(order).values({
    id: crypto.randomUUID(),
    userId,
    productId: resolved.productId,
    type: 'refund',
    status: 'completed',
    credits: resolved.credits,
    amountCents: amountCents ? -amountCents : null,
    currency: currency ?? null,
    provider: platform,
    providerOrderId: refundTransactionId,
    providerEventType: platformEventType,
    rawPayload: rawPayload as Record<string, unknown> | null,
    createdAt: new Date().toISOString(),
  })

  console.info(
    `[payments] deducted ${resolved.credits} credits from user ${userId} due to refund`
  )

  return {
    success: true,
    creditsDeducted: resolved.credits,
    newBalance: result.newBalance,
  }
}
