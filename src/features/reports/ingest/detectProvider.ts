import type { ReportProvider } from '../types'

interface ProviderDetectionResult {
  provider: ReportProvider
  version?: string
  confidence: number
}

// detect the report provider from HTML content
export function detectProvider(html: string): ProviderDetectionResult | null {
  const lowerHtml = html.toLowerCase()

  // autocheck detection patterns
  const autocheckPatterns = [
    'autocheck.com',
    'experian autocheck',
    'autocheck score',
    'autocheck report',
    'freeLinkReport',
    'fastLinkFullReport',
    'experian-logo.png',
  ]

  // carfax detection patterns
  const carfaxPatterns = [
    'carfax.com',
    'carfax vehicle history',
    'carfax_online',
    'data-react-helmet',
    'carfax report',
  ]

  let autocheckScore = 0
  let carfaxScore = 0

  for (const pattern of autocheckPatterns) {
    if (lowerHtml.includes(pattern.toLowerCase())) {
      autocheckScore++
    }
  }

  for (const pattern of carfaxPatterns) {
    if (lowerHtml.includes(pattern.toLowerCase())) {
      carfaxScore++
    }
  }

  // determine provider based on scores
  if (autocheckScore > carfaxScore && autocheckScore > 0) {
    return {
      provider: 'autocheck',
      confidence: Math.min(autocheckScore / autocheckPatterns.length, 1),
    }
  }

  if (carfaxScore > autocheckScore && carfaxScore > 0) {
    // check for react version vs classic
    const isReactVersion = lowerHtml.includes('data-react-helmet')
    return {
      provider: 'carfax',
      version: isReactVersion ? 'react' : 'classic',
      confidence: Math.min(carfaxScore / carfaxPatterns.length, 1),
    }
  }

  // check title as fallback
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  if (titleMatch) {
    const title = titleMatch[1].toLowerCase()
    if (title.includes('autocheck')) {
      return { provider: 'autocheck', confidence: 0.5 }
    }
    if (title.includes('carfax')) {
      return { provider: 'carfax', confidence: 0.5 }
    }
  }

  return null
}

// extract VIN from HTML content
export function extractVinFromHtml(html: string): string | null {
  // VIN pattern: 17 alphanumeric characters (excluding I, O, Q)
  const vinPattern = /\b[A-HJ-NPR-Z0-9]{17}\b/g

  // try to find VIN in structured locations first
  const structuredPatterns = [
    // autocheck VIN field
    /VIN[:\s]*<[^>]*>([A-HJ-NPR-Z0-9]{17})</i,
    // carfax title pattern
    /:\s*([A-HJ-NPR-Z0-9]{17})\s*<\/title>/i,
    // generic VIN label
    /VIN[:\s]+([A-HJ-NPR-Z0-9]{17})/i,
    // data attribute
    /data-vin="([A-HJ-NPR-Z0-9]{17})"/i,
    // id containing VIN
    /id="[^"]*([A-HJ-NPR-Z0-9]{17})[^"]*"/i,
  ]

  for (const pattern of structuredPatterns) {
    const match = html.match(pattern)
    if (match && match[1]) {
      return match[1].toUpperCase()
    }
  }

  // fallback to finding any VIN-like string
  const allVins = html.match(vinPattern)
  if (allVins && allVins.length > 0) {
    // return most common VIN if multiple found
    const vinCounts = new Map<string, number>()
    for (const vin of allVins) {
      const upper = vin.toUpperCase()
      vinCounts.set(upper, (vinCounts.get(upper) || 0) + 1)
    }

    let mostCommon = ''
    let maxCount = 0
    for (const [vin, count] of vinCounts) {
      if (count > maxCount) {
        maxCount = count
        mostCommon = vin
      }
    }
    return mostCommon || null
  }

  return null
}
