export const SUPPORTED_LOCALES = [
  'en',
  'es',
  'de',
  'fr',
  'it',
  'ru',
  'pl',
  'cs',
  'zh',
  'ar',
] as const
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]
export const DEFAULT_LOCALE: SupportedLocale = 'en'
export const RTL_LOCALES: SupportedLocale[] = ['ar']

export const LOCALE_META: Record<
  SupportedLocale,
  {
    name: string
    bcp47: string
    og: string
    dir: 'ltr' | 'rtl'
  }
> = {
  en: { name: 'English', bcp47: 'en-US', og: 'en_US', dir: 'ltr' },
  es: { name: 'Español', bcp47: 'es-ES', og: 'es_ES', dir: 'ltr' },
  de: { name: 'Deutsch', bcp47: 'de-DE', og: 'de_DE', dir: 'ltr' },
  fr: { name: 'Français', bcp47: 'fr-FR', og: 'fr_FR', dir: 'ltr' },
  it: { name: 'Italiano', bcp47: 'it-IT', og: 'it_IT', dir: 'ltr' },
  ru: { name: 'Русский', bcp47: 'ru-RU', og: 'ru_RU', dir: 'ltr' },
  pl: { name: 'Polski', bcp47: 'pl-PL', og: 'pl_PL', dir: 'ltr' },
  cs: { name: 'Čeština', bcp47: 'cs-CZ', og: 'cs_CZ', dir: 'ltr' },
  zh: { name: '简体中文', bcp47: 'zh-CN', og: 'zh_CN', dir: 'ltr' },
  ar: { name: 'العربية', bcp47: 'ar-SA', og: 'ar_SA', dir: 'rtl' },
}

export function isValidLocale(v: string): v is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(v)
}

export function isRTL(locale: SupportedLocale): boolean {
  return RTL_LOCALES.includes(locale)
}
