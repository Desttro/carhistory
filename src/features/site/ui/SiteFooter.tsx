import { SizableText, XStack, YStack } from 'tamagui'

import { LocaleSwitcher } from '~/features/locale/LocaleSwitcher'
import { Link } from '~/interface/app/Link'
import { PageContainer } from '~/interface/layout/PageContainer'

export const SiteFooter = () => {
  return (
    <YStack py="$6" mt="auto">
      <PageContainer>
        <YStack mx="auto" width="100%" maxW={840} px="$4" gap="$4">
          <XStack gap="$4" flexWrap="wrap" justify="center" items="center">
            <Link href="/home/vin-lookup">
              <SizableText size="$3" color="$color11" hoverStyle={{ color: '$color12' }}>
                VIN Lookup
              </SizableText>
            </Link>
            <SizableText size="$3" color="$color8">
              •
            </SizableText>
            <Link href="/home/pricing">
              <SizableText size="$3" color="$color11" hoverStyle={{ color: '$color12' }}>
                Pricing
              </SizableText>
            </Link>
            <SizableText size="$3" color="$color8">
              •
            </SizableText>
            <Link href="/privacy-policy">
              <SizableText size="$3" color="$color11" hoverStyle={{ color: '$color12' }}>
                Privacy Policy
              </SizableText>
            </Link>
            <SizableText size="$3" color="$color8">
              •
            </SizableText>
            <Link href="/terms-of-service">
              <SizableText size="$3" color="$color11" hoverStyle={{ color: '$color12' }}>
                Terms of Service
              </SizableText>
            </Link>
            <SizableText size="$3" color="$color8">
              •
            </SizableText>
            <Link href="/help">
              <SizableText size="$3" color="$color11" hoverStyle={{ color: '$color12' }}>
                Help
              </SizableText>
            </Link>
            <SizableText size="$3" color="$color8">
              •
            </SizableText>
            <LocaleSwitcher size="small" />
          </XStack>
        </YStack>
      </PageContainer>
    </YStack>
  )
}
