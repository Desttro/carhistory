import { ensureAuth } from '~/features/auth/server/ensureAuth'
import { vinActions } from '~/features/bulkvin/server/vinActions'

import type { Endpoint } from 'one'

export const POST: Endpoint = async (req) => {
  try {
    const session = await ensureAuth(req)
    const body = (await req.json()) as {
      vin?: string
      carfaxRecords?: number
      autocheckRecords?: number
    }

    if (!body.vin) {
      return Response.json({ success: false, error: 'Missing vin in request body' }, { status: 400 })
    }

    const authData = {
      id: session.user.id,
      // same pre-existing type issue as ensureAuth.ts — role exists via admin plugin
      role: session.user.role as 'admin' | undefined,
      email: session.user.email,
    }

    const knownCounts =
      body.carfaxRecords !== undefined || body.autocheckRecords !== undefined
        ? { carfaxRecords: body.carfaxRecords, autocheckRecords: body.autocheckRecords }
        : undefined

    const result = await vinActions.purchaseReport(authData, body.vin, knownCounts)
    return Response.json(result)
  } catch (err) {
    // ensureAuth throws Response objects for 401/403
    if (err instanceof Response) {
      return err
    }

    console.info('[api/vin/purchase] error:', err)
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
