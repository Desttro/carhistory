import type { Severity } from '~/features/reports/types'

export type DamageZoneId =
  | 'front'
  | 'rear'
  | 'left-side'
  | 'right-side'
  | 'roof'
  | 'left-front'
  | 'right-front'
  | 'left-rear'
  | 'right-rear'

export interface DamageEvent {
  date: string
  details: string
  severity: Severity
}

export interface DamageZoneData {
  zoneId: DamageZoneId
  severity: Severity
  eventCount: number
  events: DamageEvent[]
}

export interface ZonePathDefinition {
  id: DamageZoneId
  label: string
  d: string
}
