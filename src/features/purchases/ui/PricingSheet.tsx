import { href, useRouter } from 'one'
import { memo, useEffect, useState } from 'react'
import { Platform } from 'react-native'
import { SizableText, Spinner, XStack, YStack } from 'tamagui'

import { SERVER_URL } from '~/constants/urls'
import { useAuth } from '~/features/auth/client/authClient'
import { returnToStorage } from '~/features/auth/returnToStorage'
import { useCredits } from '~/features/purchases/useCredits'
import { Button } from '~/interface/buttons/Button'
import { CoinsIcon } from '~/interface/icons/phosphor/CoinsIcon'
import { PricingShimmer } from '~/interface/shimmer/PricingShimmer'

import { useRevenueCat } from '../revenuecat'

import { PackageCard } from './components/PackageCard'
import { useProducts } from './useProducts'
import { usePurchase } from './usePurchase'

const isWeb = Platform.OS === 'web'

export interface PricingSheetProps {
  inline?: boolean
  context?: 'pricing-page' | 'vin-check'
  vin?: string
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

    // web stub returns null, native returns actual offerings
    const { offerings, isLoading: isLoadingOfferings } = useRevenueCat()

    // fetch provider mappings from API for native RC package matching
    const [providerMappings, setProviderMappings] = useState<
      Map<string, Record<string, string>> | undefined
    >()

    useEffect(() => {
      if (isWeb) return

      let cancelled = false

      const loadMappings = async () => {
        try {
          const res = await fetch(`${SERVER_URL}/api/products`)
          const products = (await res.json()) as Array<{
            id: string
            providers: Record<string, string>
          }>
          if (!cancelled) {
            const map = new Map<string, Record<string, string>>()
            for (const p of products) {
              map.set(p.id, p.providers)
            }
            setProviderMappings(map)
          }
        } catch {
          // best-effort
        }
      }

      loadMappings()

      return () => {
        cancelled = true
      }
    }, [])

    const { products, isLoading: isLoadingProducts } = useProducts({
      offerings,
      providerMappings,
    })
    const { purchase, isLoading: isPurchasing, error, activeSlug } = usePurchase()

    const handleLoginClick = () => {
      if (isWeb) {
        const returnUrl = vin
          ? `/home/vin-lookup?vin=${encodeURIComponent(vin)}`
          : '/home/pricing'
        returnToStorage.set(returnUrl)
        router.push(href('/auth/login'))
      } else {
        router.push('/auth/login')
      }
    }

    const handlePurchase = async (product: (typeof products)[number]) => {
      if (!isLoggedIn) {
        handleLoginClick()
        return
      }

      onPurchaseStart?.()
      await purchase(product)
    }

    const isLoading = isLoadingProducts || (!isWeb && isLoadingOfferings)

    if (isLoading && !products.length) {
      return isWeb ? (
        <PricingShimmer />
      ) : (
        <YStack items="center" py="$6">
          <Spinner size="large" />
          <SizableText size="$3" color="$color10" mt="$2">
            Loading packages...
          </SizableText>
        </YStack>
      )
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
            {products.map((product) => (
              <YStack key={product.slug} $md={{ flex: inline ? undefined : 1 }}>
                <PackageCard
                  credits={product.credits}
                  price={product.price}
                  pricePerCredit={product.pricePerCredit}
                  onPress={() => handlePurchase(product)}
                  isLoading={isPurchasing && activeSlug === product.slug}
                  isPopular={product.isPopular}
                  savingsPercent={product.savingsPercent}
                  isBestValue={product.isBestValue}
                />
              </YStack>
            ))}
          </YStack>
        </YStack>

        <SizableText size="$2" color="$color9" text="center">
          Credits never expire.{' '}
          {isLoggedIn
            ? isWeb
              ? "You'll be redirected to complete payment."
              : 'Payment processed through App Store.'
            : 'Log in to purchase.'}
        </SizableText>
      </YStack>
    )
  }
)
