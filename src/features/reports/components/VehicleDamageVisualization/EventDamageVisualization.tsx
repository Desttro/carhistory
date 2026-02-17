import { memo, useMemo } from 'react'
import Svg, { Path } from 'react-native-svg'
import { SizableText, useTheme, XStack, YStack } from 'tamagui'

import { carOutlinePath, damageZonePaths } from './damageZones'
import { parseAccidentDamageZones, parseEventDamageZones } from './parseEventDamage'

import type { DamageZoneData, DamageZoneId } from './types'
import type { ColorTokens } from 'tamagui'
import type { AccidentRecord, NormalizedEvent } from '~/features/reports/types'

interface EventDamageVisualizationProps {
  event?: NormalizedEvent
  accident?: AccidentRecord
}

const severityColors: Record<
  string,
  { fill: ColorTokens; stroke: ColorTokens; opacity: number }
> = {
  minor: { fill: '$yellow8', stroke: '$yellow10', opacity: 0.5 },
  moderate: { fill: '$orange8', stroke: '$orange10', opacity: 0.6 },
  severe: { fill: '$red8', stroke: '$red10', opacity: 0.7 },
  unknown: { fill: '$color8', stroke: '$color10', opacity: 0.4 },
}

export const EventDamageVisualization = memo(
  ({ event, accident }: EventDamageVisualizationProps) => {
    const theme = useTheme()

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

    const damageMap = new Map(damageZones.map((z) => [z.zoneId, z]))

    const getZoneColor = (zoneId: DamageZoneId) => {
      const zone = damageMap.get(zoneId)
      if (!zone) return null

      const colors = severityColors[zone.severity] || severityColors.unknown
      return {
        fill: theme[colors.fill]?.get() || theme.color8.get(),
        stroke: theme[colors.stroke]?.get() || theme.color10.get(),
        opacity: colors.opacity,
      }
    }

    const zoneLabels = damageZones
      .map((z) => damageZonePaths.find((p) => p.id === z.zoneId)?.label)
      .filter(Boolean)

    return (
      <XStack gap="$2" items="center" mt="$2">
        <YStack width={60} height={60}>
          <Svg viewBox="0 0 47.032 47.032" width="100%" height="100%">
            <Path
              d={carOutlinePath}
              fill={theme.color3.get()}
              stroke={theme.color6.get()}
              strokeWidth={0.5}
            />
            {damageZonePaths.map((zoneDef) => {
              const colors = getZoneColor(zoneDef.id)
              if (!colors) return null

              return (
                <Path
                  key={zoneDef.id}
                  d={zoneDef.d}
                  fill={colors.fill}
                  fillOpacity={colors.opacity}
                  stroke={colors.stroke}
                  strokeWidth={1}
                />
              )
            })}
          </Svg>
        </YStack>
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
