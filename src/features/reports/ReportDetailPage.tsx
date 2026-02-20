import { useParams, useRouter } from 'one'
import { memo } from 'react'
import { Platform, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { H2, SizableText, Spinner, XStack, YStack } from 'tamagui'

import { vehicleReportById } from '~/data/queries/vehicleReport'
import { useTabBarBottomPadding } from '~/features/app/tabBarConstants'
import { useT } from '~/i18n/context'
import { useLocale } from '~/i18n/context'
import { HeadInfo } from '~/interface/app/HeadInfo'
import { Button } from '~/interface/buttons/Button'
import { CaretLeftIcon } from '~/interface/icons/phosphor/CaretLeftIcon'
import { FileTextIcon } from '~/interface/icons/phosphor/FileTextIcon'
import { ShareFatIcon } from '~/interface/icons/phosphor/ShareFatIcon'
import { WarningCircleIcon } from '~/interface/icons/phosphor/WarningCircleIcon'
import { PageLayout } from '~/interface/pages/PageLayout'
import { useQuery } from '~/zero/client'

import {
  VehicleHeader,
  SummaryStats,
  TitleBrands,
  Timeline,
  SourceProviders,
} from './components/ReportSections'
import { useShareReport } from './useShareReport'

import type { CanonicalReport } from './types'

const isNative = Platform.OS !== 'web'

export const ReportDetailPage = memo(() => {
  const { reportId = '' } = useParams<{ reportId?: string }>()
  const router = useRouter()
  const [vehicleReport, status] = useQuery(vehicleReportById, { reportId })
  const insets = useSafeAreaInsets()
  const tabBarPadding = useTabBarBottomPadding()
  const t = useT()
  const locale = useLocale()
  const { shareReport, isLoading: isShareLoading } = useShareReport(reportId)

  const report = vehicleReport?.canonicalJson as CanonicalReport | undefined
  const isLoading = status.type === 'unknown'
  const isExpired = vehicleReport ? vehicleReport.expiresAt < Date.now() : false

  if (isLoading) {
    return (
      <PageLayout>
        <HeadInfo title={t('report.loading')} />
        <YStack flex={1} items="center" justify="center" p="$8">
          <Spinner size="large" />
          <SizableText size="$3" color="$color10" mt="$3">
            {t('report.loading')}
          </SizableText>
        </YStack>
      </PageLayout>
    )
  }

  if (!vehicleReport) {
    return (
      <PageLayout>
        <HeadInfo title={t('report.notFound.title')} />
        <YStack flex={1} items="center" justify="center" p="$8" gap="$4">
          <FileTextIcon size={64} color="$color8" />
          <H2 size="$6" color="$color10">
            {t('report.notFound.title')}
          </H2>
          <SizableText size="$4" color="$color10" text="center">
            {t('report.notFound.description')}
          </SizableText>
          <Button onPress={() => router.push('/home/reports')}>
            {t('report.notFound.back')}
          </Button>
        </YStack>
      </PageLayout>
    )
  }

  if (isExpired) {
    const vin = vehicleReport.vehicle?.vin || vehicleReport.vehicleId
    return (
      <PageLayout>
        <HeadInfo title={t('report.expired.title')} />
        <YStack flex={1} items="center" justify="center" p="$8" gap="$4">
          <WarningCircleIcon size={64} color="$orange10" />
          <H2 size="$6" color="$orange10">
            {t('report.expired.title')}
          </H2>
          <SizableText size="$4" color="$color10" text="center">
            {t('report.expired.description')}
          </SizableText>
          <SizableText size="$3" color="$color8" fontFamily="$mono">
            {t('report.vin', { vin })}
          </SizableText>
          <Button onPress={() => router.push(`/home/vin-lookup?vin=${vin}` as any)}>
            {t('report.expired.cta')}
          </Button>
        </YStack>
      </PageLayout>
    )
  }

  if (!report) {
    return (
      <PageLayout>
        <HeadInfo title={t('report.error.title')} />
        <YStack flex={1} items="center" justify="center" p="$8" gap="$4">
          <WarningCircleIcon size={64} color="$red10" />
          <H2 size="$6" color="$red10">
            {t('report.error.title')}
          </H2>
          <SizableText size="$4" color="$color10" text="center">
            {t('report.error.description')}
          </SizableText>
          <Button onPress={() => router.push('/home/reports')}>
            {t('report.notFound.back')}
          </Button>
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

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          isNative
            ? {
                paddingTop: insets.top + 12,
                paddingBottom: tabBarPadding,
                paddingHorizontal: 16,
                gap: 16,
              }
            : undefined
        }
      >
        {isNative && (
          <XStack justify="space-between" items="center">
            <Button
              size="small"
              circular
              bg="$color3"
              icon={<CaretLeftIcon size={20} color="$color12" />}
              onPress={() => router.back()}
            />
            <Button
              size="small"
              circular
              bg="$color3"
              icon={<ShareFatIcon size={20} color="$color12" />}
              onPress={shareReport}
              disabled={isShareLoading}
            />
          </XStack>
        )}
        <YStack
          gap="$4"
          width="100%"
          self="center"
          maxW={800}
          {...(isNative ? {} : { p: '$4' })}
          $lg={{ maxW: 1040 }}
        >
          <XStack justify="space-between" items="flex-start">
            <YStack flex={1}>
              <VehicleHeader report={report} hasIssues={hasIssues} />
            </YStack>
            {!isNative && (
              <Button
                size="small"
                bg="$color3"
                icon={<ShareFatIcon size={18} color="$color12" />}
                onPress={shareReport}
                disabled={isShareLoading}
                ml="$3"
              >
                {t('share.button')}
              </Button>
            )}
          </XStack>
          <SummaryStats report={report} hasIssues={hasIssues} locale={locale} />
          {report.titleBrands.length > 0 && <TitleBrands brands={report.titleBrands} />}
          <Timeline events={report.events} />
          <SourceProviders providers={report.sourceProviders} />
        </YStack>
      </ScrollView>
    </PageLayout>
  )
})
