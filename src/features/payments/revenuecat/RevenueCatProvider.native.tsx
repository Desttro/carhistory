import { createContext, useEffect, useState, type ReactNode } from 'react'
import Purchases, {
  type CustomerInfo,
  type PurchasesOfferings,
} from 'react-native-purchases'

import { useAuth } from '~/features/auth/client/authClient'

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

// const REVENUECAT_API_KEY = import.meta.env.VITE_REVENUECAT_API_PUBLIC || ''
const REVENUECAT_API_KEY = 'test_YdhUttgtlMcWaNHudizpxsdTfhT'

export function RevenueCatProvider({ children }: { children: ReactNode }) {
  const { user, state } = useAuth()
  const [isConfigured, setIsConfigured] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null)
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null)

  // configure sdk on mount
  useEffect(() => {
    if (!REVENUECAT_API_KEY) {
      console.info('[RevenueCat] no API key configured, skipping initialization')
      setIsLoading(false)
      return
    }

    const configure = async () => {
      try {
        Purchases.configure({ apiKey: REVENUECAT_API_KEY })
        setIsConfigured(true)
        console.info('[RevenueCat] SDK configured')
      } catch (error) {
        console.info('[RevenueCat] failed to configure:', error)
      }
    }

    configure()
  }, [])

  // link/unlink user when auth state changes
  useEffect(() => {
    if (!isConfigured) return
    if (state === 'loading') return

    const syncUser = async () => {
      try {
        if (user?.id) {
          // log in with our user ID so RevenueCat can associate purchases
          const { customerInfo } = await Purchases.logIn(user.id)
          setCustomerInfo(customerInfo)
          console.info('[RevenueCat] logged in user:', user.id)
        } else {
          // user logged out, reset to anonymous
          const customerInfo = await Purchases.logOut()
          setCustomerInfo(customerInfo)
          console.info('[RevenueCat] logged out user')
        }
      } catch (error) {
        console.info('[RevenueCat] sync user error:', error)
      }
    }

    syncUser()
  }, [isConfigured, user?.id, state])

  // fetch offerings once configured
  useEffect(() => {
    if (!isConfigured) return

    const fetchOfferings = async () => {
      try {
        setIsLoading(true)
        const fetchedOfferings = await Purchases.getOfferings()
        setOfferings(fetchedOfferings)
        console.info('[RevenueCat] offerings fetched:', Object.keys(fetchedOfferings.all))
      } catch (error) {
        console.info('[RevenueCat] failed to fetch offerings:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOfferings()
  }, [isConfigured])

  const refreshCustomerInfo = async () => {
    if (!isConfigured) return
    try {
      const info = await Purchases.getCustomerInfo()
      setCustomerInfo(info)
    } catch (error) {
      console.info('[RevenueCat] failed to refresh customer info:', error)
    }
  }

  return (
    <RevenueCatContext.Provider
      value={{
        offerings,
        customerInfo,
        isConfigured,
        isLoading,
        refreshCustomerInfo,
      }}
    >
      {children}
    </RevenueCatContext.Provider>
  )
}
