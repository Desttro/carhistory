import { uuid } from '@take-out/helpers'
import { and, eq, isNull } from 'drizzle-orm'

import { getDb } from '~/database'
import { reportShareToken } from '~/database/schema-private'
import { vehicleReport } from '~/database/schema-public'

import type { CanonicalReport } from '../types'
import type { AuthData } from '~/features/auth/types'

export const shareActions = {
  createShareToken,
  getReportByShareToken,
  revokeShareToken,
  getShareTokenForReport,
}

async function createShareToken(
  authData: AuthData,
  reportId: string
): Promise<{ success: boolean; token?: string; error?: string }> {
  if (!authData?.id) {
    return { success: false, error: 'Authentication required' }
  }

  const db = getDb()
  const userId = authData.id

  // verify ownership
  const report = await db
    .select({ id: vehicleReport.id })
    .from(vehicleReport)
    .where(and(eq(vehicleReport.id, reportId), eq(vehicleReport.userId, userId)))
    .limit(1)

  if (report.length === 0) {
    return { success: false, error: 'Report not found or not owned by user' }
  }

  // check for existing active token
  const existing = await db
    .select({ token: reportShareToken.token })
    .from(reportShareToken)
    .where(
      and(
        eq(reportShareToken.vehicleReportId, reportId),
        eq(reportShareToken.userId, userId),
        isNull(reportShareToken.revokedAt)
      )
    )
    .limit(1)

  if (existing.length > 0) {
    return { success: true, token: existing[0].token }
  }

  // create new token
  const token = uuid()
  await db.insert(reportShareToken).values({
    id: uuid(),
    vehicleReportId: reportId,
    userId,
    token,
  })

  return { success: true, token }
}

async function getReportByShareToken(
  token: string
): Promise<{ success: boolean; report?: CanonicalReport; error?: string }> {
  const db = getDb()

  const result = await db
    .select({
      canonicalJson: vehicleReport.canonicalJson,
      revokedAt: reportShareToken.revokedAt,
    })
    .from(reportShareToken)
    .innerJoin(vehicleReport, eq(reportShareToken.vehicleReportId, vehicleReport.id))
    .where(eq(reportShareToken.token, token))
    .limit(1)

  if (result.length === 0) {
    return { success: false, error: 'not_found' }
  }

  const row = result[0]

  if (row.revokedAt) {
    return { success: false, error: 'revoked' }
  }

  if (!row.canonicalJson) {
    return { success: false, error: 'not_found' }
  }

  return { success: true, report: row.canonicalJson }
}

async function revokeShareToken(
  authData: AuthData,
  reportId: string
): Promise<{ success: boolean; error?: string }> {
  if (!authData?.id) {
    return { success: false, error: 'Authentication required' }
  }

  const db = getDb()
  const now = new Date().toISOString()

  await db
    .update(reportShareToken)
    .set({ revokedAt: now })
    .where(
      and(
        eq(reportShareToken.vehicleReportId, reportId),
        eq(reportShareToken.userId, authData.id),
        isNull(reportShareToken.revokedAt)
      )
    )

  return { success: true }
}

async function getShareTokenForReport(
  authData: AuthData,
  reportId: string
): Promise<{ success: boolean; token?: string }> {
  if (!authData?.id) {
    return { success: false }
  }

  const db = getDb()

  const result = await db
    .select({ token: reportShareToken.token })
    .from(reportShareToken)
    .where(
      and(
        eq(reportShareToken.vehicleReportId, reportId),
        eq(reportShareToken.userId, authData.id),
        isNull(reportShareToken.revokedAt)
      )
    )
    .limit(1)

  if (result.length === 0) {
    return { success: true }
  }

  return { success: true, token: result[0].token }
}
