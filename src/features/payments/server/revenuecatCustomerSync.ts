import { getDb } from '~/database'
import { customerProvider } from '~/database/schema-private'

import { setAttributes } from './revenuecatClient'

export async function syncRevenueCatSubscriber(user: {
  id: string
  email: string
  name?: string
}) {
  try {
    const attributes: Record<string, { value: string }> = {
      $email: { value: user.email },
    }

    if (user.name) {
      attributes.$displayName = { value: user.name }
    }

    await setAttributes(user.id, attributes)

    // store mapping (RC app_user_id is our user.id)
    const db = getDb()
    await db
      .insert(customerProvider)
      .values({
        id: crypto.randomUUID(),
        userId: user.id,
        provider: 'revenuecat',
        externalCustomerId: user.id,
        createdAt: new Date().toISOString(),
      })
      .onConflictDoNothing()

    console.info(`[revenuecat-sync] set attributes for ${user.email}`)
  } catch (error) {
    // best-effort — subscriber may not exist yet in revenuecat
    console.info(`[revenuecat-sync] failed for ${user.email}:`, error)
  }
}
