import { eq } from 'drizzle-orm'

import { getDb } from '~/database'
import { userCredits, creditTransaction } from '~/database/schema-public'

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

  const existing = await db
    .select()
    .from(userCredits)
    .where(eq(userCredits.userId, userId))
    .limit(1)

  if (existing.length === 0) {
    await db.insert(userCredits).values({
      id: crypto.randomUUID(),
      userId,
      balance: 0,
    })
  }
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

  if (amount <= 0) {
    return { success: false, error: 'Amount must be positive' }
  }

  const db = getDb()
  const userId = authData.id

  await ensureUserCreditsExist(userId)

  const currentCredits = await db
    .select({ balance: userCredits.balance })
    .from(userCredits)
    .where(eq(userCredits.userId, userId))
    .limit(1)

  const currentBalance = currentCredits[0]?.balance ?? 0

  if (currentBalance < amount) {
    return { success: false, error: 'Insufficient credits' }
  }

  const newBalance = currentBalance - amount

  await db
    .update(userCredits)
    .set({
      balance: newBalance,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(userCredits.userId, userId))

  await db.insert(creditTransaction).values({
    id: crypto.randomUUID(),
    userId,
    amount: -amount,
    type,
    referenceId,
    description,
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

  if (amount <= 0) {
    return { success: false, error: 'Amount must be positive' }
  }

  const db = getDb()
  const userId = authData.id

  await ensureUserCreditsExist(userId)

  const currentCredits = await db
    .select({ balance: userCredits.balance })
    .from(userCredits)
    .where(eq(userCredits.userId, userId))
    .limit(1)

  const currentBalance = currentCredits[0]?.balance ?? 0
  const newBalance = currentBalance + amount

  await db
    .update(userCredits)
    .set({
      balance: newBalance,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(userCredits.userId, userId))

  await db.insert(creditTransaction).values({
    id: crypto.randomUUID(),
    userId,
    amount,
    type,
    referenceId,
    description,
    // payment metadata fields (null for non-payment transactions)
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

// add credits by userId directly (for webhook handlers without auth context)
async function addCreditsByUserId(
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

  const currentCredits = await db
    .select({ balance: userCredits.balance })
    .from(userCredits)
    .where(eq(userCredits.userId, userId))
    .limit(1)

  const currentBalance = currentCredits[0]?.balance ?? 0
  const newBalance = currentBalance + amount

  await db
    .update(userCredits)
    .set({
      balance: newBalance,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(userCredits.userId, userId))

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

// deduct credits by userId directly (for refund webhook handlers)
async function deductCreditsByUserId(
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

  const currentCredits = await db
    .select({ balance: userCredits.balance })
    .from(userCredits)
    .where(eq(userCredits.userId, userId))
    .limit(1)

  const currentBalance = currentCredits[0]?.balance ?? 0

  if (currentBalance < amount) {
    return { success: false, error: 'Insufficient credits' }
  }

  const newBalance = currentBalance - amount

  await db
    .update(userCredits)
    .set({
      balance: newBalance,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(userCredits.userId, userId))

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
