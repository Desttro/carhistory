import { eq, and } from 'drizzle-orm'

import { getDb } from '~/database'
import { productProvider } from '~/database/schema-private'
import { product } from '~/database/schema-public'

import { REVENUECAT_PRODUCT_MAPPINGS } from '../productConfig'
import { polarClient } from './polarClient'

import type { Product } from '@polar-sh/sdk/models/components/product'

// upsert a single polar product into the local product + productProvider tables
export async function syncPolarProduct(polarProduct: Product) {
  const db = getDb()

  const credits = Number(polarProduct.metadata?.credits)
  if (!credits || credits <= 0) {
    console.info(
      `[product-sync] skipping polar product ${polarProduct.id} - no credits metadata`
    )
    return
  }

  // extract price from first fixed price (amountType === 'fixed')
  const fixedPrice = polarProduct.prices.find((p) => 'priceAmount' in p)
  const priceCents =
    fixedPrice && 'priceAmount' in fixedPrice ? fixedPrice.priceAmount : 0
  const currency =
    fixedPrice && 'priceCurrency' in fixedPrice ? fixedPrice.priceCurrency : 'usd'

  // check if mapping exists
  const existing = await db
    .select({
      id: productProvider.id,
      productId: productProvider.productId,
    })
    .from(productProvider)
    .where(
      and(
        eq(productProvider.provider, 'polar'),
        eq(productProvider.externalProductId, polarProduct.id)
      )
    )
    .limit(1)

  const now = new Date().toISOString()
  const isActive = !polarProduct.isArchived

  if (existing[0]) {
    // update existing product + provider data
    await db
      .update(product)
      .set({
        name: polarProduct.name,
        description: polarProduct.description ?? undefined,
        priceCents,
        currency,
        isActive,
        updatedAt: now,
      })
      .where(eq(product.id, existing[0].productId))

    await db
      .update(productProvider)
      .set({
        externalData: polarProduct as unknown as Record<string, unknown>,
        updatedAt: now,
      })
      .where(eq(productProvider.id, existing[0].id))

    console.info(`[product-sync] updated polar product: ${polarProduct.name}`)
  } else {
    // create new product + mapping
    const productId = crypto.randomUUID()
    const slug = `credits-${credits}`

    // check if product with this slug already exists (from a prior manual insert)
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
        name: polarProduct.name,
        description: polarProduct.description,
        credits,
        priceCents,
        currency,
        badge: credits === 3 ? 'popular' : null,
        sortOrder: credits,
        isActive,
        createdAt: now,
      })
    } else {
      // update existing product with latest data
      await db
        .update(product)
        .set({
          name: polarProduct.name,
          description: polarProduct.description ?? undefined,
          priceCents,
          currency,
          isActive,
          updatedAt: now,
        })
        .where(eq(product.id, targetProductId))
    }

    await db.insert(productProvider).values({
      id: crypto.randomUUID(),
      productId: targetProductId,
      provider: 'polar',
      externalProductId: polarProduct.id,
      externalData: polarProduct as unknown as Record<string, unknown>,
      createdAt: now,
    })

    console.info(`[product-sync] created polar product mapping: ${polarProduct.name}`)
  }
}

// sync all polar products
export async function syncAllPolarProducts() {
  const { result } = await polarClient.products.list({})
  const products = result.items

  console.info(`[product-sync] syncing ${products.length} polar products`)

  for (const p of products) {
    await syncPolarProduct(p)
  }

  // seed revenuecat mappings after polar products exist
  await seedRevenueCatMappings()

  console.info('[product-sync] sync complete')
}

// create productProvider rows for revenuecat using known mappings
export async function seedRevenueCatMappings() {
  const db = getDb()

  for (const [slug, rcProductId] of Object.entries(REVENUECAT_PRODUCT_MAPPINGS)) {
    const existingProduct = await db
      .select({ id: product.id })
      .from(product)
      .where(eq(product.slug, slug))
      .limit(1)

    if (!existingProduct[0]) {
      console.info(`[product-sync] skipping RC mapping for ${slug} - product not found`)
      continue
    }

    await db
      .insert(productProvider)
      .values({
        id: crypto.randomUUID(),
        productId: existingProduct[0].id,
        provider: 'revenuecat',
        externalProductId: rcProductId,
        createdAt: new Date().toISOString(),
      })
      .onConflictDoNothing()

    console.info(`[product-sync] seeded RC mapping: ${slug} -> ${rcProductId}`)
  }
}
