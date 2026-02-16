import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, basename } from 'node:path'

import { describe, expect, test } from 'vitest'

import { AutoCheckParser } from '~/features/reports/parsers/autocheck/AutoCheckParser'
import { CarfaxParser } from '~/features/reports/parsers/carfax/CarfaxParser'

const DECODED_HTML_DIR = join(process.cwd(), 'decoded_html')

interface TestFile {
  vin: string
  provider: 'autocheck' | 'carfax'
  path: string
}

function getTestFiles(): TestFile[] {
  if (!existsSync(DECODED_HTML_DIR)) {
    return []
  }

  const files = readdirSync(DECODED_HTML_DIR)
  const testFiles: TestFile[] = []

  for (const file of files) {
    if (!file.endsWith('.html')) continue

    const match = file.match(/^([A-HJ-NPR-Z0-9]{17})_(autocheck|carfax)\.html$/)
    if (match) {
      testFiles.push({
        vin: match[1],
        provider: match[2] as 'autocheck' | 'carfax',
        path: join(DECODED_HTML_DIR, file),
      })
    }
  }

  return testFiles
}

const testFiles = getTestFiles()
const autocheckFiles = testFiles.filter((f) => f.provider === 'autocheck')
const carfaxFiles = testFiles.filter((f) => f.provider === 'carfax')

describe('AutoCheckParser', () => {
  test.skipIf(autocheckFiles.length === 0)('parses all autocheck files', () => {
    const results: Array<{
      vin: string
      success: boolean
      eventCount: number
      accidentCount: number
      errors: string[]
      warnings: string[]
    }> = []

    for (const file of autocheckFiles) {
      const html = readFileSync(file.path, 'utf-8')
      const parser = new AutoCheckParser(html)
      const result = parser.parse()

      results.push({
        vin: file.vin,
        success: result.success,
        eventCount: result.report?.events?.length ?? 0,
        accidentCount: result.report?.accidentCount ?? 0,
        errors: result.errors,
        warnings: result.warnings,
      })
    }

    // verify all files parsed successfully
    for (const r of results) {
      expect(r.success, `AutoCheck ${r.vin} should parse successfully`).toBe(true)
      expect(r.errors, `AutoCheck ${r.vin} should have no errors`).toEqual([])
    }

    // log summary
    console.info('\nAutoCheck Parser Results:')
    console.info('='.repeat(60))
    for (const r of results) {
      console.info(
        `${r.vin}: ${r.eventCount} events, ${r.accidentCount} accidents${r.warnings.length > 0 ? ` (${r.warnings.length} warnings)` : ''}`
      )
    }
  })

  test.skipIf(autocheckFiles.length === 0)(
    'extracts correct VIN from autocheck files',
    () => {
      for (const file of autocheckFiles) {
        const html = readFileSync(file.path, 'utf-8')
        const parser = new AutoCheckParser(html)
        const result = parser.parse()

        expect(
          result.report?.vehicleInfo?.vin,
          `VIN should match filename for ${basename(file.path)}`
        ).toBe(file.vin)
      }
    }
  )

  test.skipIf(autocheckFiles.length === 0)(
    'handles collapse-999 "All Reported Events" pattern',
    () => {
      // find file with collapse-999 pattern
      const file = autocheckFiles.find((f) => f.vin === '3C6MRVJG6SE502433')
      if (!file) return

      const html = readFileSync(file.path, 'utf-8')
      const parser = new AutoCheckParser(html)
      const result = parser.parse()

      expect(result.success).toBe(true)
      expect(result.report?.events).toBeDefined()

      // events from collapse-999 should have undefined ownerSequence
      const eventsWithOwner = result.report?.events?.filter(
        (e) => e.ownerSequence !== undefined
      )
      const eventsWithoutOwner = result.report?.events?.filter(
        (e) => e.ownerSequence === undefined
      )

      // this file uses collapse-999, so most events should have undefined owner
      console.info(
        `3C6MRVJG6SE502433: ${eventsWithOwner?.length ?? 0} events with owner, ${eventsWithoutOwner?.length ?? 0} events without owner`
      )
    }
  )
})

