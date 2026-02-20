import { Slot, Stack } from 'one'
import { View, XStack, YStack } from 'tamagui'

import { MainHeader } from '~/features/app/MainHeader'
import { useT } from '~/i18n/context'
import { HeaderBackButton } from '~/interface/buttons/HeaderBackButton'
import { PageMainContainer } from '~/interface/layout/PageContainer'

import { SettingsSidebarContent } from './index'

export const SettingLayout = () => {
  const t = useT()

  if (process.env.VITE_NATIVE) {
    return (
      <Stack
        screenOptions={{
          headerTransparent: true,
        }}
      >
        <Stack.Screen name="index">
          <Stack.Header>
            <Stack.Header.Title>{t('settings.title')}</Stack.Header.Title>
            <Stack.Header.Left asChild>
              <HeaderBackButton />
            </Stack.Header.Left>
          </Stack.Header>
        </Stack.Screen>
        <Stack.Screen name="edit-profile">
          <Stack.Header>
            <Stack.Header.Title>{t('settings.editProfile')}</Stack.Header.Title>
            <Stack.Header.Left asChild>
              <HeaderBackButton />
            </Stack.Header.Left>
          </Stack.Header>
        </Stack.Screen>
      </Stack>
    )
  }

  return (
    <>
      <MainHeader />
      <XStack flex={1} flexBasis="auto" pt={50} minH="calc(100vh - 50px)">
        <View
          width={260}
          borderRightWidth={1}
          borderRightColor="$color2"
          position="sticky"
          t={50}
          height="calc(100vh - 50px)"
          shrink={0}
          display="none"
          $md={{ display: 'flex' }}
        >
          <SettingsSidebarContent />
        </View>
        <YStack flex={1} flexBasis="auto">
          <PageMainContainer pt="$6" px="$2" $md={{ px: '$4' }} $xl={{ maxW: 680 }}>
            <Slot />
          </PageMainContainer>
        </YStack>
      </XStack>
    </>
  )
}
