import { useState } from 'react'

import { analytics } from '~/features/analytics/analytics'
import { authClient } from '~/features/auth/client/authClient'

export function usePurchaseCredits() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const purchaseWithPolar = async (slug: string) => {
    setIsLoading(true)
    setError(null)

    try {
      analytics.track('credit_purchase_initiated', { slug, platform: 'polar' })
      // this redirects to Polar checkout
      await authClient.checkout({ slug })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Purchase failed'
      setError(message)
      console.info('[Purchase] Polar checkout error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    purchaseWithPolar,
    isLoading,
    error,
    clearError: () => setError(null),
  }
}
