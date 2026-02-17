import { processPurchase, processRefund } from './paymentActions'

// RevenueCat webhook event types
// https://www.revenuecat.com/docs/integrations/webhooks/event-types-and-fields
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

interface RevenueCatWebhookPayload {
  api_version: string
  event: {
    type: RevenueCatEventType
    id: string
    app_user_id: string
    original_app_user_id: string
    aliases?: string[]
    product_id: string
    entitlement_ids?: string[]
    period_type?: string
    purchased_at_ms?: number
    expiration_at_ms?: number
    store?: string
    environment?: string
    is_family_share?: boolean
    country_code?: string
    price_in_purchased_currency?: number
    currency?: string
    transaction_id?: string
    original_transaction_id?: string
    cancel_reason?: string
    subscriber_attributes?: Record<string, { value: string; updated_at_ms: number }>
  }
}

// resolve user ID from RevenueCat webhook payload
function resolveUserId(event: RevenueCatWebhookPayload['event']): string | null {
  // try app_user_id first (usually set to our user ID)
  if (event.app_user_id && !event.app_user_id.startsWith('$RCAnonymousID:')) {
    return event.app_user_id
  }

  // then try original_app_user_id
  if (
    event.original_app_user_id &&
    !event.original_app_user_id.startsWith('$RCAnonymousID:')
  ) {
    return event.original_app_user_id
  }

  // then check aliases
  if (event.aliases) {
    const nonAnonymousAlias = event.aliases.find((a) => !a.startsWith('$RCAnonymousID:'))
    if (nonAnonymousAlias) {
      return nonAnonymousAlias
    }
  }

  // check subscriber attributes for userId
  if (event.subscriber_attributes?.['$userId']?.value) {
    return event.subscriber_attributes['$userId'].value
  }

  return null
}

export async function handleRevenueCatWebhook(
  payload: RevenueCatWebhookPayload
): Promise<{ success: boolean; error?: string }> {
  const event = payload.event

  console.info(`[revenuecat] received event: ${event.type} for ${event.app_user_id}`)

  // only handle consumable purchases (NON_RENEWING_PURCHASE)
  if (event.type === 'NON_RENEWING_PURCHASE' || event.type === 'INITIAL_PURCHASE') {
    const userId = resolveUserId(event)
    if (!userId) {
      console.info(
        `[revenuecat] could not resolve user ID for event ${event.id}, skipping`
      )
      return { success: true } // don't fail the webhook
    }

    const transactionId = event.transaction_id || event.id

    const result = await processPurchase(
      userId,
      event.product_id,
      'revenuecat',
      transactionId,
      event.type,
      event.price_in_purchased_currency
        ? Math.round(event.price_in_purchased_currency * 100)
        : undefined,
      event.currency,
      payload
    )

    if (!result.success && !result.alreadyProcessed) {
      console.info(`[revenuecat] failed to process purchase: ${result.error}`)
    }

    return { success: true }
  }

  // handle refunds/cancellations
  if (event.type === 'CANCELLATION') {
    // only process customer-support-initiated refunds for consumables
    if (event.cancel_reason === 'CUSTOMER_SUPPORT') {
      const userId = resolveUserId(event)
      if (!userId) {
        console.info(
          `[revenuecat] could not resolve user ID for refund ${event.id}, skipping`
        )
        return { success: true }
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
        event.price_in_purchased_currency
          ? Math.round(event.price_in_purchased_currency * 100)
          : undefined,
        event.currency,
        payload
      )

      if (!result.success && !result.alreadyProcessed) {
        console.info(`[revenuecat] failed to process refund: ${result.error}`)
      }
    }

    return { success: true }
  }

  // ignore other event types
  console.info(`[revenuecat] ignoring event type: ${event.type}`)
  return { success: true }
}
