import { PARSER_VERSIONS } from '../../constants'
import { BaseParser } from '../base/BaseParser'

import type {
  ParseResult,
  SourceReport,
  ParsedVehicleInfo,
  RawParsedEvent,
  AccidentRecord,
  Severity,
  ReportProvider,
  ProviderVersion,
  DatePrecision,
} from '../../types'

export class CarfaxParser extends BaseParser {
  readonly provider: ReportProvider = 'carfax'
  readonly parserVersion: ProviderVersion = PARSER_VERSIONS.carfax

  parse(): ParseResult {
    try {
      const vehicleInfo = this.parseVehicleInfo()
      if (!vehicleInfo.vin) {
        this.addError('Could not extract VIN from report')
        return this.buildResult(undefined)
      }

      const events = this.parseEvents()
      const accidents = this.parseAccidents()

      const report: SourceReport = {
        provider: this.provider,
        parserVersion: this.parserVersion,
        reportDate: this.parseReportDate(),
        vehicleInfo,
        estimatedOwners: this.parseOwnerCount(),
        accidentCount: accidents.length,
        odometerLastReported: this.findLastOdometer(events),
        odometerLastDate: this.findLastOdometerDate(events),
        odometerIssues: this.checkOdometerIssues(),
        titleBrands: this.parseTitleBrands(),
        totalLoss: this.checkTotalLoss(),
        openRecallCount: this.parseOpenRecallCount(),
        events,
        accidents,
        serviceRecordCount: this.countServiceRecords(events),
      }

      return this.buildResult(report)
    } catch (err) {
      this.addError(`Parser error: ${err instanceof Error ? err.message : String(err)}`)
      return this.buildResult(undefined)
    }
  }

  protected parseVehicleInfo(): ParsedVehicleInfo {
    // try data-vin attribute first
    let vin = this.getAttr('[data-vin]', 'data-vin')

    // fallback: parse from title
    if (!vin) {
      const title = this.$('title').text()
      const vinMatch = title.match(/([A-HJ-NPR-Z0-9]{17})/)
      vin = vinMatch?.[1]
    }

    // parse vehicle info from title
    // format: "CARFAX Vehicle History Report for this 2020 CHEVROLET CORVETTE STINGRAY: VIN"
    const title = this.$('title').text()
    const titleMatch = title.match(
      /(\d{4})\s+([A-Z]+)\s+([A-Z0-9\s]+):\s*[A-HJ-NPR-Z0-9]{17}/i
    )

    let year: number | undefined
    let make: string | undefined
    let model: string | undefined

    if (titleMatch) {
      year = parseInt(titleMatch[1], 10)
      make = this.capitalizeFirst(titleMatch[2])
      model = this.capitalizeFirst(titleMatch[3].trim())
    }

    return {
      vin: vin?.toUpperCase() || '',
      year,
      make,
      model,
    }
  }

