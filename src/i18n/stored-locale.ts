import { createStorageValue } from '@take-out/helpers'

import type { SupportedLocale } from './locales'

export const storedLocale = createStorageValue<SupportedLocale>('user-locale')
