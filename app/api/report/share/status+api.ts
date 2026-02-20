import { ensureAuth } from '~/features/auth/server/ensureAuth'
import { shareActions } from '~/features/reports/server/shareActions'

import type { Endpoint } from 'one'

export const GET: Endpoint = async (req) => {
  try {
    const session = await ensureAuth(req)
    const url = new URL(req.url)
    const reportId = url.searchParams.get('reportId')

    if (!reportId) {
      return Response.json(
        { success: false, error: 'Missing reportId query parameter' },
        { status: 400 }
      )
    }

    const authData = {
      id: session.user.id,
      role: session.user.role as 'admin' | undefined,
      email: session.user.email,
    }

    const result = await shareActions.getShareTokenForReport(authData, reportId)
    return Response.json(result)
  } catch (err) {
    if (err instanceof Response) return err
    console.info('[api/report/share/status] GET error:', err)
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
