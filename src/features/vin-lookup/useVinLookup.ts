import { router } from 'one'
import { useCallback, useState } from 'react'

import { REPORT_CREDIT_COST } from '~/features/credits/constants'
import { useCredits } from '~/features/credits/useCredits'
import { useUser } from '~/features/user/useUser'
import { dialogConfirm } from '~/interface/dialogs/actions'
import { showToast } from '~/interface/toast/helpers'

import { VIN_LENGTH } from './validation'

import type { VinCheckResult } from '~/features/bulkvin/types'

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

  const checkVin = useCallback(async () => {
    const normalizedVin = vin.toUpperCase().trim()

    if (normalizedVin.length !== VIN_LENGTH) {
      setError(`VIN must be exactly ${VIN_LENGTH} characters`)
      return
    }

    setIsChecking(true)
    setError(null)
    setCheckResult(null)

    try {
      const res = await fetch(`/api/vin/check?vin=${encodeURIComponent(normalizedVin)}`)
      const data = (await res.json()) as VinCheckResult

      if (!data.success) {
        setError(data.error || 'No records found for this VIN')
        return
      }

      // include the VIN in the result for use in pricing redirects
      setCheckResult({ ...data, vin: normalizedVin })
    } catch (err) {
      console.info('vin check error:', err)
      setError(err instanceof Error ? err.message : 'Failed to check VIN')
    } finally {
      setIsChecking(false)
    }
  }, [vin])

  const purchaseReport = useCallback(async () => {
    if (!user) {
      setError('Please log in to purchase a report')
      return
    }

    if (balance < REPORT_CREDIT_COST) {
      setError(
        `Insufficient credits. You need at least ${REPORT_CREDIT_COST} credit to purchase a report.`
      )
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

    try {
      const res = await fetch('/api/vin/purchase', {
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
        setError(data.error || 'Failed to purchase report')
        return
      }

      // credits balance updates automatically via Zero sync
      showToast('Report purchased successfully')

      if (data.reportId) {
        router.push(`/home/reports/${data.reportId}`)
      }
    } catch (err) {
      console.info('purchase report error:', err)
      setError(err instanceof Error ? err.message : 'Failed to purchase report')
    } finally {
      setIsPurchasing(false)
    }
  }, [vin, user, balance, checkResult])

  const reset = useCallback(() => {
    setVin('')
    setCheckResult(null)
    setError(null)
  }, [])

  return {
    vin,
    setVin,
    isChecking,
    isPurchasing,
    checkResult,
    error,
    checkVin,
    purchaseReport,
    reset,
    isLoggedIn: !!user,
    hasCredits: balance >= REPORT_CREDIT_COST,
    creditBalance: balance,
  }
}
