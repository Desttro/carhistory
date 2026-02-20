import { ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useTabBarBottomPadding } from '~/features/app/tabBarConstants'

import { GradientBackground } from '../backgrounds/GradientBackground'

import type { PageLayoutProps } from './PageLayoutProps'

export const PageLayout = ({
  children,
  useImage = false,
  bottomOffset,
  useInsets = false,
  scroll = false,
  tabBarOffset = false,
}: PageLayoutProps) => {
  const insets = useSafeAreaInsets()
  const tabBarPadding = useTabBarBottomPadding()

  const paddingTop = insets.top
  const paddingBottom = tabBarOffset ? tabBarPadding : 0

  if (scroll) {
    return (
      <GradientBackground
        useInsets={false}
        useImage={useImage}
        bottomOffset={bottomOffset}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop,
            paddingBottom,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </GradientBackground>
    )
  }

  return (
    <GradientBackground
      useInsets={useInsets}
      useImage={useImage}
      bottomOffset={bottomOffset}
    >
      {children}
    </GradientBackground>
  )
}
