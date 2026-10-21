import { Clock3 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { DateText } from '../../components/ui/DateText'
import { inquiryElapsedLabel } from './inquiry-elapsed'

export function InquiryDateBadge({ value, tone }: { value?: string | null; tone: 'teal' | 'mint' }) {
  if (!value) return '—'
  const toneClass =
    tone === 'mint' ? 'bg-mint-50 text-teal-900 ring-mint-200' : 'bg-white text-teal-900 ring-teal-200'
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${toneClass}`}>
      <DateText value={value} withTime />
    </span>
  )
}

export function InquiryElapsedBadge({
  from,
  to,
  locale,
}: {
  from?: string | null
  to?: string | null
  locale: string
}) {
  const { t } = useTranslation()
  if (!from) return null
  const label = inquiryElapsedLabel(from, to ?? new Date().toISOString(), t, locale)
  if (!label) return null
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-900 ring-1 ring-teal-200">
      <Clock3 className="size-3 shrink-0" aria-hidden />
      {label}
    </span>
  )
}

export function InquiryDecidedAtValue({
  from,
  at,
  locale,
}: {
  from?: string | null
  at?: string | null
  locale: string
}) {
  return (
    <span className="flex flex-wrap items-center gap-2">
      {at ? <DateText value={at} withTime /> : null}
      <InquiryElapsedBadge from={from} to={at} locale={locale} />
    </span>
  )
}
