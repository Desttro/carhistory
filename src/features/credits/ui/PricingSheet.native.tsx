import { useRouter } from 'one'
import { memo, useMemo, useState } from 'react'
import { Alert } from 'react-native'
import Purchases from 'react-native-purchases'
import { SizableText, Spinner, XStack, YStack } from 'tamagui'

import { activeProducts } from '~/data/queries/product'
import { useAuth } from '~/features/auth/client/authClient'
import { useCredits } from '~/features/credits/useCredits'
import { useRevenueCat } from '~/features/payments/revenuecat'
import { Button } from '~/interface/buttons/Button'
import { CoinsIcon } from '~/interface/icons/phosphor/CoinsIcon'
import { useQuery } from '~/zero/client'

import { PackageCard } from './components/PackageCard'

import type { PurchasesError, PurchasesPackage } from 'react-native-purchases'

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
    const [products] = useQuery(activeProducts)

    // match products to RC packages by credits count
    const packagesWithProduct = useMemo(() => {
      if (!offerings?.current?.availablePackages || !products.length) return []
      return products.map((product) => {
        const rcPackage = offerings.current!.availablePackages.find((pkg) => {
          const match = pkg.product.identifier.match(/(\d+)_credit/)
          return match && parseInt(match[1]) === product.credits
        })
        return { product, rcPackage }
      })
    }, [offerings, products])

    const handleLoginClick = () => {
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

        Alert.alert(
          'Purchase Complete',
          'Your credits will appear shortly. It may take a moment to process.'
        )
      } catch (error) {
        const purchaseError = error as PurchasesError
        if (purchaseError.userCancelled) {
          console.info('[Purchase] user cancelled')
        } else {
          console.info('[Purchase] error:', error)
          Alert.alert(
            'Purchase Failed',
            purchaseError.message || 'An error occurred during purchase'
          )
        }
      } finally {
        setIsPurchasing(false)
        setSelectedProductId(null)
      }
    }

    const isLoading = !products.length || isLoadingOfferings

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
            <YStack
              gap="$3"
              $md={{
                flexDirection: inline ? 'column' : 'row',
                gap: '$4',
                maxW: inline ? 400 : 900,
              }}
            >
              {(() => {
                const singleEntry = packagesWithProduct.find(
                  (e) => e.product.credits === 1
                )
                const basePricePerCredit = singleEntry?.rcPackage?.product.price || 0
                const maxCredits = Math.max(
                  ...packagesWithProduct.map((e) => e.product.credits)
                )

                return packagesWithProduct.map(({ product: pkg, rcPackage }) => {
                  const price = rcPackage?.product.priceString || 'N/A'
                  const priceNum = rcPackage?.product.price || 0
                  const ppc = pkg.credits > 0 ? priceNum / pkg.credits : 0
                  const pricePerCredit =
                    pkg.credits > 0 && priceNum > 0 ? `$${ppc.toFixed(2)}` : undefined
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
                        onPress={() => {
                          if (rcPackage) {
                            handlePurchase(rcPackage, pkg.id)
                          } else if (!isLoggedIn) {
                            handleLoginClick()
                          }
                        }}
                        isLoading={isPurchasing && selectedProductId === pkg.id}
                        isPopular={pkg.badge === 'popular'}
                        savingsPercent={savingsPercent}
                        isBestValue={isBestValue}
                      />
                    </YStack>
                  )
                })
              })()}
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
