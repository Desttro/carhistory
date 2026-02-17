import { vinActions } from '~/features/bulkvin/server/vinActions'

import type { Endpoint } from 'one'

export const GET: Endpoint = async (req) => {
  const url = new URL(req.url)
  const vin = url.searchParams.get('vin')

  if (!vin) {
    return Response.json({ success: false, error: 'Missing vin parameter' }, { status: 400 })
  }

  try {
    const result = await vinActions.checkVin(vin)
    return Response.json(result)
  } catch (err) {
    console.info('[api/vin/check] error:', err)
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
