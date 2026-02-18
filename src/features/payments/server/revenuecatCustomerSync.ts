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
    console.info(`[revenuecat-sync] set attributes for ${user.email}`)
  } catch (error) {
    // best-effort — subscriber may not exist yet in revenuecat
    console.info(`[revenuecat-sync] failed for ${user.email}:`, error)
  }
}
