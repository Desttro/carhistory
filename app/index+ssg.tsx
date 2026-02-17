import { YStack } from 'tamagui'

import { HeadInfo } from '~/interface/app/HeadInfo'
import { ContentSection } from '~/interface/landing/ContentSection'
import { HeroSection } from '~/interface/landing/HeroSection'

const ogImageUrl = `${process.env.ONE_SERVER_URL}/take-og.png`

export function IndexPage() {
  return (
    <YStack position="relative">
      <HeadInfo
        title="CarHistory | Vehicle History Reports"
        description="CarHistory is a platform for managing your car history and maintenance records."
        openGraph={{
          url: process.env.ONE_SERVER_URL,
          images: [{ url: ogImageUrl, width: 1200, height: 630 }],
        }}
      />

      <HeroSection />

      <ContentSection />
    </YStack>
  )
}
