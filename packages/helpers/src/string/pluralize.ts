const hasPluralRules =
  typeof Intl !== 'undefined' && typeof Intl.PluralRules !== 'undefined'

let pluralRules: Intl.PluralRules | undefined = hasPluralRules
  ? new Intl.PluralRules('en-US')
  : undefined

function selectCategory(count: number): string {
  if (pluralRules) return pluralRules.select(count)
  return count === 1 ? 'one' : 'other'
}

export function pluralize(count: number, singular: string, plural: string): string {
  const grammaticalNumber = selectCategory(count)
  switch (grammaticalNumber) {
    case 'one':
      return `${count} ${singular}`
    case 'other':
      return `${count} ${plural}`
    default:
      throw new Error(
        `Can't pluralize: ${grammaticalNumber} for ${count} / ${singular} / ${plural}`,
      )
  }
}

export function setPluralizeLocale(locale: Intl.LocalesArgument): void {
  if (hasPluralRules) {
    pluralRules = new Intl.PluralRules(locale)
  }
}

export type PluralizeFn = typeof pluralize
