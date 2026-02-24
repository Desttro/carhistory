import { router } from 'one'
import { useCallback, useState } from 'react'

import { SERVER_URL } from '~/constants/urls'
import { analytics } from '~/features/analytics/analytics'
import { REPORT_CREDIT_COST } from '~/features/credits/constants'
import { useCredits } from '~/features/credits/useCredits'
import { useUser } from '~/features/user/useUser'
import { dialogConfirm } from '~/interface/dialogs/actions'
import { showToast } from '~/interface/toast/helpers'

import { VIN_LENGTH } from './validation'

import type { VinCheckResult } from '~/features/bulkvin/types'

export type VinErrorType = 'no-records' | 'network' | 'auth' | 'credits' | null

interface PurchaseResult {
  success: boolean
  reportId?: string
  error?: string
}

export function useVinLookup() {
  const { user } = useUser()
  const { balance } = useCredits()

  const [vin, setVin] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [checkResult, setCheckResult] = useState<VinCheckResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [errorType, setErrorType] = useState<VinErrorType>(null)

  const checkVin = useCallback(async () => {
    const normalizedVin = vin.toUpperCase().trim()

    if (normalizedVin.length !== VIN_LENGTH) {
      setError(`VIN must be exactly ${VIN_LENGTH} characters`)
      return
    }

    setIsChecking(true)
    setError(null)
    setErrorType(null)
    setCheckResult(null)

    try {
      const res = await fetch(
        `${SERVER_URL}/api/vin/check?vin=${encodeURIComponent(normalizedVin)}`
      )
      const data = (await res.json()) as VinCheckResult

      if (!data.success) {
        const errorMsg = data.error || 'No records found for this VIN'
        analytics.track('vin_searched', {
          vin: normalizedVin,
          success: false,
          error: errorMsg,
        })
        setError(errorMsg)
        setErrorType('no-records')
        return
      }

      analytics.track('vin_searched', { vin: normalizedVin, success: true })
      // include the VIN in the result for use in pricing redirects
      setCheckResult({ ...data, vin: normalizedVin })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to check VIN'
      analytics.track('vin_searched', {
        vin: normalizedVin,
        success: false,
        error: errorMsg,
      })
      console.info('vin check error:', err)
      setError(errorMsg)
      setErrorType('network')
    } finally {
      setIsChecking(false)
    }
  }, [vin])

  const purchaseReport = useCallback(async () => {
    if (!user) {
      setError('Please log in to purchase a report')
      setErrorType('auth')
      return
    }

    if (balance < REPORT_CREDIT_COST) {
      setError(
        `Insufficient credits. You need at least ${REPORT_CREDIT_COST} credit to purchase a report.`
      )
      setErrorType('credits')
      return
    }

    const normalizedVin = vin.toUpperCase().trim()

    // confirm purchase with user
    const confirmed = await dialogConfirm({
      title: 'Purchase Report',
      description: `This will use ${REPORT_CREDIT_COST} credit to get the full vehicle history report for VIN: ${normalizedVin}`,
    })

    if (!confirmed) {
      return
    }

    setIsPurchasing(true)
    setError(null)
    setErrorType(null)

    try {
      const res = await fetch(`${SERVER_URL}/api/vin/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          vin: normalizedVin,
          carfaxRecords: checkResult?.carfaxRecords,
          autocheckRecords: checkResult?.autocheckRecords,
        }),
      })

      const data = (await res.json()) as PurchaseResult

      if (!data.success) {
        const errorMsg = data.error || 'Failed to purchase report'
        analytics.track('report_purchased', {
          vin: normalizedVin,
          success: false,
          error: errorMsg,
        })
        setError(errorMsg)
        return
      }

      analytics.track('report_purchased', {
        vin: normalizedVin,
        reportId: data.reportId,
        success: true,
      })

      // credits balance updates automatically via Zero sync
      showToast('Report purchased successfully')

      if (data.reportId) {
        router.push(`/home/reports/${data.reportId}`)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to purchase report'
      analytics.track('report_purchased', {
        vin: normalizedVin,
        success: false,
        error: errorMsg,
      })
      console.info('purchase report error:', err)
      setError(errorMsg)
    } finally {
      setIsPurchasing(false)
    }
  }, [vin, user, balance, checkResult])

  const reset = useCallback(() => {
    setVin('')
    setCheckResult(null)
    setError(null)
    setErrorType(null)
  }, [])

  return {
    vin,
    setVin,
    isChecking,
    isPurchasing,
    checkResult,
    error,
    errorType,
    checkVin,
    purchaseReport,
    reset,
    isLoggedIn: !!user,
    hasCredits: balance >= REPORT_CREDIT_COST,
    creditBalance: balance,
  }
}
