import { eq, and } from 'drizzle-orm'

import { getDb } from '~/database'
import { creditTransaction } from '~/database/schema-private'
import {
  creditsActions,
  type PaymentMetadata,
  type PaymentPlatform,
} from '~/features/credits/server/creditsActions'

import { getCreditsForProduct, type Platform } from '../constants'

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

  // resolve credits from product ID
  const credits = getCreditsForProduct(productId, platform)
  if (!credits) {
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
    credits,
    'purchase',
    platformTransactionId,
    `${credits} credits purchased via ${platform}`,
    paymentMetadata
  )

  if (!result.success) {
    return { success: false, error: result.error }
  }

  console.info(`[payments] added ${credits} credits for user ${userId} via ${platform}`)

  return {
    success: true,
    creditsAdded: credits,
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

  // resolve credits from product ID
  const credits = getCreditsForProduct(productId, platform)
  if (!credits) {
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
    credits,
    'refund',
    originalTransactionId,
    `${credits} credits refunded via ${platform}`,
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

  console.info(`[payments] deducted ${credits} credits from user ${userId} due to refund`)

  return {
    success: true,
    creditsDeducted: credits,
    newBalance: result.newBalance,
  }
}
