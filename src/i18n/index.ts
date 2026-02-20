// core engine
export { I18n, createI18n, i18n } from './engine'

// react
export { I18nProvider, useI18n, useLocale, useT } from './context'
export { AppI18nProvider } from './provider-app'

// locale config
export {
  DEFAULT_LOCALE,
  LOCALE_META,
  RTL_LOCALES,
  SUPPORTED_LOCALES,
  isRTL,
  isValidLocale,
} from './locales'

// formatting
export {
  formatCurrency,
  formatDate,
  formatNumber,
  formatOdometer,
  formatRelativeTime,
  useFormat,
} from './format'

// enum translation helpers
export {
  translateDamageZone,
  translateEventType,
  translateSeverity,
  translateTitleBrand,
} from './enums'

// detection
export { detectLocaleFromHeaders } from './detect'

// types
export type {
  CompiledMessage,
  CompiledToken,
  InterpolationValues,
  MessageKey,
  Messages,
  TFunction,
} from './types'
export type { SupportedLocale } from './locales'
