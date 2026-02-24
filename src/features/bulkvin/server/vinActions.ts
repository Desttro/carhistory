import { eq, and } from 'drizzle-orm'

import { getDb } from '~/database'
import { vinCheckCache } from '~/database/schema-private'
import { REPORT_CREDIT_COST } from '~/features/credits/constants'
import { creditsActions } from '~/features/credits/server/creditsActions'
import { reportActions } from '~/features/reports/server/reportActions'
import { validateVin } from '~/features/vin-lookup/validation'

import { bulkvinClient } from '../client'

import type { VinCheckResult } from '../types'
import type { AuthData } from '~/features/auth/types'

interface PurchaseReportResult {
  success: boolean
  reportId?: string
  error?: string
}

export const vinActions = {
  checkVin,
  purchaseReport,
}

async function checkVin(vin: string): Promise<VinCheckResult> {
  const validation = validateVin(vin)

  if (!validation.valid) {
    return {
      success: false,
      error: validation.error,
    }
  }

  const result = await bulkvinClient.checkVin(validation.normalizedVin)

  // upsert cache with record counts (no parsedReport links yet)
  if (result.success) {
    const db = getDb()
    const carfaxRecords = result.carfaxRecords ?? 0
    const autocheckRecords = result.autocheckRecords ?? 0

    // bulkvin returns model as e.g. "2021 BMW 5 SERIES M550I XDRIVE" — year may be embedded
    const yearNum = typeof result.year === 'number' ? result.year : null
    const parsedYear =
      yearNum ?? (result.model ? Number.parseInt(result.model, 10) || null : null)

    await db
      .insert(vinCheckCache)
      .values({
        id: crypto.randomUUID(),
        vin: validation.normalizedVin,
        carfaxRecords,
        autocheckRecords,
        model: result.model,
        year: parsedYear,
      })
      .onConflictDoUpdate({
        target: [vinCheckCache.vin, vinCheckCache.carfaxRecords, vinCheckCache.autocheckRecords],
        set: {
          lastVerifiedAt: new Date().toISOString(),
          model: result.model,
          year: parsedYear,
        },
      })
  }

  return result
}

async function purchaseReport(
  authData: AuthData,
  vin: string,
  knownCounts?: { carfaxRecords?: number; autocheckRecords?: number }
): Promise<PurchaseReportResult> {
  if (!authData?.id) {
    return { success: false, error: 'Authentication required' }
  }

  const validation = validateVin(vin)

  if (!validation.valid) {
    return {
      success: false,
      error: validation.error,
    }
  }

  const normalizedVin = validation.normalizedVin

  // check if user already has a valid report for this VIN
  const existingReport = await reportActions.hasValidReport(authData, normalizedVin)
  if (existingReport.hasReport) {
    return {
      success: true,
      reportId: existingReport.reportId,
    }
  }

  // check user has enough credits
  const balance = await creditsActions.getBalance(authData)
  if (balance < REPORT_CREDIT_COST) {
    return {
      success: false,
      error: `Insufficient credits. You need at least ${REPORT_CREDIT_COST} credit to purchase a report.`,
    }
  }

  const purchaseStart = Date.now()

  // always do a fresh free check to get current record counts
  let carfaxRecords: number
  let autocheckRecords: number

  if (
    knownCounts &&
    (knownCounts.carfaxRecords !== undefined ||
      knownCounts.autocheckRecords !== undefined)
  ) {
    carfaxRecords = knownCounts.carfaxRecords ?? 0
    autocheckRecords = knownCounts.autocheckRecords ?? 0
    console.info('[vinActions] using frontend counts, skipping checkVin:', {
      carfaxRecords,
      autocheckRecords,
    })
  } else {
    const checkResult = await bulkvinClient.checkVin(normalizedVin)
    if (!checkResult.success) {
      return {
        success: false,
        error: checkResult.error || 'No records available for this VIN',
      }
    }
    carfaxRecords = checkResult.carfaxRecords ?? 0
    autocheckRecords = checkResult.autocheckRecords ?? 0
    console.info('[vinActions] checked via API:', { carfaxRecords, autocheckRecords })
  }

  const expectCarfax = carfaxRecords > 0
  const expectAutocheck = autocheckRecords > 0

  // try cache-based creation
  const cacheResult = await tryCreateFromCache(
    authData,
    normalizedVin,
    carfaxRecords,
    autocheckRecords
  )

  if (cacheResult) {
    console.info(
      `[vinActions] cache hit - report created from cache in ${Date.now() - purchaseStart}ms`
    )
    return cacheResult
  }

  // cache miss - fetch fresh from bulkvin paid endpoints
  const htmlContents: string[] = []

  const { carfax: carfaxResult, autocheck: autocheckResult } =
    await bulkvinClient.getBothReports(normalizedVin, {
      requireBoth: expectCarfax && expectAutocheck,
    })

  console.info('[vinActions] carfax result:', {
    success: carfaxResult.success,
    error: carfaxResult.error,
    hasHtml: !!carfaxResult.html,
  })
  console.info('[vinActions] autocheck result:', {
    success: autocheckResult.success,
    error: autocheckResult.error,
    hasHtml: !!autocheckResult.html,
  })

  // validate we got expected reports
  if (expectCarfax && !carfaxResult.success) {
    return {
      success: false,
      error: carfaxResult.error || 'Failed to fetch Carfax report. Please try again.',
    }
  }

  if (expectAutocheck && !autocheckResult.success) {
    return {
      success: false,
      error:
        autocheckResult.error || 'Failed to fetch AutoCheck report. Please try again.',
    }
  }

  if (carfaxResult.success && carfaxResult.html) {
    htmlContents.push(carfaxResult.html)
  }

  if (autocheckResult.success && autocheckResult.html) {
    htmlContents.push(autocheckResult.html)
  }

  if (htmlContents.length === 0) {
    return { success: false, error: 'Failed to fetch any report data. Please try again.' }
  }

  // deduct credits
  const deductResult = await creditsActions.deductCredits(
    authData,
    REPORT_CREDIT_COST,
    'report_purchase',
    normalizedVin,
    `Vehicle report purchase for VIN: ${normalizedVin}`
  )

  if (!deductResult.success) {
    return { success: false, error: deductResult.error || 'Failed to deduct credits' }
  }

  // create the report
  const createResult = await reportActions.createReport(authData, htmlContents)

  if (!createResult.success) {
    // refund credits on failure
    await creditsActions.addCredits(
      authData,
      REPORT_CREDIT_COST,
      'refund',
      normalizedVin,
      `Refund for failed report purchase: ${normalizedVin}`
    )
    return { success: false, error: createResult.error || 'Failed to create report' }
  }

  // update vinCheckCache with parsedReport links for future reuse
  if (createResult.parsedReportIds && createResult.parsedReportIds.length > 0) {
    const db = getDb()
    const carfaxParsed = createResult.parsedReportIds.find((p) => p.provider === 'carfax')
    const autocheckParsed = createResult.parsedReportIds.find(
      (p) => p.provider === 'autocheck'
    )

    await db
      .insert(vinCheckCache)
      .values({
        id: crypto.randomUUID(),
        vin: normalizedVin,
        carfaxRecords,
        autocheckRecords,
        carfaxReportHtmlId: carfaxParsed?.reportHtmlId ?? null,
        autocheckReportHtmlId: autocheckParsed?.reportHtmlId ?? null,
        carfaxParsedReportId: carfaxParsed?.parsedReportId ?? null,
        autocheckParsedReportId: autocheckParsed?.parsedReportId ?? null,
      })
      .onConflictDoUpdate({
        target: [vinCheckCache.vin, vinCheckCache.carfaxRecords, vinCheckCache.autocheckRecords],
        set: {
          lastVerifiedAt: new Date().toISOString(),
          carfaxReportHtmlId: carfaxParsed?.reportHtmlId ?? null,
          autocheckReportHtmlId: autocheckParsed?.reportHtmlId ?? null,
          carfaxParsedReportId: carfaxParsed?.parsedReportId ?? null,
          autocheckParsedReportId: autocheckParsed?.parsedReportId ?? null,
        },
      })
  }

  console.info(`[vinActions] purchaseReport completed in ${Date.now() - purchaseStart}ms`)
  return { success: true, reportId: createResult.reportId }
}

