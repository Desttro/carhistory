import { memo } from 'react'
import { SizableText, YStack } from 'tamagui'

export interface PriceDisplayProps {
  price: string
  pricePerCredit?: string
}

export const PriceDisplay = memo(({ price, pricePerCredit }: PriceDisplayProps) => {
  return (
    <YStack items="center" gap="$1">
      <SizableText size="$7" fontWeight="700" color="$color12">
        {price}
      </SizableText>
      {pricePerCredit && (
        <SizableText size="$2" color="$color9">
          {pricePerCredit} per credit
        </SizableText>
      )}
    </YStack>
  )
})
