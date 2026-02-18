import { useState } from 'react'
import { useRouter } from 'one'
import { H2, SizableText, Spinner, YStack } from 'tamagui'

import { ReportCard } from '~/features/reports/ReportCard'
import { useVehicleReports } from '~/features/reports/useVehicleReports'
import { VinSearchForm } from '~/features/vin-lookup/VinSearchForm'
import { CarIcon } from '~/interface/icons/phosphor/CarIcon'
import { FileTextIcon } from '~/interface/icons/phosphor/FileTextIcon'
import { PageLayout } from '~/interface/pages/PageLayout'

export function ReportsPage() {
  const { activeReports, expiredReports, isLoading, isEmpty } = useVehicleReports()
  const [vin, setVin] = useState('')
  const router = useRouter()

  const handleSearch = () => {
    router.push(`/home/vin-lookup?vin=${vin}`)
  }

  return (
    <PageLayout>
      <YStack flex={1} gap="$4" px="$4" py="$6" maxW={700} width="100%" self="center">
        <YStack gap="$2" items="center">
          <FileTextIcon size={32} color="$color10" />
          <H2 size="$8" fontWeight="700" text="center">
            My Reports
          </H2>
          <SizableText size="$4" color="$color10" text="center">
            Your vehicle history reports
          </SizableText>
        </YStack>

        {isLoading && (
          <YStack flex={1} items="center" justify="center" py="$8">
            <Spinner size="large" />
          </YStack>
        )}

        {isEmpty && (
          <YStack gap="$6" items="center" py="$8" px="$2">
            <YStack gap="$3" items="center">
              <CarIcon size={64} color="$color8" />
              <SizableText size="$6" fontWeight="600" color="$color11" text="center">
                No reports yet
              </SizableText>
              <SizableText size="$4" color="$color9" text="center" maxW={400}>
                Enter a VIN below to check vehicle history — accidents, title records,
                odometer readings, service logs, and more
              </SizableText>
            </YStack>

            <YStack width="100%" maxW={480}>
              <VinSearchForm
                vin={vin}
                onVinChange={setVin}
                onSearch={handleSearch}
                isLoading={false}
              />
            </YStack>
          </YStack>
        )}

        {activeReports.length > 0 && (
          <YStack gap="$3">
            <SizableText size="$5" fontWeight="600" color="$color11">
              Active Reports
            </SizableText>
            {activeReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </YStack>
        )}

        {expiredReports.length > 0 && (
          <YStack gap="$3" mt="$4">
            <SizableText size="$5" fontWeight="600" color="$color10">
              Expired Reports
            </SizableText>
            {expiredReports.map((report) => (
              <ReportCard key={report.id} report={report} isExpired />
            ))}
          </YStack>
        )}
      </YStack>
    </PageLayout>
  )
}
