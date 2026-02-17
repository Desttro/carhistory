import { memo } from 'react'
import { SizableText, View, XStack } from 'tamagui'

export const DamageLegend = memo(() => {
  return (
    <XStack gap="$3" flexWrap="wrap">
      <XStack items="center" gap="$1.5">
        <View
          width={12}
          height={12}
          rounded={4}
          bg="$yellow8"
          opacity={0.6}
          borderWidth={1}
          borderColor="$yellow10"
        />
        <SizableText size="$2" color="$color10">
          Minor
        </SizableText>
      </XStack>
      <XStack items="center" gap="$1.5">
        <View
          width={12}
          height={12}
          rounded={4}
          bg="$orange8"
          opacity={0.6}
          borderWidth={1}
          borderColor="$orange10"
        />
        <SizableText size="$2" color="$color10">
          Moderate
        </SizableText>
      </XStack>
      <XStack items="center" gap="$1.5">
        <View
          width={12}
          height={12}
          rounded={4}
          bg="$red8"
          opacity={0.6}
          borderWidth={1}
          borderColor="$red10"
        />
        <SizableText size="$2" color="$color10">
          Severe
        </SizableText>
      </XStack>
    </XStack>
  )
})
