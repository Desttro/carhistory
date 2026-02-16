import { eq, and, gt } from 'drizzle-orm'

import { getDb } from '~/database'
import {
  vehicle,
  vehicleReport,
  reportHtml,
  parsedReport,
  timelineEvent,
} from '~/database/schema-public'

import { REPORT_VALIDITY_DAYS } from '../constants'
import { computeContentHash } from '../ingest/computeHash'
import { detectProvider, extractVinFromHtml } from '../ingest/detectProvider'
import { storeHtml } from '../ingest/storeHtml'
import { mergeReports } from '../merge/mergeReports'
import { AutoCheckParser } from '../parsers/autocheck/AutoCheckParser'
import { CarfaxParser } from '../parsers/carfax/CarfaxParser'

import type { CanonicalReport, ReportProvider, SourceReport } from '../types'
import type { AuthData } from '~/features/auth/types'

export const reportActions = {
  createReport,
  getReport,
  hasValidReport,
  getUserReports,
}

interface CreateReportResult {
  success: boolean
  reportId?: string
  error?: string
}

// create a new report for a VIN (each call = new purchase)
async function createReport(
  authData: AuthData,
  htmlContents: string[]
): Promise<CreateReportResult> {
  if (!authData?.id) {
    return { success: false, error: 'Authentication required' }
  }

  if (htmlContents.length === 0) {
    return { success: false, error: 'No HTML content provided' }
  }

  const db = getDb()
  const userId = authData.id

  // parse all HTML files and extract VINs
  const parsedSources: Array<{
    html: string
    provider: ReportProvider
    report: SourceReport
    contentHash: string
  }> = []

  let primaryVin: string | null = null

  for (const html of htmlContents) {
    // detect provider
    const detection = detectProvider(html)
    if (!detection) {
      return { success: false, error: 'Could not detect report provider' }
    }

    // parse the report
    const parser =
      detection.provider === 'autocheck'
        ? new AutoCheckParser(html)
        : new CarfaxParser(html)

    const result = parser.parse()
    if (!result.success || !result.report) {
      return {
        success: false,
        error: `Failed to parse ${detection.provider} report: ${result.errors.join(', ')}`,
      }
    }

    const vin = result.report.vehicleInfo.vin
    if (!vin) {
      return { success: false, error: 'Could not extract VIN from report' }
    }

    // verify all reports are for the same VIN
    if (primaryVin === null) {
      primaryVin = vin
    } else if (vin !== primaryVin) {
      return {
        success: false,
        error: `VIN mismatch: expected ${primaryVin}, got ${vin}`,
      }
    }

    parsedSources.push({
      html,
      provider: detection.provider,
      report: result.report,
      contentHash: computeContentHash(html),
    })
  }

  if (!primaryVin) {
    return { success: false, error: 'Could not determine VIN' }
  }

  // create or update vehicle record
  const existingVehicle = await db
    .select()
    .from(vehicle)
    .where(eq(vehicle.vin, primaryVin))
    .limit(1)

  if (existingVehicle.length === 0) {
    const vehicleInfo = parsedSources[0].report.vehicleInfo
    await db.insert(vehicle).values({
      id: primaryVin,
      vin: primaryVin,
      year: vehicleInfo.year,
      make: vehicleInfo.make,
      model: vehicleInfo.model,
      trim: vehicleInfo.trim,
      bodyStyle: vehicleInfo.bodyStyle,
      engine: vehicleInfo.engine,
      transmission: vehicleInfo.transmission,
      drivetrain: vehicleInfo.drivetrain,
      fuelType: vehicleInfo.fuelType,
      vehicleClass: vehicleInfo.vehicleClass,
      countryOfAssembly: vehicleInfo.countryOfAssembly,
    })
  }

  // create the purchased report
  const reportId = crypto.randomUUID()
  const purchasedAt = new Date()
  const expiresAt = new Date(purchasedAt)
  expiresAt.setDate(expiresAt.getDate() + REPORT_VALIDITY_DAYS)

  await db.insert(vehicleReport).values({
    id: reportId,
    vehicleId: primaryVin,
    userId,
    purchasedAt: purchasedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  })

  // store HTML and create parsed reports
  const mergeInputs: Array<{ report: SourceReport; parsedReportId: string }> = []

  for (const source of parsedSources) {
    // check if HTML already exists by content hash
    let htmlRecord = await db
      .select()
      .from(reportHtml)
      .where(eq(reportHtml.contentHash, source.contentHash))
      .limit(1)

    let reportHtmlId: string

    if (htmlRecord.length === 0) {
      // store new HTML
      const storageResult = await storeHtml(source.html, primaryVin, source.provider)

      reportHtmlId = crypto.randomUUID()
      await db.insert(reportHtml).values({
        id: reportHtmlId,
        vehicleId: primaryVin,
        provider: source.provider,
        providerVersion: source.report.parserVersion,
        r2Key: storageResult.r2Key,
        r2Bucket: storageResult.r2Bucket,
        contentHash: storageResult.contentHash,
        fileSizeBytes: storageResult.fileSizeBytes,
        reportDate: source.report.reportDate,
      })
    } else {
      reportHtmlId = htmlRecord[0].id
    }

    // create parsed report
    const parsedReportId = crypto.randomUUID()
    await db.insert(parsedReport).values({
      id: parsedReportId,
      reportHtmlId,
      vehicleId: primaryVin,
      vehicleReportId: reportId,
      provider: source.provider,
      parserVersion: source.report.parserVersion,
      status: 'success',
      estimatedOwners: source.report.estimatedOwners,
      accidentCount: source.report.accidentCount,
      odometerLastReported: source.report.odometerLastReported,
      odometerLastDate: source.report.odometerLastDate,
      odometerIssues: source.report.odometerIssues,
      titleBrands: source.report.titleBrands,
      totalLoss: source.report.totalLoss,
      providerScore: source.report.providerScore,
      providerScoreRangeLow: source.report.providerScoreRangeLow,
      providerScoreRangeHigh: source.report.providerScoreRangeHigh,
      rawParsedJson: source.report as any,
    })

    mergeInputs.push({ report: source.report, parsedReportId })
  }

  // merge all sources into canonical report
  const canonical = mergeReports(mergeInputs)

  // insert timeline events
  for (const event of canonical.events) {
    await db.insert(timelineEvent).values({
      id: crypto.randomUUID(),
      vehicleReportId: reportId,
      vehicleId: primaryVin,
      eventType: event.eventType,
      eventSubtype: event.eventSubtype,
      eventDate: event.eventDate,
      eventDatePrecision: event.eventDatePrecision,
      location: event.location,
      state: event.state,
      country: event.country,
      odometerMiles: event.odometerMiles,
      summary: event.summary,
      details: event.details,
      detailsJson: event.detailsJson,
      severity: event.severity,
      isNegative: event.isNegative,
      ownerSequence: event.ownerSequence,
      sources: event.sources,
      fingerprint: event.fingerprint,
    })
  }

  // update vehicle report with canonical data
  await db
    .update(vehicleReport)
    .set({
      estimatedOwners: canonical.estimatedOwners,
      accidentCount: canonical.accidentCount,
      odometerLastReported: canonical.odometerLastReported,
      odometerLastDate: canonical.odometerLastDate,
      odometerIssues: canonical.odometerIssues,
      titleBrands: canonical.titleBrands,
      totalLoss: canonical.totalLoss,
      openRecallCount: canonical.openRecallCount,
      eventCount: canonical.eventCount,
      serviceRecordCount: canonical.serviceRecordCount,
      sourceProviders: canonical.sourceProviders,
      canonicalJson: canonical as any,
    })
    .where(eq(vehicleReport.id, reportId))

  return { success: true, reportId }
}