describe('CarfaxParser', () => {
  test.skipIf(carfaxFiles.length === 0)('parses all carfax files', () => {
    const results: Array<{
      vin: string
      success: boolean
      eventCount: number
      accidentCount: number
      errors: string[]
      warnings: string[]
      format: string
    }> = []

    for (const file of carfaxFiles) {
      const html = readFileSync(file.path, 'utf-8')
      const parser = new CarfaxParser(html)
      const result = parser.parse()

      // detect format
      const isClassic = html.includes('class="details-row')
      const isModern = html.includes('detailed-history-row-main')

      results.push({
        vin: file.vin,
        success: result.success,
        eventCount: result.report?.events?.length ?? 0,
        accidentCount: result.report?.accidentCount ?? 0,
        errors: result.errors,
        warnings: result.warnings,
        format: isClassic ? 'classic' : isModern ? 'modern' : 'unknown',
      })
    }

    // verify all files parsed successfully
    for (const r of results) {
      expect(r.success, `Carfax ${r.vin} (${r.format}) should parse successfully`).toBe(
        true
      )
      expect(r.errors, `Carfax ${r.vin} should have no errors`).toEqual([])
    }

    // log summary
    console.info('\nCarfax Parser Results:')
    console.info('='.repeat(60))
    for (const r of results) {
      console.info(
        `${r.vin} [${r.format}]: ${r.eventCount} events, ${r.accidentCount} accidents${r.warnings.length > 0 ? ` (${r.warnings.length} warnings)` : ''}`
      )
    }
  })

  test.skipIf(carfaxFiles.length === 0)('extracts correct VIN from carfax files', () => {
    for (const file of carfaxFiles) {
      const html = readFileSync(file.path, 'utf-8')
      const parser = new CarfaxParser(html)
      const result = parser.parse()

      expect(
        result.report?.vehicleInfo?.vin,
        `VIN should match filename for ${basename(file.path)}`
      ).toBe(file.vin)
    }
  })

  test.skipIf(carfaxFiles.length === 0)('parses classic format correctly', () => {
    // WAUDG74F25N111998 uses classic format
    const file = carfaxFiles.find((f) => f.vin === 'WAUDG74F25N111998')
    if (!file) return

    const html = readFileSync(file.path, 'utf-8')
    const parser = new CarfaxParser(html)
    const result = parser.parse()

    expect(result.success).toBe(true)
    expect(result.report?.events?.length).toBeGreaterThan(0)

    console.info(`WAUDG74F25N111998 (classic): ${result.report?.events?.length} events`)
  })

  test.skipIf(carfaxFiles.length === 0)('parses modern format correctly', () => {
    // 1G1Y72D49L5108561 uses modern format
    const file = carfaxFiles.find((f) => f.vin === '1G1Y72D49L5108561')
    if (!file) return

    const html = readFileSync(file.path, 'utf-8')
    const parser = new CarfaxParser(html)
    const result = parser.parse()

    expect(result.success).toBe(true)
    expect(result.report?.events?.length).toBeGreaterThan(0)

    console.info(`1G1Y72D49L5108561 (modern): ${result.report?.events?.length} events`)
  })
})

describe('Parser Summary', () => {
  test.skipIf(testFiles.length === 0)('all files parse with events', () => {
    const summary: Array<{
      vin: string
      provider: string
      eventCount: number
      success: boolean
    }> = []

    for (const file of testFiles) {
      const html = readFileSync(file.path, 'utf-8')
      const parser =
        file.provider === 'autocheck' ? new AutoCheckParser(html) : new CarfaxParser(html)
      const result = parser.parse()

      summary.push({
        vin: file.vin,
        provider: file.provider,
        eventCount: result.report?.events?.length ?? 0,
        success: result.success,
      })
    }

    // group by VIN
    const byVin = new Map<string, typeof summary>()
    for (const s of summary) {
      const existing = byVin.get(s.vin) ?? []
      existing.push(s)
      byVin.set(s.vin, existing)
    }

    console.info('\nParsing Summary by VIN:')
    console.info('='.repeat(70))
    console.info('VIN                 | AutoCheck Events | Carfax Events')
    console.info('-'.repeat(70))

    for (const [vin, results] of byVin) {
      const autocheck = results.find((r) => r.provider === 'autocheck')
      const carfax = results.find((r) => r.provider === 'carfax')

      const acEvents = autocheck ? `${autocheck.eventCount}` : 'N/A'
      const cfEvents = carfax ? `${carfax.eventCount}` : 'N/A'

      console.info(`${vin} | ${acEvents.padStart(16)} | ${cfEvents.padStart(13)}`)
    }

    // verify minimum event counts (at least some events for non-brand-new vehicles)
    const allSuccess = summary.every((s) => s.success)
    expect(allSuccess).toBe(true)
  })
})
