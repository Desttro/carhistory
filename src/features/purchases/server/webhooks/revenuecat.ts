import { uuid } from '@take-out/helpers'
import { getDb } from '~/database'
import { webhookEvent } from '~/database/schema-private'

import { processPurchase, processRefund } from '../orderProcessor'

type RevenueCatEventType =
  | 'INITIAL_PURCHASE'
  | 'NON_RENEWING_PURCHASE'
  | 'RENEWAL'
  | 'CANCELLATION'
  | 'UNCANCELLATION'
  | 'EXPIRATION'
  | 'BILLING_ISSUE'
  | 'PRODUCT_CHANGE'
  | 'SUBSCRIBER_ALIAS'
  | 'TRANSFER'

interface RevenueCatEvent {
  type: RevenueCatEventType
  id: string
  app_user_id: string
  original_app_user_id: string
  aliases?: string[]
  product_id: string
  price_in_purchased_currency?: number
  currency?: string
  transaction_id?: string
  original_transaction_id?: string
  cancel_reason?: string
  subscriber_attributes?: Record<string, { value: string; updated_at_ms: number }>
}

export interface RevenueCatWebhookPayload {
  api_version: string
  event: RevenueCatEvent
}

function isAnonymous(id: string) {
  return id.startsWith('$RCAnonymousID:')
}

function resolveUserId(event: RevenueCatEvent): string | null {
  if (event.app_user_id && !isAnonymous(event.app_user_id)) {
    return event.app_user_id
  }

  if (event.original_app_user_id && !isAnonymous(event.original_app_user_id)) {
    return event.original_app_user_id
  }

  if (event.aliases) {
    const alias = event.aliases.find((a) => !isAnonymous(a))
    if (alias) return alias
  }

  if (event.subscriber_attributes?.['$userId']?.value) {
    return event.subscriber_attributes['$userId'].value
  }

  return null
}

function priceInCents(price?: number): number | undefined {
  return price ? Math.round(price * 100) : undefined
}

async function handlePurchase(event: RevenueCatEvent, payload: RevenueCatWebhookPayload) {
  const userId = resolveUserId(event)
  if (!userId) {
    console.info(`[revenuecat] could not resolve user ID for event ${event.id}, skipping`)
    return
  }

  const transactionId = event.transaction_id || event.id

  const result = await processPurchase(
    userId,
    event.product_id,
    'revenuecat',
    transactionId,
    event.type,
    priceInCents(event.price_in_purchased_currency),
    event.currency,
    payload
  )

  if (!result.success && !result.alreadyProcessed) {
    console.info(`[revenuecat] failed to process purchase: ${result.error}`)
  }
}

async function handleRefund(event: RevenueCatEvent, payload: RevenueCatWebhookPayload) {
  const userId = resolveUserId(event)
  if (!userId) {
    console.info(
      `[revenuecat] could not resolve user ID for refund ${event.id}, skipping`
    )
    return
  }

  const originalTransactionId =
    event.original_transaction_id || event.transaction_id || event.id
  const refundTransactionId = `${event.id}-refund`

  const result = await processRefund(
    userId,
    event.product_id,
    'revenuecat',
    originalTransactionId,
    refundTransactionId,
    event.type,
    priceInCents(event.price_in_purchased_currency),
    event.currency,
    payload
  )

  if (!result.success && !result.alreadyProcessed) {
    console.info(`[revenuecat] failed to process refund: ${result.error}`)
  }
}

async function storeWebhookEvent(
  event: RevenueCatEvent,
  processedAction: string | null,
  rawPayload: unknown
) {
  try {
    const db = getDb()
    const userId = resolveUserId(event)
    await db
      .insert(webhookEvent)
      .values({
        id: uuid(),
        provider: 'revenuecat',
        eventType: event.type,
        externalEventId: event.id,
        userId,
        processed: !!processedAction,
        processedAction,
        rawPayload: rawPayload as Record<string, unknown>,
      })
      .onConflictDoNothing()
  } catch (error) {
    // best-effort — don't fail the webhook handler
    console.info('[revenuecat] failed to store webhook event:', error)
  }
}

export async function handleRevenueCatWebhook(
  payload: RevenueCatWebhookPayload
): Promise<{ success: boolean; error?: string }> {
  const { event } = payload

  console.info(`[revenuecat] received event: ${event.type} for ${event.app_user_id}`)

  switch (event.type) {
    case 'INITIAL_PURCHASE':
    case 'NON_RENEWING_PURCHASE':
    case 'RENEWAL':
      await handlePurchase(event, payload)
      await storeWebhookEvent(event, 'purchase', payload)
      break

    case 'CANCELLATION':
      await handleRefund(event, payload)
      await storeWebhookEvent(event, 'refund', payload)
      break

    case 'TRANSFER':
      console.info(
        `[revenuecat] user transfer: ${event.original_app_user_id} -> ${event.app_user_id}`
      )
      await storeWebhookEvent(event, 'ignored', payload)
      break

    case 'EXPIRATION':
      console.info(
        `[revenuecat] expiration for ${event.app_user_id}, product: ${event.product_id}`
      )
      await storeWebhookEvent(event, 'ignored', payload)
      break

    case 'BILLING_ISSUE':
      console.info(
        `[revenuecat] billing issue for ${event.app_user_id}, product: ${event.product_id}`
      )
      await storeWebhookEvent(event, 'ignored', payload)
      break

    case 'SUBSCRIBER_ALIAS':
    case 'UNCANCELLATION':
    case 'PRODUCT_CHANGE':
      console.info(
        `[revenuecat] ${event.type} for ${event.app_user_id}, no action needed`
      )
      await storeWebhookEvent(event, 'ignored', payload)
      break

    default:
      console.info(`[revenuecat] unknown event type: ${event.type}`)
      await storeWebhookEvent(event, null, payload)
  }

  return { success: true }
}
