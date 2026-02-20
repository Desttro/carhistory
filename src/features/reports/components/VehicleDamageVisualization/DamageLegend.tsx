import { memo } from 'react'
import { SizableText, View, XStack } from 'tamagui'

import { useT } from '~/i18n/context'

export const DamageLegend = memo(() => {
  const t = useT()

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
          {t('severity.minor')}
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
          {t('severity.moderate')}
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
          {t('severity.severe')}
        </SizableText>
      </XStack>
    </XStack>
  )
})
