import { useParams, useRouter } from 'one'
import { memo, useMemo } from 'react'
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { H2, H3, H4, SizableText, Spinner, XStack, YStack } from 'tamagui'

import { vehicleReportById } from '~/data/queries/vehicleReport'
import { useTabBarBottomPadding } from '~/features/app/tabBarConstants'
import { HeadInfo } from '~/interface/app/HeadInfo'
import { Button } from '~/interface/buttons/Button'
import { CarIcon } from '~/interface/icons/phosphor/CarIcon'
import { CheckCircleIcon } from '~/interface/icons/phosphor/CheckCircleIcon'
import { ClockIcon } from '~/interface/icons/phosphor/ClockIcon'
import { FileTextIcon } from '~/interface/icons/phosphor/FileTextIcon'
import { GaugeIcon } from '~/interface/icons/phosphor/GaugeIcon'
import { MegaphoneIcon } from '~/interface/icons/phosphor/MegaphoneIcon'
import { ShieldCheckIcon } from '~/interface/icons/phosphor/ShieldCheckIcon'
import { UserIcon } from '~/interface/icons/phosphor/UserIcon'
import { WarningCircleIcon } from '~/interface/icons/phosphor/WarningCircleIcon'
import { WrenchIcon } from '~/interface/icons/phosphor/WrenchIcon'
import { AnimatedBlurHeader, HEADER_HEIGHT } from '~/interface/headers/AnimatedBlurHeader.native'
import { KeyValueRow } from '~/interface/lists/KeyValueRow'
import { PageLayout } from '~/interface/pages/PageLayout'
import { useQuery } from '~/zero/client'

import { EventDamageVisualization } from './components/VehicleDamageVisualization'

import type { CanonicalReport, EventType, NormalizedEvent } from './types'

export const ReportDetailPage = memo(() => {
  const { reportId = '' } = useParams<{ reportId?: string }>()
  const router = useRouter()
  const [vehicleReport, status] = useQuery(vehicleReportById, { reportId })
  const insets = useSafeAreaInsets()
  const tabBarPadding = useTabBarBottomPadding()
  const scrollY = useSharedValue(0)

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y
    },
  })

  const report = vehicleReport?.canonicalJson as CanonicalReport | undefined
  const isLoading = status.type === 'unknown'
  const isExpired = vehicleReport ? vehicleReport.expiresAt < Date.now() : false

  if (isLoading) {
    return (
      <PageLayout>
        <HeadInfo title="Loading Report..." />
        <YStack flex={1} items="center" justify="center" p="$8">
          <Spinner size="large" />
          <SizableText size="$3" color="$color10" mt="$3">
            Loading report...
          </SizableText>
        </YStack>
      </PageLayout>
    )
  }

  if (!vehicleReport) {
    return (
      <PageLayout>
        <HeadInfo title="Report Not Found" />
        <YStack flex={1} items="center" justify="center" p="$8" gap="$4">
          <FileTextIcon size={64} color="$color8" />
          <H2 size="$6" color="$color10">
            Report Not Found
          </H2>
          <SizableText size="$4" color="$color10" text="center">
            This report may have been deleted or you don't have access to it.
          </SizableText>
          <Button onPress={() => router.push('/home/reports')}>Back to Reports</Button>
        </YStack>
      </PageLayout>
    )
  }

  if (isExpired) {
    const vin = vehicleReport.vehicle?.vin || vehicleReport.vehicleId
    return (
      <PageLayout>
        <HeadInfo title="Report Expired" />
        <YStack flex={1} items="center" justify="center" p="$8" gap="$4">
          <WarningCircleIcon size={64} color="$orange10" />
          <H2 size="$6" color="$orange10">
            Report Expired
          </H2>
          <SizableText size="$4" color="$color10" text="center">
            This report has expired. Purchase a new report to get updated information.
          </SizableText>
          <SizableText size="$3" color="$color8" fontFamily="$mono">
            VIN: {vin}
          </SizableText>
          <Button onPress={() => router.push(`/home/vin-lookup?vin=${vin}` as any)}>
            Get Updated Report
          </Button>
        </YStack>
      </PageLayout>
    )
  }

  if (!report) {
    return (
      <PageLayout>
        <HeadInfo title="Report Error" />
        <YStack flex={1} items="center" justify="center" p="$8" gap="$4">
          <WarningCircleIcon size={64} color="$red10" />
          <H2 size="$6" color="$red10">
            Report Data Unavailable
          </H2>
          <SizableText size="$4" color="$color10" text="center">
            There was an issue loading this report's data.
          </SizableText>
          <Button onPress={() => router.push('/home/reports')}>Back to Reports</Button>
        </YStack>
      </PageLayout>
    )
  }

  const title = `${report.vehicleInfo.year} ${report.vehicleInfo.make} ${report.vehicleInfo.model}`

  const hasIssues =
    report.accidentCount > 0 ||
    report.totalLoss ||
    report.odometerIssues ||
    report.titleBrands.length > 0

  return (
    <PageLayout>
      <HeadInfo title={title} />
      <AnimatedBlurHeader scrollY={scrollY} title={title} showBackButton />
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: HEADER_HEIGHT + insets.top + 8,
          paddingBottom: tabBarPadding,
          paddingHorizontal: 16,
          gap: 16,
        }}
      >
        <VehicleHeader report={report} />
        <SummaryStats report={report} hasIssues={hasIssues} />
        {report.titleBrands.length > 0 && <TitleBrands brands={report.titleBrands} />}
        <Timeline events={report.events} />
        <SourceProviders providers={report.sourceProviders} />
      </Animated.ScrollView>
    </PageLayout>
  )
})

