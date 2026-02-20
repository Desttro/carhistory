import { compile, interpolate } from './interpolate'

import type { SupportedLocale } from './locales'
import type { CompiledMessage, InterpolationValues, MessageKey, TFunction } from './types'

export class I18n {
  private locale: SupportedLocale = 'en'
  private messages: Record<string, string> = {}
  private listeners = new Set<() => void>()
  private compiled = new Map<string, CompiledMessage>()

  getLocale(): SupportedLocale {
    return this.locale
  }

  getMessages(): Record<string, string> {
    return this.messages
  }

  load(locale: SupportedLocale, messages: Record<string, string>): void {
    this.messages = messages
    this.locale = locale
    this.compiled.clear()
  }

  activate(locale: SupportedLocale): void {
    if (this.locale === locale) return
    this.locale = locale
    this.compiled.clear()
    for (const listener of this.listeners) {
      listener()
    }
  }

  t: TFunction = (key: MessageKey, values?: InterpolationValues): string => {
    const msg = this.messages[key as string] ?? (key as string)

    // fast path: no interpolation needed
    if (!values && !msg.includes('{')) return msg

    let compiled = this.compiled.get(msg)
    if (!compiled) {
      compiled = compile(msg)
      this.compiled.set(msg, compiled)
    }

    return interpolate(compiled, values, this.locale)
  }

  onChange(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }
}

export function createI18n(
  locale: SupportedLocale,
  messages: Record<string, string>
): I18n {
  const i18n = new I18n()
  i18n.load(locale, messages)
  return i18n
}

// singleton for non-react usage
export const i18n = new I18n()
