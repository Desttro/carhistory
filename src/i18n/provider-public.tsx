import { useEffect, useMemo, useState } from 'react'
import { I18nManager, Platform } from 'react-native'

import { I18nProvider } from './context'
import { I18n } from './engine'
import { DEFAULT_LOCALE, LOCALE_META, isRTL, isValidLocale } from './locales'
import { loadMessages } from './messages/_registry'
import { messages as enMessages } from './messages/en'
import { storedLocale } from './stored-locale'

import type { SupportedLocale } from './locales'
import type { ReactNode } from 'react'

const isWeb = Platform.OS === 'web'

function resolvePublicLocale(): SupportedLocale {
  const stored = storedLocale.get()
  if (stored && isValidLocale(stored)) return stored
  if (isWeb && typeof navigator !== 'undefined') {
    for (const lang of navigator.languages ?? []) {
      const tag = lang.split('-')[0]
      if (isValidLocale(tag)) return tag
    }
  }
  return DEFAULT_LOCALE
}

export function PublicI18nProvider({ children }: { children: ReactNode }) {
  const [locale] = useState(resolvePublicLocale)
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
      }
    })
    return () => {
      cancelled = true
    }
  }, [locale])

  useEffect(() => {
    const meta = LOCALE_META[loadedLocale]
    if (isWeb && typeof document !== 'undefined') {
      document.documentElement.lang = meta.bcp47
      document.documentElement.dir = meta.dir
    } else {
      const shouldBeRTL = isRTL(loadedLocale)
      if (I18nManager.isRTL !== shouldBeRTL) {
        I18nManager.forceRTL(shouldBeRTL)
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
