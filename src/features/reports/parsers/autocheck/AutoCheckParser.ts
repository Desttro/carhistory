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

export class AutoCheckParser extends BaseParser {
  readonly provider: ReportProvider = 'autocheck'
  readonly parserVersion: ProviderVersion = PARSER_VERSIONS.autocheck

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
        odometerLastReported: this.parseLastOdometer(),
        odometerLastDate: this.parseLastOdometerDate(),
        odometerIssues: this.checkOdometerIssues(),
        titleBrands: this.parseTitleBrands(),
        totalLoss: this.checkTotalLoss(),
        openRecallCount: this.parseOpenRecallCount(),
        events,
        accidents,
        providerScore: this.parseScore(),
        providerScoreRangeLow: this.parseScoreRangeLow(),
        providerScoreRangeHigh: this.parseScoreRangeHigh(),
        serviceRecordCount: this.countServiceRecords(events),
      }

      return this.buildResult(report)
    } catch (err) {
      this.addError(`Parser error: ${err instanceof Error ? err.message : String(err)}`)
      return this.buildResult(undefined)
    }
  }

  protected parseVehicleInfo(): ParsedVehicleInfo {
    // VIN from decode box - try multiple formats
    let vin = this.$('.decode-box-row:contains("VIN") .decode-data').first().text().trim()

    // alternate format: rTable structure
    if (!vin) {
      const vinRow = this.$('.rTableRow:has(.decodelabel:contains("VIN"))').first()
      vin = vinRow.find('.rTableCell').not('.decodelabel').first().text().trim()
    }

    vin = vin.toUpperCase()

    // year and make/model from title
    const titleParts = this.parseVehicleTitle()

    // body style and engine from subtitle
    const subtitle =
      this.$('.box-subtitle').first().text().trim() ||
      this.$('.vindecode-ms').first().text().trim()
    const subtitleParts = this.parseSubtitle(subtitle)

    // vehicle class - try multiple formats
    let vehicleClass = this.getText('.decode-box-row:contains("Class") .decode-data')
    if (!vehicleClass) {
      const classRow = this.$('.rTableRow:has(.decodelabel:contains("Class"))').first()
      vehicleClass = classRow
        .find('.rTableCell')
        .not('.decodelabel')
        .first()
        .text()
        .trim()
    }

    // country of assembly - try multiple formats
    let countryOfAssembly = this.getText(
      '.decode-box-row:contains("Country of Assembly") .decode-data'
    )
    if (!countryOfAssembly) {
      const countryRow = this.$(
        '.rTableRow:has(.decodelabel:contains("Country of Assembly"))'
      ).first()
      countryOfAssembly = countryRow
        .find('.rTableCell')
        .not('.decodelabel')
        .first()
        .text()
        .trim()
    }

    return {
      vin,
      year: titleParts.year,
      make: titleParts.make,
      model: titleParts.model,
      trim: titleParts.trim,
      bodyStyle: subtitleParts.bodyStyle,
      engine: subtitleParts.engine,
      vehicleClass: vehicleClass || undefined,
      countryOfAssembly: countryOfAssembly || undefined,
    }
  }

  private parseVehicleTitle(): {
    year?: number
    make?: string
    model?: string
    trim?: string
  } {
    // try standard format first
    let titleElements = this.$('.box-title-decode')
    const texts: string[] = []
    titleElements.each((_, el) => {
      texts.push(this.$(el).text().trim())
    })

    let fullTitle = texts.join(' ').trim()

    // alternate format: vindecode-ymm
    if (!fullTitle) {
      const altTitle = this.$('.vindecode-ymm')
      altTitle.find('span').each((_, el) => {
        const text = this.$(el).text().trim()
        if (text) texts.push(text)
      })
      fullTitle = texts.join(' ').trim()
    }

    // pattern: "2020 Chevrolet Corvette Stingray"
    const match = fullTitle.match(/^(\d{4})\s+(\w+)\s+(.+)$/)
    if (match) {
      const [, yearStr, make, rest] = match
      // try to separate model and trim
      const modelParts = rest.split(/\s+/)
      const model = modelParts[0]
      const trim = modelParts.slice(1).join(' ') || undefined

      return {
        year: parseInt(yearStr, 10),
        make,
        model,
        trim,
      }
    }

    return {}
  }

  private parseSubtitle(subtitle: string): { bodyStyle?: string; engine?: string } {
    // pattern: "Coupe 2D (6.2L V8 DI Gasoline)"
    const match = subtitle.match(/^([^(]+)(?:\(([^)]+)\))?/)
    if (match) {
      return {
        bodyStyle: match[1]?.trim() || undefined,
        engine: match[2]?.trim() || undefined,
      }
    }
    return {}
  }

  protected parseEvents(): RawParsedEvent[] {
    const events: RawParsedEvent[] = []

    // standard format: HTML tables in #history section
    this.$('#history table.table-stripedX tbody tr').each((_, row) => {
      const cells = this.$(row).find('td')
      if (cells.length < 5) return

      const dateText = this.$(cells[0]).text().trim()
      const location = this.$(cells[1]).text().trim()
      const odometerText = this.$(cells[2]).text().trim()
      const dataSource = this.$(cells[3]).text().trim()
      const details = this.$(cells[4]).text().trim()

      if (!dateText || !details) return

      const date = this.parseDate(dateText)
      if (!date) {
        this.addWarning(`Could not parse date: ${dateText}`)
        return
      }

      // determine owner sequence from parent card
      const ownerCard = this.$(row).closest('[id^="collapse-"]')
      const ownerSequence = this.extractOwnerSequence(ownerCard.attr('id'))

      events.push({
        date,
        datePrecision: this.getDatePrecision(dateText),
        location: location || undefined,
        state: this.extractState(location),
        odometer: this.parseOdometer(odometerText),
        dataSource: dataSource || undefined,
        details,
        ownerSequence,
      })
    })

    // alternate format: rTable structure with div rows
    this.$('.historyTable .rTableBody .rTableRow').each((_, row) => {
      const cells = this.$(row).find('.rTableCell')
      if (cells.length < 5) return

      const dateText = this.$(cells[0]).text().trim()
      const location = this.$(cells[1]).text().trim()
      const odometerText = this.$(cells[2]).text().trim()
      const dataSource = this.$(cells[3]).text().trim()
      const details = this.$(cells[4]).text().trim()

      if (!dateText || !details) return

      const date = this.parseDate(dateText)
      if (!date) {
        this.addWarning(`Could not parse date: ${dateText}`)
        return
      }

      // alternate format doesn't have owner sections
      events.push({
        date,
        datePrecision: this.getDatePrecision(dateText),
        location: location || undefined,
        state: this.extractState(location),
        odometer: this.parseOdometer(odometerText),
        dataSource: dataSource || undefined,
        details,
      })
    })

    return events
  }

  private extractOwnerSequence(collapseId?: string): number | undefined {
    if (!collapseId) return undefined

    // id format: "collapse-{ownerNumber}-{vin}"
    const match = collapseId.match(/collapse-(\d+)-/)
    if (match) {
      const seq = parseInt(match[1], 10)
      // sequence 0 is pre-titling events, 999 is "All Reported Events" (no owner info)
      // only return valid owner sequences (1-998)
      return seq > 0 && seq < 999 ? seq : undefined
    }
    return undefined
  }

  private getDatePrecision(dateText: string): DatePrecision {
    // MM/YYYY format
    if (/^\d{1,2}\/\d{4}$/.test(dateText)) return 'month'
    // YYYY format
    if (/^\d{4}$/.test(dateText)) return 'year'
    // MM/DD/YYYY format
    return 'day'
  }

  protected parseAccidents(): AccidentRecord[] {
    const accidents: AccidentRecord[] = []

    // accident table in #accident section
    this.$('#accident table.table-striped tbody tr').each((_, row) => {
      const cells = this.$(row).find('td')
      if (cells.length < 3) return

      const dateText = this.$(cells[0]).text().trim()
      const type = this.$(cells[1]).text().trim()
      const severityText = this.$(cells[2]).text().trim()

      const date = this.parseDate(dateText)
      if (!date) return

      accidents.push({
        date,
        type,
        severity: this.parseSeverity(severityText),
        airbagDeployed: this.checkAccidentIndicator('airbag'),
        structuralDamage: this.checkAccidentIndicator('structural'),
        overturned: this.checkAccidentIndicator('overturned'),
        impactAreas: this.parseImpactAreas(),
      })
    })

    return accidents
  }

  private checkAccidentIndicator(type: string): boolean {
    const selector = `#accident img[src*="${type}"][alt*="-on"]`
    return this.$(selector).length > 0
  }

  private parseImpactAreas(): string[] {
    const areas: string[] = []

    // check for indicator images (front, rear, left, right)
    const positions = ['front', 'rear', 'left', 'right']
    for (const pos of positions) {
      if (this.$(`#accident img[src*="indicator"][class*="${pos}"]`).length > 0) {
        areas.push(pos)
      }
    }

    return areas
  }

  private parseReportDate(): string | undefined {
    const dateText = this.getText('.report-date span')
    if (!dateText) return undefined

    // format: "12/06/2025 15:41:02 EST"
    const match = dateText.match(/^(\d{1,2}\/\d{1,2}\/\d{4})/)
    if (match) {
      return this.parseDate(match[1])
    }

    return undefined
  }

  private parseOwnerCount(): number | undefined {
    const ownerText = this.getText('.box-title-owners span')
    return this.parseNumber(ownerText)
  }

  private parseLastOdometer(): number | undefined {
    // from decode box: "17,714 (09/30/2025)"
    const odometerText = this.getText(
      '.decode-box-row:contains("Last Reported Odometer") .decode-data'
    )
    const match = odometerText.match(/([\d,]+)/)
    if (match) {
      return this.parseNumber(match[1])
    }
    return undefined
  }

  private parseLastOdometerDate(): string | undefined {
    const odometerText = this.getText(
      '.decode-box-row:contains("Last Reported Odometer") .decode-data'
    )
    const match = odometerText.match(/\((\d{1,2}\/\d{1,2}\/\d{4})\)/)
    if (match) {
      return this.parseDate(match[1])
    }
    return undefined
  }

  private checkOdometerIssues(): boolean {
    // check for odometer issue indicators
    const hasIssue =
      this.$('#odometer img[src*="issue-found"]').length > 0 ||
      this.$('#odometer .info-section-header-bad').length > 0 ||
      this.html.toLowerCase().includes('odometer rollback') ||
      this.html.toLowerCase().includes('odometer discrepancy')

    return hasIssue
  }

  private parseTitleBrands(): string[] {
    const brands: string[] = []

    // check at-a-glance section for title brand
    const titleBrandText = this.getText('#at-glance .subtitle')
    if (titleBrandText) {
      // common title brands
      const brandPatterns = [
        'salvage',
        'rebuilt',
        'flood',
        'fire',
        'hail',
        'junk',
        'lemon',
        'manufacturer buyback',
        'odometer rollback',
      ]

      const lowerText = titleBrandText.toLowerCase()
      for (const brand of brandPatterns) {
        if (lowerText.includes(brand)) {
          brands.push(brand)
        }
      }
    }

    // also check state title brand card
    const stateTitleBrand = this.$(
      '#at-glance .card:contains("State Title Brand") .subtitle span'
    )
      .text()
      .trim()
    if (stateTitleBrand && stateTitleBrand.toLowerCase() !== 'none') {
      if (!brands.includes(stateTitleBrand.toLowerCase())) {
        brands.push(stateTitleBrand.toLowerCase())
      }
    }

    return brands
  }

  private checkTotalLoss(): boolean {
    const insuranceLoss = this.$(
      '#at-glance .card:contains("Insurance Loss") .card-footer-text'
    )
      .text()
      .toLowerCase()
    return (
      insuranceLoss.includes('total loss') ||
      insuranceLoss.includes('insurance loss reported')
    )
  }

  private parseOpenRecallCount(): number {
    const recallText = this.$(
      '#at-glance .card:contains("Open Recall") .card-footer-text'
    )
      .text()
      .toLowerCase()

    if (recallText.includes('no open recalls')) {
      return 0
    }

    // try to extract number
    const match = recallText.match(/(\d+)\s*open\s*recall/i)
    if (match) {
      return parseInt(match[1], 10)
    }

    // if there are open recalls but no count, assume at least 1
    if (recallText.includes('open recall')) {
      return 1
    }

    return 0
  }

  private parseScore(): number | undefined {
    const scoreText = this.getText('.mainScore span')
    return this.parseNumber(scoreText)
  }

  private parseScoreRangeLow(): number | undefined {
    const lowText = this.getText('.low-score span')
    return this.parseNumber(lowText)
  }

  private parseScoreRangeHigh(): number | undefined {
    const highText = this.getText('.high-score span')
    return this.parseNumber(highText)
  }

  private countServiceRecords(events: RawParsedEvent[]): number {
    return events.filter((e) => e.dataSource?.toLowerCase().includes('service')).length
  }
}
