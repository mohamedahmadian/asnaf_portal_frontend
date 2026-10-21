import { formatNumber } from '../../lib/datetime'

const MINUTE_MS = 60_000
const HOUR_MS = 60 * MINUTE_MS
const DAY_MS = 24 * HOUR_MS
const WEEK_MS = 7 * DAY_MS
const MONTH_MS = 30 * DAY_MS

export function inquiryElapsedLabel(
  fromIso: string,
  toIso: string,
  t: (key: string, options?: Record<string, string>) => string,
  locale: string,
) {
  const elapsed = Math.max(0, new Date(toIso).getTime() - new Date(fromIso).getTime())
  if (!Number.isFinite(elapsed)) return null
  const n = (value: number) => formatNumber(value, locale)
  if (elapsed < MINUTE_MS) return t('cases.inquiryElapsedUnderMinute')
  if (elapsed < DAY_MS) {
    const hours = Math.floor(elapsed / HOUR_MS)
    const minutes = Math.floor((elapsed % HOUR_MS) / MINUTE_MS)
    if (hours === 0) return t('cases.inquiryElapsedMinute', { count: n(minutes) })
    if (minutes === 0) return t('cases.inquiryElapsedHour', { count: n(hours) })
    return t('cases.inquiryElapsedHourMinute', { hours: n(hours), minutes: n(minutes) })
  }
  if (elapsed < WEEK_MS) {
    const days = Math.floor(elapsed / DAY_MS)
    const hours = Math.floor((elapsed % DAY_MS) / HOUR_MS)
    if (hours === 0) return t('cases.inquiryElapsedDay', { count: n(days) })
    return t('cases.inquiryElapsedDayHour', { days: n(days), hours: n(hours) })
  }
  if (elapsed < MONTH_MS) {
    return t('cases.inquiryElapsedDay', { count: n(Math.floor(elapsed / DAY_MS)) })
  }
  const weeks = Math.floor(elapsed / WEEK_MS)
  const days = Math.floor((elapsed % WEEK_MS) / DAY_MS)
  if (days === 0) return t('cases.inquiryElapsedWeek', { count: n(weeks) })
  return t('cases.inquiryElapsedWeekDay', { weeks: n(weeks), days: n(days) })
}
