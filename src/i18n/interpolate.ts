import { selectPlural } from './plural'

import type { CompiledMessage, CompiledToken, InterpolationValues } from './types'

const compiledCache = new Map<string, CompiledMessage>()

export function compile(message: string): CompiledMessage {
  const cached = compiledCache.get(message)
  if (cached) return cached

  const tokens = parse(message, 0).tokens
  compiledCache.set(message, tokens)
  return tokens
}

function parse(src: string, start: number): { tokens: CompiledToken[]; end: number } {
  const tokens: CompiledToken[] = []
  let text = ''
  let i = start

  while (i < src.length) {
    const ch = src[i]

    if (ch === '}') {
      if (text) tokens.push(text)
      return { tokens, end: i }
    }

    if (ch === '#') {
      if (text) tokens.push(text)
      text = ''
      tokens.push({ type: 'hash' })
      i++
      continue
    }

    if (ch === '{') {
      if (text) tokens.push(text)
      text = ''

      const argEnd = findArgEnd(src, i + 1)
      const argContent = src.slice(i + 1, argEnd).trim()
      const parts = argContent.split(',')
      const name = parts[0]!.trim()

      if (parts.length === 1) {
        // simple variable: {name}
        tokens.push({ type: 'var', name })
        i = argEnd + 1
      } else {
        const argType = parts[1]!.trim()

        if (argType === 'plural' || argType === 'selectordinal') {
          const pluralType = argType === 'selectordinal' ? 'ordinal' : 'cardinal'
          const rest = src.slice(i + 1 + name.length + 1 + argType.length + 1, argEnd)
          const { offset, forms } = parsePluralForms(rest, src, i)
          tokens.push({
            type: 'plural',
            name,
            offset,
            forms,
          })
          // need to find the actual end after parsing forms
          i = findMatchingBrace(src, i) + 1
        } else if (argType === 'select') {
          const afterSelect = i + 1 + name.length + 1 + argType.length + 1
          const forms = parseSelectForms(src, afterSelect)
          tokens.push({ type: 'select', name, forms: forms.result })
          i = findMatchingBrace(src, i) + 1
        } else if (argType === 'number') {
          const style = parts[2]?.trim()
          tokens.push({ type: 'number', name, style })
          i = argEnd + 1
        } else if (argType === 'date') {
          const style = parts[2]?.trim()
          tokens.push({ type: 'date', name, style })
          i = argEnd + 1
        } else {
          // unknown type, treat as variable
          tokens.push({ type: 'var', name })
          i = argEnd + 1
        }
      }
      continue
    }

    // escape: '' wraps literal text in ICU, but we'll keep it simple
    if (ch === "'" && i + 1 < src.length && src[i + 1] === "'") {
      text += "'"
      i += 2
      continue
    }
    if (
      ch === "'" &&
      i + 1 < src.length &&
      (src[i + 1] === '{' || src[i + 1] === '}' || src[i + 1] === '#')
    ) {
      text += src[i + 1]
      i += 2
      continue
    }

    text += ch
    i++
  }

  if (text) tokens.push(text)
  return { tokens, end: i }
}

function findArgEnd(src: string, start: number): number {
  // find the end of a simple argument (no nested braces)
  let depth = 0
  for (let i = start; i < src.length; i++) {
    if (src[i] === '{') depth++
    if (src[i] === '}') {
      if (depth === 0) return i
      depth--
    }
  }
  return src.length
}

function findMatchingBrace(src: string, openPos: number): number {
  let depth = 0
  for (let i = openPos; i < src.length; i++) {
    if (src[i] === '{') depth++
    if (src[i] === '}') {
      depth--
      if (depth === 0) return i
    }
  }
  return src.length - 1
}

