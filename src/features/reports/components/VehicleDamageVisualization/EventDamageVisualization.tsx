import { memo, useMemo } from 'react'
import { SizableText, View, XStack, YStack } from 'tamagui'

import { damageZonePaths } from './damageZones'
import { parseAccidentDamageZones, parseEventDamageZones } from './parseEventDamage'
import { VehicleSvg } from './VehicleSvg'

import type { AccidentRecord, NormalizedEvent } from '~/features/reports/types'

interface EventDamageVisualizationProps {
  event?: NormalizedEvent
  accident?: AccidentRecord
}

export const EventDamageVisualization = memo(
  ({ event, accident }: EventDamageVisualizationProps) => {
    const damageZones = useMemo(() => {
      if (event) {
        return parseEventDamageZones(event)
      }
      if (accident) {
        return parseAccidentDamageZones(accident)
      }
      return []
    }, [event, accident])

    if (damageZones.length === 0) {
      return null
    }

    const zoneLabels = damageZones
      .map((z) => damageZonePaths.find((p) => p.id === z.zoneId)?.label)
      .filter(Boolean)

    return (
      <XStack gap="$3" items="center" mt="$2" bg="$color2" rounded="$3" p="$2">
        <View height={120} aspectRatio={200 / 440}>
          <VehicleSvg
            damageZones={damageZones}
            hoveredZone={null}
          />
        </View>
        <YStack flex={1} gap="$0.5">
          <SizableText size="$2" color="$color10">
            Impact area{zoneLabels.length > 1 ? 's' : ''}
          </SizableText>
          <SizableText size="$2" fontWeight="500" color="$color11">
            {zoneLabels.join(', ')}
          </SizableText>
        </YStack>
      </XStack>
    )
  }
)
