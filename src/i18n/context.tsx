import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import type { I18n } from './engine'
import type { SupportedLocale } from './locales'
import type { TFunction } from './types'
import type { ReactNode } from 'react'

interface I18nContextValue {
  i18n: I18n
  t: TFunction
  locale: SupportedLocale
  setLocale?: (locale: SupportedLocale) => void
}

const I18nContext = createContext<I18nContextValue | null>(null)

function makeCtx(i18n: I18n, setLocale?: (locale: SupportedLocale) => void): I18nContextValue {
  return {
    i18n,
    t: i18n.t,
    locale: i18n.getLocale(),
    setLocale,
  }
}

export function I18nProvider({
  i18n,
  children,
  onLocaleChange,
}: {
  i18n: I18n
  children: ReactNode
  onLocaleChange?: (locale: SupportedLocale) => void
}) {
  const [ctx, setCtx] = useState(() => makeCtx(i18n, onLocaleChange))

  useEffect(() => {
    setCtx(makeCtx(i18n, onLocaleChange))
    return i18n.onChange(() => setCtx(makeCtx(i18n, onLocaleChange)))
  }, [i18n, onLocaleChange])

  return <I18nContext.Provider value={ctx}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n: missing I18nProvider')
  return ctx
}

export function useT(): TFunction {
  return useI18n().t
}

export function useLocale(): SupportedLocale {
  return useI18n().locale
}

export function useSetLocale(): ((locale: SupportedLocale) => void) | undefined {
  return useI18n().setLocale
}
