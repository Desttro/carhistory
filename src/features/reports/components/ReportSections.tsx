import { memo, useMemo, useState } from 'react'
import { AnimatePresence, H2, H3, H4, SizableText, XStack, YStack } from 'tamagui'

import { useT } from '~/i18n/context'
import { useLocale } from '~/i18n/context'
import { translateEventType, translateTitleBrand } from '~/i18n/enums'
import { formatNumber } from '~/i18n/format'
import { animationClamped } from '~/interface/animations/animationClamped'
import { StatusChip } from '~/interface/chips/StatusChip'
import { CaretDownIcon } from '~/interface/icons/phosphor/CaretDownIcon'
import { CarIcon } from '~/interface/icons/phosphor/CarIcon'
import { CheckCircleIcon } from '~/interface/icons/phosphor/CheckCircleIcon'
import { ClockIcon } from '~/interface/icons/phosphor/ClockIcon'
import { GaugeIcon } from '~/interface/icons/phosphor/GaugeIcon'
import { MegaphoneIcon } from '~/interface/icons/phosphor/MegaphoneIcon'
import { ShieldCheckIcon } from '~/interface/icons/phosphor/ShieldCheckIcon'
import { UserIcon } from '~/interface/icons/phosphor/UserIcon'
import { WarningCircleIcon } from '~/interface/icons/phosphor/WarningCircleIcon'
import { WrenchIcon } from '~/interface/icons/phosphor/WrenchIcon'
import { KeyValueRow } from '~/interface/lists/KeyValueRow'

import { EventDamageVisualization } from './VehicleDamageVisualization'

import type { CanonicalReport, EventType, NormalizedEvent } from '../types'

export const VehicleHeader = memo(
  ({ report, hasIssues }: { report: CanonicalReport; hasIssues: boolean }) => {
    const { vehicleInfo } = report
    const t = useT()

    return (
      <YStack gap="$3">
        <XStack gap="$3" items="center">
          <YStack
            width={56}
            height={56}
            rounded="$4"
            bg="$color3"
            items="center"
            justify="center"
            shrink={0}
          >
            <CarIcon size={28} color="$color11" />
          </YStack>
          <YStack flex={1} gap="$1">
            <H2 size="$7" fontWeight="600" $md={{ size: '$8' }}>
              {vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}
            </H2>
            <XStack items="center" gap="$2">
              <SizableText size="$3" color="$color10" fontFamily="$mono">
                {vehicleInfo.vin}
              </SizableText>
              <StatusChip
                label={hasIssues ? t('report.issuesFound') : t('report.clean')}
                icon={
                  hasIssues ? (
                    <WarningCircleIcon size={10} color="$color11" />
                  ) : (
                    <CheckCircleIcon size={10} color="$color11" />
                  )
                }
                theme={hasIssues ? 'orange' : 'green'}
                size="small"
              />
            </XStack>
          </YStack>
        </XStack>

        <YStack bg="$color2" rounded="$4" px="$3" py="$1">
          {vehicleInfo.trim && (
            <KeyValueRow label={t('vehicle.trim')} value={vehicleInfo.trim} />
          )}
          {vehicleInfo.bodyStyle && (
            <KeyValueRow label={t('vehicle.bodyStyle')} value={vehicleInfo.bodyStyle} />
          )}
          {vehicleInfo.engine && (
            <KeyValueRow label={t('vehicle.engine')} value={vehicleInfo.engine} />
          )}
          {vehicleInfo.drivetrain && (
            <KeyValueRow label={t('vehicle.drivetrain')} value={vehicleInfo.drivetrain} />
          )}
          <KeyValueRow
            label={t('vehicle.yearMakeModel')}
            value={`${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}`}
            last
          />
        </YStack>
      </YStack>
    )
  }
)

