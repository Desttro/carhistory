import { memo, useMemo, useState } from 'react'
import { H4, SizableText, View, XStack, YStack } from 'tamagui'

import { WarningCircleIcon } from '~/interface/icons/phosphor/WarningCircleIcon'

import { DamageLegend } from './DamageLegend'
import { damageZonePaths } from './damageZones'
import { parseDamageZones } from './parseDamageZones'
import { VehicleSvg } from './VehicleSvg'

import type { DamageZoneData, DamageZoneId } from './types'
import type { ColorTokens } from 'tamagui'
import type { AccidentRecord, NormalizedEvent, Severity } from '~/features/reports/types'

interface VehicleDamageVisualizationProps {
  accidents: AccidentRecord[]
  events: NormalizedEvent[]
}

const severityOrder: Severity[] = ['unknown', 'minor', 'moderate', 'severe']

function getMaxSeverity(zones: DamageZoneData[]): Severity {
  let max: Severity = 'unknown'
  for (const zone of zones) {
    if (severityOrder.indexOf(zone.severity) > severityOrder.indexOf(max)) {
      max = zone.severity
    }
  }
  return max
}

function getSeverityLabel(severity: Severity): string {
  switch (severity) {
    case 'severe':
      return 'Severe Damage'
    case 'moderate':
      return 'Moderate Damage'
    case 'minor':
      return 'Minor Damage'
    default:
      return 'Damage Reported'
  }
}

function getSeverityColor(severity: Severity): ColorTokens {
  switch (severity) {
    case 'severe':
      return '$red10'
    case 'moderate':
      return '$orange10'
    case 'minor':
      return '$yellow10'
    default:
      return '$color10'
  }
}

export const VehicleDamageVisualization = memo(
  ({ accidents, events }: VehicleDamageVisualizationProps) => {
    const [hoveredZone, setHoveredZone] = useState<DamageZoneId | null>(null)

    const damageZones = useMemo(
      () => parseDamageZones(accidents, events),
      [accidents, events]
    )

    // don't render if no damage zones found
    if (damageZones.length === 0) {
      return null
    }

    const maxSeverity = getMaxSeverity(damageZones)
    const hoveredData = hoveredZone
      ? damageZones.find((z) => z.zoneId === hoveredZone)
      : null
    const hoveredLabel = hoveredZone
      ? damageZonePaths.find((p) => p.id === hoveredZone)?.label
      : null

    return (
      <YStack
        gap="$3"
        bg="$color2"
        p="$4"
        rounded="$4"
        borderWidth={1}
        borderColor="$color4"
      >
        {/* header */}
        <XStack items="center" gap="$2">
          <WarningCircleIcon size={18} color={getSeverityColor(maxSeverity)} />
          <H4 size="$4" color={getSeverityColor(maxSeverity)}>
            {getSeverityLabel(maxSeverity)}
          </H4>
        </XStack>

        {/* visualization container */}
        <XStack gap="$4" flexWrap="wrap">
          {/* svg container */}
          <YStack
            flex={1}
            minW={150}
            maxW={200}
            items="center"
            justify="center"
            $platform-web={{
              cursor: 'pointer',
            }}
          >
            <View width="100%" aspectRatio={1}>
              <VehicleSvg
                damageZones={damageZones}
                hoveredZone={hoveredZone}
                onZoneHover={setHoveredZone}
              />
            </View>
          </YStack>

          {/* info panel */}
          <YStack flex={2} minW={150} gap="$3" justify="center">
            {hoveredData ? (
              <YStack gap="$2">
                <SizableText size="$4" fontWeight="600">
                  {hoveredLabel}
                </SizableText>
                <SizableText size="$3" color="$color10">
                  {hoveredData.eventCount}{' '}
                  {hoveredData.eventCount === 1 ? 'incident' : 'incidents'} •{' '}
                  {hoveredData.severity} severity
                </SizableText>
                {hoveredData.events.slice(0, 2).map((event, i) => (
                  <YStack key={i} gap="$1" bg="$color3" p="$2" rounded="$3">
                    <SizableText size="$2" color="$color8" fontFamily="$mono">
                      {event.date}
                    </SizableText>
                    <SizableText size="$2" color="$color11" numberOfLines={2}>
                      {event.details}
                    </SizableText>
                  </YStack>
                ))}
                {hoveredData.events.length > 2 && (
                  <SizableText size="$2" color="$color8">
                    +{hoveredData.events.length - 2} more
                  </SizableText>
                )}
              </YStack>
            ) : (
              <YStack gap="$2">
                <SizableText size="$3" color="$color10">
                  {damageZones.length} area{damageZones.length !== 1 ? 's' : ''} with
                  reported damage
                </SizableText>
                <SizableText size="$2" color="$color8">
                  Hover over highlighted areas to see details
                </SizableText>
                <XStack gap="$2" flexWrap="wrap" mt="$1">
                  {damageZones.map((zone) => {
                    const label = damageZonePaths.find((p) => p.id === zone.zoneId)?.label
                    return (
                      <YStack key={zone.zoneId} bg="$color4" px="$2" py="$1" rounded="$3">
                        <SizableText size="$2" color="$color11">
                          {label} ({zone.eventCount})
                        </SizableText>
                      </YStack>
                    )
                  })}
                </XStack>
              </YStack>
            )}

            <DamageLegend />
          </YStack>
        </XStack>
      </YStack>
    )
  }
)
