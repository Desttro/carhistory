import { memo } from 'react'
import { Separator, SizableText, XStack, YStack } from 'tamagui'

import type { ReactNode } from 'react'

interface KeyValueRowProps {
  label: string
  value: string | ReactNode
  last?: boolean
}

export const KeyValueRow = memo(({ label, value, last }: KeyValueRowProps) => {
  return (
    <YStack>
      <XStack justify="space-between" items="center" py="$2">
        <SizableText size="$3" color="$color10">
          {label}
        </SizableText>
        {typeof value === 'string' ? (
          <SizableText size="$3" color="$color12">
            {value}
          </SizableText>
        ) : (
          value
        )}
      </XStack>
      {!last && <Separator />}
    </YStack>
  )
})
