import { useLocale } from './context'

// memoized formatter caches
const dateFormatCache = new Map<string, Intl.DateTimeFormat>()
const numberFormatCache = new Map<string, Intl.NumberFormat>()
const relativeFormatCache = new Map<string, Intl.RelativeTimeFormat>()

function getDateFormat(
  locale: string,
  options?: Intl.DateTimeFormatOptions
): Intl.DateTimeFormat {
  const key = `${locale}:${JSON.stringify(options ?? {})}`
  let fmt = dateFormatCache.get(key)
  if (!fmt) {
    fmt = new Intl.DateTimeFormat(locale, options)
    dateFormatCache.set(key, fmt)
  }
  return fmt
}

function getNumberFormat(
  locale: string,
  options?: Intl.NumberFormatOptions
): Intl.NumberFormat {
  const key = `${locale}:${JSON.stringify(options ?? {})}`
  let fmt = numberFormatCache.get(key)
  if (!fmt) {
    fmt = new Intl.NumberFormat(locale, options)
    numberFormatCache.set(key, fmt)
  }
  return fmt
}

function getRelativeFormat(locale: string): Intl.RelativeTimeFormat {
  let fmt = relativeFormatCache.get(locale)
  if (!fmt) {
    fmt = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
    relativeFormatCache.set(locale, fmt)
  }
  return fmt
}

export function formatDate(
  date: Date | string | number,
  locale: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = date instanceof Date ? date : new Date(date)
  return getDateFormat(locale, options).format(d)
}

export function formatNumber(
  value: number,
  locale: string,
  options?: Intl.NumberFormatOptions
): string {
  return getNumberFormat(locale, options).format(value)
}

export function formatCurrency(cents: number, locale: string, currency = 'USD'): string {
  return getNumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(cents / 100)
}

export function formatRelativeTime(date: Date | string | number, locale: string): string {
  const d = date instanceof Date ? date : new Date(date)
  const now = Date.now()
  const diffMs = d.getTime() - now
  const diffSec = Math.round(diffMs / 1000)
  const diffMin = Math.round(diffSec / 60)
  const diffHr = Math.round(diffMin / 60)
  const diffDay = Math.round(diffHr / 24)

  const fmt = getRelativeFormat(locale)

  if (Math.abs(diffSec) < 60) return fmt.format(diffSec, 'second')
  if (Math.abs(diffMin) < 60) return fmt.format(diffMin, 'minute')
  if (Math.abs(diffHr) < 24) return fmt.format(diffHr, 'hour')
  if (Math.abs(diffDay) < 30) return fmt.format(diffDay, 'day')
  if (Math.abs(diffDay) < 365) return fmt.format(Math.round(diffDay / 30), 'month')
  return fmt.format(Math.round(diffDay / 365), 'year')
}

export function formatOdometer(miles: number, locale: string): string {
  return getNumberFormat(locale).format(miles)
}

export function useFormat() {
  const locale = useLocale()
  return {
    date: (d: Date | string | number, opts?: Intl.DateTimeFormatOptions) =>
      formatDate(d, locale, opts),
    number: (v: number, opts?: Intl.NumberFormatOptions) => formatNumber(v, locale, opts),
    currency: (cents: number, cur?: string) => formatCurrency(cents, locale, cur),
    relativeTime: (d: Date | string | number) => formatRelativeTime(d, locale),
    odometer: (miles: number) => formatOdometer(miles, locale),
  }
}
