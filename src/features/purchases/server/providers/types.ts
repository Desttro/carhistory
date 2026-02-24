import type { Provider } from '../../types'

export interface ProviderProduct {
  externalProductId: string
  name: string
  description?: string
  credits: number
  priceCents: number // 0 for rc (prices come from native sdk)
  currency: string
  isActive: boolean
  externalData: Record<string, unknown>
}

export interface ProviderAdapter {
  provider: Provider
  fetchProducts(): Promise<ProviderProduct[]>
  syncCustomer(user: { id: string; email: string; name?: string }): Promise<void>
}
