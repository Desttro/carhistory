import { describe, expect, test } from 'vitest'

import {
  createEventFingerprint,
  areSimilarEvents,
} from '~/features/reports/merge/fingerprint'
import { EventTypes } from '~/features/reports/types'

import type { RawParsedEvent } from '~/features/reports/types'

describe('createEventFingerprint', () => {
  test('creates consistent fingerprint for same event', () => {
    const event: RawParsedEvent = {
      date: '2024-01-15',
      details: 'Oil change performed',
      state: 'NC',
      odometer: 50000,
    }

    const fp1 = createEventFingerprint(EventTypes.SERVICE, event)
    const fp2 = createEventFingerprint(EventTypes.SERVICE, event)

    expect(fp1).toBe(fp2)
    expect(fp1).toHaveLength(16)
  })

  test('creates different fingerprints for different months', () => {
    const event1: RawParsedEvent = {
      date: '2024-01-15',
      details: 'Oil change performed',
    }
    const event2: RawParsedEvent = {
      date: '2024-02-15',
      details: 'Oil change performed',
    }

    const fp1 = createEventFingerprint(EventTypes.SERVICE, event1)
    const fp2 = createEventFingerprint(EventTypes.SERVICE, event2)

    expect(fp1).not.toBe(fp2)
  })

  test('creates same fingerprint for nearby odometer readings', () => {
    const event1: RawParsedEvent = {
      date: '2024-01-15',
      details: 'Oil change performed',
      odometer: 50100,
    }
    const event2: RawParsedEvent = {
      date: '2024-01-15',
      details: 'Oil change performed',
      odometer: 50200,
    }

    const fp1 = createEventFingerprint(EventTypes.SERVICE, event1)
    const fp2 = createEventFingerprint(EventTypes.SERVICE, event2)

    // both round to 50000, so should be same
    expect(fp1).toBe(fp2)
  })

  test('creates different fingerprints for different event types', () => {
    const event: RawParsedEvent = {
      date: '2024-01-15',
      details: 'Some event',
    }

    const fp1 = createEventFingerprint(EventTypes.SERVICE, event)
    const fp2 = createEventFingerprint(EventTypes.TITLE, event)

    expect(fp1).not.toBe(fp2)
  })
})

describe('areSimilarEvents', () => {
  test('detects similar events in same month', () => {
    const event1: RawParsedEvent = {
      date: '2024-01-15',
      details: 'Oil change and filter replacement',
      odometer: 50000,
      state: 'NC',
    }
    const event2: RawParsedEvent = {
      date: '2024-01-20',
      details: 'Oil change and filter replaced',
      odometer: 50100,
      state: 'NC',
    }

    expect(areSimilarEvents(event1, event2, EventTypes.SERVICE, EventTypes.SERVICE)).toBe(
      true
    )
  })

  test('rejects events with different types', () => {
    const event1: RawParsedEvent = {
      date: '2024-01-15',
      details: 'Some event',
    }
    const event2: RawParsedEvent = {
      date: '2024-01-15',
      details: 'Some event',
    }

    expect(areSimilarEvents(event1, event2, EventTypes.SERVICE, EventTypes.TITLE)).toBe(
      false
    )
  })

  test('rejects events in different months', () => {
    const event1: RawParsedEvent = {
      date: '2024-01-15',
      details: 'Oil change',
    }
    const event2: RawParsedEvent = {
      date: '2024-02-15',
      details: 'Oil change',
    }

    expect(areSimilarEvents(event1, event2, EventTypes.SERVICE, EventTypes.SERVICE)).toBe(
      false
    )
  })

  test('rejects events with very different odometers', () => {
    const event1: RawParsedEvent = {
      date: '2024-01-15',
      details: 'Oil change',
      odometer: 50000,
    }
    const event2: RawParsedEvent = {
      date: '2024-01-20',
      details: 'Oil change',
      odometer: 60000,
    }

    expect(areSimilarEvents(event1, event2, EventTypes.SERVICE, EventTypes.SERVICE)).toBe(
      false
    )
  })

  test('rejects events in different states', () => {
    const event1: RawParsedEvent = {
      date: '2024-01-15',
      details: 'Title issued',
      state: 'NC',
    }
    const event2: RawParsedEvent = {
      date: '2024-01-15',
      details: 'Title issued',
      state: 'CA',
    }

    expect(areSimilarEvents(event1, event2, EventTypes.TITLE, EventTypes.TITLE)).toBe(
      false
    )
  })
})
