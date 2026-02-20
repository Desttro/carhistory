import { useSearchParams } from 'one'
import { useEffect } from 'react'
import { H2, SizableText, YStack } from 'tamagui'

import { useVinLookup } from '~/features/vin-lookup/useVinLookup'
import { VinCheckResult } from '~/features/vin-lookup/VinCheckResult'
import { VinSearchForm } from '~/features/vin-lookup/VinSearchForm'
import { MagnifyingGlassIcon } from '~/interface/icons/phosphor/MagnifyingGlassIcon'
import { PageLayout } from '~/interface/pages/PageLayout'

export function VinLookupPage() {
  const params = useSearchParams()
  const vinParam = params.get('vin')

  const {
    vin,
    setVin,
    isChecking,
    isPurchasing,
    checkResult,
    error,
    checkVin,
    purchaseReport,
    isLoggedIn,
    hasCredits,
    creditBalance,
  } = useVinLookup()

  // pre-populate from query param
  useEffect(() => {
    if (vinParam && !vin) {
      setVin(vinParam.toUpperCase().trim())
    }
  }, [vinParam, vin, setVin])

  // auto-check when VIN was set from URL param
  useEffect(() => {
    if (
      vinParam &&
      vin === vinParam.toUpperCase().trim() &&
      !checkResult &&
      !isChecking
    ) {
      checkVin()
    }
  }, [vinParam, vin, checkResult, isChecking, checkVin])

  return (
    <PageLayout scroll tabBarOffset>
      <YStack
        gap="$6"
        px="$4"
        py="$6"
        maxW={600}
        width="100%"
        self="center"
        $md={{ maxW: 700, px: '$8' }}
      >
        <YStack gap="$2" items="center">
          <MagnifyingGlassIcon size={32} color="$color10" />
          <H2 size="$8" fontWeight="700" text="center">
            Vehicle History Report
          </H2>
          <SizableText size="$4" color="$color10" text="center">
            Enter a VIN to check databases for accidents, title history, odometer
            readings, service logs, and more
          </SizableText>
        </YStack>

        <VinSearchForm
          vin={vin}
          onVinChange={setVin}
          onSearch={checkVin}
          isLoading={isChecking}
          error={error}
        />

        {checkResult && (
          <VinCheckResult
            result={checkResult}
            isLoggedIn={isLoggedIn}
            hasCredits={hasCredits}
            creditBalance={creditBalance}
            isPurchasing={isPurchasing}
            onPurchase={purchaseReport}
          />
        )}
      </YStack>
    </PageLayout>
  )
}
