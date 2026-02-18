import { REVENUECAT_API_KEY } from '~/server/env-server'

const BASE_URL = 'https://api.revenuecat.com/v1'

const headers = () => ({
  Authorization: `Bearer ${REVENUECAT_API_KEY}`,
  'Content-Type': 'application/json',
})

export async function setAttributes(
  appUserId: string,
  attributes: Record<string, { value: string }>
) {
  const res = await fetch(
    `${BASE_URL}/subscribers/${encodeURIComponent(appUserId)}/attributes`,
    {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ attributes }),
    }
  )

  if (!res.ok) {
    throw new Error(`revenuecat setAttributes failed: ${res.status} ${await res.text()}`)
  }
}

export async function getSubscriber(appUserId: string) {
  const res = await fetch(
    `${BASE_URL}/subscribers/${encodeURIComponent(appUserId)}`,
    {
      method: 'GET',
      headers: headers(),
    }
  )

  if (!res.ok) {
    throw new Error(`revenuecat getSubscriber failed: ${res.status} ${await res.text()}`)
  }

  return res.json()
}
