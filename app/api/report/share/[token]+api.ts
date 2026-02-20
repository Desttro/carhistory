import { shareActions } from '~/features/reports/server/shareActions'

import type { Endpoint } from 'one'

export const GET: Endpoint = async (req) => {
  try {
    const url = new URL(req.url)
    const segments = url.pathname.split('/')
    const token = segments[segments.length - 1]

    if (!token) {
      return Response.json({ success: false, error: 'Missing token' }, { status: 400 })
    }

    const result = await shareActions.getReportByShareToken(token)

    if (!result.success) {
      const status = result.error === 'not_found' ? 404 : 410
      return Response.json(result, { status })
    }

    return Response.json(result)
  } catch (err) {
    console.info('[api/report/share/[token]] GET error:', err)
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
