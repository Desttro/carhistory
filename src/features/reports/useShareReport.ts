import { useCallback, useEffect, useState } from 'react'
import { Share } from 'react-native'

import { SERVER_URL } from '~/constants/urls'
import { analytics } from '~/features/analytics/analytics'
import { showError } from '~/interface/dialogs/actions'
import { showToast } from '~/interface/toast/helpers'

export function useShareReport(reportId: string) {
  const [shareToken, setShareToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const shareUrl = shareToken ? `${SERVER_URL}/report/share/${shareToken}` : null
  const isShared = Boolean(shareToken)

  useEffect(() => {
    if (!reportId) return
    let cancelled = false

    fetch(`${SERVER_URL}/api/report/share/status?reportId=${reportId}`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.success && data.token) {
          setShareToken(data.token)
        }
      })
      .catch(() => {
        // ignore - user may not have shared yet
      })

    return () => {
      cancelled = true
    }
  }, [reportId])

  const shareReport = useCallback(async () => {
    if (isLoading) return
    setIsLoading(true)

    try {
      let token = shareToken

      if (!token) {
        const res = await fetch(`${SERVER_URL}/api/report/share`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ reportId }),
        })
        const data = await res.json()
        if (!data.success || !data.token) {
          throw new Error(data.error || 'Failed to create share link')
        }
        token = data.token
        setShareToken(token)
      }

      const url = `${SERVER_URL}/report/share/${token}`

      if (!process.env.VITE_NATIVE) {
        await navigator.clipboard.writeText(url)
        showToast('Report link copied to clipboard!', { type: 'success' })
      } else {
        const result = await Share.share({
          message: 'Check out this vehicle history report',
          url,
        })
        if (result.action === Share.sharedAction) {
          showToast('Report shared!', { type: 'success' })
        }
      }

      analytics.track('report_shared', {
        reportId,
        method: !process.env.VITE_NATIVE ? 'clipboard' : 'share_sheet',
      })
    } catch (error) {
      console.info('error sharing report:', error)
      showError(error, 'Share Report')
    } finally {
      setIsLoading(false)
    }
  }, [reportId, shareToken, isLoading])

  const revokeShare = useCallback(async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/report/share`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reportId }),
      })
      const data = await res.json()
      if (data.success) {
        setShareToken(null)
        showToast('Share link revoked', { type: 'success' })
      }
    } catch (error) {
      console.info('error revoking share:', error)
      showError(error, 'Revoke Share')
    }
  }, [reportId])

  return {
    shareReport,
    revokeShare,
    shareToken,
    shareUrl,
    isLoading,
    isShared,
  }
}
