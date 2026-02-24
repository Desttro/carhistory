import { getFontSized } from '@tamagui/get-font-sized'
import { createStyledContext, styled, Text, View, withStaticProperties } from 'tamagui'

import type { SizeTokens } from 'tamagui'

const ChipContext = createStyledContext({
  size: '$true' as SizeTokens,
})

const ChipFrame = styled(View, {
  name: 'Chip',
  flexDirection: 'row',
  context: ChipContext,
  variants: {
    circular: {
      true: {
        borderRadius: 1000_000_000,
      },
    },
    unstyled: {
      false: {
        borderRadius: 5,
        px: '$3',
        bg: '$color6',
        justify: 'center',
        items: 'center',
        hoverStyle: {
          bg: '$color7',
        },
      },
    },
    size: {
      '...size': (val, { tokens }) => {
        return {
          px: tokens.space[val].val,
          py: tokens.space[val].val * 0.2,
        }
      },
    },
  } as const,
  defaultVariants: {
    unstyled: false,
  },
})

const ChipText = styled(Text, {
  name: 'ChipText',
  context: ChipContext,
  variants: {
    unstyled: {
      false: {
        fontFamily: '$body',
        size: '$true',
        color: '$color',
      },
    },
    size: {
      '...fontSize': getFontSized as any,
    },
  } as const,
  defaultVariants: {
    unstyled: false,
  },
})

export const Chip = withStaticProperties(ChipFrame, {
  Text: ChipText,
})
