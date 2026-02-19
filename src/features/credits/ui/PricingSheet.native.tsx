import { useRouter } from 'one'
import { memo, useEffect, useState } from 'react'
import { Alert } from 'react-native'
import Purchases from 'react-native-purchases'
import { SizableText, Spinner, XStack, YStack } from 'tamagui'

import { API_URL } from '~/constants/urls'
import { useAuth } from '~/features/auth/client/authClient'
import { useCredits } from '~/features/credits/useCredits'
import { useRevenueCat } from '~/features/payments/revenuecat'
import { Button } from '~/interface/buttons/Button'
import { CoinsIcon } from '~/interface/icons/phosphor/CoinsIcon'

import { PackageCard } from './components/PackageCard'

import type { PurchasesPackage } from 'react-native-purchases'

interface ApiProduct {
  id: string
  slug: string
  name: string
  credits: number
  priceCents: number
  currency: string
  badge: string | null
  sortOrder: number
  providers: Record<string, string>
}

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
    const {
      offerings,
      isLoading: isLoadingOfferings,
      refreshCustomerInfo,
    } = useRevenueCat()
    const [isPurchasing, setIsPurchasing] = useState(false)
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
    const [products, setProducts] = useState<ApiProduct[]>([])
    const [isLoadingProducts, setIsLoadingProducts] = useState(true)

    useEffect(() => {
      fetch(`${API_URL}/products`)
        .then((r) => r.json())
        .then((data) => setProducts(data))
        .catch((err) => console.info('[PricingSheet] failed to load products:', err))
        .finally(() => setIsLoadingProducts(false))
    }, [])

    // map products to RevenueCat packages
    const packagesWithOffering = products.map((product) => {
      const rcProductId = product.providers?.revenuecat
      const rcPackage = offerings?.current?.availablePackages.find(
        (p) => p.product.identifier === rcProductId
      )
      return { ...product, rcProductId, rcPackage }
    })

    const handleLoginClick = () => {
      // navigate to auth screen on native
      router.push('/auth/login')
    }

    const handlePurchase = async (rcPackage: PurchasesPackage, productId: string) => {
      if (!isLoggedIn) {
        handleLoginClick()
        return
      }

      setIsPurchasing(true)
      setSelectedProductId(productId)
      onPurchaseStart?.()

      try {
        const { customerInfo } = await Purchases.purchasePackage(rcPackage)
        console.info('[Purchase] success, customer info:', customerInfo.originalAppUserId)

        await refreshCustomerInfo()

        Alert.alert('Purchase Complete', 'Your credits have been added to your account!')
      } catch (error: any) {
        if (error.userCancelled) {
          console.info('[Purchase] user cancelled')
        } else {
          console.info('[Purchase] error:', error)
          Alert.alert(
            'Purchase Failed',
            error.message || 'An error occurred during purchase'
          )
        }
      } finally {
        setIsPurchasing(false)
        setSelectedProductId(null)
      }
    }

    const isLoading = isLoadingProducts || isLoadingOfferings

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

        <YStack gap="$3">
          <SizableText size="$5" fontWeight="600" text={inline ? undefined : 'center'}>
            {isLoggedIn ? 'Buy Credits' : 'Credit Packages'}
          </SizableText>

          {isLoading ? (
            <YStack items="center" py="$6">
              <Spinner size="large" />
              <SizableText size="$3" color="$color10" mt="$2">
                Loading packages...
              </SizableText>
            </YStack>
          ) : (
            <YStack gap="$3">
              {packagesWithOffering.map((pkg) => {
                const rcPackage = pkg.rcPackage
                const price = rcPackage?.product.priceString || 'N/A'
                const priceNum = rcPackage?.product.price || 0
                const pricePerCredit =
                  pkg.credits > 0 && priceNum > 0
                    ? `$${(priceNum / pkg.credits).toFixed(2)}`
                    : undefined

                return (
                  <PackageCard
                    key={pkg.slug}
                    credits={pkg.credits}
                    price={price}
                    pricePerCredit={pricePerCredit}
                    onPress={() => {
                      if (rcPackage && pkg.rcProductId) {
                        handlePurchase(rcPackage, pkg.rcProductId)
                      } else if (!isLoggedIn) {
                        handleLoginClick()
                      }
                    }}
                    isLoading={isPurchasing && selectedProductId === pkg.rcProductId}
                    isPopular={pkg.badge === 'popular'}
                  />
                )
              })}
            </YStack>
          )}
        </YStack>

        <SizableText size="$2" color="$color9" text="center">
          Credits never expire.{' '}
          {isLoggedIn ? 'Payment processed through App Store.' : 'Log in to purchase.'}
        </SizableText>
      </YStack>
    )
  }
)