const VehicleHeader = memo(({ report }: { report: CanonicalReport }) => {
  const { vehicleInfo } = report

  return (
    <YStack gap="$2">
      <H2 size="$8" fontWeight="600">
        {vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}
      </H2>
      <YStack bg="$color2" rounded="$4" px="$3" py="$1">
        <KeyValueRow
          label="VIN"
          value={
            <SizableText size="$3" color="$color12" fontFamily="$mono">
              {vehicleInfo.vin}
            </SizableText>
          }
        />
        {vehicleInfo.trim && <KeyValueRow label="Trim" value={vehicleInfo.trim} />}
        <KeyValueRow
          label="Year / Make / Model"
          value={`${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}`}
          last
        />
      </YStack>
    </YStack>
  )
})

const SummaryStats = memo(
  ({ report, hasIssues }: { report: CanonicalReport; hasIssues: boolean }) => {
    return (
      <YStack gap="$3">
        <XStack items="center" gap="$2">
          {hasIssues ? (
            <WarningCircleIcon size={20} color="$orange10" />
          ) : (
            <CheckCircleIcon size={20} color="$green10" />
          )}
          <H3 size="$5" color={hasIssues ? '$orange10' : '$green10'}>
            {hasIssues ? 'Issues Found' : 'Clean History'}
          </H3>
        </XStack>

        <XStack gap="$3" flexWrap="wrap">
          <StatBox
            label="Owners"
            value={report.estimatedOwners?.toString() ?? 'Unknown'}
          />
          <StatBox
            label="Accidents"
            value={report.accidentCount.toString()}
            isWarning={report.accidentCount > 0}
          />
          <StatBox label="Service Records" value={report.serviceRecordCount.toString()} />
          <StatBox label="Total Events" value={report.eventCount.toString()} />
        </XStack>

        {report.odometerLastReported && (
          <YStack gap="$1" bg="$color2" p="$3" rounded="$4">
            <SizableText size="$2" color="$color10">
              Last Reported Odometer
            </SizableText>
            <XStack items="baseline" gap="$1">
              <SizableText size="$6" fontWeight="600">
                {report.odometerLastReported.toLocaleString()}
              </SizableText>
              <SizableText size="$3" color="$color10">
                miles
              </SizableText>
            </XStack>
            {report.odometerLastDate && (
              <SizableText size="$2" color="$color8">
                as of {report.odometerLastDate}
              </SizableText>
            )}
            {report.odometerIssues && (
              <XStack items="center" gap="$1" mt="$1">
                <WarningCircleIcon size={14} color="$red10" />
                <SizableText size="$2" color="$red10">
                  Odometer issues detected
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
                Total Loss Reported
              </SizableText>
            </XStack>
          </YStack>
        )}
      </YStack>
    )
  }
)

const StatBox = memo(
  ({
    label,
    value,
    isWarning,
  }: {
    label: string
    value: string
    isWarning?: boolean
  }) => {
    return (
      <YStack flex={1} minW={100} bg="$color2" p="$3" rounded="$4" items="center">
        <SizableText size="$2" color="$color10">
          {label}
        </SizableText>
        <SizableText size="$7" fontWeight="600" color={isWarning ? '$red10' : '$color12'}>
          {value}
        </SizableText>
      </YStack>
    )
  }
)

const TitleBrands = memo(({ brands }: { brands: string[] }) => {
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
          Title Brands
        </SizableText>
      </XStack>
      <YStack gap="$1">
        {brands.map((brand, i) => (
          <SizableText key={i} size="$3" color="$orange11">
            • {brand}
          </SizableText>
        ))}
      </YStack>
    </YStack>
  )
})

const Timeline = memo(({ events }: { events: NormalizedEvent[] }) => {
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
        <H3 size="$5">Timeline</H3>
        <SizableText size="$3" color="$color10">
          No events found
        </SizableText>
      </YStack>
    )
  }

  return (
    <YStack gap="$3">
      <H3 size="$5">Timeline ({events.length} events)</H3>
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
    const label = ownerNumber === 'unknown' ? 'Unknown Owner' : `Owner ${ownerNumber}`

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
        >
          <UserIcon size={18} color="$color10" />
          <H4 size="$4" color="$color11">
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
            {events.length} {events.length === 1 ? 'event' : 'events'}
          </SizableText>
        </XStack>
        <YStack gap="$2" pl="$3" borderLeftWidth={2} borderColor="$color5">
          {events.map((event, i) => (
            <TimelineEvent key={event.fingerprint || i} event={event} />
          ))}
        </YStack>
      </YStack>
    )
  }
)

