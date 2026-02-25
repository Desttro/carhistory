import { uuid } from '@take-out/helpers'
import { getDb } from '~/database'
import { customerProvider } from '~/database/schema-private'

import { setAttributes, listProducts } from './revenuecatApi'

import type { ProviderAdapter, ProviderProduct } from './types'

export async function syncRevenueCatSubscriber(user: {
  id: string
  email: string
  name?: string
}) {
  // store mapping first — critical for webhook processing
  const db = getDb()
  await db
    .insert(customerProvider)
    .values({
      id: uuid(),
      userId: user.id,
      provider: 'revenuecat',
      externalCustomerId: user.id,
      createdAt: new Date().toISOString(),
    })
    .onConflictDoNothing()

  // set attributes best-effort — subscriber may not exist yet in revenuecat
  try {
    const attributes: Record<string, { value: string }> = {
      $email: { value: user.email },
    }

    if (user.name) {
      attributes.$displayName = { value: user.name }
    }

    await setAttributes(user.id, attributes)
    console.info(`[revenuecat-sync] set attributes for ${user.email}`)
  } catch (error) {
    console.info(`[revenuecat-sync] setAttributes failed for ${user.email}:`, error)
  }
}

export const revenuecatAdapter: ProviderAdapter = {
  provider: 'revenuecat',

  async fetchProducts(): Promise<ProviderProduct[]> {
    const response = await listProducts()
    if (!response) return []

    // rc returns one entry per store (app_store + play_store) for each product,
    // deduplicate by store_identifier since credits are the same across stores
    const seen = new Map<string, ProviderProduct>()

    for (const p of response.items) {
      if (seen.has(p.store_identifier)) continue

      // extract credits from store_identifier, e.g. io.carhistory.app.credits.3
      const match = p.store_identifier.match(/credits?[._](\d+)$/)
      const credits = match ? parseInt(match[1]) : 0
      if (credits <= 0) continue

      seen.set(p.store_identifier, {
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

    return [...seen.values()]
  },

  syncCustomer: syncRevenueCatSubscriber,
}
