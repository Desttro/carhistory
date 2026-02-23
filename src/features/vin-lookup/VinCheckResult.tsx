import { memo } from 'react'
import { H3, SizableText, Spinner, XStack, YStack } from 'tamagui'

import { animationClamped } from '~/interface/animations/animationClamped'
import { PricingSheet } from '~/features/credits/ui/PricingSheet'
import { Button } from '~/interface/buttons/Button'
import { StatusChip } from '~/interface/chips/StatusChip'
import { CarIcon } from '~/interface/icons/phosphor/CarIcon'
import { CheckCircleIcon } from '~/interface/icons/phosphor/CheckCircleIcon'
import { DatabaseIcon } from '~/interface/icons/phosphor/DatabaseIcon'
import { FileTextIcon } from '~/interface/icons/phosphor/FileTextIcon'
import { ShieldCheckIcon } from '~/interface/icons/phosphor/ShieldCheckIcon'
import { KeyValueRow } from '~/interface/lists/KeyValueRow'

import type { VinCheckResult as VinCheckResultType } from '~/features/bulkvin/types'

function formatVehicleName(year?: number, model?: string): string {
  if (!year && !model) return ''
  if (!model) return String(year)
  if (!year) return model

  const yearStr = String(year)
  const trimmed = model.trimStart()
  if (trimmed.startsWith(yearStr)) {
    return trimmed.slice(yearStr.length).trimStart()
  }
  return `${year} ${model}`
}

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
    const vehicleName = formatVehicleName(result.year, result.model)

    return (
      <YStack
        gap="$4"
        bg="$color2"
        p="$5"
        rounded="$6"
        borderWidth={1}
        borderColor="$color4"
        enterStyle={{ opacity: 0, y: 12 }}
        transition={animationClamped('quick')}
        opacity={1}
        y={0}
        $md={{ p: '$6' }}
      >
        {/* header */}
        <XStack items="center" gap="$3">
          <YStack
            bg="$green3"
            rounded="$10"
            width={48}
            height={48}
            items="center"
            justify="center"
            $md={{ width: 56, height: 56 }}
          >
            <CarIcon size={26} color="$green10" />
          </YStack>
          <YStack gap="$1" flex={1}>
            <StatusChip
              label="Verified"
              theme="green"
              icon={<CheckCircleIcon size={12} />}
              size="small"
            />
            {vehicleName ? (
              <H3 size="$6" fontWeight="700" color="$color12" $md={{ size: '$7' }}>
                {vehicleName}
              </H3>
            ) : null}
          </YStack>
        </XStack>

        {/* vehicle details */}
        <YStack bg="$color3" rounded="$4" px="$3" py="$1" $md={{ px: '$4' }}>
          {result.vin && (
            <KeyValueRow
              label="VIN"
              value={
                <SizableText fontFamily="$mono" size="$3" color="$color12">
                  {result.vin}
                </SizableText>
              }
            />
          )}
          {result.year && <KeyValueRow label="Year" value={String(result.year)} />}
          {result.model && (
            <KeyValueRow label="Model" value={formatVehicleName(undefined, result.model)} />
          )}
          <KeyValueRow label="Total Records" value={String(totalRecords)} last />
        </YStack>

        {/* record count stat boxes */}
        <XStack gap="$3">
          <YStack
            flex={1}
            bg="$color3"
            rounded="$4"
            p="$3"
            gap="$1"
            items="center"
            $md={{ p: '$4' }}
          >
            <YStack
              bg="$blue3"
              rounded="$10"
              width={36}
              height={36}
              items="center"
              justify="center"
              mb="$1"
            >
              <FileTextIcon size={18} color="$blue10" />
            </YStack>
            <SizableText size="$8" fontWeight="700" color="$color12">
              {result.carfaxRecords ?? 0}
            </SizableText>
            <SizableText size="$2" color="$color10">
              Carfax records
            </SizableText>
          </YStack>
          <YStack
            flex={1}
            bg="$color3"
            rounded="$4"
            p="$3"
            gap="$1"
            items="center"
            $md={{ p: '$4' }}
          >
            <YStack
              bg="$purple3"
              rounded="$10"
              width={36}
              height={36}
              items="center"
              justify="center"
              mb="$1"
            >
              <DatabaseIcon size={18} color="$purple10" />
            </YStack>
            <SizableText size="$8" fontWeight="700" color="$color12">
              {result.autocheckRecords ?? 0}
            </SizableText>
            <SizableText size="$2" color="$color10">
              AutoCheck records
            </SizableText>
          </YStack>
        </XStack>

        {/* source attribution */}
        <XStack items="center" justify="center" gap="$2" py="$2">
          <ShieldCheckIcon size={16} color="$color9" />
          <SizableText size="$2" color="$color9">
            Powered by Carfax & AutoCheck
          </SizableText>
        </XStack>

        {/* purchase section */}
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
              <SizableText size="$5" fontWeight="600" color="$color12">
                Get Full {totalRecords}-Record Report
              </SizableText>
              <SizableText size="$2" color="$color8">
                Your balance: {creditBalance} credits
              </SizableText>
              <YStack maxW={320} width="100%">
                <Button
                  size="xl"
                  variant="action"
                  onPress={onPurchase}
                  disabled={isPurchasing}
                  icon={isPurchasing ? <Spinner size="small" /> : undefined}
                  width="100%"
                >
                  {isPurchasing ? 'Generating report...' : 'Purchase Report (1 Credit)'}
                </Button>
              </YStack>
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
