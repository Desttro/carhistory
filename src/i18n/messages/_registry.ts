import type { SupportedLocale } from '../locales'

export async function loadMessages(
  locale: SupportedLocale
): Promise<Record<string, string>> {
  switch (locale) {
    case 'en':
      return (await import('./en')).messages as unknown as Record<string, string>
    case 'es':
      return (await import('./es')).messages
    case 'de':
      return (await import('./de')).messages
    case 'fr':
      return (await import('./fr')).messages
    case 'it':
      return (await import('./it')).messages
    case 'ru':
      return (await import('./ru')).messages
    case 'pl':
      return (await import('./pl')).messages
    case 'cs':
      return (await import('./cs')).messages
    case 'zh':
      return (await import('./zh')).messages
    case 'ar':
      return (await import('./ar')).messages
    default:
      return (await import('./en')).messages as unknown as Record<string, string>
  }
}
