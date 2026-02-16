import { boolean, json, number, string, table } from '@rocicorp/zero'
import { mutations, serverWhere } from 'on-zero'

import type { ReadonlyJSONObject } from '@rocicorp/zero'

export const schema = table('vehicleReport')
  .columns({
    id: string(),
    vehicleId: string(),
    userId: string(),
    purchasedAt: number(),
    expiresAt: number(),
    estimatedOwners: number().optional(),
    accidentCount: number().optional(),
    odometerLastReported: number().optional(),
    odometerLastDate: string().optional(),
    odometerIssues: boolean().optional(),
    titleBrands: json<readonly string[]>().optional(),
    totalLoss: boolean().optional(),
    openRecallCount: number().optional(),
    eventCount: number().optional(),
    serviceRecordCount: number().optional(),
    sourceProviders: json<readonly string[]>().optional(),
    canonicalJson: json<ReadonlyJSONObject>().optional(),
    createdAt: number(),
  })
  .primaryKey('id')

// users can only read their own reports
export const permissions = serverWhere('vehicleReport', (_, auth) => {
  return _.cmp('userId', auth?.id || '')
})

// no client-side mutations for vehicleReport - created server-side only
export const mutate = mutations(schema, permissions, {})
