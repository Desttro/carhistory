import { Polar } from '@polar-sh/sdk'

import { POLAR_ACCESS_TOKEN, POLAR_MODE } from '~/server/env-server'

export const polarClient = new Polar({
  accessToken: POLAR_ACCESS_TOKEN,
  server: POLAR_MODE === 'production' ? 'production' : 'sandbox',
})
