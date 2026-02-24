import { getDb } from '~/database'
import { webhookEvent } from '~/database/schema-private'

import { processPurchase, processRefund } from '../orderProcessor'
import { syncPolarProductFromWebhook } from '../productSync'

import type { WebhookOrderPaidPayload } from '@polar-sh/sdk/models/components/webhookorderpaidpayload'
import type { WebhookOrderRefundedPayload } from '@polar-sh/sdk/models/components/webhookorderrefundedpayload'
import type { WebhookProductCreatedPayload } from '@polar-sh/sdk/models/components/webhookproductcreatedpayload'
import type { WebhookProductUpdatedPayload } from '@polar-sh/sdk/models/components/webhookproductupdatedpayload'

async function storeWebhookEvent(
  eventType: string,
  externalEventId: string | null,
  userId: string | null,
  processedAction: string | null,
  rawPayload: unknown
) {
  try {
    const db = getDb()
    await db
      .insert(webhookEvent)
      .values({
        id: crypto.randomUUID(),
        provider: 'polar',
        eventType,
        externalEventId,
        userId,
        processed: !!processedAction,
        processedAction,
        rawPayload: rawPayload as Record<string, unknown>,
      })
      .onConflictDoNothing()
  } catch (error) {
    // best-effort — don't fail the webhook handler
    console.info('[polar] failed to store webhook event:', error)
  }
}

export async function handleOrderPaid(payload: WebhookOrderPaidPayload) {
  const order = payload.data

  // skip subscription renewals - only process one-time purchases
  if (order.billingReason !== 'purchase') {
    console.info(
      `[polar] skipping non-purchase order: ${order.id} (reason: ${order.billingReason})`
    )
    await storeWebhookEvent('order.paid', order.id, order.customer.externalId, 'ignored', payload)
    return
  }

  const userId = order.customer.externalId
  if (!userId) {
    console.info(`[polar] order ${order.id} has no customer external_id, skipping`)
    await storeWebhookEvent('order.paid', order.id, null, 'ignored', payload)
    return
  }

  const productId = order.productId
  if (!productId) {
    console.info(`[polar] order ${order.id} has no productId, skipping`)
    await storeWebhookEvent('order.paid', order.id, userId, 'ignored', payload)
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

  await storeWebhookEvent('order.paid', order.id, userId, 'purchase', payload)

  if (!result.success && !result.alreadyProcessed) {
    console.info(`[polar] failed to process order ${order.id}: ${result.error}`)
  }
}

export async function handleOrderRefunded(payload: WebhookOrderRefundedPayload) {
  const order = payload.data

  const userId = order.customer.externalId
  if (!userId) {
    console.info(
      `[polar] refund for order ${order.id} has no customer external_id, skipping`
    )
    await storeWebhookEvent('order.refunded', order.id, null, 'ignored', payload)
    return
  }

  const productId = order.productId
  if (!productId) {
    console.info(`[polar] refund for order ${order.id} has no productId, skipping`)
    await storeWebhookEvent('order.refunded', order.id, userId, 'ignored', payload)
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

  await storeWebhookEvent('order.refunded', order.id, userId, 'refund', payload)

  if (!result.success && !result.alreadyProcessed) {
    console.info(
      `[polar] failed to process refund for order ${order.id}: ${result.error}`
    )
  }
}

export async function handleProductCreated(payload: WebhookProductCreatedPayload) {
  await syncPolarProductFromWebhook(payload.data)
  await storeWebhookEvent('product.created', payload.data.id, null, 'ignored', payload)
}

export async function handleProductUpdated(payload: WebhookProductUpdatedPayload) {
  await syncPolarProductFromWebhook(payload.data)
  await storeWebhookEvent('product.updated', payload.data.id, null, 'ignored', payload)
}
