const cache = new Map<string, Intl.PluralRules>()

export function selectPlural(
  locale: string,
  value: number,
  type: 'cardinal' | 'ordinal' = 'cardinal'
): string {
  const key = `${locale}:${type}`
  let rules = cache.get(key)
  if (!rules) {
    rules = new Intl.PluralRules(locale, { type })
    cache.set(key, rules)
  }
  return rules.select(value)
}
