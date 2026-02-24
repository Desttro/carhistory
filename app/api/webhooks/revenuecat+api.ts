import { timingSafeEqual } from 'node:crypto'

import {
  handleRevenueCatWebhook,
  type RevenueCatWebhookPayload,
} from '~/features/purchases/server/webhooks/revenuecat'
import { REVENUECAT_WEBHOOK_AUTH } from '~/server/env-server'

import type { Endpoint } from 'one'

function isValidAuth(authHeader: string | null): boolean {
  if (!REVENUECAT_WEBHOOK_AUTH || !authHeader) return false

  const expected = `Bearer ${REVENUECAT_WEBHOOK_AUTH}`
  if (authHeader.length !== expected.length) return false

  const a = Buffer.from(authHeader)
  const b = Buffer.from(expected)
  return timingSafeEqual(a, b)
}

function isValidPayload(payload: unknown): payload is RevenueCatWebhookPayload {
  if (!payload || typeof payload !== 'object') return false
  const p = payload as Record<string, unknown>
  if (!p.event || typeof p.event !== 'object') return false
  const event = p.event as Record<string, unknown>
  return typeof event.type === 'string' && typeof event.id === 'string'
}

export const POST: Endpoint = async (req) => {
  if (!isValidAuth(req.headers.get('authorization'))) {
    console.info('[revenuecat webhook] unauthorized request')
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let payload: unknown
  try {
    payload = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!isValidPayload(payload)) {
    console.info('[revenuecat webhook] invalid payload structure')
    return Response.json({ error: 'Invalid payload' }, { status: 400 })
  }

  try {
    const result = await handleRevenueCatWebhook(payload)
    // always return 200 so revenuecat doesn't retry handled events
    return Response.json(result, { status: 200 })
  } catch (err) {
    console.info('[revenuecat webhook] error:', err)
    // 500 so revenuecat retries on actual failures
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
