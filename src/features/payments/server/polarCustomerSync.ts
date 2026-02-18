import { polarClient } from './polarClient'

export async function syncPolarCustomer(user: { id: string; email: string; name?: string }) {
  try {
    const { result } = await polarClient.customers.list({ email: user.email })
    const existing = result.items[0]

    if (!existing) {
      await polarClient.customers.create({
        email: user.email,
        name: user.name || undefined,
        externalId: user.id,
      })
      console.info(`[polar-sync] created customer for ${user.email}`)
      return
    }

    // already linked to this user
    if (existing.externalId === user.id) {
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
        console.info(`[polar-sync] linked existing customer for ${user.email}`)
        return
      } catch {
        // fall through to delete+recreate
      }
    }

    // wrong externalId (db reset scenario) or update failed — delete + recreate
    await polarClient.customers.delete({ id: existing.id })
    await polarClient.customers.create({
      email: user.email,
      name: user.name || undefined,
      externalId: user.id,
    })
    console.info(`[polar-sync] recreated customer for ${user.email}`)
  } catch (error) {
    console.error(`[polar-sync] failed for ${user.email}:`, error)
  }
}
