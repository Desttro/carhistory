import { H1, Paragraph, SizableText, XStack, YStack } from 'tamagui'

import { CREDIT_PACKAGES, PACKAGE_METADATA, PRICE_DISPLAY } from '~/features/payments/constants'
import { HeadInfo } from '~/interface/app/HeadInfo'
import { Link } from '~/interface/app/Link'
import { Button } from '~/interface/buttons/Button'
import { ArrowRightIcon } from '~/interface/icons/phosphor/ArrowRightIcon'
import { CoinsIcon } from '~/interface/icons/phosphor/CoinsIcon'
import { SparkleIcon } from '~/interface/icons/phosphor/SparkleIcon'

export function PricingSSGPage() {
  return (
    <YStack flex={1} items="center" px="$4" py="$10">
      <HeadInfo
        title="Pricing - CarHistory"
        description="Purchase credits for vehicle history reports. Carfax & AutoCheck data combined."
      />

      <YStack gap="$6" maxW={900} width="100%" items="center">
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
          width="100%"
          $md={{
            flexDirection: 'row',
            gap: '$4',
          }}
        >
          {CREDIT_PACKAGES.map((pkg) => {
            const priceData = PRICE_DISPLAY[pkg.slug]
            const metadata = PACKAGE_METADATA[pkg.slug]
            const isPopular = metadata?.badge === 'popular'

            return (
              <YStack
                key={pkg.slug}
                flex={1}
                p="$4"
                rounded="$6"
                bg="$color2"
                borderWidth={isPopular ? 2 : 1}
                borderColor={isPopular ? '$accent8' : '$color4'}
                gap="$3"
                position="relative"
              >
                {isPopular && (
                  <XStack
                    position="absolute"
                    t={-12}
                    self="center"
                    bg="$accent10"
                    px="$3"
                    py="$1"
                    rounded="$4"
                  >
                    <SizableText size="$1" color="white" fontWeight="700">
                      Most Popular
                    </SizableText>
                  </XStack>
                )}

                <YStack gap="$3" items="center" py="$3">
                  <SparkleIcon size={28} color="$accent10" />
                  <YStack items="center" gap="$1">
                    <SizableText size="$8" fontWeight="700" color="$color12">
                      {pkg.credits}
                    </SizableText>
                    <SizableText size="$3" color="$color10">
                      {pkg.credits === 1 ? 'Credit' : 'Credits'}
                    </SizableText>
                  </YStack>
                  <YStack items="center">
                    <SizableText size="$6" fontWeight="700" color="$color12">
                      {priceData?.price}
                    </SizableText>
                    {priceData?.pricePerCredit && pkg.credits > 1 && (
                      <SizableText size="$2" color="$color9">
                        {priceData.pricePerCredit}/credit
                      </SizableText>
                    )}
                  </YStack>
                </YStack>

                <Link href="/home/pricing">
                  <Button variant="action" size="large" width="100%">
                    Get Started
                  </Button>
                </Link>
              </YStack>
            )
          })}
        </YStack>

        <YStack gap="$3" mt="$4">
          <Paragraph size="$4" color="$color9" text="center">
            1 credit = 1 full vehicle history report
          </Paragraph>
          <Paragraph size="$4" color="$color9" text="center">
            Credits never expire. Buy in bulk for the best value.
          </Paragraph>
        </YStack>

        <Link href="/home/vin-lookup">
          <Button theme="accent" size="large" icon={ArrowRightIcon} iconAfter>
            Check a VIN Now
          </Button>
        </Link>
      </YStack>
    </YStack>
  )
}
