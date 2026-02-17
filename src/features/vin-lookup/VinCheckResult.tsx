import { memo } from 'react'
import { H3, SizableText, Spinner, XStack, YStack } from 'tamagui'

import { PricingSheet } from '~/features/credits/ui/PricingSheet'
import { Button } from '~/interface/buttons/Button'
import { CarIcon } from '~/interface/icons/phosphor/CarIcon'
import { ShieldCheckIcon } from '~/interface/icons/phosphor/ShieldCheckIcon'

import type { VinCheckResult as VinCheckResultType } from '~/features/bulkvin/types'

interface VinCheckResultProps {
  result: VinCheckResultType
  isLoggedIn: boolean
  hasCredits: boolean
  creditBalance: number
  isPurchasing: boolean
  onPurchase: () => void
}

export const VinCheckResult = memo(
  ({
    result,
    isLoggedIn,
    hasCredits,
    creditBalance,
    isPurchasing,
    onPurchase,
  }: VinCheckResultProps) => {
    const totalRecords = (result.carfaxRecords ?? 0) + (result.autocheckRecords ?? 0)

    return (
      <YStack
        gap="$4"
        bg="$color2"
        p="$5"
        rounded="$6"
        borderWidth={1}
        borderColor="$color4"
      >
        <XStack items="center" gap="$3">
          <YStack
            bg="$green3"
            rounded="$4"
            width={44}
            height={44}
            items="center"
            justify="center"
          >
            <CarIcon size={24} color="$green10" />
          </YStack>
          <YStack gap="$1">
            <SizableText size="$2" color="$green10" fontWeight="600">
              Vehicle Identified
            </SizableText>
            {(result.year || result.model) && (
              <H3 size="$6" fontWeight="700" color="$color12">
                {result.year} {result.model}
              </H3>
            )}
          </YStack>
        </XStack>

        <XStack gap="$3">
          <YStack flex={1} bg="$color3" rounded="$4" p="$3" gap="$1">
            <SizableText size="$2" color="$color10">
              Carfax
            </SizableText>
            <SizableText size="$8" fontWeight="700" color="$color12">
              {result.carfaxRecords ?? 0}
            </SizableText>
            <SizableText size="$2" color="$color10">
              records
            </SizableText>
          </YStack>
          <YStack flex={1} bg="$color3" rounded="$4" p="$3" gap="$1">
            <SizableText size="$2" color="$color10">
              AutoCheck
            </SizableText>
            <SizableText size="$8" fontWeight="700" color="$color12">
              {result.autocheckRecords ?? 0}
            </SizableText>
            <SizableText size="$2" color="$color10">
              records
            </SizableText>
          </YStack>
        </XStack>

        <XStack items="center" justify="center" gap="$2" py="$2">
          <ShieldCheckIcon size={16} color="$color9" />
          <SizableText size="$2" color="$color9">
            Powered by Carfax & AutoCheck databases
          </SizableText>
        </XStack>

        <YStack gap="$2" pt="$2" borderTopWidth={1} borderColor="$color4">
          {!isLoggedIn || !hasCredits ? (
            <YStack gap="$3">
              <SizableText size="$3" color="$color10" text="center">
                {isLoggedIn
                  ? 'You need credits to purchase reports'
                  : 'Get full report with credits'}
              </SizableText>
              <PricingSheet inline context="vin-check" vin={result.vin} />
            </YStack>
          ) : (
            <YStack gap="$2" items="center">
              <SizableText size="$3" color="$color10">
                Get full {totalRecords} record report for 1 credit
              </SizableText>
              <SizableText size="$2" color="$color8">
                Your balance: {creditBalance} credits
              </SizableText>
              <Button
                size="xl"
                variant="action"
                onPress={onPurchase}
                disabled={isPurchasing}
                icon={isPurchasing ? <Spinner size="small" /> : undefined}
              >
                {isPurchasing ? 'Generating report...' : 'Purchase Report (1 Credit)'}
              </Button>
              {isPurchasing && (
                <SizableText size="$1" color="$color8" text="center">
                  This may take up to 30 seconds
                </SizableText>
              )}
            </YStack>
          )}
        </YStack>
      </YStack>
    )
  }
)