// get report by ID (checks expiration)
async function getReport(
  authData: AuthData,
  reportId: string
): Promise<CanonicalReport | null> {
  if (!authData?.id) {
    return null
  }

  const db = getDb()
  const userId = authData.id
  const now = new Date().toISOString()

  const result = await db
    .select()
    .from(vehicleReport)
    .where(
      and(
        eq(vehicleReport.id, reportId),
        eq(vehicleReport.userId, userId),
        gt(vehicleReport.expiresAt, now)
      )
    )
    .limit(1)

  if (result.length === 0) {
    return null
  }

  return result[0].canonicalJson as CanonicalReport
}

// check if user has valid (non-expired) report for VIN
async function hasValidReport(
  authData: AuthData,
  vin: string
): Promise<{ hasReport: boolean; reportId?: string; expiresAt?: string }> {
  if (!authData?.id) {
    return { hasReport: false }
  }

  const db = getDb()
  const userId = authData.id
  const now = new Date().toISOString()

  const result = await db
    .select({
      id: vehicleReport.id,
      expiresAt: vehicleReport.expiresAt,
    })
    .from(vehicleReport)
    .where(
      and(
        eq(vehicleReport.vehicleId, vin),
        eq(vehicleReport.userId, userId),
        gt(vehicleReport.expiresAt, now)
      )
    )
    .orderBy(vehicleReport.expiresAt)
    .limit(1)

  if (result.length === 0) {
    return { hasReport: false }
  }

  return {
    hasReport: true,
    reportId: result[0].id,
    expiresAt: result[0].expiresAt,
  }
}

// get all reports for a user
async function getUserReports(authData: AuthData): Promise<
  Array<{
    id: string
    vin: string
    year?: number
    make?: string
    model?: string
    purchasedAt: string
    expiresAt: string
    isExpired: boolean
  }>
> {
  if (!authData?.id) {
    return []
  }

  const db = getDb()
  const userId = authData.id
  const now = new Date().toISOString()

  const results = await db
    .select({
      id: vehicleReport.id,
      vehicleId: vehicleReport.vehicleId,
      purchasedAt: vehicleReport.purchasedAt,
      expiresAt: vehicleReport.expiresAt,
      year: vehicle.year,
      make: vehicle.make,
      model: vehicle.model,
    })
    .from(vehicleReport)
    .leftJoin(vehicle, eq(vehicleReport.vehicleId, vehicle.id))
    .where(eq(vehicleReport.userId, userId))
    .orderBy(vehicleReport.purchasedAt)

  return results.map((r) => ({
    id: r.id,
    vin: r.vehicleId,
    year: r.year || undefined,
    make: r.make || undefined,
    model: r.model || undefined,
    purchasedAt: r.purchasedAt,
    expiresAt: r.expiresAt,
    isExpired: r.expiresAt < now,
  }))
}
