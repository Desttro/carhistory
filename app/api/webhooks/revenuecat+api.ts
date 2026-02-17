import { handleRevenueCatWebhook } from '~/features/payments/server/revenuecatWebhook'
import { REVENUECAT_WEBHOOK_AUTH } from '~/server/env-server'

import type { Endpoint } from 'one'

export const POST: Endpoint = async (req) => {
  // validate authorization header
  const authHeader = req.headers.get('authorization')
  if (!REVENUECAT_WEBHOOK_AUTH || authHeader !== `Bearer ${REVENUECAT_WEBHOOK_AUTH}`) {
    console.info('[revenuecat webhook] unauthorized request')
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await req.json()
    const result = await handleRevenueCatWebhook(payload)
    return Response.json(result)
  } catch (err) {
    console.info('[revenuecat webhook] error:', err)
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
