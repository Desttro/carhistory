import { useState } from 'react'

import { authClient } from '~/features/auth/client/authClient'
import { CREDIT_PACKAGES } from '~/features/payments/constants'

// type for polar checkout method (added by polarClient plugin)
type AuthClientWithPolar = typeof authClient & {
  checkout: (params: { slug?: string; products?: string[] }) => Promise<void>
}

export function usePurchaseCredits() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const purchaseWithPolar = async (slug: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // this redirects to Polar checkout
      await (authClient as AuthClientWithPolar).checkout({ slug })
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
