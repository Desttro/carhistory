import { href, useRouter } from 'one'
import { memo, useState } from 'react'
import { SizableText, XStack, YStack } from 'tamagui'

import { useAuth } from '~/features/auth/client/authClient'
import { returnToStorage } from '~/features/auth/returnToStorage'
import { useCredits } from '~/features/credits/useCredits'
import { Button } from '~/interface/buttons/Button'
import { CoinsIcon } from '~/interface/icons/phosphor/CoinsIcon'

import { PACKAGE_METADATA, PRICE_DISPLAY } from '~/features/payments/constants'

import { PackageCard } from './components/PackageCard'
import { usePurchaseCredits } from './usePurchaseCredits'

export interface PricingSheetProps {
  // for inline display (not in dialog)
  inline?: boolean
  // context for different CTAs
  context?: 'pricing-page' | 'vin-check'
  // VIN for redirect back after login
  vin?: string
  // callback when purchase is initiated (for dialog use)
  onPurchaseStart?: () => void
}

export const PricingSheet = memo(
  ({
    inline = false,
    context = 'pricing-page',
    vin,
    onPurchaseStart,
  }: PricingSheetProps) => {
    const router = useRouter()
    const { state } = useAuth()
    const isLoggedIn = state === 'logged-in'
    const { balance } = useCredits()
    const { packages, purchaseWithPolar, isLoading, error } = usePurchaseCredits()
    const [selectedSlug, setSelectedSlug] = useState<string | null>(null)

    const handleLoginClick = () => {
      const returnUrl = vin
        ? `/home/vin-lookup?vin=${encodeURIComponent(vin)}`
        : '/home/pricing'
      returnToStorage.set(returnUrl)
      router.push(href('/auth/login'))
    }

    const handlePurchase = async (slug: string) => {
      if (!isLoggedIn) {
        handleLoginClick()
        return
      }

      setSelectedSlug(slug)
      onPurchaseStart?.()
      await purchaseWithPolar(slug)
      setSelectedSlug(null)
    }

    return (
      <YStack gap="$4">
        {isLoggedIn && (
          <XStack gap="$2" items="center" justify="center" py="$2">
            <CoinsIcon size={20} color="$color11" />
            <SizableText size="$4" color="$color11">
              Current balance: <SizableText fontWeight="700">{balance}</SizableText>
            </SizableText>
          </XStack>
        )}

        {!isLoggedIn && (
          <YStack gap="$3" items="center" py="$2">
            <SizableText size="$4" color="$color10" text="center">
              {context === 'vin-check'
                ? 'Log in to purchase credits and get your report'
                : 'Log in to purchase credits'}
            </SizableText>
            <Button size="large" variant="action" onPress={handleLoginClick}>
              Log In to Purchase
            </Button>
          </YStack>
        )}

        {error && (
          <YStack bg="$red3" p="$3" rounded="$4">
            <SizableText color="$red11" size="$3">
              {error}
            </SizableText>
          </YStack>
        )}

        <YStack gap="$3">
          <SizableText size="$5" fontWeight="600" text={inline ? undefined : 'center'}>
            {isLoggedIn ? 'Buy Credits' : 'Credit Packages'}
          </SizableText>

          <YStack
            gap="$3"
            width="100%"
            $md={{
              flexDirection: inline ? 'column' : 'row',
              gap: '$4',
              maxW: inline ? 400 : 900,
            }}
          >
            {packages.map((pkg) => {
              const priceData = PRICE_DISPLAY[pkg.slug]
              const metadata = PACKAGE_METADATA[pkg.slug]

              return (
                <YStack key={pkg.slug} $md={{ flex: inline ? undefined : 1 }}>
                  <PackageCard
                    credits={pkg.credits}
                    price={priceData?.price || 'See price'}
                    pricePerCredit={priceData?.pricePerCredit}
                    onPress={() => handlePurchase(pkg.slug)}
                    isLoading={isLoading && selectedSlug === pkg.slug}
                    isPopular={metadata?.badge === 'popular'}
                  />
                </YStack>
              )
            })}
          </YStack>
        </YStack>

        <SizableText size="$2" color="$color9" text="center">
          Credits never expire.{' '}
          {isLoggedIn
            ? "You'll be redirected to complete payment."
            : 'Log in to purchase.'}
        </SizableText>
      </YStack>
    )
  }
)
