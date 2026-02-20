import { ensureAuth } from '~/features/auth/server/ensureAuth'
import { shareActions } from '~/features/reports/server/shareActions'

import type { Endpoint } from 'one'

export const POST: Endpoint = async (req) => {
  try {
    const session = await ensureAuth(req)
    const body = (await req.json()) as { reportId?: string }

    if (!body.reportId) {
      return Response.json(
        { success: false, error: 'Missing reportId in request body' },
        { status: 400 }
      )
    }

    const authData = {
      id: session.user.id,
      role: session.user.role as 'admin' | undefined,
      email: session.user.email,
    }

    const result = await shareActions.createShareToken(authData, body.reportId)
    return Response.json(result)
  } catch (err) {
    if (err instanceof Response) return err
    console.info('[api/report/share] POST error:', err)
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const DELETE: Endpoint = async (req) => {
  try {
    const session = await ensureAuth(req)
    const body = (await req.json()) as { reportId?: string }

    if (!body.reportId) {
      return Response.json(
        { success: false, error: 'Missing reportId in request body' },
        { status: 400 }
      )
    }

    const authData = {
      id: session.user.id,
      role: session.user.role as 'admin' | undefined,
      email: session.user.email,
    }

    const result = await shareActions.revokeShareToken(authData, body.reportId)
    return Response.json(result)
  } catch (err) {
    if (err instanceof Response) return err
    console.info('[api/report/share] DELETE error:', err)
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
