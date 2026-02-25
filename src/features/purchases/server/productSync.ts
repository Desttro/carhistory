import { uuid } from '@take-out/helpers'
import { eq, and } from 'drizzle-orm'

import { getDb } from '~/database'
import { productProvider } from '~/database/schema-private'
import { product } from '~/database/schema-public'

import { polarAdapter } from './providers/polar'
import { revenuecatAdapter } from './providers/revenuecat'

import type { ProviderAdapter, ProviderProduct } from './providers/types'
import type { Provider } from '../types'

// upsert a single product into the local product + productProvider tables
export async function upsertProduct(
  provider: Provider,
  providerProduct: ProviderProduct
) {
  const db = getDb()

  // check if mapping exists
  const existing = await db
    .select({
      id: productProvider.id,
      productId: productProvider.productId,
    })
    .from(productProvider)
    .where(
      and(
        eq(productProvider.provider, provider),
        eq(productProvider.externalProductId, providerProduct.externalProductId)
      )
    )
    .limit(1)

  const now = new Date().toISOString()

  if (existing[0]) {
    // update existing product + provider data
    // polar returns prices in their api, so we store priceCents for web display
    // rc doesn't expose prices server-side; skip price update for rc
    const updateSet: Record<string, unknown> = {
      name: providerProduct.name,
      description: providerProduct.description ?? undefined,
      isActive: providerProduct.isActive,
      updatedAt: now,
    }

    if (providerProduct.priceCents > 0) {
      updateSet.priceCents = providerProduct.priceCents
      updateSet.currency = providerProduct.currency
    }

    await db
      .update(product)
      .set(updateSet)
      .where(eq(product.id, existing[0].productId))

    await db
      .update(productProvider)
      .set({
        externalData: providerProduct.externalData,
        updatedAt: now,
      })
      .where(eq(productProvider.id, existing[0].id))

    console.info(`[product-sync] updated ${provider} product: ${providerProduct.name}`)
  } else {
    // create new product + mapping
    const productId = uuid()
    const slug = `credits-${providerProduct.credits}`

    // check if product with this slug already exists
    const existingProduct = await db
      .select({ id: product.id })
      .from(product)
      .where(eq(product.slug, slug))
      .limit(1)

    const targetProductId = existingProduct[0]?.id ?? productId

    if (!existingProduct[0]) {
      await db.insert(product).values({
        id: productId,
        slug,
        name: providerProduct.name,
        description: providerProduct.description,
        credits: providerProduct.credits,
        priceCents: providerProduct.priceCents,
        currency: providerProduct.currency,
        badge: providerProduct.credits === 3 ? 'popular' : null,
        sortOrder: providerProduct.credits,
        isActive: providerProduct.isActive,
        createdAt: now,
      })
    } else {
      const updateSet: Record<string, unknown> = {
        name: providerProduct.name,
        description: providerProduct.description ?? undefined,
        isActive: providerProduct.isActive,
        updatedAt: now,
      }

      if (providerProduct.priceCents > 0) {
        updateSet.priceCents = providerProduct.priceCents
        updateSet.currency = providerProduct.currency
      }

      await db
        .update(product)
        .set(updateSet)
        .where(eq(product.id, targetProductId))
    }

    await db
      .insert(productProvider)
      .values({
        id: uuid(),
        productId: targetProductId,
        provider,
        externalProductId: providerProduct.externalProductId,
        externalData: providerProduct.externalData,
        createdAt: now,
      })
      .onConflictDoNothing()

    console.info(`[product-sync] created ${provider} product mapping: ${providerProduct.name}`)
  }
}

// sync all products from a single provider adapter
export async function syncProviderProducts(adapter: ProviderAdapter) {
  const products = await adapter.fetchProducts()
  console.info(`[product-sync] syncing ${products.length} ${adapter.provider} products`)

  for (const p of products) {
    await upsertProduct(adapter.provider, p)
  }
}

// concurrency guard to prevent overlapping syncs
let syncInProgress = false

// sync products from all providers
export async function syncAllProducts() {
  if (syncInProgress) {
    console.info('[product-sync] sync already in progress, skipping')
    return
  }

  syncInProgress = true
  try {
    // polar first (has prices), then revenuecat
    await syncProviderProducts(polarAdapter)

    try {
      await syncProviderProducts(revenuecatAdapter)
    } catch (error) {
      // rc sync is best-effort — may not have api key configured
      console.info('[product-sync] revenuecat sync failed (non-fatal):', error)
    }

    console.info('[product-sync] sync complete')
  } finally {
    syncInProgress = false
  }
}

// re-export for backward compat during migration
export { syncAllProducts as syncAllPolarProducts }

// upsert from a raw Polar product object (used by webhook handlers)
export async function syncPolarProductFromWebhook(polarProduct: {
  id: string
  name: string
  description?: string | null
  metadata?: Record<string, unknown>
  prices: Array<Record<string, unknown>>
  isArchived?: boolean
}) {
  const credits = Number(polarProduct.metadata?.credits)
  if (!credits || credits <= 0) {
    console.info(
      `[product-sync] skipping polar product ${polarProduct.id} - no credits metadata`
    )
    return
  }

  const fixedPrice = polarProduct.prices.find((p) => 'priceAmount' in p)
  const priceCents =
    fixedPrice && 'priceAmount' in fixedPrice
      ? (fixedPrice.priceAmount as number)
      : 0
  const currency =
    fixedPrice && 'priceCurrency' in fixedPrice
      ? (fixedPrice.priceCurrency as string)
      : 'usd'

  await upsertProduct('polar', {
    externalProductId: polarProduct.id,
    name: polarProduct.name,
    description: polarProduct.description ?? undefined,
    credits,
    priceCents,
    currency,
    isActive: !polarProduct.isArchived,
    externalData: polarProduct as unknown as Record<string, unknown>,
  })
}
