import { number, string, table } from '@rocicorp/zero'
import { mutations, serverWhere } from 'on-zero'

export const schema = table('userCredits')
  .columns({
    id: string(),
    userId: string(),
    balance: number(),
    createdAt: number(),
    updatedAt: number().optional(),
  })
  .primaryKey('id')

// users can only read their own credits
export const permissions = serverWhere('userCredits', (_, auth) => {
  return _.cmp('userId', auth?.id || '')
})

// no client-side mutations - credits modified server-side only
export const mutate = mutations(schema, permissions, {})