// attempt to create report from cache - returns result if cache hit, null if miss
async function tryCreateFromCache(
  authData: AuthData,
  vin: string,
  carfaxRecords: number,
  autocheckRecords: number
): Promise<PurchaseReportResult | null> {
  const db = getDb()

  // look for a cache entry with matching counts that has parsedReport links
  const cached = await db
    .select()
    .from(vinCheckCache)
    .where(
      and(
        eq(vinCheckCache.vin, vin),
        eq(vinCheckCache.carfaxRecords, carfaxRecords),
        eq(vinCheckCache.autocheckRecords, autocheckRecords)
      )
    )
    .limit(1)

  if (cached.length === 0) {
    return null
  }

  const cacheEntry = cached[0]

  // verify all available sources have cached parsedReport links
  const cachedParsedReportIds: string[] = []

  if (carfaxRecords > 0) {
    if (!cacheEntry.carfaxParsedReportId) return null
    cachedParsedReportIds.push(cacheEntry.carfaxParsedReportId)
  }

  if (autocheckRecords > 0) {
    if (!cacheEntry.autocheckParsedReportId) return null
    cachedParsedReportIds.push(cacheEntry.autocheckParsedReportId)
  }

  if (cachedParsedReportIds.length === 0) {
    return null
  }

  // deduct credits before creating from cache
  const deductResult = await creditsActions.deductCredits(
    authData,
    REPORT_CREDIT_COST,
    'report_purchase',
    vin,
    `Vehicle report purchase for VIN: ${vin} (cached)`
  )

  if (!deductResult.success) {
    return { success: false, error: deductResult.error || 'Failed to deduct credits' }
  }

  // try creating from cache
  const createResult = await reportActions.createReportFromCache(
    authData,
    vin,
    cachedParsedReportIds
  )

  if (!createResult.success) {
    // refund credits and fall through to fresh fetch
    await creditsActions.addCredits(
      authData,
      REPORT_CREDIT_COST,
      'refund',
      vin,
      `Refund for failed cache-based report: ${vin}`
    )

    // null cache entry parsedReport links so we don't try again
    await db
      .update(vinCheckCache)
      .set({
        carfaxParsedReportId: null,
        autocheckParsedReportId: null,
        carfaxReportHtmlId: null,
        autocheckReportHtmlId: null,
      })
      .where(eq(vinCheckCache.id, cacheEntry.id))

    console.info('[vinActions] cache-based creation failed, falling through to fresh fetch')
    return null
  }

  // update lastVerifiedAt on success
  await db
    .update(vinCheckCache)
    .set({ lastVerifiedAt: new Date().toISOString() })
    .where(eq(vinCheckCache.id, cacheEntry.id))

  return { success: true, reportId: createResult.reportId }
}
