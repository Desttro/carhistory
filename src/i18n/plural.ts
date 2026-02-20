type PluralCategory = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other'

const hasPluralRules =
  typeof Intl !== 'undefined' && typeof Intl.PluralRules !== 'undefined'

// cldr cardinal plural rules for the 10 supported locales
// see: https://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html
export function cldrCardinal(locale: string, n: number): PluralCategory {
  const lang = locale.split('-')[0]!.toLowerCase()
  const abs = Math.abs(n)
  const i = Math.trunc(abs) // integer part
  const fStr = String(abs).split('.')[1] ?? ''
  const v = fStr.length // number of visible fraction digits
  const f = v === 0 ? 0 : Number.parseInt(fStr, 10) // visible fraction value

  switch (lang) {
    // chinese: always other
    case 'zh':
      return 'other'

    // english, german, italian: one when integer 1, no decimals
    case 'en':
    case 'de':
    case 'it':
      return i === 1 && v === 0 ? 'one' : 'other'

    // spanish: one when exactly 1 (no decimals)
    case 'es':
      return i === 1 && v === 0 ? 'one' : 'other'

    // french: one when integer part is 0 or 1
    case 'fr':
      return i === 0 || i === 1 ? 'one' : 'other'

    // russian
    case 'ru': {
      const m10 = i % 10
      const m100 = i % 100
      if (v === 0 && m10 === 1 && m100 !== 11) return 'one'
      if (v === 0 && m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return 'few'
      if (
        v === 0 &&
        (m10 === 0 || (m10 >= 5 && m10 <= 9) || (m100 >= 11 && m100 <= 14))
      )
        return 'many'
      return 'other'
    }

    // polish
    case 'pl': {
      const m10 = i % 10
      const m100 = i % 100
      if (i === 1 && v === 0) return 'one'
      if (v === 0 && m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return 'few'
      if (
        v === 0 &&
        ((i !== 1 && m10 >= 0 && m10 <= 1) ||
          (m10 >= 5 && m10 <= 9) ||
          (m100 >= 12 && m100 <= 14))
      )
        return 'many'
      return 'other'
    }

    // czech
    case 'cs': {
      if (i === 1 && v === 0) return 'one'
      if (i >= 2 && i <= 4 && v === 0) return 'few'
      if (v !== 0) return 'many'
      return 'other'
    }

    // arabic
    case 'ar': {
      if (n === 0) return 'zero'
      if (n === 1) return 'one'
      if (n === 2) return 'two'
      const m100 = i % 100
      if (m100 >= 3 && m100 <= 10) return 'few'
      if (m100 >= 11 && m100 <= 99) return 'many'
      return 'other'
    }

    default:
      return 'other'
  }
}

const cache = new Map<string, Intl.PluralRules>()

export function selectPlural(
  locale: string,
  value: number,
  type: 'cardinal' | 'ordinal' = 'cardinal',
): string {
  if (!hasPluralRules) {
    // ordinal not used in our messages, safe to return 'other'
    if (type === 'ordinal') return 'other'
    return cldrCardinal(locale, value)
  }

  const key = `${locale}:${type}`
  let rules = cache.get(key)
  if (!rules) {
    rules = new Intl.PluralRules(locale, { type })
    cache.set(key, rules)
  }
  return rules.select(value)
}
