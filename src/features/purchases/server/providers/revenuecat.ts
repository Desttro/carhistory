import { getDb } from '~/database'
import { customerProvider } from '~/database/schema-private'

import { setAttributes, listProducts } from './revenuecatApi'

import type { ProviderAdapter, ProviderProduct } from './types'

export async function syncRevenueCatSubscriber(user: {
  id: string
  email: string
  name?: string
}) {
  try {
    const attributes: Record<string, { value: string }> = {
      $email: { value: user.email },
    }

    if (user.name) {
      attributes.$displayName = { value: user.name }
    }

    await setAttributes(user.id, attributes)

    // store mapping (RC app_user_id is our user.id)
    const db = getDb()
    await db
      .insert(customerProvider)
      .values({
        id: crypto.randomUUID(),
        userId: user.id,
        provider: 'revenuecat',
        externalCustomerId: user.id,
        createdAt: new Date().toISOString(),
      })
      .onConflictDoNothing()

    console.info(`[revenuecat-sync] set attributes for ${user.email}`)
  } catch (error) {
    // best-effort — subscriber may not exist yet in revenuecat
    console.info(`[revenuecat-sync] failed for ${user.email}:`, error)
  }
}

export const revenuecatAdapter: ProviderAdapter = {
  provider: 'revenuecat',

  async fetchProducts(): Promise<ProviderProduct[]> {
    const response = await listProducts()
    if (!response) return []

    const products: ProviderProduct[] = []

    for (const p of response.items) {
      // extract credits from store_identifier naming convention
      // e.g., cat_history_3_credits -> 3, cat_history_1_credit -> 1
      const match = p.store_identifier.match(/(\d+)_credits?/)
      const credits = match ? parseInt(match[1]) : 0
      if (credits <= 0) continue

      products.push({
        externalProductId: p.store_identifier,
        name: `${credits} Credit${credits > 1 ? 's' : ''}`,
        credits,
        // rc doesn't expose prices server-side; native shows store price directly
        priceCents: 0,
        currency: 'usd',
        isActive: true,
        externalData: p as unknown as Record<string, unknown>,
      })
    }

    return products
  },

  syncCustomer: syncRevenueCatSubscriber,
}
