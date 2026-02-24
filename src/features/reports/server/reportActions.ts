import { eq, and, gt, inArray } from 'drizzle-orm'

import { getDb } from '~/database'
import { reportHtml, parsedReport, timelineEvent } from '~/database/schema-private'
import { vehicle, vehicleReport } from '~/database/schema-public'

import { REPORT_VALIDITY_DAYS } from '../constants'
import { computeContentHash } from '../ingest/computeHash'
import { detectProvider } from '../ingest/detectProvider'
import { prepareHtmlMetadata, uploadHtmlToR2 } from '../ingest/storeHtml'
import { mergeReports } from '../merge/mergeReports'
import { AutoCheckParser } from '../parsers/autocheck/AutoCheckParser'
import { CarfaxParser } from '../parsers/carfax/CarfaxParser'

import type { CanonicalReport, ReportProvider, SourceReport } from '../types'
import type { AuthData } from '~/features/auth/types'

export const reportActions = {
  createReport,
  createReportFromCache,
  getReport,
  hasValidReport,
  getUserReports,
}

interface CreateReportResult {
  success: boolean
  reportId?: string
  error?: string
  // returned to caller so vinActions can update vinCheckCache
  parsedReportIds?: Array<{ provider: ReportProvider; parsedReportId: string; reportHtmlId: string }>
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

  // --- phase 1: parse (pure computation, no DB) ---
  const parsedSources: Array<{
    html: string
    provider: ReportProvider
    report: SourceReport
    contentHash: string
  }> = []

  let primaryVin: string | null = null

