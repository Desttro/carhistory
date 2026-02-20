import { useCallback, useEffect, useState } from 'react'
import { Platform } from 'react-native'

import { DEFAULT_LOCALE, LOCALE_META, SUPPORTED_LOCALES } from '~/i18n/locales'
import { storedLocale } from '~/i18n/stored-locale'
import { zero } from '~/zero/client'

import type { SupportedLocale } from '~/i18n/locales'

interface UseLocaleSwitchOptions {
  userId?: string
  contextLocale?: SupportedLocale
  /** from i18n context — triggers provider re-render directly */
  onLocaleChange?: (locale: SupportedLocale) => void
}

export function useLocaleSwitch(options?: UseLocaleSwitchOptions) {
  const { userId, contextLocale, onLocaleChange } = options ?? {}

  const [internalLocale, setInternalLocale] = useState<SupportedLocale>(
    () => contextLocale ?? storedLocale.get() ?? DEFAULT_LOCALE
  )

  // keep in sync when context updates (e.g. after Zero round-trip)
  useEffect(() => {
    if (contextLocale) {
      setInternalLocale(contextLocale)
    }
  }, [contextLocale])

  const setLocale = useCallback(
    (newLocale: SupportedLocale) => {
      setInternalLocale(newLocale)
      storedLocale.set(newLocale)

      // notify i18n provider directly for immediate UI update
      onLocaleChange?.(newLocale)

      if (userId) {
        zero.mutate.userState.update({
          userId,
          locale: newLocale,
        })
      }

      // outside i18n context on web: set cookie + reload so middleware picks it up
      if (!onLocaleChange && Platform.OS === 'web' && typeof document !== 'undefined') {
        document.cookie = `locale=${newLocale}; Path=/; Max-Age=31536000; SameSite=Lax`
        window.location.reload()
      }
    },
    [userId, onLocaleChange]
  )

  const localeItems = SUPPORTED_LOCALES.map((loc) => ({
    key: loc,
    label: LOCALE_META[loc].name,
    selected: loc === internalLocale,
  }))

  return { currentLocale: internalLocale, setLocale, localeItems }
}
