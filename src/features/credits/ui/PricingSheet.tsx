import { href, useRouter } from 'one'
import { memo, useState } from 'react'
import { SizableText, XStack, YStack } from 'tamagui'

import { activeProducts } from '~/data/queries/product'
import { useAuth } from '~/features/auth/client/authClient'
import { returnToStorage } from '~/features/auth/returnToStorage'
import { useCredits } from '~/features/credits/useCredits'
import { Button } from '~/interface/buttons/Button'
import { CoinsIcon } from '~/interface/icons/phosphor/CoinsIcon'
import { useQuery } from '~/zero/client'

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
    const { purchaseWithPolar, isLoading, error } = usePurchaseCredits()
    const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
    const [products] = useQuery(activeProducts)

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
        {isLoggedIn && context !== 'pricing-page' && (
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
            {(() => {
              const singlePkg = products.find((p) => p.credits === 1)
              const basePricePerCredit = singlePkg
                ? singlePkg.priceCents / 100
                : 0
              const maxCredits = Math.max(...products.map((p) => p.credits))

              return products.map((pkg) => {
                const price = `$${(pkg.priceCents / 100).toFixed(2)}`
                const ppc = pkg.priceCents / 100 / pkg.credits
                const pricePerCredit =
                  pkg.credits > 1 ? `$${ppc.toFixed(2)}` : undefined
                const savingsPercent =
                  pkg.credits > 1 && basePricePerCredit > 0
                    ? Math.round(
                        ((basePricePerCredit - ppc) / basePricePerCredit) * 100
                      )
                    : 0
                const isBestValue = pkg.credits === maxCredits && pkg.credits > 1

                return (
                  <YStack key={pkg.slug} $md={{ flex: inline ? undefined : 1 }}>
                    <PackageCard
                      credits={pkg.credits}
                      price={price}
                      pricePerCredit={pricePerCredit}
                      onPress={() => handlePurchase(pkg.slug)}
                      isLoading={isLoading && selectedSlug === pkg.slug}
                      isPopular={pkg.badge === 'popular'}
                      savingsPercent={savingsPercent}
                      isBestValue={isBestValue}
                    />
                  </YStack>
                )
              })
            })()}
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