  for (const html of htmlContents) {
    const detection = detectProvider(html)
    if (!detection) {
      return { success: false, error: 'Could not detect report provider' }
    }

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

  // --- phase 2: single transaction for all DB writes ---
  const reportId = crypto.randomUUID()
  const purchasedAt = new Date()
  const expiresAt = new Date(purchasedAt)
  expiresAt.setDate(expiresAt.getDate() + REPORT_VALIDITY_DAYS)

  // track pending R2 uploads for phase 3
  const pendingUploads: Array<{
    html: string
    r2Key: string
    vin: string
    provider: ReportProvider
    contentHash: string
    reportHtmlId: string
  }> = []

  const outputParsedReportIds: CreateReportResult['parsedReportIds'] = []

  const canonical = await db.transaction(async (tx) => {
    // vehicle upsert
    const existingVehicle = await tx
      .select()
      .from(vehicle)
      .where(eq(vehicle.vin, primaryVin))
      .limit(1)

    if (existingVehicle.length === 0) {
      const vehicleInfo = parsedSources[0].report.vehicleInfo
      await tx.insert(vehicle).values({
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

    // insert vehicleReport
    await tx.insert(vehicleReport).values({
      id: reportId,
      vehicleId: primaryVin,
      userId,
      purchasedAt: purchasedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
    })

    // store HTML metadata and create parsed reports
    const mergeInputs: Array<{ report: SourceReport; parsedReportId: string }> = []

    for (const source of parsedSources) {
      // check if HTML already exists by content hash
      const htmlRecord = await tx
        .select()
        .from(reportHtml)
        .where(eq(reportHtml.contentHash, source.contentHash))
        .limit(1)

      let reportHtmlId: string

      if (htmlRecord.length === 0) {
        // prepare metadata (pure computation) and insert with pending status
        const metadata = prepareHtmlMetadata(source.html, primaryVin, source.provider)

        reportHtmlId = crypto.randomUUID()
        await tx.insert(reportHtml).values({
          id: reportHtmlId,
          vehicleId: primaryVin,
          provider: source.provider,
          providerVersion: source.report.parserVersion,
          r2Key: metadata.r2Key,
          r2Bucket: metadata.r2Bucket,
          contentHash: metadata.contentHash,
          fileSizeBytes: metadata.fileSizeBytes,
          r2UploadStatus: 'pending',
          reportDate: source.report.reportDate,
        })

        pendingUploads.push({
          html: source.html,
          r2Key: metadata.r2Key,
          vin: primaryVin,
          provider: source.provider,
          contentHash: metadata.contentHash,
          reportHtmlId,
        })
      } else {
        reportHtmlId = htmlRecord[0].id
      }

      // create parsed report
      const parsedReportId = crypto.randomUUID()
      await tx.insert(parsedReport).values({
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
        rawParsedJson: source.report,
      })

      mergeInputs.push({ report: source.report, parsedReportId })
      outputParsedReportIds.push({ provider: source.provider, parsedReportId, reportHtmlId })
    }

    // merge all sources into canonical report
    const merged = mergeReports(mergeInputs)

    // batch insert timeline events
    if (merged.events.length > 0) {
      await tx.insert(timelineEvent).values(
        merged.events.map((event) => ({
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
        }))
      )
    }

    // update vehicleReport with canonical data
    await tx
      .update(vehicleReport)
      .set({
        estimatedOwners: merged.estimatedOwners,
        accidentCount: merged.accidentCount,
        odometerLastReported: merged.odometerLastReported,
        odometerLastDate: merged.odometerLastDate,
        odometerIssues: merged.odometerIssues,
        titleBrands: merged.titleBrands,
        totalLoss: merged.totalLoss,
        openRecallCount: merged.openRecallCount,
        eventCount: merged.eventCount,
        serviceRecordCount: merged.serviceRecordCount,
        sourceProviders: merged.sourceProviders,
        canonicalJson: merged,
      })
      .where(eq(vehicleReport.id, reportId))

    return merged
  })

  // --- phase 3: fire-and-forget R2 uploads ---
  for (const upload of pendingUploads) {
    uploadHtmlToR2(
      upload.html,
      upload.r2Key,
      upload.vin,
      upload.provider,
      upload.contentHash
    ).then(async () => {
      await db
        .update(reportHtml)
        .set({ r2UploadStatus: 'uploaded' })
        .where(eq(reportHtml.id, upload.reportHtmlId))
    }).catch(async (error) => {
      console.info('[reportActions] R2 upload failed, marking as failed', {
        reportHtmlId: upload.reportHtmlId,
        error: error instanceof Error ? error.message : String(error),
      })
      await db
        .update(reportHtml)
        .set({ r2UploadStatus: 'failed' })
        .where(eq(reportHtml.id, upload.reportHtmlId))
    })
  }

  return { success: true, reportId, parsedReportIds: outputParsedReportIds }
}

// create a report by reusing cached parsedReport data (no bulkvin fetch needed)
async function createReportFromCache(
  authData: AuthData,
  vin: string,
  cachedParsedReportIds: string[]
): Promise<CreateReportResult> {
  if (!authData?.id) {
    return { success: false, error: 'Authentication required' }
  }

  if (cachedParsedReportIds.length === 0) {
    return { success: false, error: 'No cached parsed report IDs provided' }
  }

  const db = getDb()
  const userId = authData.id

  // load cached parsedReport records
  const cachedReports = await db
    .select()
    .from(parsedReport)
    .where(inArray(parsedReport.id, cachedParsedReportIds))

  if (cachedReports.length === 0) {
    return { success: false, error: 'Cached parsed reports not found' }
  }

  // verify all have rawParsedJson
  const validCached = cachedReports.filter((r) => r.rawParsedJson)
  if (validCached.length === 0) {
    return { success: false, error: 'Cached parsed reports have no data' }
  }

  const reportId = crypto.randomUUID()
  const purchasedAt = new Date()
  const expiresAt = new Date(purchasedAt)
  expiresAt.setDate(expiresAt.getDate() + REPORT_VALIDITY_DAYS)

  await db.transaction(async (tx) => {
    // vehicle upsert
    const existingVehicle = await tx
      .select()
      .from(vehicle)
      .where(eq(vehicle.vin, vin))
      .limit(1)

    if (existingVehicle.length === 0) {
      const vehicleInfo = validCached[0].rawParsedJson!.vehicleInfo
      await tx.insert(vehicle).values({
        id: vin,
        vin,
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

    // insert vehicleReport
    await tx.insert(vehicleReport).values({
      id: reportId,
      vehicleId: vin,
      userId,
      purchasedAt: purchasedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
    })

    // clone parsedReport records for this new vehicleReport
    const mergeInputs: Array<{ report: SourceReport; parsedReportId: string }> = []

    for (const cached of validCached) {
      const newParsedReportId = crypto.randomUUID()
      await tx.insert(parsedReport).values({
        id: newParsedReportId,
        reportHtmlId: cached.reportHtmlId,
        vehicleId: vin,
        vehicleReportId: reportId,
        provider: cached.provider,
        parserVersion: cached.parserVersion,
        status: 'success',
        estimatedOwners: cached.estimatedOwners,
        accidentCount: cached.accidentCount,
        odometerLastReported: cached.odometerLastReported,
        odometerLastDate: cached.odometerLastDate,
        odometerIssues: cached.odometerIssues,
        titleBrands: cached.titleBrands,
        totalLoss: cached.totalLoss,
        providerScore: cached.providerScore,
        providerScoreRangeLow: cached.providerScoreRangeLow,
        providerScoreRangeHigh: cached.providerScoreRangeHigh,
        rawParsedJson: cached.rawParsedJson,
      })

      mergeInputs.push({
        report: cached.rawParsedJson!,
        parsedReportId: newParsedReportId,
      })
    }

    // merge and insert timeline events
    const canonical = mergeReports(mergeInputs)

    if (canonical.events.length > 0) {
      await tx.insert(timelineEvent).values(
        canonical.events.map((event) => ({
          id: crypto.randomUUID(),
          vehicleReportId: reportId,
          vehicleId: vin,
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
        }))
      )
    }

    // update vehicleReport with canonical data
    await tx
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
        canonicalJson: canonical,
      })
      .where(eq(vehicleReport.id, reportId))
  })

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

  return result[0].canonicalJson ?? null
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
