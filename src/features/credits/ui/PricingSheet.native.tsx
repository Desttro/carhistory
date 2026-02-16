import { useRouter } from 'one'
import { memo, useState } from 'react'
import { Alert } from 'react-native'
import Purchases from 'react-native-purchases'
import { SizableText, Spinner, XStack, YStack } from 'tamagui'

import { useAuth } from '~/features/auth/client/authClient'
import { useCredits } from '~/features/credits/useCredits'
import { CREDIT_PACKAGES } from '~/features/payments/constants'
import { useRevenueCat } from '~/features/payments/revenuecat'
import { Button } from '~/interface/buttons/Button'
import { CoinsIcon } from '~/interface/icons/phosphor/CoinsIcon'

import { PACKAGE_METADATA } from './constants'
import { CreditPackageCard } from './CreditPackageCard'

import type { PurchasesPackage } from 'react-native-purchases'

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

    // map our credit packages to RevenueCat packages
    const packagesWithOffering = CREDIT_PACKAGES.map((pkg) => {
      const rcPackage = offerings?.current?.availablePackages.find(
        (p) => p.product.identifier === pkg.revenuecatProductId
      )
      return { ...pkg, rcPackage }
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

    const handleRestore = async () => {
      setIsPurchasing(true)
      try {
        const customerInfo = await Purchases.restorePurchases()
        console.info('[Restore] success:', customerInfo.originalAppUserId)
        await refreshCustomerInfo()
        Alert.alert('Restore Complete', 'Your purchases have been restored.')
      } catch (error: any) {
        console.info('[Restore] error:', error)
        Alert.alert('Restore Failed', error.message || 'Could not restore purchases')
      } finally {
        setIsPurchasing(false)
      }
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

        <YStack gap="$3">
          <SizableText size="$5" fontWeight="600" text={inline ? undefined : 'center'}>
            {isLoggedIn ? 'Buy Credits' : 'Credit Packages'}
          </SizableText>

          {isLoadingOfferings ? (
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
                const metadata = PACKAGE_METADATA[pkg.slug]

                return (
                  <CreditPackageCard
                    key={pkg.slug}
                    credits={pkg.credits}
                    price={price}
                    pricePerCredit={pricePerCredit}
                    onPress={() => {
                      if (rcPackage) {
                        handlePurchase(rcPackage, pkg.revenuecatProductId)
                      } else if (!isLoggedIn) {
                        handleLoginClick()
                      }
                    }}
                    isLoading={
                      isPurchasing && selectedProductId === pkg.revenuecatProductId
                    }
                    isPopular={metadata?.badge === 'popular'}
                  />
                )
              })}
            </YStack>
          )}
        </YStack>

        {isLoggedIn && (
          <Button
            variant="transparent"
            size="small"
            onPress={handleRestore}
            disabled={isPurchasing}
          >
            Restore Purchases
          </Button>
        )}

        <SizableText size="$2" color="$color9" text="center">
          Credits never expire.{' '}
          {isLoggedIn ? 'Payment processed through App Store.' : 'Log in to purchase.'}
        </SizableText>
      </YStack>
    )
  }
)
