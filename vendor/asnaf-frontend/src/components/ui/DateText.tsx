import { useTranslation } from 'react-i18next'
import {
  formatDate,
  formatDateTimeDate,
  formatGregorianDate,
  formatHijriDate,
  formatJalaliDate,
  formatJalaliYearEquivalents,
  formatTime,
  usesJalaliCalendar,
} from '../../lib/datetime'

function EquivalentLine({
  items,
}: {
  items: { text: string; dir?: 'ltr' | 'rtl'; lang?: string }[]
}) {
  const visible = items.filter((item) => item.text)
  if (!visible.length) return null
  return (
    <p className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-xs leading-6 text-ink-500">
      {visible.map((item, index) => (
        <span key={`${item.text}-${index}`}>
          {index > 0 ? <span aria-hidden> · </span> : null}
          <span dir={item.dir} lang={item.lang}>
            {item.text}
          </span>
        </span>
      ))}
    </p>
  )
}

export function DateText({
  value,
  withTime,
  stacked,
}: {
  value?: string | null
  withTime?: boolean
  stacked?: boolean
}) {
  const { i18n } = useTranslation()
  if (!value) {
    return '—'
  }
  const locale = i18n.language.split('-')[0] ?? 'fa'
  if (!withTime) {
    return formatDate(value, locale)
  }
  return (
    <span
      className={
        stacked
          ? 'flex flex-col items-start gap-0.5'
          : 'inline-flex max-w-full flex-wrap items-baseline gap-x-2 gap-y-0.5'
      }
      dir="ltr"
    >
      <span>{formatDateTimeDate(value, locale)}</span>
      <span>{formatTime(value, locale)}</span>
    </span>
  )
}

export function DateEquivalents({ value }: { value?: string | null }) {
  const { i18n } = useTranslation()
  if (!value) return null
  const locale = i18n.language.split('-')[0] ?? 'fa'
  const hijri = formatHijriDate(value, locale)
  const other = usesJalaliCalendar(locale)
    ? formatGregorianDate(value, locale)
    : formatJalaliDate(value, locale)
  return (
    <EquivalentLine
      items={[
        { text: other, dir: 'ltr' },
        { text: hijri, dir: 'rtl', lang: 'ar' },
      ]}
    />
  )
}

export function YearEquivalents({ year }: { year?: number | null }) {
  const { i18n } = useTranslation()
  if (year == null) return null
  const locale = i18n.language.split('-')[0] ?? 'fa'
  const { gregorian, hijri } = formatJalaliYearEquivalents(year, locale)
  return (
    <EquivalentLine
      items={[
        { text: gregorian, dir: 'ltr' },
        { text: hijri, dir: 'ltr' },
      ]}
    />
  )
}

export function HijriDateText({ value }: { value?: string | null }) {
  return <DateEquivalents value={value} />
}