export const SummaryStats = memo(
  ({
    report,
    hasIssues,
    locale,
  }: {
    report: CanonicalReport
    hasIssues: boolean
    locale: string
  }) => {
    const t = useT()

    return (
      <YStack gap="$3">
        <XStack items="center" gap="$2">
          {hasIssues ? (
            <WarningCircleIcon size={20} color="$orange10" />
          ) : (
            <CheckCircleIcon size={20} color="$green10" />
          )}
          <H3 size="$5" color={hasIssues ? '$orange10' : '$green10'}>
            {hasIssues ? t('report.issuesFound') : t('report.cleanHistory')}
          </H3>
        </XStack>

        <XStack gap="$3" flexWrap="wrap">
          <StatBox
            label={t('report.stat.owners')}
            value={report.estimatedOwners?.toString() ?? t('report.stat.unknown')}
            icon={<UserIcon size={18} color="$color10" />}
          />
          <StatBox
            label={t('report.stat.accidents')}
            value={report.accidentCount.toString()}
            isWarning={report.accidentCount > 0}
            icon={
              <WarningCircleIcon
                size={18}
                color={report.accidentCount > 0 ? '$red10' : '$color10'}
              />
            }
          />
          <StatBox
            label={t('report.stat.serviceRecords')}
            value={report.serviceRecordCount.toString()}
            icon={<WrenchIcon size={18} color="$color10" />}
          />
          <StatBox
            label={t('report.stat.totalEvents')}
            value={report.eventCount.toString()}
            icon={<ClockIcon size={18} color="$color10" />}
          />
        </XStack>

        {report.odometerLastReported && (
          <YStack gap="$1" bg="$color2" p="$3" rounded="$4">
            <SizableText size="$2" color="$color10">
              {t('report.odometer.lastReported')}
            </SizableText>
            <XStack items="baseline" gap="$1">
              <SizableText size="$6" fontWeight="600">
                {formatNumber(report.odometerLastReported, locale)}
              </SizableText>
              <SizableText size="$3" color="$color10">
                {t('common.miles')}
              </SizableText>
            </XStack>
            {report.odometerLastDate && (
              <SizableText size="$2" color="$color8">
                {t('report.odometer.asOf', { date: report.odometerLastDate })}
              </SizableText>
            )}
            {report.odometerIssues && (
              <XStack items="center" gap="$1" mt="$1">
                <WarningCircleIcon size={14} color="$red10" />
                <SizableText size="$2" color="$red10">
                  {t('report.odometer.issuesDetected')}
                </SizableText>
              </XStack>
            )}
          </YStack>
        )}

        {report.totalLoss && (
          <YStack bg="$red2" p="$3" rounded="$4" borderWidth={1} borderColor="$red6">
            <XStack items="center" gap="$2">
              <WarningCircleIcon size={18} color="$red10" />
              <SizableText size="$4" fontWeight="600" color="$red10">
                {t('report.totalLoss')}
              </SizableText>
            </XStack>
          </YStack>
        )}
      </YStack>
    )
  }
)

export const StatBox = memo(
  ({
    label,
    value,
    isWarning,
    icon,
  }: {
    label: string
    value: string
    isWarning?: boolean
    icon?: React.ReactNode
  }) => {
    return (
      <YStack
        flex={1}
        minW={140}
        $md={{ minW: 160 }}
        bg="$color2"
        p="$3"
        rounded="$4"
        items="center"
        gap="$1"
        borderWidth={1}
        borderColor={isWarning ? '$red4' : '$color4'}
      >
        {icon && (
          <YStack
            width={32}
            height={32}
            rounded={1000}
            bg="$color3"
            items="center"
            justify="center"
          >
            {icon}
          </YStack>
        )}
        <SizableText size="$8" fontWeight="600" color={isWarning ? '$red10' : '$color12'}>
          {value}
        </SizableText>
        <SizableText size="$2" color="$color10">
          {label}
        </SizableText>
      </YStack>
    )
  }
)

