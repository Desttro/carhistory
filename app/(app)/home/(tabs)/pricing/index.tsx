import { H2, SizableText, YStack } from 'tamagui'

import { CreditBalanceDisplay } from '~/features/credits/ui/CreditBalanceDisplay'
import { PricingSheet } from '~/features/credits/ui/PricingSheet'
import { useAuth } from '~/features/auth/client/authClient'
import { CoinsIcon } from '~/interface/icons/phosphor/CoinsIcon'
import { PageLayout } from '~/interface/pages/PageLayout'

export function PricingPage() {
  const { state } = useAuth()
  const isLoggedIn = state === 'logged-in'

  return (
    <PageLayout>
      <YStack flex={1} gap="$6" px="$4" py="$6" maxW={900} width="100%" self="center">
        <YStack gap="$2" items="center">
          <CoinsIcon size={32} color="$color10" />
          <H2 size="$8" fontWeight="700" text="center">
            Credits & Pricing
          </H2>
          <SizableText size="$4" color="$color10" text="center">
            Purchase credits to get vehicle history reports
          </SizableText>
        </YStack>

        {isLoggedIn && (
          <YStack items="center">
            <CreditBalanceDisplay size="large" />
          </YStack>
        )}

        <PricingSheet context="pricing-page" />
      </YStack>
    </PageLayout>
  )
}
