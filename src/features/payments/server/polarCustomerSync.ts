import { getDb } from '~/database'
import { customerProvider } from '~/database/schema-private'

import { polarClient } from './polarClient'

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