export const TitleBrands = memo(({ brands }: { brands: string[] }) => {
  const t = useT()

  return (
    <YStack
      gap="$2"
      bg="$orange2"
      p="$3"
      rounded="$4"
      borderWidth={1}
      borderColor="$orange6"
    >
      <XStack items="center" gap="$2">
        <WarningCircleIcon size={18} color="$orange10" />
        <SizableText size="$4" fontWeight="600" color="$orange10">
          {t('report.titleBrands')}
        </SizableText>
      </XStack>
      <XStack gap="$2" flexWrap="wrap">
        {brands.map((brand, i) => (
          <StatusChip
            key={i}
            label={translateTitleBrand(t, brand)}
            theme="orange"
            size="medium"
          />
        ))}
      </XStack>
    </YStack>
  )
})

export const Timeline = memo(({ events }: { events: NormalizedEvent[] }) => {
  const t = useT()

  const groupedEvents = useMemo(() => {
    const sorted = [...events].sort(
      (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
    )

    const groups = new Map<number | 'unknown', NormalizedEvent[]>()

    sorted.forEach((event) => {
      const key = event.ownerSequence ?? 'unknown'
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(event)
    })

    return Array.from(groups.entries()).sort((a, b) => {
      if (a[0] === 'unknown') return 1
      if (b[0] === 'unknown') return -1
      return (a[0] as number) - (b[0] as number)
    })
  }, [events])

  if (events.length === 0) {
    return (
      <YStack gap="$2">
        <H3 size="$5">{t('report.timeline')}</H3>
        <SizableText size="$3" color="$color10">
          {t('report.timeline.noEvents')}
        </SizableText>
      </YStack>
    )
  }

  return (
    <YStack gap="$3">
      <H3 size="$5">{t('report.timeline.count', { count: events.length })}</H3>
      <YStack gap="$4">
        {groupedEvents.map(([ownerKey, ownerEvents], index) => (
          <OwnerSection
            key={ownerKey}
            ownerNumber={ownerKey}
            events={ownerEvents}
            isFirst={index === 0}
            isEven={index % 2 === 0}
          />
        ))}
      </YStack>
    </YStack>
  )
})

const OwnerSection = memo(
  ({
    ownerNumber,
    events,
    isFirst,
    isEven,
  }: {
    ownerNumber: number | 'unknown'
    events: NormalizedEvent[]
    isFirst: boolean
    isEven: boolean
  }) => {
    const [isExpanded, setIsExpanded] = useState(isFirst)
    const t = useT()
    const label =
      ownerNumber === 'unknown'
        ? t('report.timeline.ownerUnknown')
        : t('report.timeline.owner', { number: ownerNumber })

    return (
      <YStack
        gap="$3"
        mt={isFirst ? 0 : '$2'}
        bg={isEven ? '$color1' : '$color2'}
        p="$3"
        rounded="$4"
      >
        <XStack
          items="center"
          gap="$2"
          pb="$2"
          borderBottomWidth={1}
          borderColor="$color4"
          onPress={() => setIsExpanded((prev) => !prev)}
          cursor="pointer"
        >
          <UserIcon size={18} color="$color10" />
          <H4 size="$4" color="$color11" flex={1}>
            {label}
          </H4>
          <SizableText
            size="$2"
            bg="$color4"
            px="$2"
            py="$0.5"
            rounded="$2"
            color="$color10"
          >
            {t('report.timeline.eventCount', { count: events.length })}
          </SizableText>
          <YStack
            transition={animationClamped('quick')}
            rotate={isExpanded ? '0deg' : '-90deg'}
          >
            <CaretDownIcon size={16} color="$color10" />
          </YStack>
        </XStack>

        <AnimatePresence>
          {isExpanded && (
            <YStack
              key="events"
              gap="$2"
              pl="$3"
              borderLeftWidth={2}
              borderColor="$color5"
              transition={animationClamped('quick')}
              enterStyle={{ opacity: 0, y: -10 }}
              exitStyle={{ opacity: 0, y: -10 }}
              opacity={1}
              y={0}
            >
              {events.map((event, i) => (
                <TimelineEvent key={event.fingerprint || i} event={event} />
              ))}
            </YStack>
          )}
        </AnimatePresence>
      </YStack>
    )
  }
)

const eventTypeTheme: Record<string, string> = {
  ACCIDENT: 'red',
  DAMAGE: 'red',
  RECALL: 'orange',
  SERVICE: 'blue',
  TITLE: 'green',
  REGISTRATION: 'green',
  INSPECTION: 'purple',
  EMISSION: 'purple',
}

const getEventIcon = (eventType: EventType) => {
  switch (eventType) {
    case 'TITLE':
    case 'REGISTRATION':
    case 'LIEN':
      return <CarIcon size={14} color="$color11" />
    case 'SERVICE':
      return <WrenchIcon size={14} color="$color11" />
    case 'ODOMETER_READING':
      return <GaugeIcon size={14} color="$color11" />
    case 'INSPECTION':
    case 'WARRANTY':
    case 'EMISSION':
      return <ShieldCheckIcon size={14} color="$color11" />
    case 'ACCIDENT':
    case 'DAMAGE':
      return <WarningCircleIcon size={14} color="$color11" />
    case 'RECALL':
      return <MegaphoneIcon size={14} color="$color11" />
    case 'AUCTION':
    case 'LISTING':
    case 'INSURANCE':
    case 'MANUFACTURER':
    case 'OTHER':
    default:
      return <ClockIcon size={14} color="$color11" />
  }
}

const TimelineEvent = memo(({ event }: { event: NormalizedEvent }) => {
  const t = useT()
  const locale = useLocale()
  const isNegative = event.isNegative
  const bgColor = isNegative ? '$red2' : '$background'
  const borderColor = isNegative ? '$red4' : '$color4'
  const showDamageViz = event.eventType === 'ACCIDENT' || event.eventType === 'DAMAGE'
  const chipTheme = eventTypeTheme[event.eventType]

  return (
    <YStack
      bg={bgColor}
      p="$3"
      rounded="$4"
      borderWidth={1}
      borderColor={borderColor}
      borderLeftWidth={isNegative ? 3 : 1}
      borderLeftColor={isNegative ? '$red8' : borderColor}
      gap="$1"
      $platform-web={{
        cursor: 'default',
        hoverStyle: {
          borderColor: isNegative ? '$red6' : '$color6',
        },
      }}
    >
      <XStack justify="space-between" items="center">
        <SizableText size="$2" color="$color10" fontFamily="$mono">
          {event.eventDate}
        </SizableText>
        <StatusChip
          label={translateEventType(t, event.eventType)}
          icon={getEventIcon(event.eventType)}
          theme={chipTheme as any}
          size="small"
        />
      </XStack>
      <SizableText size="$3" fontWeight="500">
        {event.summary}
      </SizableText>
      {event.location && (
        <SizableText size="$2" color="$color10">
          {event.location}
          {event.state ? `, ${event.state}` : ''}
        </SizableText>
      )}
      {event.odometerMiles && (
        <XStack items="center" gap="$1">
          <GaugeIcon size={12} color="$color8" />
          <SizableText size="$2" color="$color8">
            {formatNumber(event.odometerMiles, locale)} {t('common.miles')}
          </SizableText>
        </XStack>
      )}
      {event.details && (
        <SizableText size="$2" color="$color10" mt="$1">
          {event.details}
        </SizableText>
      )}
      {showDamageViz && <EventDamageVisualization event={event} />}
    </YStack>
  )
})

export const SourceProviders = memo(({ providers }: { providers: string[] }) => {
  const t = useT()

  return (
    <YStack gap="$2" pt="$4" borderTopWidth={1} borderColor="$color4">
      <SizableText size="$2" color="$color10">
        {t('report.dataSources')}
      </SizableText>
      <XStack gap="$2" flexWrap="wrap">
        {providers.map((provider) => (
          <StatusChip
            key={provider}
            label={provider.charAt(0).toUpperCase() + provider.slice(1)}
            size="medium"
          />
        ))}
      </XStack>
    </YStack>
  )
})
