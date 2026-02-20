import { createStorageValue } from '@take-out/helpers'
import { useEffect, useMemo, useState } from 'react'
import { I18nManager, Platform } from 'react-native'

import { userWithState } from '~/data/queries/user'
import { useAuth } from '~/features/auth/client/authClient'
import { useQuery } from '~/zero/client'

import { I18nProvider } from './context'
import { I18n } from './engine'
import { DEFAULT_LOCALE, LOCALE_META, isRTL, isValidLocale } from './locales'
import { loadMessages } from './messages/_registry'
import { messages as enMessages } from './messages/en'

import type { SupportedLocale } from './locales'
import type { ReactNode } from 'react'

const isWeb = Platform.OS === 'web'

const storedLocale = createStorageValue<SupportedLocale>('user-locale')

function resolveLocale(zeroLocale?: string | null): SupportedLocale {
  if (zeroLocale && isValidLocale(zeroLocale)) return zeroLocale
  const stored = storedLocale.get()
  if (stored && isValidLocale(stored)) return stored
  return DEFAULT_LOCALE
}

export function AppI18nProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()
  const userId = auth?.user?.id
  const [userData] = useQuery(
    userWithState,
    { userId: userId ?? '' },
    { enabled: Boolean(userId) }
  )
  const zeroLocale = userData?.state?.[0]?.locale
  const locale = resolveLocale(zeroLocale)

  const [messages, setMessages] = useState<Record<string, string>>(
    enMessages as unknown as Record<string, string>
  )
  const [loadedLocale, setLoadedLocale] = useState<SupportedLocale>('en')

  useEffect(() => {
    if (locale === 'en') {
      setMessages(enMessages as unknown as Record<string, string>)
      setLoadedLocale('en')
      return
    }

    let cancelled = false
    loadMessages(locale).then((msgs) => {
      if (!cancelled) {
        setMessages(msgs)
        setLoadedLocale(locale)
        storedLocale.set(locale)
      }
    })
    return () => {
      cancelled = true
    }
  }, [locale])

  // update document lang/dir on web, I18nManager on native
  useEffect(() => {
    const meta = LOCALE_META[loadedLocale]
    if (isWeb && typeof document !== 'undefined') {
      document.documentElement.lang = meta.bcp47
      document.documentElement.dir = meta.dir
    } else {
      const shouldBeRTL = isRTL(loadedLocale)
      if (I18nManager.isRTL !== shouldBeRTL) {
        I18nManager.forceRTL(shouldBeRTL)
        // native requires app restart for RTL to fully take effect
      }
    }
  }, [loadedLocale])

  const i18n = useMemo(() => {
    const instance = new I18n()
    instance.load(loadedLocale, messages)
    return instance
  }, [loadedLocale, messages])

  return <I18nProvider i18n={i18n}>{children}</I18nProvider>
}
