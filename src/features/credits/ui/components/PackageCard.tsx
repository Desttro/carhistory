import { memo } from 'react'
import { SizableText, styled, XStack, YStack } from 'tamagui'

import { Button } from '~/interface/buttons/Button'
import { SparkleIcon } from '~/interface/icons/phosphor/SparkleIcon'

import { Chip } from './Chip'
import { PackageBadge } from './PackageBadge'
import { PriceDisplay } from './PriceDisplay'

export interface PackageCardProps {
  credits: number
  price: string
  pricePerCredit?: string
  onPress: () => void
  isLoading?: boolean
  isPopular?: boolean
  savingsPercent?: number
  isBestValue?: boolean
}

export const PackageCard = memo(
  ({
    credits,
    price,
    pricePerCredit,
    onPress,
    isLoading,
    isPopular,
    savingsPercent,
    isBestValue,
  }: PackageCardProps) => {
    const badgeVariant = isPopular ? 'popular' : isBestValue ? 'bestValue' : undefined

    return (
      <CardFrame popular={isPopular} bestValue={!isPopular && isBestValue}>
        {badgeVariant && <PackageBadge variant={badgeVariant} />}

        <YStack gap="$3" items="center" py="$3">
          <SparkleIcon size={28} color={isBestValue && !isPopular ? '$green10' : '$accent10'} />

          <YStack items="center" gap="$1">
            <SizableText size="$8" fontWeight="700" color="$color12">
              {credits}
            </SizableText>
            <SizableText size="$3" color="$color10">
              {credits === 1 ? 'Credit' : 'Credits'}
            </SizableText>
          </YStack>

          <PriceDisplay price={price} pricePerCredit={pricePerCredit} />

          {!!savingsPercent && savingsPercent > 0 && (
            <XStack>
              <Chip size="$2" bg="$green4" circular>
                <Chip.Text size="$1" fontWeight="700" color="$green11">
                  Save {savingsPercent}%
                </Chip.Text>
              </Chip>
            </XStack>
          )}
        </YStack>

        <Button variant="action" size="large" onPress={onPress} disabled={isLoading}>
          {isLoading ? 'Processing...' : 'Buy Now'}
        </Button>
      </CardFrame>
    )
  }
)

const CardFrame = styled(YStack, {
  position: 'relative',
  p: '$4',
  rounded: '$6',
  bg: '$color2',
  borderWidth: 1,
  borderColor: '$color4',
  gap: '$3',

  variants: {
    popular: {
      true: {
        borderColor: '$accent8',
        borderWidth: 2,
      },
    },
    bestValue: {
      true: {
        borderColor: '$green8',
        borderWidth: 2,
        bg: '$green2',
      },
    },
  } as const,
})
