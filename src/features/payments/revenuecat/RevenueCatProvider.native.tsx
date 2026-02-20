import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import Purchases, {
  type CustomerInfo,
  type PurchasesOfferings,
} from 'react-native-purchases'

import { useAuth } from '~/features/auth/client/authClient'

const VITE_REVENUECAT_API_PUBLIC = process.env.VITE_REVENUECAT_API_PUBLIC ?? ''

// synchronous module-level guard — Purchases is a singleton so this
// prevents the double-configure that happens in React Strict Mode
// (the async `isConfigured()` races and both invocations see false)
let configureStarted = false

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
  const lastIdentityRef = useRef<string | null>(null)
  const initialUserIdRef = useRef(user?.id ?? null)

  // configure sdk once on mount
  useEffect(() => {
    if (!VITE_REVENUECAT_API_PUBLIC) {
      console.info('[revenuecat] no api key configured, skipping initialization')
      setIsLoading(false)
      return
    }

    if (configureStarted) {
      // strict mode re-run — sdk already configured by the first invocation
      setIsConfigured(true)
      return
    }
    configureStarted = true

    try {
      const userId = initialUserIdRef.current
      Purchases.configure({
        apiKey: VITE_REVENUECAT_API_PUBLIC,
        appUserID: userId,
        entitlementVerificationMode:
          Purchases.ENTITLEMENT_VERIFICATION_MODE.INFORMATIONAL,
      })

      // seed identity ref so the sync effect doesn't redundantly logIn
      if (userId) lastIdentityRef.current = userId

      setIsConfigured(true)
      console.info('[revenuecat] sdk configured', userId ? `as ${userId}` : 'anonymous')
    } catch (error) {
      console.info('[revenuecat] failed to configure:', error)
    }
  }, [])

  // identity sync — logIn/logOut + fetch offerings on auth state change
  useEffect(() => {
    if (!isConfigured) return
    if (state === 'loading') return

    let cancelled = false

    const syncIdentity = async () => {
      try {
        const currentUserId = user?.id ?? null

        // skip if identity hasn't changed
        if (currentUserId === lastIdentityRef.current) return
        lastIdentityRef.current = currentUserId

        if (currentUserId) {
          const { customerInfo } = await Purchases.logIn(currentUserId)
          if (!cancelled) setCustomerInfo(customerInfo)
          console.info('[revenuecat] logged in user:', currentUserId)
        } else {
          const anonymous = await Purchases.isAnonymous()
          if (anonymous) {
            // already anonymous, just refresh customer info
            const info = await Purchases.getCustomerInfo()
            if (!cancelled) setCustomerInfo(info)
            console.info('[revenuecat] already anonymous, refreshed info')
          } else {
            const info = await Purchases.logOut()
            if (!cancelled) setCustomerInfo(info)
            console.info('[revenuecat] logged out user')
          }
        }

        const fetchedOfferings = await Purchases.getOfferings()
        if (!cancelled) {
          setOfferings(fetchedOfferings)
          console.info('[revenuecat] offerings fetched:', Object.keys(fetchedOfferings.all))
        }
      } catch (error) {
        console.info('[revenuecat] identity sync error:', error)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    syncIdentity()

    return () => {
      cancelled = true
    }
  }, [isConfigured, user?.id, state])

  // attribute sync — set email/displayName when profile changes
  useEffect(() => {
    if (!isConfigured || !user?.id) return

    if (user.email) Purchases.setEmail(user.email)
    if (user.name) Purchases.setDisplayName(user.name)
  }, [isConfigured, user?.id, user?.email, user?.name])

  // customer info update listener for real-time updates
  useEffect(() => {
    if (!isConfigured) return

    const listener = (info: CustomerInfo) => {
      setCustomerInfo(info)
    }

    Purchases.addCustomerInfoUpdateListener(listener)

    return () => {
      Purchases.removeCustomerInfoUpdateListener(listener)
    }
  }, [isConfigured])

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

  return <RevenueCatContext.Provider value={value}>{children}</RevenueCatContext.Provider>
}
