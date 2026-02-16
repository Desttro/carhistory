import type { DamageEvent, DamageZoneData, DamageZoneId } from './types'
import type { AccidentRecord, NormalizedEvent, Severity } from '~/features/reports/types'

const zonePatterns: Record<DamageZoneId, RegExp[]> = {
  front: [
    /\bfront\b/i,
    /\bhood\b/i,
    /\bbumper\s*front\b/i,
    /\bgrille\b/i,
    /\bheadlight/i,
  ],
  rear: [
    /\brear\b/i,
    /\btrunk\b/i,
    /\bbumper\s*rear\b/i,
    /\btailgate\b/i,
    /\btaillight/i,
    /\bback\b/i,
  ],
  'left-side': [
    /\bleft\s*side\b/i,
    /\bdriver\s*side\b/i,
    /\bleft\s*door/i,
    /\bdriver\s*door/i,
  ],
  'right-side': [
    /\bright\s*side\b/i,
    /\bpassenger\s*side\b/i,
    /\bright\s*door/i,
    /\bpassenger\s*door/i,
  ],
  roof: [/\broof\b/i, /\btop\b/i, /\brollover/i],
  'left-front': [
    /\bleft[-\s]?front\b/i,
    /\bfront[-\s]?left\b/i,
    /\bdriver[-\s]?front/i,
    /\bleft\s*fender\b/i,
  ],
  'right-front': [
    /\bright[-\s]?front\b/i,
    /\bfront[-\s]?right\b/i,
    /\bpassenger[-\s]?front/i,
    /\bright\s*fender\b/i,
  ],
  'left-rear': [
    /\bleft[-\s]?rear\b/i,
    /\brear[-\s]?left\b/i,
    /\bdriver[-\s]?rear/i,
    /\bleft\s*quarter/i,
  ],
  'right-rear': [
    /\bright[-\s]?rear\b/i,
    /\brear[-\s]?right\b/i,
    /\bpassenger[-\s]?rear/i,
    /\bright\s*quarter/i,
  ],
}

function matchZone(text: string): DamageZoneId | null {
  // check compound patterns first (more specific)
  const compoundZones: DamageZoneId[] = [
    'left-front',
    'right-front',
    'left-rear',
    'right-rear',
  ]
  for (const zoneId of compoundZones) {
    for (const pattern of zonePatterns[zoneId]) {
      if (pattern.test(text)) {
        return zoneId
      }
    }
  }

  // then check simple zones
  const simpleZones: DamageZoneId[] = ['front', 'rear', 'left-side', 'right-side', 'roof']
  for (const zoneId of simpleZones) {
    for (const pattern of zonePatterns[zoneId]) {
      if (pattern.test(text)) {
        return zoneId
      }
    }
  }

  return null
}

function getHigherSeverity(a: Severity, b: Severity): Severity {
  const order: Severity[] = ['unknown', 'minor', 'moderate', 'severe']
  return order.indexOf(a) >= order.indexOf(b) ? a : b
}

export function parseDamageZones(
  accidents: AccidentRecord[],
  events: NormalizedEvent[]
): DamageZoneData[] {
  const zoneMap = new Map<DamageZoneId, DamageZoneData>()

  // process structured accident data
  for (const accident of accidents) {
    const severity = accident.severity || 'unknown'
    const damageEvent: DamageEvent = {
      date: accident.date,
      details: accident.description || accident.type,
      severity,
    }

    // use impactAreas if available
    if (accident.impactAreas && accident.impactAreas.length > 0) {
      for (const area of accident.impactAreas) {
        const zoneId = matchZone(area)
        if (zoneId) {
          addToZone(zoneMap, zoneId, damageEvent)
        } else {
          console.info('[VehicleDamage] unknown zone pattern from impactAreas:', area)
        }
      }
    }

    // also check description
    if (accident.description) {
      const zoneId = matchZone(accident.description)
      if (zoneId && !zoneMap.get(zoneId)?.events.some((e) => e.date === accident.date)) {
        addToZone(zoneMap, zoneId, damageEvent)
      }
    }
  }

  // process normalized events for damage patterns
  const damageEvents = events.filter(
    (e) => e.eventType === 'ACCIDENT' || e.eventType === 'DAMAGE'
  )

  for (const event of damageEvents) {
    const textToSearch = [event.summary, event.details].filter(Boolean).join(' ')
    const zoneId = matchZone(textToSearch)
    const severity = event.severity || 'unknown'

    if (zoneId) {
      const damageEvent: DamageEvent = {
        date: event.eventDate,
        details: event.summary,
        severity,
      }
      // avoid duplicate dates for same zone
      if (!zoneMap.get(zoneId)?.events.some((e) => e.date === event.eventDate)) {
        addToZone(zoneMap, zoneId, damageEvent)
      }
    } else if (textToSearch.length > 0) {
      // only log when there's actual text that didn't match
      const hasDamageKeyword = /damage|impact|collision|crash|hit/i.test(textToSearch)
      if (hasDamageKeyword) {
        console.info('[VehicleDamage] unknown zone pattern:', textToSearch.slice(0, 100))
      }
    }
  }

  return Array.from(zoneMap.values())
}

function addToZone(
  zoneMap: Map<DamageZoneId, DamageZoneData>,
  zoneId: DamageZoneId,
  event: DamageEvent
) {
  const existing = zoneMap.get(zoneId)
  if (existing) {
    existing.events.push(event)
    existing.eventCount++
    existing.severity = getHigherSeverity(existing.severity, event.severity)
  } else {
    zoneMap.set(zoneId, {
      zoneId,
      severity: event.severity,
      eventCount: 1,
      events: [event],
    })
  }
}
