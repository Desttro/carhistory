import { DEFAULT_LOCALE, SUPPORTED_LOCALES, isValidLocale } from './locales'

import type { SupportedLocale } from './locales'

export function detectLocaleFromHeaders(headers: Headers): SupportedLocale {
  // 1. check cookie
  const cookie = headers.get('cookie')
  if (cookie) {
    const cookieLocale = parseCookieLocale(cookie)
    if (cookieLocale) return cookieLocale
  }

  // 2. check accept-language header
  const acceptLang = headers.get('accept-language')
  if (acceptLang) return negotiateLocale(acceptLang)

  return DEFAULT_LOCALE
}

function parseCookieLocale(cookie: string): SupportedLocale | null {
  const match = cookie.match(/(?:^|;\s*)locale=([^;]+)/)
  if (match && isValidLocale(match[1]!)) {
    return match[1] as SupportedLocale
  }
  return null
}

function negotiateLocale(header: string): SupportedLocale {
  // parse "en-US,en;q=0.9,es;q=0.8" into sorted candidates
  const candidates = header
    .split(',')
    .map((part) => {
      const [lang, ...params] = part.trim().split(';')
      const qParam = params.find((p) => p.trim().startsWith('q='))
      const q = qParam ? Number.parseFloat(qParam.trim().slice(2)) : 1.0
      return { lang: lang!.trim().toLowerCase(), q }
    })
    .sort((a, b) => b.q - a.q)

  for (const { lang } of candidates) {
    // exact match (e.g. "es")
    if (isValidLocale(lang)) return lang

    // prefix match (e.g. "es-MX" -> "es")
    const prefix = lang.split('-')[0]!
    if (isValidLocale(prefix)) return prefix

    // check if any supported locale starts with the prefix
    const match = SUPPORTED_LOCALES.find((l) => l.startsWith(prefix))
    if (match) return match
  }

  return DEFAULT_LOCALE
}
