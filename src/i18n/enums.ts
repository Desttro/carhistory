import type { MessageKey, TFunction } from './types'
import type { DamageZoneId } from '~/features/reports/components/VehicleDamageVisualization/types'
import type { EventType, Severity } from '~/features/reports/types'

const eventTypeKeys: Record<EventType, MessageKey> = {
  TITLE: 'eventType.TITLE',
  REGISTRATION: 'eventType.REGISTRATION',
  LIEN: 'eventType.LIEN',
  SERVICE: 'eventType.SERVICE',
  ODOMETER_READING: 'eventType.ODOMETER_READING',
  ACCIDENT: 'eventType.ACCIDENT',
  DAMAGE: 'eventType.DAMAGE',
  AUCTION: 'eventType.AUCTION',
  LISTING: 'eventType.LISTING',
  RECALL: 'eventType.RECALL',
  WARRANTY: 'eventType.WARRANTY',
  INSPECTION: 'eventType.INSPECTION',
  EMISSION: 'eventType.EMISSION',
  MANUFACTURER: 'eventType.MANUFACTURER',
  INSURANCE: 'eventType.INSURANCE',
  OTHER: 'eventType.OTHER',
}

const severityKeys: Record<Severity, MessageKey> = {
  minor: 'severity.minor',
  moderate: 'severity.moderate',
  severe: 'severity.severe',
  unknown: 'severity.unknown',
}

const damageZoneKeys: Record<DamageZoneId, MessageKey> = {
  front: 'damageZone.front',
  rear: 'damageZone.rear',
  'left-side': 'damageZone.left-side',
  'right-side': 'damageZone.right-side',
  roof: 'damageZone.roof',
  'left-front': 'damageZone.left-front',
  'right-front': 'damageZone.right-front',
  'left-rear': 'damageZone.left-rear',
  'right-rear': 'damageZone.right-rear',
}

const titleBrandKeys: Record<string, MessageKey> = {
  salvage: 'titleBrand.salvage',
  rebuilt: 'titleBrand.rebuilt',
  flood: 'titleBrand.flood',
  fire: 'titleBrand.fire',
  hail: 'titleBrand.hail',
  junk: 'titleBrand.junk',
  lemon: 'titleBrand.lemon',
  'manufacturer buyback': 'titleBrand.manufacturer buyback',
}

export function translateEventType(t: TFunction, type: EventType): string {
  return t(eventTypeKeys[type] ?? 'eventType.OTHER')
}

export function translateSeverity(t: TFunction, severity: Severity): string {
  return t(severityKeys[severity] ?? 'severity.unknown')
}

export function translateDamageZone(t: TFunction, zoneId: DamageZoneId): string {
  return t(damageZoneKeys[zoneId])
}

export function translateTitleBrand(t: TFunction, brand: string): string {
  const key = titleBrandKeys[brand.toLowerCase()]
  if (key) return t(key)
  // capitalize first letter of each word as fallback
  return brand.replace(/\b\w/g, (c) => c.toUpperCase())
}
