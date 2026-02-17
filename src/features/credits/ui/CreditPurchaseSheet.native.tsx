import { memo, useState } from 'react'
import { Alert } from 'react-native'
import Purchases from 'react-native-purchases'
import { ScrollView, SizableText, Spinner, XStack, YStack } from 'tamagui'

import { useCredits } from '~/features/credits/useCredits'
import { CREDIT_PACKAGES } from '~/features/payments/constants'
import { useRevenueCat } from '~/features/payments/revenuecat'
import { Button } from '~/interface/buttons/Button'
import { Dialog } from '~/interface/dialogs/Dialog'
import { CoinsIcon } from '~/interface/icons/phosphor/CoinsIcon'

import { CreditPackageCard } from './CreditPackageCard'

import type { PurchasesPackage } from 'react-native-purchases'

export interface CreditPurchaseSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const CreditPurchaseSheet = memo(
  ({ open, onOpenChange }: CreditPurchaseSheetProps) => {
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

    const handlePurchase = async (rcPackage: PurchasesPackage, productId: string) => {
      setIsPurchasing(true)
      setSelectedProductId(productId)

      try {
        const { customerInfo } = await Purchases.purchasePackage(rcPackage)
        console.info('[Purchase] success, customer info:', customerInfo.originalAppUserId)

        await refreshCustomerInfo()
        onOpenChange(false)

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
      <Dialog open={open} onOpenChange={onOpenChange} minH={500} minW={400}>
        <Dialog.Header
          title="Buy Credits"
          description="Use credits to generate vehicle history reports"
        />

        <Dialog.Body scrollable>
          <YStack gap="$4">
            <XStack gap="$2" items="center" justify="center" py="$2">
              <CoinsIcon size={20} color="$color11" />
              <SizableText size="$5" color="$color11">
                Current balance: <SizableText fontWeight="700">{balance}</SizableText>
              </SizableText>
            </XStack>

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
                  const isAvailable = !!rcPackage

                  return (
                    <CreditPackageCard
                      key={pkg.slug}
                      credits={pkg.credits}
                      price={price}
                      onPress={() => {
                        if (rcPackage) {
                          handlePurchase(rcPackage, pkg.revenuecatProductId)
                        }
                      }}
                      isLoading={
                        isPurchasing && selectedProductId === pkg.revenuecatProductId
                      }
                      isPopular={pkg.credits === 3}
                    />
                  )
                })}
              </YStack>
            )}

            <SizableText size="$2" color="$color9" text="center" px="$2">
              Credits never expire. Payment processed through App Store.
            </SizableText>

            <Button
              variant="transparent"
              size="small"
              onPress={handleRestore}
              disabled={isPurchasing}
            >
              Restore Purchases
            </Button>
          </YStack>
        </Dialog.Body>

        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button variant="transparent">Cancel</Button>
          </Dialog.Close>
        </Dialog.Footer>
      </Dialog>
    )
  }
)
