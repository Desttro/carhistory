import { describe, expect, test } from 'vitest'

import {
  classifyEventType,
  isNegativeEvent,
  extractSeverity,
  extractEventSubtype,
} from '~/features/reports/normalize/normalizeEvent'
import { EventTypes } from '~/features/reports/types'

import type { RawParsedEvent } from '~/features/reports/types'

describe('classifyEventType', () => {
  test('classifies service records', () => {
    const event: RawParsedEvent = {
      date: '2024-01-15',
      details: 'Oil change performed',
      dataSource: 'Service Record',
    }
    expect(classifyEventType(event)).toBe(EventTypes.SERVICE)
  })

  test('classifies title events', () => {
    const event: RawParsedEvent = {
      date: '2024-01-15',
      details: 'Title issued',
      dataSource: 'Motor Vehicle Dept.',
    }
    expect(classifyEventType(event)).toBe(EventTypes.TITLE)
  })

  test('classifies registration events', () => {
    const event: RawParsedEvent = {
      date: '2024-01-15',
      details: 'Registration renewal',
      dataSource: 'DMV',
    }
    expect(classifyEventType(event)).toBe(EventTypes.REGISTRATION)
  })

  test('classifies accident events', () => {
    const event: RawParsedEvent = {
      date: '2024-01-15',
      details: 'Accident reported - collision',
    }
    expect(classifyEventType(event)).toBe(EventTypes.ACCIDENT)
  })

  test('classifies damage events', () => {
    const event: RawParsedEvent = {
      date: '2024-01-15',
      details: 'Major damage reported to vehicle',
    }
    expect(classifyEventType(event)).toBe(EventTypes.DAMAGE)
  })

  test('classifies auction events', () => {
    const event: RawParsedEvent = {
      date: '2024-01-15',
      details: 'Vehicle sold',
      dataSource: 'Auction',
    }
    expect(classifyEventType(event)).toBe(EventTypes.AUCTION)
  })

  test('returns OTHER for unknown events', () => {
    const event: RawParsedEvent = {
      date: '2024-01-15',
      details: 'Something happened',
    }
    expect(classifyEventType(event)).toBe(EventTypes.OTHER)
  })
})

describe('isNegativeEvent', () => {
  test('identifies accidents as negative', () => {
    const event: RawParsedEvent = {
      date: '2024-01-15',
      details: 'Accident reported',
    }
    expect(isNegativeEvent(event)).toBe(true)
  })

  test('identifies salvage as negative', () => {
    const event: RawParsedEvent = {
      date: '2024-01-15',
      details: 'Salvage title issued',
    }
    expect(isNegativeEvent(event)).toBe(true)
  })

  test('identifies total loss as negative', () => {
    const event: RawParsedEvent = {
      date: '2024-01-15',
      details: 'Total loss declared',
    }
    expect(isNegativeEvent(event)).toBe(true)
  })

  test('identifies service as positive', () => {
    const event: RawParsedEvent = {
      date: '2024-01-15',
      details: 'Oil change performed',
    }
    expect(isNegativeEvent(event)).toBe(false)
  })

  test('identifies registration as positive', () => {
    const event: RawParsedEvent = {
      date: '2024-01-15',
      details: 'Registration renewed',
    }
    expect(isNegativeEvent(event)).toBe(false)
  })
})

describe('extractSeverity', () => {
  test('extracts severe from text', () => {
    const event: RawParsedEvent = {
      date: '2024-01-15',
      details: 'Severe damage reported',
    }
    expect(extractSeverity(event)).toBe('severe')
  })

  test('extracts moderate from text', () => {
    const event: RawParsedEvent = {
      date: '2024-01-15',
      details: 'Moderate collision damage',
    }
    expect(extractSeverity(event)).toBe('moderate')
  })

  test('extracts minor from text', () => {
    const event: RawParsedEvent = {
      date: '2024-01-15',
      details: 'Minor scratches',
    }
    expect(extractSeverity(event)).toBe('minor')
  })

  test('returns moderate for negative events without explicit severity', () => {
    const event: RawParsedEvent = {
      date: '2024-01-15',
      details: 'Accident reported',
    }
    expect(extractSeverity(event)).toBe('moderate')
  })

  test('returns undefined for positive events', () => {
    const event: RawParsedEvent = {
      date: '2024-01-15',
      details: 'Oil change',
    }
    expect(extractSeverity(event)).toBeUndefined()
  })
})

describe('extractEventSubtype', () => {
  test('extracts oil change subtype', () => {
    const event: RawParsedEvent = {
      date: '2024-01-15',
      details: 'Oil and filter changed',
    }
    expect(extractEventSubtype(EventTypes.SERVICE, event)).toBe('oil_change')
  })

  test('extracts brake service subtype', () => {
    const event: RawParsedEvent = {
      date: '2024-01-15',
      details: 'Brake pads replaced',
    }
    expect(extractEventSubtype(EventTypes.SERVICE, event)).toBe('brake_service')
  })

  test('extracts title with lien subtype', () => {
    const event: RawParsedEvent = {
      date: '2024-01-15',
      details: 'Title issued with lien holder',
    }
    expect(extractEventSubtype(EventTypes.TITLE, event)).toBe('title_with_lien')
  })

  test('extracts salvage subtype for damage', () => {
    const event: RawParsedEvent = {
      date: '2024-01-15',
      details: 'Salvage title issued',
    }
    expect(extractEventSubtype(EventTypes.DAMAGE, event)).toBe('salvage')
  })
})