function parsePluralForms(
  rest: string,
  fullSrc: string,
  outerStart: number
): { offset: number; forms: Record<string, CompiledToken[]> } {
  let offset = 0
  const forms: Record<string, CompiledToken[]> = {}

  // parse from the outer brace position to find forms properly
  const innerStart = fullSrc.indexOf(',', fullSrc.indexOf(',', outerStart + 1) + 1) + 1
  let i = innerStart

  // skip whitespace
  while (i < fullSrc.length && /\s/.test(fullSrc[i]!)) i++

  // check for offset
  const offsetMatch = fullSrc.slice(i).match(/^offset\s*:\s*(\d+)\s*/)
  if (offsetMatch) {
    offset = Number.parseInt(offsetMatch[1]!, 10)
    i += offsetMatch[0].length
  }

  // parse keyword {message} pairs
  while (i < fullSrc.length) {
    while (i < fullSrc.length && /\s/.test(fullSrc[i]!)) i++
    if (fullSrc[i] === '}') break

    // read keyword (one, other, =0, few, many, zero, two, etc.)
    let keyword = ''
    while (i < fullSrc.length && fullSrc[i] !== '{' && !/\s/.test(fullSrc[i]!)) {
      keyword += fullSrc[i]
      i++
    }
    keyword = keyword.trim()
    if (!keyword) break

    while (i < fullSrc.length && /\s/.test(fullSrc[i]!)) i++

    if (fullSrc[i] !== '{') break
    i++ // skip opening brace

    const result = parse(fullSrc, i)
    forms[keyword] = result.tokens
    i = result.end + 1 // skip closing brace
  }

  return { offset, forms }
}

function parseSelectForms(
  src: string,
  start: number
): { result: Record<string, CompiledToken[]> } {
  const result: Record<string, CompiledToken[]> = {}
  let i = start

  while (i < src.length) {
    while (i < src.length && /\s/.test(src[i]!)) i++
    if (src[i] === '}') break

    let keyword = ''
    while (i < src.length && src[i] !== '{' && !/\s/.test(src[i]!)) {
      keyword += src[i]
      i++
    }
    keyword = keyword.trim()
    if (!keyword) break

    while (i < src.length && /\s/.test(src[i]!)) i++

    if (src[i] !== '{') break
    i++

    const parsed = parse(src, i)
    result[keyword] = parsed.tokens
    i = parsed.end + 1
  }

  return { result }
}

// interpolation

export function interpolate(
  compiled: CompiledMessage,
  values: InterpolationValues | undefined,
  locale: string,
  hashValue?: number
): string {
  let result = ''

  for (const token of compiled) {
    if (typeof token === 'string') {
      result += token
      continue
    }

    switch (token.type) {
      case 'var': {
        const val = values?.[token.name]
        result += val != null ? String(val) : `{${token.name}}`
        break
      }

      case 'hash': {
        result += hashValue != null ? String(hashValue) : '#'
        break
      }

      case 'plural': {
        const rawVal = values?.[token.name]
        const num = typeof rawVal === 'number' ? rawVal : Number(rawVal)
        const adjusted = num - token.offset

        // check for exact match first (=0, =1, etc.)
        const exactKey = `=${num}`
        const category = selectPlural(locale, adjusted)
        const form =
          token.forms[exactKey] ?? token.forms[category] ?? token.forms['other'] ?? []
        result += interpolate(form, values, locale, adjusted)
        break
      }

      case 'select': {
        const val = String(values?.[token.name] ?? '')
        const form = token.forms[val] ?? token.forms['other'] ?? []
        result += interpolate(form, values, locale, hashValue)
        break
      }

      case 'number': {
        const val = values?.[token.name]
        const num = typeof val === 'number' ? val : Number(val)
        try {
          result += new Intl.NumberFormat(locale, resolveNumberStyle(token.style)).format(
            num
          )
        } catch {
          result += String(num)
        }
        break
      }

      case 'date': {
        const val = values?.[token.name]
        const date = val instanceof Date ? val : new Date(String(val))
        try {
          result += new Intl.DateTimeFormat(locale, resolveDateStyle(token.style)).format(
            date
          )
        } catch {
          result += String(val)
        }
        break
      }
    }
  }

  return result
}

function resolveNumberStyle(style?: string): Intl.NumberFormatOptions {
  switch (style) {
    case 'percent':
      return { style: 'percent' }
    case 'currency':
      return { style: 'currency', currency: 'USD' }
    default:
      return {}
  }
}

function resolveDateStyle(style?: string): Intl.DateTimeFormatOptions {
  switch (style) {
    case 'short':
      return { dateStyle: 'short' }
    case 'medium':
      return { dateStyle: 'medium' }
    case 'long':
      return { dateStyle: 'long' }
    case 'full':
      return { dateStyle: 'full' }
    default:
      return { dateStyle: 'medium' }
  }
}
