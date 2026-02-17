import { eq, sql, and, gte } from 'drizzle-orm'

import { getDb } from '~/database'
import { creditTransaction } from '~/database/schema-private'
import { userCredits } from '~/database/schema-public'

import type { AuthData } from '~/features/auth/types'

export type CreditTransactionType =
  | 'purchase'
  | 'refund'
  | 'admin_grant'
  | 'report_purchase'

export type PaymentPlatform = 'polar' | 'revenuecat'

export interface PaymentMetadata {
  platform: PaymentPlatform
  platformTransactionId: string
  platformEventType: string
  productId: string
  amountCents?: number
  currency?: string
  rawPayload?: unknown
}

interface DeductCreditsResult {
  success: boolean
  newBalance?: number
  error?: string
}

interface AddCreditsResult {
  success: boolean
  newBalance?: number
  error?: string
}

export const creditsActions = {
  getBalance,
  deductCredits,
  addCredits,
  addCreditsByUserId,
  deductCreditsByUserId,
  ensureUserCreditsExist,
}

async function ensureUserCreditsExist(userId: string): Promise<void> {
  const db = getDb()

  await db
    .insert(userCredits)
    .values({
      id: crypto.randomUUID(),
      userId,
      balance: 0,
    })
    .onConflictDoNothing({ target: userCredits.userId })
}

async function getBalance(authData: AuthData): Promise<number> {
  if (!authData?.id) {
    return 0
  }

  const db = getDb()
  const userId = authData.id

  await ensureUserCreditsExist(userId)

  const result = await db
    .select({ balance: userCredits.balance })
    .from(userCredits)
    .where(eq(userCredits.userId, userId))
    .limit(1)

  return result[0]?.balance ?? 0
}

// atomic credit addition
async function _addCredits(
  userId: string,
  amount: number,
  type: CreditTransactionType,
  referenceId?: string,
  description?: string,
  paymentMetadata?: PaymentMetadata
): Promise<AddCreditsResult> {
  if (!userId) {
    return { success: false, error: 'User ID required' }
  }

  if (amount <= 0) {
    return { success: false, error: 'Amount must be positive' }
  }

  const db = getDb()

  await ensureUserCreditsExist(userId)

  const result = await db
    .update(userCredits)
    .set({
      balance: sql`${userCredits.balance} + ${amount}`,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(userCredits.userId, userId))
    .returning({ balance: userCredits.balance })

  const newBalance = result[0]?.balance ?? 0

  await db.insert(creditTransaction).values({
    id: crypto.randomUUID(),
    userId,
    amount,
    type,
    referenceId,
    description,
    platform: paymentMetadata?.platform ?? null,
    platformTransactionId: paymentMetadata?.platformTransactionId ?? null,
    platformEventType: paymentMetadata?.platformEventType ?? null,
    productId: paymentMetadata?.productId ?? null,
    amountCents: paymentMetadata?.amountCents ?? null,
    currency: paymentMetadata?.currency ?? null,
    rawPayload: paymentMetadata?.rawPayload ?? null,
  })

  return { success: true, newBalance }
}

// atomic credit deduction with balance check
async function _deductCredits(
  userId: string,
  amount: number,
  type: CreditTransactionType,
  referenceId?: string,
  description?: string,
  paymentMetadata?: PaymentMetadata
): Promise<DeductCreditsResult> {
  if (!userId) {
    return { success: false, error: 'User ID required' }
  }

  if (amount <= 0) {
    return { success: false, error: 'Amount must be positive' }
  }

  const db = getDb()

  await ensureUserCreditsExist(userId)

  // atomic: deduct only if balance is sufficient
  const result = await db
    .update(userCredits)
    .set({
      balance: sql`${userCredits.balance} - ${amount}`,
      updatedAt: new Date().toISOString(),
    })
    .where(and(eq(userCredits.userId, userId), gte(userCredits.balance, amount)))
    .returning({ balance: userCredits.balance })

  if (result.length === 0) {
    return { success: false, error: 'Insufficient credits' }
  }

  const newBalance = result[0].balance

  await db.insert(creditTransaction).values({
    id: crypto.randomUUID(),
    userId,
    amount: -amount,
    type,
    referenceId,
    description,
    platform: paymentMetadata?.platform ?? null,
    platformTransactionId: paymentMetadata?.platformTransactionId ?? null,
    platformEventType: paymentMetadata?.platformEventType ?? null,
    productId: paymentMetadata?.productId ?? null,
    amountCents: paymentMetadata?.amountCents ?? null,
    currency: paymentMetadata?.currency ?? null,
    rawPayload: paymentMetadata?.rawPayload ?? null,
  })

  return { success: true, newBalance }
}

async function addCredits(
  authData: AuthData,
  amount: number,
  type: CreditTransactionType,
  referenceId?: string,
  description?: string,
  paymentMetadata?: PaymentMetadata
): Promise<AddCreditsResult> {
  if (!authData?.id) {
    return { success: false, error: 'Authentication required' }
  }
  return _addCredits(authData.id, amount, type, referenceId, description, paymentMetadata)
}

async function addCreditsByUserId(
  userId: string,
  amount: number,
  type: CreditTransactionType,
  referenceId?: string,
  description?: string,
  paymentMetadata?: PaymentMetadata
): Promise<AddCreditsResult> {
  return _addCredits(userId, amount, type, referenceId, description, paymentMetadata)
}

async function deductCredits(
  authData: AuthData,
  amount: number,
  type: CreditTransactionType,
  referenceId?: string,
  description?: string
): Promise<DeductCreditsResult> {
  if (!authData?.id) {
    return { success: false, error: 'Authentication required' }
  }
  return _deductCredits(authData.id, amount, type, referenceId, description)
}

async function deductCreditsByUserId(
  userId: string,
  amount: number,
  type: CreditTransactionType,
  referenceId?: string,
  description?: string,
  paymentMetadata?: PaymentMetadata
): Promise<DeductCreditsResult> {
  return _deductCredits(userId, amount, type, referenceId, description, paymentMetadata)
}
