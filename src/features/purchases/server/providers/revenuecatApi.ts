import { REVENUECAT_API_KEY, REVENUECAT_PROJECT_ID } from '~/server/env-server'

export class RevenueCatApiError extends Error {
  status: number
  isRetryable: boolean

  constructor(message: string, status: number) {
    super(message)
    this.name = 'RevenueCatApiError'
    this.status = status
    // 5xx and 429 are retryable
    this.isRetryable = status >= 500 || status === 429
  }
}

const headers = () => ({
  Authorization: `Bearer ${REVENUECAT_API_KEY}`,
  'Content-Type': 'application/json',
})

function v2Url(path: string) {
  return `https://api.revenuecat.com/v2/projects/${encodeURIComponent(REVENUECAT_PROJECT_ID)}${path}`
}

// --- v2 customer attributes ---

export async function setAttributes(
  appUserId: string,
  attributes: Record<string, { value: string }>
) {
  if (!REVENUECAT_API_KEY || !REVENUECAT_PROJECT_ID) {
    console.info('[revenuecat] no API key/project configured, skipping setAttributes')
    return
  }

  // convert from v1 format { $email: { value } } to v2 array format [{ name, value }]
  const items = Object.entries(attributes).map(([name, { value }]) => ({ name, value }))

  const res = await fetch(
    v2Url(`/customers/${encodeURIComponent(appUserId)}/attributes`),
    {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ attributes: items }),
    }
  )

  if (!res.ok) {
    throw new RevenueCatApiError(
      `revenuecat setAttributes failed: ${res.status} ${await res.text()}`,
      res.status
    )
  }
}

// --- v2 endpoints ---

export interface RevenueCatCustomer {
  id: string
  first_seen: string
  last_seen: string
  experiment: Record<string, unknown> | null
}

export async function getCustomer(appUserId: string): Promise<RevenueCatCustomer | null> {
  if (!REVENUECAT_API_KEY || !REVENUECAT_PROJECT_ID) {
    console.info('[revenuecat] no API key/project configured, skipping getCustomer')
    return null
  }

  const res = await fetch(v2Url(`/customers/${encodeURIComponent(appUserId)}`), {
    headers: headers(),
  })

  if (res.status === 404) return null

  if (!res.ok) {
    throw new RevenueCatApiError(
      `revenuecat getCustomer failed: ${res.status} ${await res.text()}`,
      res.status
    )
  }

  return res.json()
}

export interface RevenueCatPurchase {
  product_id: string
  purchased_at: string
  revenue_in_usd: { amount: string; currency: string }
  store: string
  is_sandbox: boolean
}

export interface RevenueCatPurchasesResponse {
  items: RevenueCatPurchase[]
  next_page: string | null
}

export async function getCustomerPurchases(
  appUserId: string
): Promise<RevenueCatPurchasesResponse | null> {
  if (!REVENUECAT_API_KEY || !REVENUECAT_PROJECT_ID) {
    console.info(
      '[revenuecat] no API key/project configured, skipping getCustomerPurchases'
    )
    return null
  }

  const res = await fetch(
    v2Url(`/customers/${encodeURIComponent(appUserId)}/purchases`),
    { headers: headers() }
  )

  if (res.status === 404) return null

  if (!res.ok) {
    throw new RevenueCatApiError(
      `revenuecat getCustomerPurchases failed: ${res.status} ${await res.text()}`,
      res.status
    )
  }

  return res.json()
}

export interface RevenueCatProduct {
  id: string
  store_identifier: string
  type: string
  app_id: string
}

export interface RevenueCatProductsResponse {
  items: RevenueCatProduct[]
  next_page: string | null
}

export async function listProducts(): Promise<RevenueCatProductsResponse | null> {
  if (!REVENUECAT_API_KEY || !REVENUECAT_PROJECT_ID) {
    console.info('[revenuecat] no API key/project configured, skipping listProducts')
    return null
  }

  const res = await fetch(v2Url('/products'), { headers: headers() })

  if (!res.ok) {
    throw new RevenueCatApiError(
      `revenuecat listProducts failed: ${res.status} ${await res.text()}`,
      res.status
    )
  }

  return res.json()
}
