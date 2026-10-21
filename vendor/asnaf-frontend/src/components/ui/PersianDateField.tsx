import DatePickerImport, { DateObject } from 'react-multi-date-picker'
import { CalendarDays, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  calendarDayParts,
  datePickerCalendar,
  datePickerLocale,
  fromIsoDateOnly,
  numberingDigits,
  toIsoDateOnly,
  usesJalaliCalendar,
} from '../../lib/datetime'
import { DateEquivalents } from './DateText'
import { fieldClassName } from './Form'
import 'react-multi-date-picker/styles/colors/teal.css'
import 'react-multi-date-picker/styles/layouts/mobile.css'
import './persian-date-field.css'

const DatePicker =
  (DatePickerImport as unknown as { default?: typeof DatePickerImport }).default ??
  DatePickerImport

function dayValue(date: DateObject) {
  return date.year * 10_000 + date.month.number * 100 + date.day
}

function dateInRange(date: DateObject, min?: DateObject, max?: DateObject) {
  const value = dayValue(date)
  if (min && value < dayValue(min)) return false
  if (max && value > dayValue(max)) return false
  return true
}

function positionedHost(wrapper: HTMLElement) {
  let node: HTMLElement | null = wrapper
  for (let depth = 0; depth < 4 && node; depth += 1) {
    if (/translate\(/.test(node.style.transform)) return node
    node = node.parentElement
  }
  return wrapper.parentElement ?? wrapper
}

function keepCalendarInView() {
  const wrapper = document.querySelector<HTMLElement>('.rmdp-wrapper')
  if (!wrapper) return
  const host = positionedHost(wrapper)
  const margin = 8
  const available = window.innerHeight - margin * 2
  if (wrapper.scrollHeight > available) {
    wrapper.style.maxHeight = `${available}px`
    wrapper.style.overflowY = 'auto'
  }
  const rect = wrapper.getBoundingClientRect()
  let shift = 0
  if (rect.bottom > window.innerHeight - margin) shift -= rect.bottom - (window.innerHeight - margin)
  if (rect.top + shift < margin) shift += margin - (rect.top + shift)
  if (shift === 0) return
  const match = /translate\(\s*([-\d.]+)px,\s*([-\d.]+)px\)/.exec(host.style.transform)
  if (!match) return
  host.style.transform = `translate(${Number(match[1])}px, ${Number(match[2]) + shift}px)`
}

function hasSelectedDate(selected?: DateObject | DateObject[] | null) {
  if (!selected) return false
  return Array.isArray(selected) ? selected.length > 0 : true
}

function DatePickerActions({
  handleChange,
  handleFocusedDate,
  DatePicker: picker,
  state,
  minDate,
  maxDate,
}: {
  handleChange?: (value: DateObject | DateObject[] | null, nextState?: unknown) => void
  handleFocusedDate?: (date?: DateObject | null) => void
  DatePicker?: { closeCalendar?: () => void }
  state?: {
    calendar?: DateObject['calendar']
    date?: DateObject
    selectedDate?: DateObject | DateObject[] | null
  }
  minDate?: DateObject
  maxDate?: DateObject
  position?: string
}) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language.split('-')[0] ?? 'fa'
  const pickerLocale = datePickerLocale(locale)
  const pickerCalendar = datePickerCalendar(locale)
  const selected = hasSelectedDate(state?.selectedDate)

  function todayDate() {
    return new DateObject({
      calendar: state?.calendar ?? pickerCalendar,
      locale: pickerLocale,
    })
  }

  function goToToday() {
    const today = todayDate()
    handleFocusedDate?.(today)
    if (!dateInRange(today, minDate, maxDate)) return
    handleChange?.(today, { ...state, selectedDate: today })
    picker?.closeCalendar?.()
  }

  function clearDate() {
    handleChange?.(null, { ...state, selectedDate: null })
    handleFocusedDate?.(null)
    picker?.closeCalendar?.()
  }

  return (
    <div
      className="flex gap-2 border-t border-line p-2"
      onMouseDown={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className="inline-flex flex-1 items-center justify-center rounded-xl bg-mint-500 px-2 py-1.5 text-xs font-medium text-white hover:bg-mint-600"
        onClick={goToToday}
      >
        {t('common.today')}
      </button>
      <button
        type="button"
        className="inline-flex flex-1 items-center justify-center rounded-xl border border-line bg-white px-2 py-1.5 text-xs font-medium text-ink-700 hover:bg-cream-100 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={!selected}
        onClick={clearDate}
      >
        {t('common.clearDate')}
      </button>
    </div>
  )
}

function CalendarLegend(_props: { position?: string }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language.split('-')[0] ?? 'fa'
  const otherLabel = usesJalaliCalendar(locale)
    ? t('common.calendarGregorian')
    : t('common.calendarJalali')

  return (
    <div className="eskan-cal-legend">
      <span className="eskan-cal-legend-item">
        <span className="eskan-cal-legend-swatch eskan-cal-legend-hijri" aria-hidden />
        {t('common.calendarHijri')}
      </span>
      <span className="eskan-cal-legend-item">
        <span className="eskan-cal-legend-swatch eskan-cal-legend-other" aria-hidden />
        {otherLabel}
      </span>
    </div>
  )
}

export function PersianDateField({
  id,
  value,
  onChange,
  minDate,
  maxDate,
  showHijri,
}: {
  id?: string
  value?: string
  onChange: (isoDate?: string) => void
  minDate?: string
  maxDate?: string
  showHijri?: boolean
}) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language.split('-')[0] ?? 'fa'
  const pickerLocale = datePickerLocale(locale)
  const pickerCalendar = datePickerCalendar(locale)
  const dir = document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr'
  const selected = value
    ? fromIsoDateOnly(value)?.convert(pickerCalendar)
    : undefined
  const min = minDate ? fromIsoDateOnly(minDate)?.convert(pickerCalendar) : undefined
  const max = maxDate ? fromIsoDateOnly(maxDate)?.convert(pickerCalendar) : undefined

  return (
    <div className="w-full space-y-1.5">
      <DatePicker
        value={selected}
        minDate={min}
        maxDate={max}
        calendar={pickerCalendar}
        locale={pickerLocale}
        format="YYYY/M/D"
        digits={locale === 'en' ? undefined : (numberingDigits[locale] ?? numberingDigits.fa)}
        className="teal eskan-triple-cal"
        calendarPosition={dir === 'rtl' ? 'bottom-right' : 'bottom-left'}
        containerClassName="w-full"
        portal
        zIndex={120}
        hideOnScroll
        onOpenPickNewDate={false}
        onPositionChange={() => {
          keepCalendarInView()
          requestAnimationFrame(keepCalendarInView)
        }}
        mapDays={({ date }) => {
          const parts = calendarDayParts(date, locale)
          const friday = usesJalaliCalendar(locale) && date.weekDay?.index === 6
          return {
            className: friday ? 'eskan-cal-friday' : undefined,
            title: `${parts.primary} · ${parts.hijri} · ${parts.other}`,
            children: (
              <div className="eskan-triple-day">
                <div className="eskan-triple-day-primary">{parts.primary}</div>
                <div className="eskan-triple-day-alts" dir="ltr">
                  <div className="eskan-triple-day-hijri">{parts.hijri}</div>
                  <div className="eskan-triple-day-other">{parts.other}</div>
                </div>
              </div>
            ),
          }
        }}
        plugins={[
          <CalendarLegend key="legend" position="top" />,
          <DatePickerActions key="actions" position="bottom" />,
        ]}
        render={(formatted, openCalendar) => (
          <div
            id={id}
            role="button"
            tabIndex={0}
            data-enter-ignore
            className={`${fieldClassName} date-field-trigger flex cursor-pointer items-center gap-1`}
            onClick={() => openCalendar()}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                event.stopPropagation()
                openCalendar()
              }
            }}
          >
            <span className={`pointer-events-none min-w-0 flex-1 truncate text-start ${formatted ? 'text-ink-900' : 'text-ink-400'}`}>
              {formatted || t('common.selectDate')}
            </span>
            {value ? (
              <button
                type="button"
                className="inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink-400 hover:bg-cream-100 hover:text-ink-700"
                aria-label={t('common.clearDate')}
                onMouseDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation()
                  onChange(undefined)
                }}
              >
                <X className="size-4" aria-hidden />
              </button>
            ) : null}
            <CalendarDays className="pointer-events-none size-4 shrink-0 text-teal-600" aria-hidden />
          </div>
        )}
        onChange={(date: DateObject | DateObject[] | null) => {
          if (!date || Array.isArray(date)) {
            onChange(undefined)
            return
          }
          onChange(toIsoDateOnly(date))
        }}
      />
      {showHijri ? <DateEquivalents value={value} /> : null}
    </div>
  )
}