const getEventIcon = (eventType: EventType) => {
  switch (eventType) {
    case 'TITLE':
    case 'REGISTRATION':
    case 'LIEN':
      return <CarIcon size={14} color="$color10" />
    case 'SERVICE':
      return <WrenchIcon size={14} color="$color10" />
    case 'ODOMETER_READING':
      return <GaugeIcon size={14} color="$color10" />
    case 'INSPECTION':
    case 'WARRANTY':
    case 'EMISSION':
      return <ShieldCheckIcon size={14} color="$color10" />
    case 'ACCIDENT':
    case 'DAMAGE':
      return <WarningCircleIcon size={14} color="$red10" />
    case 'RECALL':
      return <MegaphoneIcon size={14} color="$orange10" />
    case 'AUCTION':
    case 'LISTING':
    case 'INSURANCE':
    case 'MANUFACTURER':
    case 'OTHER':
    default:
      return <ClockIcon size={14} color="$color10" />
  }
}

const TimelineEvent = memo(({ event }: { event: NormalizedEvent }) => {
  const isNegative = event.isNegative
  const bgColor = isNegative ? '$red2' : '$background'
  const borderColor = isNegative ? '$red4' : '$color4'
  const showDamageViz = event.eventType === 'ACCIDENT' || event.eventType === 'DAMAGE'

  return (
    <YStack
      bg={bgColor}
      p="$3"
      rounded="$4"
      borderWidth={1}
      borderColor={borderColor}
      gap="$1"
    >
      <XStack justify="space-between" items="center">
        <SizableText size="$2" color="$color10" fontFamily="$mono">
          {event.eventDate}
        </SizableText>
        <XStack items="center" gap="$1.5" bg="$color4" px="$2" py="$0.5" rounded="$2">
          {getEventIcon(event.eventType)}
          <SizableText size="$1" color="$color8">
            {event.eventType.replace(/_/g, ' ')}
          </SizableText>
        </XStack>
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
            {event.odometerMiles.toLocaleString()} miles
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

const SourceProviders = memo(({ providers }: { providers: string[] }) => {
  return (
    <YStack gap="$2" pt="$4" borderTopWidth={1} borderColor="$color4">
      <SizableText size="$2" color="$color10">
        Data Sources
      </SizableText>
      <XStack gap="$2">
        {providers.map((provider) => (
          <SizableText
            key={provider}
            size="$2"
            bg="$color4"
            px="$2"
            py="$1"
            rounded="$3"
            textTransform="capitalize"
          >
            {provider}
          </SizableText>
        ))}
      </XStack>
    </YStack>
  )
})
