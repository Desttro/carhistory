import { H1, Paragraph, YStack } from 'tamagui'

import { HeadInfo } from '~/interface/app/HeadInfo'
import { Link } from '~/interface/app/Link'
import { Button } from '~/interface/buttons/Button'
import { ArrowRightIcon } from '~/interface/icons/phosphor/ArrowRightIcon'
import { CoinsIcon } from '~/interface/icons/phosphor/CoinsIcon'

export function PricingSSGPage() {
  return (
    <YStack flex={1} items="center" px="$4" py="$10">
      <HeadInfo
        title="Pricing - CarHistory"
        description="Purchase credits for vehicle history reports. Carfax & AutoCheck data combined."
      />

      <YStack gap="$6" maxW={700} width="100%" items="center">
        <YStack gap="$2" items="center">
          <CoinsIcon size={32} color="$color10" />
          <H1 size="$9" fontWeight="700" text="center">
            Credits & Pricing
          </H1>
          <Paragraph size="$5" color="$color10" text="center">
            Purchase credits to get vehicle history reports combining Carfax & AutoCheck data.
          </Paragraph>
        </YStack>

        <YStack
          gap="$4"
          bg="$color2"
          p="$6"
          rounded="$6"
          borderWidth={1}
          borderColor="$color4"
          width="100%"
          items="center"
        >
          <Paragraph size="$5" color="$color11" text="center">
            Log in to view pricing and purchase credits
          </Paragraph>
          <Link href="/auth/login">
            <Button theme="accent" size="large" icon={ArrowRightIcon} iconAfter>
              Log In to Get Started
            </Button>
          </Link>
        </YStack>

        <YStack gap="$3" mt="$4">
          <Paragraph size="$4" color="$color9" text="center">
            1 credit = 1 full vehicle history report
          </Paragraph>
          <Paragraph size="$4" color="$color9" text="center">
            Credits never expire. Buy in bulk for the best value.
          </Paragraph>
        </YStack>
      </YStack>
    </YStack>
  )
}
