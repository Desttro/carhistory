import { useState } from 'react'
import { Alert } from 'react-native'
import Purchases from 'react-native-purchases'

import { useRevenueCat } from '../revenuecat'

import type { PurchasesError } from 'react-native-purchases'
import type { ProductForDisplay } from './useProducts'

export function usePurchase() {
  const { refreshCustomerInfo } = useRevenueCat()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeSlug, setActiveSlug] = useState<string | null>(null)

  const purchase = async (product: ProductForDisplay) => {
    if (!product.rcPackage) {
      setError('Package not available')
      return
    }

    setIsLoading(true)
    setError(null)
    setActiveSlug(product.slug)

    try {
      const { customerInfo } = await Purchases.purchasePackage(product.rcPackage)
      console.info('[Purchase] success, customer info:', customerInfo.originalAppUserId)

      await refreshCustomerInfo()

      Alert.alert(
        'Purchase Complete',
        'Your credits will appear shortly. It may take a moment to process.'
      )
    } catch (err) {
      const purchaseError = err as PurchasesError
      if (purchaseError.userCancelled) {
        console.info('[Purchase] user cancelled')
      } else {
        console.info('[Purchase] error:', err)
        const message = purchaseError.message || 'An error occurred during purchase'
        setError(message)
        Alert.alert('Purchase Failed', message)
      }
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
