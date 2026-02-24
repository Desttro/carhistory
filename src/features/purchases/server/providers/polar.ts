import { Polar } from '@polar-sh/sdk'

import { getDb } from '~/database'
import { customerProvider } from '~/database/schema-private'
import { POLAR_ACCESS_TOKEN, POLAR_MODE } from '~/server/env-server'

import type { ProviderAdapter, ProviderProduct } from './types'

export const polarClient = new Polar({
  accessToken: POLAR_ACCESS_TOKEN,
  server: POLAR_MODE === 'production' ? 'production' : 'sandbox',
})

async function storeCustomerMapping(userId: string, polarCustomerId: string) {
  const db = getDb()
  await db
    .insert(customerProvider)
    .values({
      id: crypto.randomUUID(),
      userId,
      provider: 'polar',
      externalCustomerId: polarCustomerId,
      createdAt: new Date().toISOString(),
    })
    .onConflictDoNothing()
}

export async function syncPolarCustomer(user: {
  id: string
  email: string
  name?: string
}) {
  try {
    const { result } = await polarClient.customers.list({ email: user.email })
    const existing = result.items[0]

    if (!existing) {
      const created = await polarClient.customers.create({
        email: user.email,
        name: user.name || undefined,
        externalId: user.id,
      })
      await storeCustomerMapping(user.id, created.id)
      console.info(`[polar-sync] created customer for ${user.email}`)
      return
    }

    // already linked to this user
    if (existing.externalId === user.id) {
      await storeCustomerMapping(user.id, existing.id)
      console.info(`[polar-sync] customer already linked for ${user.email}`)
      return
    }

    // externalId is null — try to set it
    if (!existing.externalId) {
      try {
        await polarClient.customers.update({
          id: existing.id,
          customerUpdate: { externalId: user.id },
        })
        await storeCustomerMapping(user.id, existing.id)
        console.info(`[polar-sync] linked existing customer for ${user.email}`)
        return
      } catch {
        // fall through to delete+recreate
      }
    }

    // wrong externalId (db reset scenario) or update failed — delete + recreate
    await polarClient.customers.delete({ id: existing.id })
    const recreated = await polarClient.customers.create({
      email: user.email,
      name: user.name || undefined,
      externalId: user.id,
    })
    await storeCustomerMapping(user.id, recreated.id)
    console.info(`[polar-sync] recreated customer for ${user.email}`)
  } catch (error) {
    console.error(`[polar-sync] failed for ${user.email}:`, error)
  }
}

export const polarAdapter: ProviderAdapter = {
  provider: 'polar',

  async fetchProducts(): Promise<ProviderProduct[]> {
    const { result } = await polarClient.products.list({})
    const products: ProviderProduct[] = []

    for (const p of result.items) {
      const credits = Number(p.metadata?.credits)
      if (!credits || credits <= 0) continue

      const fixedPrice = p.prices.find((price) => 'priceAmount' in price)
      const priceCents =
        fixedPrice && 'priceAmount' in fixedPrice ? fixedPrice.priceAmount : 0
      const currency =
        fixedPrice && 'priceCurrency' in fixedPrice ? fixedPrice.priceCurrency : 'usd'

      products.push({
        externalProductId: p.id,
        name: p.name,
        description: p.description ?? undefined,
        credits,
        priceCents,
        currency,
        isActive: !p.isArchived,
        externalData: p as unknown as Record<string, unknown>,
      })
    }

    return products
  },

  syncCustomer: syncPolarCustomer,
}
