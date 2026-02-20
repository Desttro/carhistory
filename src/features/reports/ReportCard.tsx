import { useRouter } from 'one'
import { memo } from 'react'
import { SizableText, XStack, YStack } from 'tamagui'

import { Button } from '~/interface/buttons/Button'
import { StatusChip } from '~/interface/chips/StatusChip'
import { ArrowClockwiseIcon } from '~/interface/icons/phosphor/ArrowClockwiseIcon'
import { CarIcon } from '~/interface/icons/phosphor/CarIcon'
import { CheckCircleIcon } from '~/interface/icons/phosphor/CheckCircleIcon'
import { ClockIcon } from '~/interface/icons/phosphor/ClockIcon'
import { WarningCircleIcon } from '~/interface/icons/phosphor/WarningCircleIcon'
import { WrenchIcon } from '~/interface/icons/phosphor/WrenchIcon'

import type { VehicleReportWithVehicle } from '~/data/types'

interface ReportCardProps {
  report: VehicleReportWithVehicle
  isExpired?: boolean
}

export const ReportCard = memo(({ report, isExpired = false }: ReportCardProps) => {
  const router = useRouter()

  const vehicle = report.vehicle
  const title = vehicle
    ? `${vehicle.year || ''} ${vehicle.make || ''} ${vehicle.model || ''}`.trim()
    : 'Vehicle Report'
  const vin = vehicle?.vin || report.vehicleId

  const purchasedDate = new Date(report.purchasedAt).toLocaleDateString()
  const expiresDate = new Date(report.expiresAt).toLocaleDateString()

  const accidentCount = report.accidentCount ?? 0
  const hasAccidents = accidentCount > 0

  const handlePress = () => {
    if (!isExpired) {
      router.push(`/home/reports/${report.id}`)
    }
  }

  const handleGetUpdatedReport = () => {
    router.push(`/home/vin-lookup?vin=${vin}` as any)
  }

  return (
    <YStack
      onPress={handlePress}
      flex={1}
      p="$4"
      rounded="$5"
      borderWidth={1}
      borderColor={isExpired ? '$borderColor' : '$color5'}
      bg={isExpired ? '$background' : '$color2'}
      opacity={isExpired ? 0.8 : 1}
      gap="$3"
      cursor={isExpired ? undefined : 'pointer'}
      $platform-web={{
        hoverStyle: isExpired
          ? undefined
          : {
              bg: '$color3',
              shadowColor: '$shadowColor',
              shadowRadius: 8,
              shadowOpacity: 0.1,
            },
        pressStyle: isExpired ? undefined : { bg: '$color4' },
      }}
    >
      <XStack gap="$3" items="center">
        <YStack
          width={40}
          height={40}
          rounded="$3"
          bg="$color4"
          items="center"
          justify="center"
        >
          <CarIcon size={22} color={isExpired ? '$color10' : '$color12'} />
        </YStack>
        <YStack flex={1} gap="$1">
          <SizableText
            size="$5"
            fontWeight="600"
            color={isExpired ? '$color10' : '$color12'}
          >
            {title || 'Unknown Vehicle'}
          </SizableText>
          <SizableText size="$2" color="$color10" fontFamily="$mono">
            {vin}
          </SizableText>
        </YStack>
        {!isExpired &&
          report.accidentCount !== undefined &&
          report.accidentCount !== null && (
            <StatusChip
              label={
                hasAccidents
                  ? `${accidentCount} Accident${accidentCount > 1 ? 's' : ''}`
                  : 'Clean'
              }
              icon={
                hasAccidents ? (
                  <WarningCircleIcon size={12} color="$color11" />
                ) : (
                  <CheckCircleIcon size={12} color="$color11" />
                )
              }
              theme={hasAccidents ? 'red' : 'green'}
              size="small"
            />
          )}
      </XStack>

      {!isExpired && (
        <XStack gap="$4">
          {report.eventCount !== undefined && report.eventCount !== null && (
            <XStack items="center" gap="$1.5">
              <ClockIcon size={14} color="$color9" />
              <SizableText size="$2" color="$color10">
                {report.eventCount} events
              </SizableText>
            </XStack>
          )}
          {report.serviceRecordCount !== undefined &&
            report.serviceRecordCount !== null && (
              <XStack items="center" gap="$1.5">
                <WrenchIcon size={14} color="$color9" />
                <SizableText size="$2" color="$color10">
                  {report.serviceRecordCount} service records
                </SizableText>
              </XStack>
            )}
        </XStack>
      )}

      <XStack items="center" justify="space-between">
        <XStack gap="$4">
          <SizableText size="$2" color="$color10">
            Purchased: {purchasedDate}
          </SizableText>
          <SizableText size="$2" color={isExpired ? '$red10' : '$color10'}>
            {isExpired ? 'Expired' : `Expires: ${expiresDate}`}
          </SizableText>
        </XStack>
        {isExpired && (
          <Button
            size="small"
            variant="outlined"
            onPress={handleGetUpdatedReport}
            icon={<ArrowClockwiseIcon size={16} />}
          >
            Get Updated Report
          </Button>
        )}
      </XStack>
    </YStack>
  )
})
