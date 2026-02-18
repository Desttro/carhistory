import { createContext, type ReactNode } from 'react'

import type { CustomerInfo, PurchasesOfferings } from 'react-native-purchases'

// web stub — revenuecat is native only

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
  isLoading: false,
  refreshCustomerInfo: async () => {},
})

export function RevenueCatProvider({ children }: { children: ReactNode }) {
  return <>{children}</>
}