  private capitalizeFirst(str: string): string {
    return str
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  protected parseEvents(): RawParsedEvent[] {
    // detect format and use appropriate parser
    if (this.isClassicFormat()) {
      return this.parseClassicEvents()
    }
    return this.parseModernEvents()
  }

  private isClassicFormat(): boolean {
    return this.$('.details-row').length > 0
  }

  private parseModernEvents(): RawParsedEvent[] {
    const events: RawParsedEvent[] = []

    // find all owner blocks
    this.$('.owner-block').each((ownerIndex, ownerBlock) => {
      const ownerSequence = ownerIndex + 1

      // find records within this owner block - use TR rows, not divs
      this.$(ownerBlock)
        .find('.detailed-history-row-main')
        .each((_, recordRow) => {
          const event = this.parseModernRecord(recordRow, ownerSequence)
          if (event) {
            events.push(event)
          }
        })
    })

    // also try narrow record format
    this.$('.narrow-record').each((_, record) => {
      const event = this.parseNarrowRecord(record)
      if (event) {
        events.push(event)
      }
    })

    return events
  }

  private parseClassicEvents(): RawParsedEvent[] {
    const events: RawParsedEvent[] = []
    let ownerSequence = 0

    this.$('.details-row').each((_, row) => {
      const $row = this.$(row)

      // headers indicate new owner section
      if ($row.hasClass('details-row-header')) {
        ownerSequence++
        return
      }

      const event = this.parseClassicRecord(row, ownerSequence || 1)
      if (event) events.push(event)
    })

    return events
  }

  private parseClassicRecord(
    row: cheerio.Element,
    ownerSequence: number
  ): RawParsedEvent | null {
    const $row = this.$(row)

    // classic format: Date | Mileage | Source | Icon | Comments
    // date is in first div[valign="top"] or direct child div
    const dateDiv = $row.children('div').first()
    let dateText = dateDiv.clone().children().remove().end().text().trim()

    // handle "Not Reported" dates
    if (!dateText || dateText.toLowerCase() === 'not reported') {
      return null
    }

    const date = this.parseDate(dateText)
    if (!date) return null

    // mileage is in .mileage or second column
    const odometerText = $row.find('.mileage').text().trim()
    const odometer = this.parseOdometer(odometerText)

    // source is in .vehicleRecordSource or .source-lines
    const sourceLines: string[] = []
    $row.find('.source-line').each((_, line) => {
      const text = this.$(line).text().trim()
      if (text) sourceLines.push(text)
    })
    const source = sourceLines.join(' - ')

    // location from source lines (often has city, state format)
    const location = sourceLines.find((s) => /,\s*[A-Z]{2}/i.test(s))

    // details from comments
    const detailParts: string[] = []
    $row.find('.detail-record-comments-group').each((_, group) => {
      const text = this.$(group).text().trim()
      if (text) detailParts.push(text)
    })
    const details = detailParts.join('\n') || $row.find('div').last().text().trim()

    return {
      date,
      datePrecision: this.getDatePrecision(dateText),
      location: location || undefined,
      state: this.extractState(location || ''),
      odometer,
      dataSource: source || undefined,
      details,
      ownerSequence,
    }
  }

  private parseModernRecord(
    recordRow: cheerio.Element,
    ownerSequence?: number
  ): RawParsedEvent | null {
    const $record = this.$(recordRow)

    // date is in first column - get only direct text, not children
    const $dateCol = $record.find('.record-normal-first-column').first()
    let dateText = $dateCol.clone().children().remove().end().text().trim()

    // handle "Not Reported" dates
    if (!dateText || dateText.toLowerCase() === 'not reported') {
      return null
    }

    const date = this.parseDate(dateText)
    if (!date) return null

    // check for "not reported" odometer
    const odometerCell = $record.find('.record-odometer-reading')
    const notReported = odometerCell
      .find('.visually-hidden')
      .text()
      .includes('not reported')
    const odometer = notReported ? undefined : this.parseOdometer(odometerCell.text())

    // collect ALL source lines
    const sourceLines: string[] = []
    $record.find('.detail-record-source-line').each((_, line) => {
      const text = this.$(line).text().trim()
      if (text) sourceLines.push(text)
    })
    const source = sourceLines.join(' - ')

    // extract details
    const details = this.extractRecordDetails($record)

    // extract location from source lines (state/province)
    const location = sourceLines.find((s) => /,\s*[A-Z]{2}/i.test(s)) || sourceLines[0]

    return {
      date,
      datePrecision: this.getDatePrecision(dateText),
      location: location || undefined,
      state: this.extractState(location || ''),
      odometer,
      dataSource: source || undefined,
      details,
      ownerSequence,
    }
  }

  private parseNarrowRecord(record: cheerio.Element): RawParsedEvent | null {
    const $record = this.$(record)

    const dateText = $record.find('.narrow-record-date').text().trim()
    const date = this.parseDate(dateText)
    if (!date) return null

    const odometerText = $record.find('.narrow-record-odometer-reading').text()
    const odometer = this.parseOdometer(odometerText)

    const details = this.extractRecordDetails($record)
    const source = $record.find('.narrow-record-source').text().trim()

    return {
      date,
      datePrecision: this.getDatePrecision(dateText),
      odometer,
      dataSource: source || undefined,
      details,
    }
  }

  private extractRecordDetails($record: cheerio.Cheerio<cheerio.Element>): string {
    const parts: string[] = []

    // collect from record-comments-group
    $record.find('.record-comments-group').each((_, group) => {
      const outer = this.$(group).find('.comments-group-outer-line').text().trim()
      if (outer) parts.push(outer)

      this.$(group)
        .find('.record-comments-group-inner-line')
        .each((_, line) => {
          const text = this.$(line).text().trim()
          if (text) parts.push(text)
        })
    })

    // also try accident-damage-record-comments
    const comments = $record.find('.accident-damage-record-comments p').text().trim()
    if (comments) parts.push(comments)

    return parts.join('\n') || $record.text().trim().slice(0, 500)
  }

  private getDatePrecision(dateText: string): DatePrecision {
    if (/^\d{1,2}\/\d{4}$/.test(dateText)) return 'month'
    if (/^\d{4}$/.test(dateText)) return 'year'
    return 'day'
  }

  protected parseAccidents(): AccidentRecord[] {
    const accidents: AccidentRecord[] = []

    // find accident-damage-record sections
    this.$('.accident-damage-record').each((_, record) => {
      const $record = this.$(record)

      const dateText = $record.find('.accident-damage-record-comments p').first().text()
      const date = this.parseDate(dateText)
      if (!date) return

      // get severity from poi-image or severity indicators
      const severityText = $record.find('.severity-indicator-text').text()
      let severity: Severity = 'unknown'
      if (severityText) {
        severity = this.parseSeverity(severityText)
      } else {
        // check for damage classes in SVG
        const hasDamage =
          $record.find('.poi-image.front').length > 0 ||
          $record.find('.poi-image.rear').length > 0
        if (hasDamage) {
          severity = 'moderate'
        }
      }

      // get damage type from comments
      const comments = $record.find('.record-comments-group').text()
      let type = 'Accident'
      if (comments.toLowerCase().includes('total loss')) {
        type = 'Total Loss'
        severity = 'severe'
      } else if (comments.toLowerCase().includes('collision')) {
        type = 'Collision'
      } else if (comments.toLowerCase().includes('structural')) {
        type = 'Structural Damage'
        severity = 'severe'
      }

      // get impact areas
      const impactAreas: string[] = []
      const poiImage = $record.find('.poi-image')
      const poiClasses = poiImage.attr('class') || ''
      const positions = [
        'front',
        'rear',
        'left',
        'right',
        'left-front',
        'right-front',
        'left-rear',
        'right-rear',
      ]
      for (const pos of positions) {
        if (poiClasses.includes(pos)) {
          impactAreas.push(pos)
        }
      }

      accidents.push({
        date,
        type,
        severity,
        impactAreas: impactAreas.length > 0 ? impactAreas : undefined,
      })
    })

    return accidents
  }

  private parseReportDate(): string | undefined {
    // from meta tag: content="03.Dec.2025 16:30:18"
    const timestamp = this.getAttr('meta[name="timeStamp"]', 'content')
    if (timestamp) {
      // format: "03.Dec.2025 16:30:18"
      const match = timestamp.match(/(\d{2})\.(\w{3})\.(\d{4})/)
      if (match) {
        const [, day, monthStr, year] = match
        const months: Record<string, string> = {
          jan: '01',
          feb: '02',
          mar: '03',
          apr: '04',
          may: '05',
          jun: '06',
          jul: '07',
          aug: '08',
          sep: '09',
          oct: '10',
          nov: '11',
          dec: '12',
        }
        const month = months[monthStr.toLowerCase()]
        if (month) {
          return `${year}-${month}-${day}`
        }
      }
    }

    // try data-rptdate attribute
    const rptDate = this.getAttr('[data-rptdate]', 'data-rptdate')
    if (rptDate) {
      const match = rptDate.match(/(\d{2})\.(\w{3})\.(\d{4})/)
      if (match) {
        const [, day, monthStr, year] = match
        const months: Record<string, string> = {
          jan: '01',
          feb: '02',
          mar: '03',
          apr: '04',
          may: '05',
          jun: '06',
          jul: '07',
          aug: '08',
          sep: '09',
          oct: '10',
          nov: '11',
          dec: '12',
        }
        const month = months[monthStr.toLowerCase()]
        if (month) {
          return `${year}-${month}-${day}`
        }
      }
    }

    return undefined
  }

  private parseOwnerCount(): number | undefined {
    // look for owner count indicators
    const ownerBlocks = this.$('.owner-block').length
    if (ownerBlocks > 0) {
      return ownerBlocks
    }

    // try to find in summary sections
    const ownerText = this.$('.ownership-history-section .summary-value').text()
    const match = ownerText.match(/(\d+)/)
    if (match) {
      return parseInt(match[1], 10)
    }

    return undefined
  }

  private findLastOdometer(events: RawParsedEvent[]): number | undefined {
    // find the most recent event with odometer reading
    const withOdometer = events.filter((e) => e.odometer !== undefined)
    if (withOdometer.length === 0) return undefined

    // sort by date descending
    withOdometer.sort((a, b) => b.date.localeCompare(a.date))
    return withOdometer[0].odometer
  }

  private findLastOdometerDate(events: RawParsedEvent[]): string | undefined {
    const withOdometer = events.filter((e) => e.odometer !== undefined)
    if (withOdometer.length === 0) return undefined

    withOdometer.sort((a, b) => b.date.localeCompare(a.date))
    return withOdometer[0].date
  }

  private checkOdometerIssues(): boolean {
    const pageText = this.html.toLowerCase()
    return (
      pageText.includes('odometer rollback') ||
      pageText.includes('odometer discrepancy') ||
      pageText.includes('odometer problem') ||
      this.$('.odometer-alert').length > 0
    )
  }

  private parseTitleBrands(): string[] {
    const brands: string[] = []
    const pageText = this.html.toLowerCase()

    const brandPatterns = [
      'salvage',
      'rebuilt',
      'flood',
      'fire',
      'hail',
      'junk',
      'lemon',
      'manufacturer buyback',
    ]

    for (const brand of brandPatterns) {
      // look for title brand indicators
      if (
        this.$(`#SALVAGETITLE`).length > 0 ||
        this.$('.comments-line-alert').text().toLowerCase().includes(brand)
      ) {
        brands.push(brand)
      }
    }

    // also check for salvage in page content with strong indicators
    if (pageText.includes('salvage title') && !brands.includes('salvage')) {
      brands.push('salvage')
    }

    return brands
  }

  private checkTotalLoss(): boolean {
    const hasAlert = this.$('.comments-line-alert')
      .text()
      .toLowerCase()
      .includes('total loss')
    const inContent =
      this.html.toLowerCase().includes('total loss vehicle') ||
      this.$('#TOTALLOSS').length > 0

    return hasAlert || inContent
  }

  private parseOpenRecallCount(): number {
    // look for recall section
    const recallText = this.$('.recall-section, .open-recalls').text().toLowerCase()

    if (recallText.includes('no open recalls') || recallText.includes('0 open')) {
      return 0
    }

    const match = recallText.match(/(\d+)\s*open\s*recall/i)
    if (match) {
      return parseInt(match[1], 10)
    }

    // check for recall indicators
    if (this.$('.recall-alert').length > 0) {
      return 1
    }

    return 0
  }

  private countServiceRecords(events: RawParsedEvent[]): number {
    return events.filter(
      (e) =>
        e.dataSource?.toLowerCase().includes('service') ||
        e.details.toLowerCase().includes('service') ||
        e.details.toLowerCase().includes('maintenance')
    ).length
  }
}

// need to declare cheerio namespace types
declare namespace cheerio {
  type Element = import('domhandler').Element
  type Cheerio<T> = import('cheerio').Cheerio<T>
}
