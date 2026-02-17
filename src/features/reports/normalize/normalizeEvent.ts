import { EventTypes, eventTypeKeywords, negativeEventKeywords } from '../constants'

import type { EventType, RawParsedEvent, Severity } from '../types'

// classify an event based on its details and data source
export function classifyEventType(event: RawParsedEvent): EventType {
  const searchText = [event.details, event.dataSource || ''].join(' ').toLowerCase()

  // check each keyword pattern
  for (const [keyword, eventType] of Object.entries(eventTypeKeywords)) {
    if (searchText.includes(keyword)) {
      return eventType
    }
  }

  // default classification based on data source
  if (event.dataSource) {
    const source = event.dataSource.toLowerCase()
    if (source.includes('motor vehicle') || source.includes('dmv')) {
      if (searchText.includes('title')) return EventTypes.TITLE
      if (searchText.includes('registration')) return EventTypes.REGISTRATION
      return EventTypes.TITLE
    }
    if (source.includes('service')) {
      return EventTypes.SERVICE
    }
    if (source.includes('auction')) {
      return EventTypes.AUCTION
    }
    if (source.includes('dealer')) {
      return EventTypes.LISTING
    }
    if (source.includes('insurance')) {
      return EventTypes.INSURANCE
    }
  }

  return EventTypes.OTHER
}

// determine if an event is negative (bad for vehicle history)
export function isNegativeEvent(event: RawParsedEvent): boolean {
  const searchText = event.details.toLowerCase()

  for (const keyword of negativeEventKeywords) {
    if (searchText.includes(keyword)) {
      return true
    }
  }

  return false
}

// extract severity from event details
export function extractSeverity(event: RawParsedEvent): Severity | undefined {
  const searchText = event.details.toLowerCase()

  if (searchText.includes('severe') || searchText.includes('major')) {
    return 'severe'
  }
  if (searchText.includes('moderate')) {
    return 'moderate'
  }
  if (searchText.includes('minor')) {
    return 'minor'
  }

  // if it's a negative event without explicit severity, assume moderate
  if (isNegativeEvent(event)) {
    return 'moderate'
  }

  return undefined
}

// extract event subtype for more granular classification
export function extractEventSubtype(
  eventType: EventType,
  event: RawParsedEvent
): string | undefined {
  const details = event.details.toLowerCase()

  switch (eventType) {
    case EventTypes.SERVICE:
      if (details.includes('oil')) return 'oil_change'
      if (details.includes('tire')) return 'tire_service'
      if (details.includes('brake')) return 'brake_service'
      if (details.includes('inspection')) return 'inspection'
      if (details.includes('battery')) return 'battery_service'
      if (details.includes('transmission')) return 'transmission_service'
      if (details.includes('engine')) return 'engine_service'
      if (details.includes('alignment')) return 'alignment'
      return 'general_service'

    case EventTypes.TITLE:
      if (details.includes('lien')) return 'title_with_lien'
      if (details.includes('transfer')) return 'title_transfer'
      return 'title_issued'

    case EventTypes.REGISTRATION:
      if (details.includes('renewal')) return 'registration_renewal'
      return 'registration_event'

    case EventTypes.DAMAGE:
      if (details.includes('salvage')) return 'salvage'
      if (details.includes('flood')) return 'flood_damage'
      if (details.includes('fire')) return 'fire_damage'
      if (details.includes('hail')) return 'hail_damage'
      return 'damage_reported'

    case EventTypes.ACCIDENT:
      if (details.includes('collision')) return 'collision'
      if (details.includes('rear')) return 'rear_end'
      if (details.includes('front')) return 'front_end'
      if (details.includes('side')) return 'side_impact'
      return 'accident_reported'

    default:
      return undefined
  }
}

// create a summary from event details
export function createEventSummary(eventType: EventType, event: RawParsedEvent): string {
  const details = event.details

  // if details is short enough, use it directly
  if (details.length <= 100) {
    return details.replace(/\n/g, '; ')
  }

  // otherwise, create a summary based on event type
  const typeLabels: { [K in EventType]: string } = {
    TITLE: 'Title event',
    REGISTRATION: 'Registration event',
    LIEN: 'Lien recorded',
    SERVICE: 'Vehicle serviced',
    ODOMETER_READING: 'Odometer reading',
    ACCIDENT: 'Accident reported',
    DAMAGE: 'Damage reported',
    AUCTION: 'Auction record',
    LISTING: 'Vehicle listed',
    RECALL: 'Recall information',
    WARRANTY: 'Warranty service',
    INSPECTION: 'Inspection performed',
    EMISSION: 'Emission test',
    MANUFACTURER: 'Manufacturer event',
    INSURANCE: 'Insurance event',
    OTHER: 'Event recorded',
  }

  const label = typeLabels[eventType]
  const firstLine = details.split('\n')[0].slice(0, 80)

  return `${label}: ${firstLine}${firstLine.length < details.split('\n')[0].length ? '...' : ''}`
}
