import { computeFingerprint } from '../ingest/computeHash'

import type { RawParsedEvent, EventType } from '../types'

// create a unique fingerprint for event deduplication
// events with the same fingerprint are considered duplicates
export function createEventFingerprint(
  eventType: EventType,
  event: RawParsedEvent
): string {
  // round odometer to nearest 500 for fuzzy matching
  const roundedOdometer = event.odometer ? Math.round(event.odometer / 500) * 500 : ''

  // extract month from date for fuzzy date matching
  const dateMonth = event.date.slice(0, 7) // YYYY-MM

  // normalize summary for comparison (first 50 chars, alphanumeric only)
  const normalizedSummary = event.details
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 50)

  const parts = [
    dateMonth,
    eventType,
    event.state || '',
    String(roundedOdometer),
    normalizedSummary,
  ]

  return computeFingerprint(parts)
}

// check if two events are likely duplicates
export function areSimilarEvents(
  event1: RawParsedEvent,
  event2: RawParsedEvent,
  type1: EventType,
  type2: EventType
): boolean {
  // different types are not duplicates
  if (type1 !== type2) return false

  // check date proximity (within same month)
  const date1Month = event1.date.slice(0, 7)
  const date2Month = event2.date.slice(0, 7)
  if (date1Month !== date2Month) return false

  // check odometer proximity (within 1000 miles)
  if (event1.odometer !== undefined && event2.odometer !== undefined) {
    if (Math.abs(event1.odometer - event2.odometer) > 1000) {
      return false
    }
  }

  // check state match (if both have state)
  if (event1.state && event2.state && event1.state !== event2.state) {
    return false
  }

  // check details similarity
  const details1 = event1.details.toLowerCase().replace(/[^a-z0-9]/g, '')
  const details2 = event2.details.toLowerCase().replace(/[^a-z0-9]/g, '')

  // find common prefix length
  let commonLen = 0
  const maxCheck = Math.min(details1.length, details2.length, 50)
  for (let i = 0; i < maxCheck; i++) {
    if (details1[i] === details2[i]) {
      commonLen++
    } else {
      break
    }
  }

  // if first 20+ chars match, likely the same event
  if (commonLen >= 20) {
    return true
  }

  return false
}
