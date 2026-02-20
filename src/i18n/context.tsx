import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import type { I18n } from './engine'
import type { SupportedLocale } from './locales'
import type { TFunction } from './types'
import type { ReactNode } from 'react'

interface I18nContextValue {
  i18n: I18n
  t: TFunction
  locale: SupportedLocale
}

const I18nContext = createContext<I18nContextValue | null>(null)

function makeCtx(i18n: I18n): I18nContextValue {
  return {
    i18n,
    t: i18n.t,
    locale: i18n.getLocale(),
  }
}

export function I18nProvider({ i18n, children }: { i18n: I18n; children: ReactNode }) {
  const [ctx, setCtx] = useState(() => makeCtx(i18n))

  useEffect(() => {
    // sync on mount in case locale changed between render and effect
    setCtx(makeCtx(i18n))

    return i18n.onChange(() => setCtx(makeCtx(i18n)))
  }, [i18n])

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
