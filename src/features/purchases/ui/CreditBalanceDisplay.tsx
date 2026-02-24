import { memo } from 'react'
import { SizableText, styled, XStack } from 'tamagui'

import { useCredits } from '~/features/purchases/useCredits'
import { CoinsIcon } from '~/interface/icons/phosphor/CoinsIcon'

export interface CreditBalanceDisplayProps {
  size?: 'small' | 'medium' | 'large'
  showLabel?: boolean
}

export const CreditBalanceDisplay = memo(
  ({ size = 'medium', showLabel = true }: CreditBalanceDisplayProps) => {
    const { balance, isLoading } = useCredits()

    const iconSize = size === 'small' ? 14 : size === 'medium' ? 18 : 22
    const textSize = size === 'small' ? '$3' : size === 'medium' ? '$4' : '$5'

    return (
      <BadgeFrame size={size}>
        <CoinsIcon size={iconSize} color="$accent10" />
        <SizableText size={textSize} fontWeight="600">
          {isLoading ? '...' : balance}
        </SizableText>
        {showLabel && (
          <SizableText size={textSize} color="$color10">
            {balance === 1 ? 'credit' : 'credits'}
          </SizableText>
        )}
      </BadgeFrame>
    )
  }
)

const BadgeFrame = styled(XStack, {
  items: 'center',
  gap: '$2',
  bg: '$color2',
  rounded: '$4',
  borderWidth: 1,
  borderColor: '$color4',

  variants: {
    size: {
      small: {
        px: '$2',
        py: '$1',
      },
      medium: {
        px: '$3',
        py: '$1.5',
      },
      large: {
        px: '$4',
        py: '$2',
      },
    },
  } as const,

  defaultVariants: {
    size: 'medium',
  },
})
