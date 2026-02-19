import { eq } from 'drizzle-orm'

import { getDb } from '~/database'
import { productProvider } from '~/database/schema-private'
import { product } from '~/database/schema-public'

export async function GET() {
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

  return Response.json(Array.from(productsMap.values()))
}
