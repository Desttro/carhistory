import { processPurchase, processRefund } from './paymentActions'

import type { WebhookOrderPaidPayload } from '@polar-sh/sdk/models/components/webhookorderpaidpayload'
import type { WebhookOrderRefundedPayload } from '@polar-sh/sdk/models/components/webhookorderrefundedpayload'

// handler for Polar order.paid webhook
export async function handleOrderPaid(payload: WebhookOrderPaidPayload) {
  const order = payload.data

  // skip subscription renewals - only process one-time purchases
  if (order.billingReason !== 'purchase') {
    console.info(
      `[polar] skipping non-purchase order: ${order.id} (reason: ${order.billingReason})`
    )
    return
  }

  // get user ID from customer's external_id (set by createCustomerOnSignUp)
  const userId = order.customer.externalId
  if (!userId) {
    console.info(`[polar] order ${order.id} has no customer external_id, skipping`)
    return
  }

  // use order-level productId for one-time purchases
  const productId = order.productId
  if (!productId) {
    console.info(`[polar] order ${order.id} has no productId, skipping`)
    return
  }

  const result = await processPurchase(
    userId,
    productId,
    'polar',
    order.id,
    'order.paid',
    order.totalAmount,
    order.currency,
    payload
  )

  if (!result.success && !result.alreadyProcessed) {
    console.info(`[polar] failed to process order ${order.id}: ${result.error}`)
  }
}

// handler for Polar order.refunded webhook
export async function handleOrderRefunded(payload: WebhookOrderRefundedPayload) {
  const order = payload.data

  const userId = order.customer.externalId
  if (!userId) {
    console.info(
      `[polar] refund for order ${order.id} has no customer external_id, skipping`
    )
    return
  }

  // use order-level productId for one-time purchases
  const productId = order.productId
  if (!productId) {
    console.info(`[polar] refund for order ${order.id} has no productId, skipping`)
    return
  }

  const result = await processRefund(
    userId,
    productId,
    'polar',
    order.id,
    `${order.id}-refund`,
    'order.refunded',
    order.totalAmount,
    order.currency,
    payload
  )

  if (!result.success && !result.alreadyProcessed) {
    console.info(
      `[polar] failed to process refund for order ${order.id}: ${result.error}`
    )
  }
}
