import { use } from 'react'

import { RevenueCatContext } from './RevenueCatProvider'

export function useRevenueCat() {
  return use(RevenueCatContext)
}
