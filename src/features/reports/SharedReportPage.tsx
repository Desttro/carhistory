import {
  VehicleHeader,
  SummaryStats,
  TitleBrands,
  Timeline,

  import { useParams } from 'one'
  import { memo, useEffect, useState } from 'react'
  import { Platform, ScrollView } from 'react-native'
  import { useSafeAreaInsets } from 'react-native-safe-area-context'
  import { H2, SizableText, Spinner, XStack, YStack } from 'tamagui'

  import { SERVER_URL } from '~/constants/urls'
  import { PublicI18nProvider } from '~/i18n/provider-public'
  import { HeadInfo } from '~/interface/app/HeadInfo'
  import { StatusChip } from '~/interface/chips/StatusChip'
  import { FileTextIcon } from '~/interface/icons/phosphor/FileTextIcon'
  import { ShareFatIcon } from '~/interface/icons/phosphor/ShareFatIcon'
  import { WarningCircleIcon } from '~/interface/icons/phosphor/WarningCircleIcon'
  import { PageLayout } from '~/interface/pages/PageLayout'
  // SourceProviders,
} from './components/ReportSections'

import type { CanonicalReport } from './types'

const isNative = Platform.OS !== 'web'

function SharedReportContent() {
  const { token = '' } = useParams<{ token?: string }>()
  const insets = useSafeAreaInsets()
  const [report, setReport] = useState<CanonicalReport | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setError('not_found')
      setIsLoading(false)
      return
    }

    fetch(`${SERVER_URL}/api/report/share/${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.report) {
          setReport(data.report)
        } else {
          setError(data.error || 'not_found')
        }
      })
      .catch(() => {
        setError('not_found')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [token])

  if (isLoading) {
    return (
      <PageLayout>
        <HeadInfo title="Shared Report" />
        <YStack flex={1} items="center" justify="center" p="$8">
          <Spinner size="large" />
          <SizableText size="$3" color="$color10" mt="$3">
            Loading report...
          </SizableText>
        </YStack>
      </PageLayout>
    )
  }

  if (error || !report) {
    const isRevoked = error === 'revoked'
    return (
      <PageLayout>
        <HeadInfo title="Report Unavailable" />
        <YStack flex={1} items="center" justify="center" p="$8" gap="$4">
          {isRevoked ? (
            <WarningCircleIcon size={64} color="$orange10" />
          ) : (
            <FileTextIcon size={64} color="$color8" />
          )}
          <H2 size="$6" color={isRevoked ? '$orange10' : '$color10'}>
            {isRevoked ? 'Link Revoked' : 'Report Not Found'}
          </H2>
          <SizableText size="$4" color="$color10" text="center">
            {isRevoked
              ? 'The owner has revoked access to this shared report.'
              : 'This shared report link is invalid or has expired.'}
          </SizableText>
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
      <HeadInfo title={`${title} - Shared Report`} />

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          isNative
            ? {
                paddingTop: insets.top + 12,
                paddingBottom: insets.bottom + 16,
                paddingHorizontal: 16,
                gap: 16,
              }
            : undefined
        }
      >
        <YStack
          gap="$4"
          width="100%"
          self="center"
          maxW={800}
          {...(isNative ? {} : { p: '$4' })}
          $lg={{ maxW: 1040 }}
        >
          <XStack items="center" gap="$2">
            <StatusChip
              label="Shared Report"
              icon={<ShareFatIcon size={10} color="$color11" />}
              theme="blue"
              size="small"
            />
          </XStack>
          <VehicleHeader report={report} hasIssues={hasIssues} />
          <SummaryStats report={report} hasIssues={hasIssues} locale="en" />
          {report.titleBrands.length > 0 && <TitleBrands brands={report.titleBrands} />}
          <Timeline events={report.events} />
          {/* <SourceProviders providers={report.sourceProviders} /> */}
        </YStack>
      </ScrollView>
    </PageLayout>
  )
}

export const SharedReportPage = memo(() => {
  return (
    <PublicI18nProvider>
      <SharedReportContent />
    </PublicI18nProvider>
  )
})
