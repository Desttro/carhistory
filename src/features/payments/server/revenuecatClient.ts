import { REVENUECAT_API_KEY, REVENUECAT_PROJECT_ID } from '~/server/env-server'

// --- error class ---

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

// --- shared headers (single key for both v1 and v2) ---

const headers = () => ({
  Authorization: `Bearer ${REVENUECAT_API_KEY}`,
  'Content-Type': 'application/json',
})

// --- v1 endpoints (subscriber attributes — no v2 equivalent) ---

export async function setAttributes(
  appUserId: string,
  attributes: Record<string, { value: string }>
) {
  if (!REVENUECAT_API_KEY) {
    console.info('[revenuecat] no API key configured, skipping setAttributes')
    return
  }

  const res = await fetch(
    `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(appUserId)}/attributes`,
    {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ attributes }),
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

function v2Url(path: string) {
  return `https://api.revenuecat.com/v2/projects/${encodeURIComponent(REVENUECAT_PROJECT_ID)}${path}`
}

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
