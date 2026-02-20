import { memo } from 'react'
import { styled, XStack } from 'tamagui'

import { Chip } from './Chip'

export interface PackageBadgeProps {
  variant: 'popular' | 'bestValue'
}

export const PackageBadge = memo(({ variant }: PackageBadgeProps) => {
  if (variant === 'popular') {
    return (
      <BadgeContainer>
        <Chip size="$2" bg="$accent10" circular>
          <Chip.Text size="$1" fontWeight="700" color="$color1">
            POPULAR
          </Chip.Text>
        </Chip>
      </BadgeContainer>
    )
  }
  if (variant === 'bestValue') {
    return (
      <BadgeContainer>
        <Chip size="$2" bg="$green10" circular>
          <Chip.Text size="$1" fontWeight="700" color="$color1">
            BEST VALUE
          </Chip.Text>
        </Chip>
      </BadgeContainer>
    )
  }
  return null
})

const BadgeContainer = styled(XStack, {
  position: 'absolute',
  t: -12,
  r: 16,
})
