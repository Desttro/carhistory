import { messages as arMessages } from './ar'
import { messages as csMessages } from './cs'
import { messages as deMessages } from './de'
import { messages as enMessages } from './en'
import { messages as esMessages } from './es'
import { messages as frMessages } from './fr'
import { messages as itMessages } from './it'
import { messages as plMessages } from './pl'
import { messages as ruMessages } from './ru'
import { messages as zhMessages } from './zh'

import type { SupportedLocale } from '../locales'

const messageMap: Record<SupportedLocale, Record<string, string>> = {
  en: enMessages as unknown as Record<string, string>,
  es: esMessages,
  de: deMessages,
  fr: frMessages,
  it: itMessages,
  ru: ruMessages,
  pl: plMessages,
  cs: csMessages,
  zh: zhMessages,
  ar: arMessages,
}

export async function loadMessages(
  locale: SupportedLocale
): Promise<Record<string, string>> {
  return messageMap[locale] ?? messageMap.en
}
