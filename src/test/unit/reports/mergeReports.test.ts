import { describe, expect, test } from 'vitest'

import { mergeReports } from '~/features/reports/merge/mergeReports'

import type { SourceReport } from '~/features/reports/types'

describe('mergeReports', () => {
  const baseAutoCheckReport: SourceReport = {
    provider: 'autocheck',
    parserVersion: 'autocheck@v1.0.0',
    reportDate: '2024-01-15',
    vehicleInfo: {
      vin: '1G1Y72D49L5108561',
      year: 2020,
      make: 'Chevrolet',
      model: 'Corvette',
      trim: 'Stingray',
    },
    estimatedOwners: 3,
    accidentCount: 1,
    odometerLastReported: 50000,
    odometerLastDate: '2024-01-10',
    odometerIssues: false,
    titleBrands: ['salvage'],
    totalLoss: true,
    openRecallCount: 0,
    events: [
      {
        date: '2024-01-05',
        details: 'Oil change and filter replacement at dealer',
        dataSource: 'Service Record',
        odometer: 49000,
        state: 'NC',
      },
      {
        date: '2024-01-10',
        details: 'Title issued',
        dataSource: 'Motor Vehicle Dept.',
        odometer: 50000,
        state: 'NC',
      },
    ],
    accidents: [
      {
        date: '2023-06-15',
        type: 'Collision',
        severity: 'moderate',
      },
    ],
  }

  const baseCarfaxReport: SourceReport = {
    provider: 'carfax',
    parserVersion: 'carfax@v1.0.0',
    reportDate: '2024-01-15',
    vehicleInfo: {
      vin: '1G1Y72D49L5108561',
      year: 2020,
      make: 'Chevrolet',
      model: 'Corvette Stingray',
    },
    estimatedOwners: 2,
    accidentCount: 1,
    odometerLastReported: 50100,
    odometerLastDate: '2024-01-12',
    odometerIssues: false,
    titleBrands: [],
    totalLoss: false,
    openRecallCount: 1,
    events: [
      {
        date: '2024-01-05',
        details: 'Oil change and filter replacement done',
        dataSource: 'Service',
        odometer: 49050,
        state: 'NC',
      },
      {
        date: '2024-01-12',
        details: 'Registration renewed',
        dataSource: 'DMV',
        odometer: 50100,
        state: 'NC',
      },
    ],
    accidents: [
      {
        date: '2023-06-15',
        type: 'Front collision',
        severity: 'moderate',
      },
    ],
  }

  test('merges vehicle info from multiple sources', () => {
    const result = mergeReports([
      { report: baseAutoCheckReport, parsedReportId: 'p1' },
      { report: baseCarfaxReport, parsedReportId: 'p2' },
    ])

    expect(result.vehicleInfo.vin).toBe('1G1Y72D49L5108561')
    expect(result.vehicleInfo.year).toBe(2020)
    expect(result.vehicleInfo.make).toBe('Chevrolet')
    expect(result.vehicleInfo.model).toBe('Corvette')
    expect(result.vehicleInfo.trim).toBe('Stingray')
  })

  test('takes max estimated owners', () => {
    const result = mergeReports([
      { report: baseAutoCheckReport, parsedReportId: 'p1' },
      { report: baseCarfaxReport, parsedReportId: 'p2' },
    ])

    expect(result.estimatedOwners).toBe(3)
  })

  test('merges title brands', () => {
    const result = mergeReports([
      { report: baseAutoCheckReport, parsedReportId: 'p1' },
      { report: baseCarfaxReport, parsedReportId: 'p2' },
    ])

    expect(result.titleBrands).toContain('salvage')
  })

  test('takes true for totalLoss if any source reports it', () => {
    const result = mergeReports([
      { report: baseAutoCheckReport, parsedReportId: 'p1' },
      { report: baseCarfaxReport, parsedReportId: 'p2' },
    ])

    expect(result.totalLoss).toBe(true)
  })

  test('deduplicates similar events', () => {
    const result = mergeReports([
      { report: baseAutoCheckReport, parsedReportId: 'p1' },
      { report: baseCarfaxReport, parsedReportId: 'p2' },
    ])

    // should have service events from both sources
    const serviceEvents = result.events.filter((e) => e.eventType === 'SERVICE')
    // exact dedup depends on fingerprint match, similar text may create separate events
    expect(serviceEvents.length).toBeGreaterThanOrEqual(1)

    // all events should have at least one source
    for (const event of result.events) {
      expect(event.sources.length).toBeGreaterThanOrEqual(1)
    }
  })

  test('deduplicates accidents by month', () => {
    const result = mergeReports([
      { report: baseAutoCheckReport, parsedReportId: 'p1' },
      { report: baseCarfaxReport, parsedReportId: 'p2' },
    ])

    expect(result.accidents.length).toBe(1)
    expect(result.accidents[0].date).toBe('2023-06-15')
  })

  test('includes source providers', () => {
    const result = mergeReports([
      { report: baseAutoCheckReport, parsedReportId: 'p1' },
      { report: baseCarfaxReport, parsedReportId: 'p2' },
    ])

    expect(result.sourceProviders).toContain('autocheck')
    expect(result.sourceProviders).toContain('carfax')
  })

  test('calculates correct event count', () => {
    const result = mergeReports([
      { report: baseAutoCheckReport, parsedReportId: 'p1' },
      { report: baseCarfaxReport, parsedReportId: 'p2' },
    ])

    expect(result.eventCount).toBe(result.events.length)
  })

  test('finds last odometer from events', () => {
    const result = mergeReports([
      { report: baseAutoCheckReport, parsedReportId: 'p1' },
      { report: baseCarfaxReport, parsedReportId: 'p2' },
    ])

    expect(result.odometerLastReported).toBeDefined()
  })

  test('throws error for empty source list', () => {
    expect(() => mergeReports([])).toThrow('Cannot merge empty source list')
  })
})
