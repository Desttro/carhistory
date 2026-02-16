import { memo } from 'react'
import Svg, { Path } from 'react-native-svg'
import { useTheme } from 'tamagui'

import { carOutlinePath, damageZonePaths } from './damageZones'

import type { DamageZoneData, DamageZoneId } from './types'
import type { ColorTokens } from 'tamagui'

interface VehicleSvgProps {
  damageZones: DamageZoneData[]
  hoveredZone: DamageZoneId | null
  onZoneHover?: (zoneId: DamageZoneId | null) => void
  onZonePress?: (zoneId: DamageZoneId) => void
}

const severityColors: Record<
  string,
  { fill: ColorTokens; stroke: ColorTokens; opacity: number }
> = {
  minor: { fill: '$yellow8', stroke: '$yellow10', opacity: 0.4 },
  moderate: { fill: '$orange8', stroke: '$orange10', opacity: 0.5 },
  severe: { fill: '$red8', stroke: '$red10', opacity: 0.6 },
  unknown: { fill: '$color8', stroke: '$color10', opacity: 0.3 },
}

export const VehicleSvg = memo(
  ({ damageZones, hoveredZone, onZoneHover, onZonePress }: VehicleSvgProps) => {
    const theme = useTheme()
    const damageMap = new Map(damageZones.map((z) => [z.zoneId, z]))

    const getZoneColor = (zoneId: DamageZoneId) => {
      const zone = damageMap.get(zoneId)
      if (!zone) return null

      const colors = severityColors[zone.severity] || severityColors.unknown
      const isHovered = hoveredZone === zoneId

      return {
        fill: theme[colors.fill]?.get() || theme.color8.get(),
        stroke: theme[colors.stroke]?.get() || theme.color10.get(),
        opacity: isHovered ? colors.opacity + 0.2 : colors.opacity,
        strokeWidth: isHovered ? 2 : 1,
      }
    }

    return (
      <Svg viewBox="0 0 47.032 47.032" width="100%" height="100%">
        {/* car outline */}
        <Path
          d={carOutlinePath}
          fill={theme.color3.get()}
          stroke={theme.color6.get()}
          strokeWidth={0.5}
        />

        {/* damage zones */}
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
              strokeWidth={colors.strokeWidth}
              onPress={() => onZonePress?.(zoneDef.id)}
              onPressIn={() => onZoneHover?.(zoneDef.id)}
              onPressOut={() => onZoneHover?.(null)}
            />
          )
        })}
      </Svg>
    )
  }
)
