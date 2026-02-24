import { eq, and } from 'drizzle-orm'

import { getDb } from '~/database'
import { creditTransaction, productProvider } from '~/database/schema-private'
import { product } from '~/database/schema-public'

import type { Provider } from '../types'

// resolve a product from external provider product ID
export async function resolveProduct(externalProductId: string, provider: string) {
  const db = getDb()
  const rows = await db
    .select({ credits: product.credits, productId: product.id })
    .from(productProvider)
    .innerJoin(product, eq(product.id, productProvider.productId))
    .where(
      and(
        eq(productProvider.provider, provider),
        eq(productProvider.externalProductId, externalProductId)
      )
    )
    .limit(1)
  return rows[0] ?? null
}

// idempotency: check if a transaction has already been processed
export async function isTransactionProcessed(
  provider: Provider,
  providerTransactionId: string
): Promise<boolean> {
  const db = getDb()

  const existing = await db
    .select({ id: creditTransaction.id })
    .from(creditTransaction)
    .where(
      and(
        eq(creditTransaction.platform, provider),
        eq(creditTransaction.platformTransactionId, providerTransactionId)
      )
    )
    .limit(1)

  return existing.length > 0
}

// centralized query for active products with provider mappings
export async function getActiveProductsWithProviders() {
  const db = getDb()

  const rows = await db
    .select({
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      credits: product.credits,
      priceCents: product.priceCents,
      currency: product.currency,
      badge: product.badge,
      sortOrder: product.sortOrder,
      provider: productProvider.provider,
      externalProductId: productProvider.externalProductId,
    })
    .from(product)
    .leftJoin(productProvider, eq(product.id, productProvider.productId))
    .where(eq(product.isActive, true))
    .orderBy(product.sortOrder)

  // group provider mappings per product
  const productsMap = new Map<
    string,
    {
      id: string
      slug: string
      name: string
      description: string | null
      credits: number
      priceCents: number
      currency: string
      badge: string | null
      sortOrder: number
      providers: Record<string, string>
    }
  >()

  for (const row of rows) {
    if (!productsMap.has(row.id)) {
      productsMap.set(row.id, {
        id: row.id,
        slug: row.slug,
        name: row.name,
        description: row.description,
        credits: row.credits,
        priceCents: row.priceCents,
        currency: row.currency,
        badge: row.badge,
        sortOrder: row.sortOrder,
        providers: {},
      })
    }
    if (row.provider && row.externalProductId) {
      productsMap.get(row.id)!.providers[row.provider] = row.externalProductId
    }
  }

  return Array.from(productsMap.values())
}
