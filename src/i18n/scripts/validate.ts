import { SUPPORTED_LOCALES } from '../locales'
import { messages as enMessages } from '../messages/en'

import type { SupportedLocale } from '../locales'

const enKeys = Object.keys(enMessages) as (keyof typeof enMessages)[]

async function loadLocaleMessages(
  locale: SupportedLocale
): Promise<Record<string, string>> {
  switch (locale) {
    case 'en':
      return enMessages as unknown as Record<string, string>
    case 'es':
      return (await import('../messages/es')).messages
    case 'de':
      return (await import('../messages/de')).messages
    case 'fr':
      return (await import('../messages/fr')).messages
    case 'it':
      return (await import('../messages/it')).messages
    case 'ru':
      return (await import('../messages/ru')).messages
    case 'pl':
      return (await import('../messages/pl')).messages
    case 'cs':
      return (await import('../messages/cs')).messages
    case 'zh':
      return (await import('../messages/zh')).messages
    case 'ar':
      return (await import('../messages/ar')).messages
    default:
      return {}
  }
}

function validateICUSyntax(message: string, key: string, locale: string): string[] {
  const errors: string[] = []
  let depth = 0

  for (let i = 0; i < message.length; i++) {
    if (message[i] === '{') depth++
    if (message[i] === '}') depth--
    if (depth < 0) {
      errors.push(`[${locale}] ${key}: unmatched closing brace at position ${i}`)
      break
    }
  }

  if (depth !== 0) {
    errors.push(`[${locale}] ${key}: unbalanced braces (depth=${depth})`)
  }

  // check plural forms have 'other' fallback
  if (message.includes('plural,') || message.includes('plural ,')) {
    if (!message.includes('other {') && !message.includes('other{')) {
      errors.push(`[${locale}] ${key}: plural missing 'other' form`)
    }
  }

  // check select forms have 'other' fallback
  if (message.includes('select,') || message.includes('select ,')) {
    if (!message.includes('other {') && !message.includes('other{')) {
      errors.push(`[${locale}] ${key}: select missing 'other' form`)
    }
  }

  return errors
}

function extractPlaceholders(message: string): Set<string> {
  // only extract top-level ICU placeholders, skip nested content inside plural/select forms
  const placeholders = new Set<string>()
  let depth = 0
  let i = 0

  while (i < message.length) {
    if (message[i] === '{') {
      if (depth === 0) {
        // top-level opening brace - extract the placeholder name
        const rest = message.slice(i + 1)
        const nameMatch = rest.match(/^(\w+)/)
        if (nameMatch) {
          placeholders.add(nameMatch[1]!)
        }
      }
      depth++
    } else if (message[i] === '}') {
      depth = Math.max(0, depth - 1)
    }
    i++
  }

  return placeholders
}

async function main() {
  let hasErrors = false
  const results: {
    locale: string
    missing: string[]
    extra: string[]
    errors: string[]
    completion: number
  }[] = []

  for (const locale of SUPPORTED_LOCALES) {
    if (locale === 'en') continue

    let messages: Record<string, string>
    try {
      messages = await loadLocaleMessages(locale)
    } catch (err) {
      console.info(`  [${locale}] failed to load: ${err}`)
      hasErrors = true
      continue
    }

    const localeKeys = new Set(Object.keys(messages))
    const missing: string[] = []
    const extra: string[] = []
    const errors: string[] = []

    // check for missing keys
    for (const key of enKeys) {
      if (!localeKeys.has(key)) {
        missing.push(key)
      }
    }

    // check for extra keys
    for (const key of localeKeys) {
      if (!(key in enMessages)) {
        extra.push(key)
      }
    }

    // validate ICU syntax and placeholder consistency
    for (const key of enKeys) {
      const enMsg = enMessages[key]
      const locMsg = messages[key]
      if (!locMsg) continue

      errors.push(...validateICUSyntax(locMsg, key, locale))

      // check placeholders match
      const enPlaceholders = extractPlaceholders(enMsg)
      const locPlaceholders = extractPlaceholders(locMsg)
      for (const p of enPlaceholders) {
        if (!locPlaceholders.has(p)) {
          errors.push(`[${locale}] ${key}: missing placeholder {${p}}`)
        }
      }
    }

    const completion = ((enKeys.length - missing.length) / enKeys.length) * 100

    results.push({ locale, missing, extra, errors, completion })

    if (missing.length > 0 || errors.length > 0) {
      hasErrors = true
    }
  }

  // print results
  console.info('\ni18n validation results\n' + '='.repeat(40))

  for (const r of results) {
    const status = r.missing.length === 0 && r.errors.length === 0 ? 'ok' : 'FAIL'
    console.info(`\n[${r.locale}] ${status} - ${r.completion.toFixed(1)}% complete`)

    if (r.missing.length > 0) {
      console.info(`  missing keys (${r.missing.length}):`)
      for (const k of r.missing.slice(0, 10)) {
        console.info(`    - ${k}`)
      }
      if (r.missing.length > 10) {
        console.info(`    ... and ${r.missing.length - 10} more`)
      }
    }

    if (r.extra.length > 0) {
      console.info(`  extra keys (${r.extra.length}):`)
      for (const k of r.extra.slice(0, 5)) {
        console.info(`    - ${k}`)
      }
    }

    if (r.errors.length > 0) {
      console.info(`  errors (${r.errors.length}):`)
      for (const e of r.errors.slice(0, 10)) {
        console.info(`    ${e}`)
      }
    }
  }

  console.info('\n' + '='.repeat(40))

  if (hasErrors) {
    console.info('VALIDATION FAILED')
    process.exit(1)
  } else {
    console.info('all locales valid')
  }
}

main()
