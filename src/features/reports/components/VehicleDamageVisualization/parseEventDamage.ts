import type { DamageZoneData, DamageZoneId } from './types'
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

function matchZones(text: string): DamageZoneId[] {
  const matched: DamageZoneId[] = []

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
        matched.push(zoneId)
        break
      }
    }
  }

  // then check simple zones
  const simpleZones: DamageZoneId[] = ['front', 'rear', 'left-side', 'right-side', 'roof']
  for (const zoneId of simpleZones) {
    for (const pattern of zonePatterns[zoneId]) {
      if (pattern.test(text)) {
        matched.push(zoneId)
        break
      }
    }
  }

  return [...new Set(matched)]
}

export function parseEventDamageZones(event: NormalizedEvent): DamageZoneData[] {
  const severity = event.severity || 'unknown'
  const textToSearch = [event.summary, event.details].filter(Boolean).join(' ')
  const zones = matchZones(textToSearch)

  return zones.map((zoneId) => ({
    zoneId,
    severity,
    eventCount: 1,
    events: [
      {
        date: event.eventDate,
        details: event.summary,
        severity,
      },
    ],
  }))
}

export function parseAccidentDamageZones(accident: AccidentRecord): DamageZoneData[] {
  const severity = accident.severity || 'unknown'
  const zones: DamageZoneId[] = []

  // use impactAreas if available
  if (accident.impactAreas && accident.impactAreas.length > 0) {
    for (const area of accident.impactAreas) {
      const matched = matchZones(area)
      zones.push(...matched)
    }
  }

  // also check description
  if (accident.description) {
    const matched = matchZones(accident.description)
    zones.push(...matched)
  }

  // check type as well
  if (accident.type) {
    const matched = matchZones(accident.type)
    zones.push(...matched)
  }

  const uniqueZones = [...new Set(zones)]

  return uniqueZones.map((zoneId) => ({
    zoneId,
    severity,
    eventCount: 1,
    events: [
      {
        date: accident.date,
        details: accident.description || accident.type,
        severity,
      },
    ],
  }))
}
