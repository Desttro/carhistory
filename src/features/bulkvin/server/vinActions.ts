import { REPORT_CREDIT_COST } from '~/features/credits/constants'
import { creditsActions } from '~/features/credits/server/creditsActions'
import { reportActions } from '~/features/reports/server/reportActions'
import { validateVin } from '~/features/vin/validation'

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

  return bulkvinClient.checkVin(validation.normalizedVin)
}

async function purchaseReport(
  authData: AuthData,
  vin: string
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

  // verify data exists via check endpoint
  const checkResult = await bulkvinClient.checkVin(normalizedVin)
  if (!checkResult.success) {
    return {
      success: false,
      error: checkResult.error || 'No records available for this VIN',
    }
  }

  // determine which reports we expect based on check result
  const expectCarfax = (checkResult.carfaxRecords ?? 0) > 0
  const expectAutocheck = (checkResult.autocheckRecords ?? 0) > 0

  console.info('[vinActions] expecting reports:', { expectCarfax, expectAutocheck })

  // fetch both reports (queue handles rate limiting)
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

  // create the report using existing reportActions
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

  return { success: true, reportId: createResult.reportId }
}
