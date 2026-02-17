import { describe, expect, test } from 'vitest'

import {
  detectProvider,
  extractVinFromHtml,
} from '~/features/reports/ingest/detectProvider'

describe('detectProvider', () => {
  test('detects autocheck from page content', () => {
    const html = `
      <html>
        <head><title>Welcome to AutoCheck - Full Report</title></head>
        <body id="fastLinkFullReport">
          <div>Experian AutoCheck Report</div>
          <img src="https://www.autocheck.com/reportservice/common/img/experian-logo.png">
        </body>
      </html>
    `
    const result = detectProvider(html)
    expect(result).not.toBeNull()
    expect(result?.provider).toBe('autocheck')
    expect(result?.confidence).toBeGreaterThan(0.3)
  })

  test('detects carfax from react page', () => {
    const html = `
      <html>
        <head>
          <title data-react-helmet="true">CARFAX Vehicle History Report for this 2020 CHEVROLET: 1G1Y72D49L5108561</title>
          <meta content="CARFAX_ONLINE" data-react-helmet="true" name="permutation">
        </head>
        <body>
          <div>CARFAX Report</div>
        </body>
      </html>
    `
    const result = detectProvider(html)
    expect(result).not.toBeNull()
    expect(result?.provider).toBe('carfax')
    expect(result?.version).toBe('react')
  })

  test('returns null for unknown provider', () => {
    const html = '<html><body>Hello world</body></html>'
    const result = detectProvider(html)
    expect(result).toBeNull()
  })
})

describe('extractVinFromHtml', () => {
  test('extracts VIN from autocheck format', () => {
    const html = `
      <div class="decode-box-row">
        <div class="decode-label">VIN:</div>
        <div class="decode-data">1G1Y72D49L5108561</div>
      </div>
    `
    const vin = extractVinFromHtml(html)
    expect(vin).toBe('1G1Y72D49L5108561')
  })

  test('extracts VIN from carfax title', () => {
    const html = `
      <title>CARFAX Report: 1G1Y72D49L5108561</title>
    `
    const vin = extractVinFromHtml(html)
    expect(vin).toBe('1G1Y72D49L5108561')
  })

  test('extracts VIN from data attribute', () => {
    const html = `
      <div data-vin="1G1Y72D49L5108561">Report</div>
    `
    const vin = extractVinFromHtml(html)
    expect(vin).toBe('1G1Y72D49L5108561')
  })

  test('returns null when no VIN found', () => {
    const html = '<html><body>No VIN here</body></html>'
    const vin = extractVinFromHtml(html)
    expect(vin).toBeNull()
  })

  test('returns most common VIN when multiple found', () => {
    const html = `
      <div>VIN: 1G1Y72D49L5108561</div>
      <div>VIN: 1G1Y72D49L5108561</div>
      <div>VIN: 1G1Y72D49L5108561</div>
      <div>Other: WAUDG74F25N111998</div>
    `
    const vin = extractVinFromHtml(html)
    expect(vin).toBe('1G1Y72D49L5108561')
  })
})
