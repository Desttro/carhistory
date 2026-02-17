import { useState } from 'react'

import { authClient } from '~/features/auth/client/authClient'
import { CREDIT_PACKAGES } from '~/features/payments/constants'

export function usePurchaseCredits() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const purchaseWithPolar = async (slug: string) => {
    setIsLoading(true)
    setError(null)

    try {
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
    packages: CREDIT_PACKAGES,
    purchaseWithPolar,
    isLoading,
    error,
    clearError: () => setError(null),
  }
}
