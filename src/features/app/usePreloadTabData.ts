import { memo } from 'react'

import { activeProducts } from '~/data/queries/product'
import { userById } from '~/data/queries/user'
import { userCreditsByUserId } from '~/data/queries/userCredits'
import { vehicleReportsByUserId } from '~/data/queries/vehicleReport'
import { useAuth } from '~/features/auth/client/authClient'
import { useQuery } from '~/zero/client'

// preloads tab data into zero's cache so tabs load instantly on navigation.
// uses useQuery (which goes through react context) instead of preload()
// to avoid proxy + private field issues on hermes.
export const PreloadTabData = memo(() => {
  const { user } = useAuth()
  const userId = user?.id || ''

  useQuery(activeProducts)
  useQuery(vehicleReportsByUserId, { userId }, { enabled: !!userId })
  useQuery(userCreditsByUserId, { userId }, { enabled: !!userId })
  useQuery(userById, { userId }, { enabled: !!userId })

  return null
})
