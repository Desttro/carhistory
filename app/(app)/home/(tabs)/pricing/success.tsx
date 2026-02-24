import { useRouter } from 'one'
import { H2, SizableText, YStack } from 'tamagui'

import { CreditBalanceDisplay } from '~/features/credits/ui/CreditBalanceDisplay'
import { Button } from '~/interface/buttons/Button'
import { CheckCircleIcon } from '~/interface/icons/phosphor/CheckCircleIcon'
import { PageLayout } from '~/interface/pages/PageLayout'

export function CheckoutSuccessPage() {
  const router = useRouter()

  return (
    <PageLayout scroll tabBarOffset>
      <YStack
        gap="$6"
        px="$4"
        py="$8"
        maxW={900}
        width="100%"
        self="center"
        items="center"
        $md={{ px: '$8' }}
      >
        <YStack gap="$3" items="center">
          <CheckCircleIcon size={48} color="$green10" />
          <H2 size="$8" fontWeight="700" text="center">
            Purchase successful
          </H2>
          <SizableText size="$4" color="$color10" text="center">
            Your credits have been added to your account
          </SizableText>
        </YStack>

        <CreditBalanceDisplay size="large" />

        <YStack gap="$3" width="100%" maxW={300}>
          <Button
            size="large"
            variant="action"
            onPress={() => router.push('/home/vin-lookup')}
          >
            Look up a vehicle
          </Button>
          <Button
            size="large"
            variant="outlined"
            onPress={() => router.push('/home/pricing')}
          >
            Back to pricing
          </Button>
        </YStack>
      </YStack>
    </PageLayout>
  )
}
