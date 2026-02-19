import { boolean, number, string, table } from '@rocicorp/zero'
import { mutations, serverWhere } from 'on-zero'

export const schema = table('product')
  .columns({
    id: string(),
    slug: string(),
    name: string(),
    description: string().optional(),
    credits: number(),
    priceCents: number(),
    currency: string(),
    badge: string().optional(),
    sortOrder: number(),
    isActive: boolean(),
    createdAt: number(),
    updatedAt: number().optional(),
  })
  .primaryKey('id')

// products are publicly readable
export const permissions = serverWhere('product', () => true)

// no client-side mutations - products managed server-side only
export const mutate = mutations(schema, permissions, {})
