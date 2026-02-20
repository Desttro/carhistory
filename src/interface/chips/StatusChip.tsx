import type { ReactNode } from 'react'
import { SizableText, XStack, type ThemeName } from 'tamagui'

interface StatusChipProps {
  label: string
  icon?: ReactNode
  theme?: ThemeName
  size?: 'small' | 'medium'
}

export const StatusChip = ({ label, icon, theme, size = 'small' }: StatusChipProps) => {
  const isSmall = size === 'small'

  return (
    <XStack
      theme={theme}
      items="center"
      gap={isSmall ? '$1' : '$1.5'}
      bg="$color4"
      px={isSmall ? '$2' : '$2.5'}
      py={isSmall ? '$0.5' : '$1'}
      rounded={1000}
    >
      {icon}
      <SizableText
        size={isSmall ? '$1' : '$2'}
        fontWeight="600"
        color="$color11"
      >
        {label}
      </SizableText>
    </XStack>
  )
}
