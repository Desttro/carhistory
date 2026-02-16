import { memo } from 'react'

import { PackageCard } from './components/PackageCard'

export interface CreditPackageCardProps {
  credits: number
  price: string
  pricePerCredit?: string
  onPress: () => void
  isLoading?: boolean
  isPopular?: boolean
}

export const CreditPackageCard = memo((props: CreditPackageCardProps) => {
  return <PackageCard {...props} />
})
