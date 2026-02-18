import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import Purchases, {
  type CustomerInfo,
  type PurchasesOfferings,
} from 'react-native-purchases'

import { useAuth } from '~/features/auth/client/authClient'

const VITE_REVENUECAT_API_PUBLIC = process.env.VITE_REVENUECAT_API_PUBLIC ?? ''

export interface RevenueCatContextValue {
  offerings: PurchasesOfferings | null
  customerInfo: CustomerInfo | null
  isConfigured: boolean
  isLoading: boolean
  refreshCustomerInfo: () => Promise<void>
}

export const RevenueCatContext = createContext<RevenueCatContextValue>({
  offerings: null,
  customerInfo: null,
  isConfigured: false,
  isLoading: true,
  refreshCustomerInfo: async () => {},
})

export function RevenueCatProvider({ children }: { children: ReactNode }) {
  const { user, state } = useAuth()
  const [isConfigured, setIsConfigured] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null)
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null)

  // configure sdk on mount
  useEffect(() => {
    if (!VITE_REVENUECAT_API_PUBLIC) {
      console.info('[revenuecat] no api key configured, skipping initialization')
      setIsLoading(false)
      return
    }

    try {
      Purchases.configure({ apiKey: VITE_REVENUECAT_API_PUBLIC })
      setIsConfigured(true)
      console.info('[revenuecat] sdk configured')
    } catch (error) {
      console.info('[revenuecat] failed to configure:', error)
    }
  }, [])

  // sync identity + offerings when auth state changes
  useEffect(() => {
    if (!isConfigured) return
    if (state === 'loading') return

    const sync = async () => {
      try {
        if (user?.id) {
          const { customerInfo } = await Purchases.logIn(user.id)
          setCustomerInfo(customerInfo)

          if (user.email) Purchases.setEmail(user.email)
          if (user.name) Purchases.setDisplayName(user.name)

          console.info('[revenuecat] logged in user:', user.id)
        } else {
          const customerInfo = await Purchases.logOut()
          setCustomerInfo(customerInfo)
          console.info('[revenuecat] logged out user')
        }

        const fetchedOfferings = await Purchases.getOfferings()
        setOfferings(fetchedOfferings)
        console.info('[revenuecat] offerings fetched:', Object.keys(fetchedOfferings.all))
      } catch (error) {
        console.info('[revenuecat] sync error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    sync()
  }, [isConfigured, user?.id, user?.email, user?.name, state])

  const refreshCustomerInfo = useCallback(async () => {
    if (!isConfigured) return
    try {
      const info = await Purchases.getCustomerInfo()
      setCustomerInfo(info)
    } catch (error) {
      console.info('[revenuecat] failed to refresh customer info:', error)
    }
  }, [isConfigured])

  const value = useMemo(
    () => ({
      offerings,
      customerInfo,
      isConfigured,
      isLoading,
      refreshCustomerInfo,
    }),
    [offerings, customerInfo, isConfigured, isLoading, refreshCustomerInfo]
  )

  return (
    <RevenueCatContext.Provider value={value}>
      {children}
    </RevenueCatContext.Provider>
  )
}
