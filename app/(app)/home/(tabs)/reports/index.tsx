import { useRouter } from 'one'
import { useState } from 'react'
import { H2, SizableText, Spinner, XStack, YStack } from 'tamagui'

import { ReportCard } from '~/features/reports/ReportCard'
import { useVehicleReports } from '~/features/reports/useVehicleReports'
import { VinSearchForm } from '~/features/vin-lookup/VinSearchForm'
import { CarIcon } from '~/interface/icons/phosphor/CarIcon'
import { FileTextIcon } from '~/interface/icons/phosphor/FileTextIcon'
import { SimpleGrid, SimpleGridItem } from '~/interface/layout/SimpleGrid'
import { PageLayout } from '~/interface/pages/PageLayout'

export function ReportsPage() {
  const { activeReports, expiredReports, isLoading, isEmpty } = useVehicleReports()
  const [vin, setVin] = useState('')
  const router = useRouter()

  const handleSearch = () => {
    router.push(`/home/vin-lookup?vin=${vin}`)
  }

  return (
    <PageLayout scroll tabBarOffset>
      <YStack
        gap="$4"
        px="$4"
        py="$6"
        maxW={700}
        width="100%"
        self="center"
        $md={{ maxW: 900, px: '$8' }}
        $lg={{ maxW: 1000 }}
      >
        <YStack gap="$2" items="center">
          <YStack
            width={56}
            height={56}
            rounded={1000}
            bg="$color3"
            items="center"
            justify="center"
          >
            <FileTextIcon size={28} color="$color10" />
          </YStack>
          <H2 size="$8" fontWeight="700" text="center">
            My Reports
          </H2>
          <SizableText size="$4" color="$color10" text="center">
            Your vehicle history reports
          </SizableText>
        </YStack>

        {isLoading && (
          <YStack items="center" justify="center" py="$12">
            <Spinner size="large" />
          </YStack>
        )}

        {isEmpty && (
          <YStack
            gap="$6"
            items="center"
            py="$8"
            px="$4"
            borderWidth={2}
            borderStyle="dashed"
            borderColor="$color6"
            bg="$color2"
            rounded="$6"
          >
            <YStack gap="$3" items="center">
              <YStack
                width={80}
                height={80}
                rounded={1000}
                bg="$color3"
                items="center"
                justify="center"
              >
                <CarIcon size={40} color="$color8" />
              </YStack>
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
            <XStack items="center" gap="$2">
              <SizableText size="$5" fontWeight="600" color="$color11">
                Active Reports
              </SizableText>
              <SizableText
                size="$1"
                fontWeight="600"
                bg="$color4"
                color="$color10"
                px="$2"
                py="$0.5"
                rounded={1000}
              >
                {activeReports.length}
              </SizableText>
            </XStack>
            <SimpleGrid>
              {activeReports.map((report) => (
                <SimpleGridItem key={report.id} columns={2}>
                  <ReportCard report={report} />
                </SimpleGridItem>
              ))}
            </SimpleGrid>
          </YStack>
        )}

        {expiredReports.length > 0 && (
          <YStack gap="$3" mt="$4">
            <XStack items="center" gap="$2">
              <SizableText size="$5" fontWeight="600" color="$color10">
                Expired Reports
              </SizableText>
              <SizableText
                size="$1"
                fontWeight="600"
                bg="$color4"
                color="$color10"
                px="$2"
                py="$0.5"
                rounded={1000}
              >
                {expiredReports.length}
              </SizableText>
            </XStack>
            <SimpleGrid>
              {expiredReports.map((report) => (
                <SimpleGridItem key={report.id} columns={2}>
                  <ReportCard report={report} isExpired />
                </SimpleGridItem>
              ))}
            </SimpleGrid>
          </YStack>
        )}
      </YStack>
    </PageLayout>
  )
}
