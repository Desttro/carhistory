import { href } from 'one'
import { H2, SizableText, YStack } from 'tamagui'

import { ReportCard } from '~/features/reports/ReportCard'
import { useVehicleReports } from '~/features/reports/useVehicleReports'
import { Link } from '~/interface/app/Link'
import { Button } from '~/interface/buttons/Button'
import { FileTextIcon } from '~/interface/icons/phosphor/FileTextIcon'
import { MagnifyingGlassIcon } from '~/interface/icons/phosphor/MagnifyingGlassIcon'
import { PageLayout } from '~/interface/pages/PageLayout'

export function ReportsPage() {
  const { activeReports, expiredReports, isLoading, isEmpty } = useVehicleReports()

  return (
    <PageLayout>
      <YStack flex={1} gap="$4" px="$4" py="$6" maxW={700} width="100%" self="center">
        <H2 size="$8" fontWeight="700">
          My Reports
        </H2>

        {isLoading && (
          <SizableText size="$4" color="$color10">
            Loading reports...
          </SizableText>
        )}

        {isEmpty && (
          <YStack gap="$4" items="center" py="$8">
            <FileTextIcon size={48} color="$color8" />
            <SizableText size="$5" color="$color10" text="center">
              No reports yet
            </SizableText>
            <SizableText size="$3" color="$color9" text="center">
              Check a VIN to get your first vehicle history report
            </SizableText>
            <Link href={href('/home/vin-lookup')}>
              <Button
                size="large"
                variant="action"
                icon={<MagnifyingGlassIcon size={18} />}
              >
                Check a VIN
              </Button>
            </Link>
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
