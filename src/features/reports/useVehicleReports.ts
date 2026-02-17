import { useMemo, useState } from 'react'
import { isWeb } from 'tamagui'

import {
  vehicleReportsByUserId,
  vehicleReportsPaginated,
} from '~/data/queries/vehicleReport'
import { useAuth } from '~/features/auth/client/authClient'
import { useQuery } from '~/zero/client'

import type { VehicleReportWithVehicle } from '~/data/types'

type ReportCursor = { id: string; purchasedAt: number } | null

// simple list with active/expired grouping
export function useVehicleReports(limit?: number) {
  const auth = useAuth()
  const userId = auth.user?.id || ''

  const [reports, status] = useQuery(
    vehicleReportsByUserId,
    { userId, limit },
    { enabled: !!userId }
  )

  const { activeReports, expiredReports } = useMemo(() => {
    const now = Date.now()
    const active: VehicleReportWithVehicle[] = []
    const expired: VehicleReportWithVehicle[] = []

    for (const report of reports || []) {
      if (new Date(report.expiresAt).getTime() > now) {
        active.push(report as VehicleReportWithVehicle)
      } else {
        expired.push(report as VehicleReportWithVehicle)
      }
    }

    return { activeReports: active, expiredReports: expired }
  }, [reports])

  return {
    reports: reports as readonly VehicleReportWithVehicle[] | undefined,
    activeReports,
    expiredReports,
    isLoading: status.type === 'unknown',
    isEmpty: status.type === 'complete' && (!reports || reports.length === 0),
  }
}

// paginated with infinite scroll (native) / page nav (web)
export function useVehicleReportsPaginated(pageSize = 10) {
  const auth = useAuth()
  const userId = auth.user?.id || ''

  // native: cursor-based infinite scroll
  const [allReportsData, setAllReportsData] = useState<VehicleReportWithVehicle[]>([])
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false)
  const [hasInitialLoad, setHasInitialLoad] = useState<boolean>(false)
  const [cursor, setCursor] = useState<ReportCursor>(null)
  // web: page-based pagination
  const [currentPage, setCurrentPage] = useState(1)

  const [reports, status] = useQuery(
    vehicleReportsPaginated,
    {
      userId,
      pageSize,
      cursor: isWeb ? null : cursor,
    },
    { enabled: !!userId }
  )

  // native: accumulate reports for infinite scroll
  useMemo(() => {
    if (!isWeb && reports && reports.length > 0) {
      setAllReportsData((prev) => {
        if (!cursor) {
          return reports as VehicleReportWithVehicle[]
        }
        const newReports = reports as VehicleReportWithVehicle[]
        const existingIds = new Set(prev.map((r) => r.id))
        const uniqueNewReports = newReports.filter((r) => !existingIds.has(r.id))
        return [...prev, ...uniqueNewReports]
      })
      setIsLoadingMore(false)
      if (!hasInitialLoad) {
        setHasInitialLoad(true)
      }
    }
  }, [reports, cursor, hasInitialLoad])

  // web: use current page reports directly, native: accumulated reports
  const displayReports = isWeb
    ? (reports as VehicleReportWithVehicle[]) || []
    : allReportsData

  const hasMore = reports ? reports.length === pageSize : false
  const isInitialLoading =
    status.type === 'unknown' && (isWeb ? true : !cursor) && !!userId

  // native: infinite scroll
  const loadMore = () => {
    if (isWeb) return
    const hasMoreToFetch = reports && reports.length === pageSize

    if (
      !isLoadingMore &&
      hasMoreToFetch &&
      hasInitialLoad &&
      reports &&
      reports.length > 0
    ) {
      setIsLoadingMore(true)
      const lastReport = reports[reports.length - 1]
      if (lastReport) {
        setCursor({ id: lastReport.id, purchasedAt: lastReport.purchasedAt })
      }
    }
  }

  const refresh = () => {
    setCursor(null)
    setAllReportsData([])
    setHasInitialLoad(false)
    setIsLoadingMore(false)
    setCurrentPage(1)
  }

  // web: page navigation
  const nextPage = () => {
    if (!isWeb || !hasMore) return
    setCurrentPage((prev) => prev + 1)
  }

  const prevPage = () => {
    if (!isWeb || currentPage <= 1) return
    setCurrentPage((prev) => prev - 1)
  }

  const isEmpty =
    status.type === 'complete' && displayReports.length === 0 && !isLoadingMore

  return {
    reports: displayReports,
    isLoading: isInitialLoading,
    isLoadingMore,
    hasMore,
    isEmpty,
    loadMore,
    refresh,
    // web pagination
    currentPage,
    nextPage,
    prevPage,
  }
}
