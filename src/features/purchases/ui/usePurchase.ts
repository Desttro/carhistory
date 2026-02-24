import { useState } from 'react'

import { analytics } from '~/features/analytics/analytics'
import { authClient } from '~/features/auth/client/authClient'

import type { ProductForDisplay } from './useProducts'

export function usePurchase() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeSlug, setActiveSlug] = useState<string | null>(null)

  const purchase = async (product: ProductForDisplay) => {
    setIsLoading(true)
    setError(null)
    setActiveSlug(product.slug)

    try {
      analytics.track('credit_purchase_initiated', { slug: product.slug, platform: 'polar' })
      await authClient.checkout({ slug: product.slug })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Purchase failed'
      setError(message)
      console.info('[Purchase] Polar checkout error:', err)
    } finally {
      setIsLoading(false)
      setActiveSlug(null)
    }
  }

  return {
    purchase,
    isLoading,
    error,
    activeSlug,
    clearError: () => setError(null),
  }
}
