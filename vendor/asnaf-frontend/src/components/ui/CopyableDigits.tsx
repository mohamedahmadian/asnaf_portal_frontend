import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { copyText } from '../../lib/clipboard'
import { localizeDigits, toLatinDigits } from '../../lib/datetime'

export function useCopyDigits() {
  const { t } = useTranslation()
  return (raw?: string | null) => {
    const latin = raw ? toLatinDigits(raw).trim() : ''
    if (!latin) return
    void copyText(latin)
      .then(() => toast.success(t('common.copied')))
      .catch(() => toast.error(t('common.error')))
  }
}

export function CopyableDigits({
  value,
  empty = '—',
  className = '',
}: {
  value?: string | null
  empty?: ReactNode
  className?: string
}) {
  const { t, i18n } = useTranslation()
  const copyDigits = useCopyDigits()
  const locale = i18n.language.split('-')[0] ?? 'fa'
  const latin = value ? toLatinDigits(value).trim() : ''
  if (!latin) return empty

  const displayed = localizeDigits(latin, locale)

  return (
    <button
      type="button"
      dir="ltr"
      className={`inline cursor-pointer rounded-md border-0 bg-transparent p-0 text-start text-inherit [font:inherit] hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 ${className}`}
      title={t('common.copy')}
      aria-label={`${t('common.copy')} ${displayed}`}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        copyDigits(latin)
      }}
    >
      {displayed}
    </button>
  )
}
