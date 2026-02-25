import { Protected, Redirect, Slot, Stack, usePathname } from 'one'
import { Configuration, isWeb, SizableText } from 'tamagui'

import { useAuth } from '~/features/auth/client/authClient'
import { returnToStorage } from '~/features/auth/returnToStorage'
import { ZeroTestUI } from '~/features/devtools/ZeroTestUI'
import { useWidgetDeepLink } from '~/features/widgets/useWidgetDeepLink'
import { useWidgets } from '~/features/widgets/useWidgets'
import { AppI18nProvider } from '~/i18n/provider-app'
import { Dialogs } from '~/interface/dialogs/Dialogs'
import { Gallery } from '~/interface/gallery/Gallery'
import { NotificationProvider } from '~/interface/notification/Notification'
import { ToastProvider } from '~/interface/toast/Toast'
import { DragDropFile } from '~/interface/upload/DragDropFile'
import { animationsApp } from '~/tamagui/animationsApp'
import { ProvideZero } from '~/zero/client'

function WidgetSetup() {
  useWidgetDeepLink()
  useWidgets()
  return null
}

export function AppLayout() {
  const { state } = useAuth()
  const pathname = usePathname()
  const isLoggedIn = state === 'logged-in'

  if (state === 'loading') {
    return (
      <SizableText m="auto" color="$color8">
        Loading...
      </SizableText>
    )
  }

  // Redirect for auth routing
  if (isWeb) {
    if (!isLoggedIn && pathname.startsWith('/home')) {
      const isPublicPath = ['/home/vin-lookup', '/home/pricing'].some((p) =>
        pathname.startsWith(p)
      )
      if (!isPublicPath) {
        returnToStorage.set(
          pathname + (typeof window !== 'undefined' ? window.location.search : '')
        )
        return <Redirect href="/auth/login" />
      }
    }
    if (isLoggedIn && pathname.startsWith('/auth')) {
      const returnTo = returnToStorage.get()
      returnToStorage.remove()
      return <Redirect href={(returnTo as any) || '/home/vin-lookup'} />
    }
  }

  return (
    // our app is SPA from here on down, avoid extra work by disabling SSR
    <Configuration disableSSR animationDriver={animationsApp}>
      <ProvideZero>
        <AppI18nProvider>
          <WidgetSetup />
          <ToastProvider>
            <NotificationProvider>
              {!process.env.VITE_NATIVE ? (
                <DragDropFile>
                  <Gallery />
                  <Slot />
                </DragDropFile>
              ) : (
                // Stack transition animation on native
                <Stack
                  screenOptions={{
                    headerShown: false,
                    animation: 'none',
                  }}
                >
                  <Protected guard={!isLoggedIn}>
                    <Stack.Screen name="auth" />
                  </Protected>
                  <Protected guard={isLoggedIn}>
                    <Stack.Screen name="home" />
                  </Protected>
                </Stack>
              )}
            </NotificationProvider>
            <Dialogs />
          </ToastProvider>
        </AppI18nProvider>
        <ZeroTestUI />
      </ProvideZero>
    </Configuration>
  )
}
