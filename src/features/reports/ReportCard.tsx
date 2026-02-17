import { useRouter } from 'one'
import { memo } from 'react'
import { SizableText, XStack, YStack } from 'tamagui'

import { Button } from '~/interface/buttons/Button'
import { ArrowClockwiseIcon } from '~/interface/icons/phosphor/ArrowClockwiseIcon'
import { FileTextIcon } from '~/interface/icons/phosphor/FileTextIcon'

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
      p="$4"
      rounded="$4"
      borderWidth={1}
      borderColor={isExpired ? '$borderColor' : '$color6'}
      bg={isExpired ? '$background' : '$color2'}
      opacity={isExpired ? 0.8 : 1}
      gap="$2"
      hoverStyle={isExpired ? undefined : { bg: '$color3' }}
      pressStyle={isExpired ? undefined : { bg: '$color4' }}
      cursor={isExpired ? undefined : 'pointer'}
    >
      <XStack gap="$3" items="center">
        <FileTextIcon size={24} color={isExpired ? '$color10' : '$color12'} />
        <YStack flex={1}>
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
      </XStack>

      <XStack gap="$4" mt="$1">
        <SizableText size="$2" color="$color10">
          Purchased: {purchasedDate}
        </SizableText>
        <SizableText size="$2" color={isExpired ? '$red10' : '$color10'}>
          {isExpired ? 'Expired' : `Expires: ${expiresDate}`}
        </SizableText>
      </XStack>

      {!isExpired && (
        <XStack gap="$4" mt="$1">
          {report.accidentCount !== undefined && report.accidentCount !== null && (
            <SizableText
              size="$2"
              color={report.accidentCount > 0 ? '$red10' : '$green10'}
            >
              {report.accidentCount === 0
                ? 'No accidents'
                : `${report.accidentCount} accident${report.accidentCount > 1 ? 's' : ''}`}
            </SizableText>
          )}
          {report.eventCount !== undefined && report.eventCount !== null && (
            <SizableText size="$2" color="$color10">
              {report.eventCount} events
            </SizableText>
          )}
        </XStack>
      )}

      {isExpired && (
        <XStack mt="$2">
          <Button
            size="small"
            variant="outlined"
            onPress={handleGetUpdatedReport}
            icon={<ArrowClockwiseIcon size={16} />}
          >
            Get Updated Report
          </Button>
        </XStack>
      )}
    </YStack>
  )
})
