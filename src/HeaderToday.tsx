import { CalendarDays } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']

function localizeFa(input: string) {
  return input.replace(/\d/g, (digit) => persianDigits[Number(digit)] ?? digit)
}

function todayIsoDate(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function numericDate(date: Date, calendar: 'persian' | 'gregory') {
  const parts = new Intl.DateTimeFormat(`en-u-ca-${calendar}`, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(date)
  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ''
  return localizeFa(`${pick('year')}/${pick('month')}/${pick('day')}`)
}

function formatWeekday(date: Date) {
  return new Intl.DateTimeFormat('fa-IR', { weekday: 'long' }).format(date)
}

const hijriMonths = [
  'محرم',
  'صفر',
  'ربیع الاول',
  'ربیع الثانی',
  'جمادی الاول',
  'جمادی الثانی',
  'رجب',
  'شعبان',
  'رمضان',
  'شوال',
  'ذیقعده',
  'ذیحجه',
]

function isGregorianLeap(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

function gregorianJulianDay(year: number, month: number, day: number) {
  const lengths = [31, isGregorianLeap(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  let dayOfYear = day
  for (let index = 0; index < month - 1; index += 1) dayOfYear += lengths[index] ?? 0
  const previous = year - 1
  const leaps = (previous / 4 | 0) + (-previous / 100 | 0) + (previous / 400 | 0)
  return 365 * previous + leaps + dayOfYear + 1721424
}

function isHijriLeap(year: number) {
  return [2, 5, 7, 10, 13, 15, 18, 21, 24, 26, 29].includes(((year % 30) + 30) % 30)
}

function hijriMonthLengths(leap: boolean) {
  return [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, leap ? 30 : 29]
}

function hijriDaysBefore(year: number) {
  return 354 * (year - 1) + ((11 / 30) * (year - 1) + 0.5 | 0)
}

function formatHijri(date: Date) {
  const offset = gregorianJulianDay(date.getFullYear(), date.getMonth() + 1, date.getDate()) - 1948438
  let year = Math.trunc((offset - 0.5) / 354.366) + 1
  let day = 1 + (offset - (hijriDaysBefore(year) + 1))
  while (day > (isHijriLeap(year) ? 355 : 354) || day < 1) {
    if (day < 1) {
      year -= 1
      day += isHijriLeap(year) ? 355 : 354
    } else {
      day -= isHijriLeap(year) ? 355 : 354
      year += 1
    }
  }
  const lengths = hijriMonthLengths(isHijriLeap(year))
  let month = 0
  while (day > (lengths[month] ?? 30)) {
    day -= lengths[month] ?? 30
    month += 1
  }
  return localizeFa(`${day} ${hijriMonths[month] ?? ''} ${year}`)
}

function useToday() {
  const [date, setDate] = useState(() => new Date())

  useEffect(() => {
    let timeoutId = 0
    function schedule() {
      const now = new Date()
      const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1)
      timeoutId = window.setTimeout(() => {
        setDate(new Date())
        schedule()
      }, Math.max(1000, nextMidnight.getTime() - now.getTime()))
    }
    schedule()
    return () => window.clearTimeout(timeoutId)
  }, [])

  return date
}

function CalendarCol({
  label,
  value,
  dir,
  lang,
  className = '',
}: {
  label: string
  value: string
  dir?: 'ltr' | 'rtl'
  lang?: string
  className?: string
}) {
  if (!value) return null
  return (
    <span className={`flex min-w-0 flex-col gap-0.5 px-2.5 sm:px-3 ${className}`}>
      <span className="text-[10px] font-medium leading-none text-teal-700">{label}</span>
      <span
        className="truncate text-sm font-semibold leading-tight text-ink-900"
        dir={dir}
        lang={lang}
        title={value}
      >
        {value}
      </span>
    </span>
  )
}

export function HeaderToday() {
  const { t } = useTranslation()
  const date = useToday()
  const iso = todayIsoDate(date)
  const weekday = formatWeekday(date)
  const jalali = numericDate(date, 'persian')
  const hijri = formatHijri(date)
  const gregorian = numericDate(date, 'gregory')
  const [pinned, setPinned] = useState(false)
  const [hovered, setHovered] = useState(false)
  const expanded = pinned || hovered
  const rootRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!expanded) return

    function close() {
      setPinned(false)
      setHovered(false)
    }

    function onPointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        close()
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') close()
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [expanded])

  return (
    <button
      ref={rootRef}
      type="button"
      aria-expanded={expanded}
      {...(expanded ? { 'data-enter-ignore': '' } : {})}
      aria-label={t('nav.todayCalendars')}
      onClick={() => setPinned((value) => !value)}
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') setHovered(true)
      }}
      onPointerLeave={(event) => {
        if (event.pointerType !== 'mouse') return
        setHovered(false)
        setPinned(false)
      }}
      className="flex shrink-0 cursor-pointer items-center gap-2 overflow-hidden rounded-2xl border border-line bg-white py-1.5 pe-2 ps-1.5 text-start shadow-sm transition hover:border-teal-300 hover:shadow-[0_6px_12px_rgba(46,189,182,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/80 sm:gap-2.5 sm:py-2 sm:pe-3 sm:ps-2"
    >
      <time dateTime={iso} className="flex min-w-0 items-center gap-2 sm:gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-mint-500 text-white shadow-[0_6px_12px_rgba(46,189,182,0.28)]">
          <CalendarDays className="size-4" aria-hidden />
        </span>
        <span className="flex min-w-0 flex-col justify-center">
          <span className="text-[10px] font-medium leading-none text-ink-400">{t('common.today')}</span>
          <span className="mt-0.5 truncate text-xs font-semibold leading-tight text-teal-800">{weekday}</span>
        </span>
        <span className="flex min-w-0 items-stretch">
          <CalendarCol label={t('common.calendarJalali')} value={jalali} dir="ltr" />
          <span
            className="grid min-w-0 transition-[grid-template-columns] duration-300 ease-out"
            style={{ gridTemplateColumns: expanded ? '1fr' : '0fr' }}
          >
            <span className="flex min-w-0 overflow-hidden" aria-hidden={!expanded} inert={!expanded || undefined}>
              <span className="flex w-max items-stretch">
                <CalendarCol
                  className="border-s border-line"
                  label={t('common.calendarHijri')}
                  value={hijri}
                  dir="rtl"
                  lang="fa"
                />
                <CalendarCol
                  className="border-s border-line"
                  label={t('common.calendarGregorian')}
                  value={gregorian}
                  dir="ltr"
                />
              </span>
            </span>
          </span>
        </span>
      </time>
    </button>
  )
}
