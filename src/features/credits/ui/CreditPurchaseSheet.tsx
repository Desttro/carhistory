import { memo, useState } from 'react'
import { ScrollView, SizableText, XStack, YStack } from 'tamagui'

import { useCredits } from '~/features/credits/useCredits'
import { Button } from '~/interface/buttons/Button'
import { Dialog } from '~/interface/dialogs/Dialog'
import { CoinsIcon } from '~/interface/icons/phosphor/CoinsIcon'
import { H3 } from '~/interface/text/Headings'

import { CreditPackageCard } from './CreditPackageCard'
import { usePurchaseCredits } from './usePurchaseCredits'

export interface CreditPurchaseSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// price mapping for web display (Polar handles actual pricing at checkout)
const PRICE_DISPLAY: Record<string, string> = {
  'credits-1': '$1.99',
  'credits-3': '$4.99',
  'credits-6': '$8.99',
}

export const CreditPurchaseSheet = memo(
  ({ open, onOpenChange }: CreditPurchaseSheetProps) => {
    const { balance } = useCredits()
    const { packages, purchaseWithPolar, isLoading, error } = usePurchaseCredits()
    const [selectedSlug, setSelectedSlug] = useState<string | null>(null)

    const handlePurchase = async (slug: string) => {
      setSelectedSlug(slug)
      await purchaseWithPolar(slug)
      setSelectedSlug(null)
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

            {error && (
              <YStack bg="$red3" p="$3" rounded="$4">
                <SizableText color="$red11" size="$3">
                  {error}
                </SizableText>
              </YStack>
            )}

            <YStack gap="$3">
              {packages.map((pkg) => (
                <CreditPackageCard
                  key={pkg.slug}
                  credits={pkg.credits}
                  price={PRICE_DISPLAY[pkg.slug] || 'See price'}
                  onPress={() => handlePurchase(pkg.slug)}
                  isLoading={isLoading && selectedSlug === pkg.slug}
                  isPopular={pkg.credits === 3}
                />
              ))}
            </YStack>

            <SizableText size="$2" color="$color9" text="center" px="$2">
              Credits never expire. You&apos;ll be redirected to complete payment.
            </SizableText>
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
