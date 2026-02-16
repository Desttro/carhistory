import * as cheerio from 'cheerio'

import type {
  ParseResult,
  SourceReport,
  ReportProvider,
  ProviderVersion,
  ParsedVehicleInfo,
  RawParsedEvent,
  AccidentRecord,
  Severity,
} from '../../types'
import type { CheerioAPI } from 'cheerio'
import type { Element } from 'domhandler'

export abstract class BaseParser {
  protected $: CheerioAPI
  protected html: string
  protected errors: string[] = []
  protected warnings: string[] = []

  abstract readonly provider: ReportProvider
  abstract readonly parserVersion: ProviderVersion

  constructor(html: string) {
    this.html = html
    this.$ = cheerio.load(html)
  }

  abstract parse(): ParseResult

  protected abstract parseVehicleInfo(): ParsedVehicleInfo
  protected abstract parseEvents(): RawParsedEvent[]
  protected abstract parseAccidents(): AccidentRecord[]

  // utility methods for subclasses

  protected getText(selector: string): string {
    return this.$(selector).first().text().trim()
  }

  protected getTextAll(selector: string): string[] {
    return this.$(selector)
      .map((_, el) => this.$(el).text().trim())
      .get()
      .filter((t) => t.length > 0)
  }

  protected getAttr(selector: string, attr: string): string | undefined {
    return this.$(selector).first().attr(attr)
  }

  protected parseNumber(text: string): number | undefined {
    const cleaned = text.replace(/[,\s]/g, '')
    const num = parseInt(cleaned, 10)
    return Number.isNaN(num) ? undefined : num
  }

  protected parseDate(dateStr: string): string | undefined {
    if (!dateStr) return undefined

    // try various date formats
    const formats = [
      // MM/DD/YYYY
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
      // YYYY-MM-DD
      /^(\d{4})-(\d{2})-(\d{2})$/,
      // MM/YYYY
      /^(\d{1,2})\/(\d{4})$/,
      // Month DD, YYYY
      /^(\w+)\s+(\d{1,2}),?\s+(\d{4})$/,
    ]

    const cleaned = dateStr.trim()

    // MM/DD/YYYY format
    let match = cleaned.match(formats[0])
    if (match) {
      const [, month, day, year] = match
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    }

    // already ISO format
    match = cleaned.match(formats[1])
    if (match) {
      return cleaned
    }

    // MM/YYYY format (month precision)
    match = cleaned.match(formats[2])
    if (match) {
      const [, month, year] = match
      return `${year}-${month.padStart(2, '0')}`
    }

    return undefined
  }

  protected parseSeverity(text: string): Severity {
    const lower = text.toLowerCase()
    if (lower.includes('severe') || lower.includes('major')) return 'severe'
    if (lower.includes('moderate')) return 'moderate'
    if (lower.includes('minor')) return 'minor'
    return 'unknown'
  }

  protected extractState(location: string): string | undefined {
    if (!location) return undefined

    // check for state abbreviation at end (CITY, ST)
    const abbrevMatch = location.match(/,\s*([A-Z]{2})\s*$/i)
    if (abbrevMatch) {
      return abbrevMatch[1].toUpperCase()
    }

    // check for just state abbreviation
    if (/^[A-Z]{2}$/i.test(location.trim())) {
      return location.trim().toUpperCase()
    }

    return undefined
  }

  protected parseOdometer(text: string): number | undefined {
    if (!text) return undefined

    // extract number, ignoring commas and other characters
    const match = text.match(/([\d,]+)/)
    if (match) {
      return this.parseNumber(match[1])
    }

    return undefined
  }

  protected cleanText(text: string): string {
    return text.replace(/\s+/g, ' ').replace(/\n+/g, ' ').trim()
  }

  protected addError(message: string): void {
    this.errors.push(message)
  }

  protected addWarning(message: string): void {
    this.warnings.push(message)
  }

  protected buildResult(report: SourceReport | undefined): ParseResult {
    return {
      success: report !== undefined && this.errors.length === 0,
      report,
      errors: this.errors,
      warnings: this.warnings,
    }
  }
}
