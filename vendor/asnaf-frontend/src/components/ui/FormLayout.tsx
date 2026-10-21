import type { LucideIcon } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { peekDetailEditTo } from '../../hooks/useDetailEditTo'
import { CopyableDigits, useCopyDigits } from './CopyableDigits'

export const cardClassName =
  'rounded-[22px] border border-white bg-white shadow-[0_10px_30px_rgba(20,40,40,0.05)]'

export type FormTone = 'teal' | 'mint' | 'ink' | 'red'

export const formToneClass: Record<FormTone, { wrap: string; icon: string; factIcon: string }> = {
  teal: {
    wrap: 'border-teal-100 bg-gradient-to-b from-teal-50 to-white',
    icon: 'bg-teal-500 text-white shadow-[0_8px_16px_rgba(46,189,182,0.28)]',
    factIcon: 'bg-teal-100 text-teal-500',
  },
  mint: {
    wrap: 'border-mint-100 bg-gradient-to-b from-mint-50 to-white',
    icon: 'bg-mint-500 text-white shadow-[0_8px_16px_rgba(63,214,190),0.24)]',
    factIcon: 'bg-mint-100 text-mint-500',
  },
  ink: {
    wrap: 'border-line bg-gradient-to-b from-cream-50 to-white',
    icon: 'bg-ink-700 text-white',
    factIcon: 'bg-cream-100 text-ink-500',
  },
  red: {
    wrap: 'border-red-300 bg-gradient-to-b from-red-50 to-white',
    icon: 'bg-red-500 text-white shadow-[0_8px_16px_rgba(239,68,68,0.24)]',
    factIcon: 'bg-red-100 text-red-600',
  },
}

/** Body padding inside FormCard (around AppForm fields). */
export const formCardBodyClassName = 'space-y-4 p-5 sm:p-6'

function isFormCardInteractiveTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false
  return Boolean(
    target.closest(
      'a, button, input, textarea, select, [role="button"], [role="dialog"], [data-nested-dialog], [data-enter-ignore], .leaflet-container',
    ),
  )
}

/**
 * Soft admin card with teal/mint gradient header.
 * Wrap every CRUD / entry form (and detail sections) with this shell.
 */
export function FormCard({
  icon,
  iconImageUrl,
  title,
  titleExtra,
  subtitle,
  chips,
  action,
  children,
  className = '',
  headerClassName,
  editTo,
  onDoubleClick,
  onClick,
}: {
  icon: LucideIcon
  /** تصویر (مثلاً عکس پرسنلی) به‌جای آیکون در کاشی هدر؛ اگر لود نشود همان آیکون می‌ماند */
  iconImageUrl?: string | null
  title: ReactNode
  titleExtra?: ReactNode
  subtitle?: ReactNode
  chips?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
  headerClassName?: string
  /** دابل‌کلیک کارت جزئیات → ویرایش؛ اگر نیاید از `DetailActions` خوانده می‌شود */
  editTo?: string
  onDoubleClick?: () => void
  /** کلیک روی بدنهٔ کارت؛ دکمه، لینک و کپی از آن جدا هستند */
  onClick?: () => void
}) {
  const navigate = useNavigate()
  return (
    <section
      className={`${cardClassName} overflow-hidden ${
        onClick
          ? 'cursor-pointer transition hover:ring-2 hover:ring-teal-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300'
          : ''
      } ${className}`}
      tabIndex={onClick ? 0 : undefined}
      onClick={(event) => {
        if (!onClick || isFormCardInteractiveTarget(event.target)) return
        onClick()
      }}
      onKeyDown={(event) => {
        if (!onClick || event.target !== event.currentTarget) return
        if (event.key !== 'Enter' && event.key !== ' ') return
        event.preventDefault()
        onClick()
      }}
      onDoubleClick={(event) => {
        if (isFormCardInteractiveTarget(event.target)) return
        if (onDoubleClick) {
          onDoubleClick()
          return
        }
        if (onClick) return
        const to = editTo ?? peekDetailEditTo()
        if (to) navigate(to)
      }}
    >
      <FormCardHeader
        icon={icon}
        iconImageUrl={iconImageUrl}
        title={title}
        titleExtra={titleExtra}
        subtitle={subtitle}
        chips={chips}
        action={action}
        className={headerClassName}
      />
      {children}
    </section>
  )
}

/** Soft blobs for shared teal/mint card headers. */
export function FormCardHeaderDecor() {
  return (
    <>
      <div
        className="pointer-events-none absolute -start-8 -top-10 size-32 rounded-full bg-teal-200/30"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -end-6 -bottom-12 size-28 rounded-full bg-mint-100/70"
        aria-hidden
      />
    </>
  )
}

export function FormCardHeader({
  icon: Icon,
  iconImageUrl,
  title,
  titleExtra,
  subtitle,
  chips,
  action,
  heading = 'h2',
  leading,
  className = '',
}: {
  icon: LucideIcon
  iconImageUrl?: string | null
  title: ReactNode
  titleExtra?: ReactNode
  subtitle?: ReactNode
  chips?: ReactNode
  action?: ReactNode
  heading?: 'h1' | 'h2'
  leading?: ReactNode
  className?: string
}) {
  const Heading = heading
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null)
  const imageUrl = iconImageUrl && iconImageUrl !== failedImageUrl ? iconImageUrl : null
  const titleClass =
    heading === 'h1'
      ? 'text-xl font-semibold leading-snug text-ink-900 sm:text-2xl'
      : 'text-base font-semibold leading-snug text-ink-900'
  const subtitleClass =
    heading === 'h1' ? 'mt-1 text-sm leading-6 text-ink-500' : 'mt-0.5 text-xs leading-5 text-ink-600'
  return (
    <header className={`relative shrink-0 overflow-hidden bg-gradient-to-e from-mint-50 via-white to-teal-50 px-5 py-5 sm:px-6 ${className}`}>
      <FormCardHeaderDecor />
      <div className="relative flex flex-wrap items-center justify-between gap-3 sm:flex-nowrap">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {leading}
          <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-teal-500 text-white shadow-[0_10px_22px_rgba(46,189,182,0.32)]">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt=""
                draggable={false}
                className="size-full object-cover"
                onError={() => setFailedImageUrl(imageUrl)}
              />
            ) : (
              <Icon className="size-6" aria-hidden />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <Heading className={titleClass}>{title}</Heading>
              {titleExtra}
            </div>
            {subtitle ? <div className={subtitleClass}>{subtitle}</div> : null}
            {chips ? <div className="mt-3 flex flex-wrap gap-1.5">{chips}</div> : null}
          </div>
        </div>
        {action ? <div className="relative z-10 flex shrink-0 items-center self-stretch">{action}</div> : null}
      </div>
    </header>
  )
}

export function FormMetaChip({
  icon: Icon,
  label,
  copyValue,
}: {
  icon: LucideIcon
  label?: ReactNode
  copyValue?: string | null
}) {
  const copyDigits = useCopyDigits()
  const canCopy = Boolean(copyValue)
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-ink-700 shadow-[0_4px_10px_rgba(20,40,40,0.05)] ring-1 ring-teal-100 ${
        canCopy ? 'cursor-pointer' : ''
      }`}
      onClick={canCopy ? () => copyDigits(copyValue) : undefined}
    >
      <Icon className="size-3 text-teal-600" aria-hidden />
      {copyValue ? <CopyableDigits value={copyValue} /> : label}
    </span>
  )
}

export function FormSectionTitle({
  icon: Icon,
  children,
  className = 'mb-4',
  action,
}: {
  icon: LucideIcon
  children: ReactNode
  className?: string
  action?: ReactNode
}) {
  return (
    <h3
      className={`flex w-full items-center gap-3 border-b-2 border-teal-200 pb-3 text-base font-bold leading-6 text-ink-900 ${className}`}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-500 text-white shadow-[0_6px_14px_rgba(46,189,182,0.32)]">
        <Icon className="size-5" aria-hidden />
      </span>
      <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">{children}</span>
      {action ? <span className="shrink-0">{action}</span> : null}
    </h3>
  )
}

export function FormFactTile({
  icon: Icon,
  label,
  value,
  copyValue,
  empty,
  tone = 'teal',
  compact = false,
  className = '',
  onClick,
  action,
}: {
  icon: LucideIcon
  label: string
  value?: ReactNode
  copyValue?: string | null
  empty?: boolean
  tone?: FormTone
  compact?: boolean
  className?: string
  onClick?: () => void
  action?: ReactNode
}) {
  const colors = formToneClass[tone]
  const copyDigits = useCopyDigits()
  const usingCopy = copyValue !== undefined && !onClick
  const canCopy = Boolean(copyValue) && !onClick
  const isEmpty = empty ?? (copyValue !== undefined && !copyValue)
  const display = usingCopy ? <CopyableDigits value={copyValue} /> : value
  return (
    <article
      className={`relative z-10 flex min-w-0 ${action ? 'items-center' : 'items-start'} overflow-hidden rounded-2xl border ${colors.wrap} ${
        compact ? 'gap-2 px-2.5 py-1.5' : 'gap-3 px-3 py-3'
      } ${canCopy || onClick ? 'cursor-pointer' : ''} ${onClick ? 'transition hover:ring-2 hover:ring-teal-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300' : ''} ${className}`}
      data-enter-ignore={canCopy || onClick ? '' : undefined}
      role={onClick ? 'link' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick ?? (canCopy ? () => copyDigits(copyValue) : undefined)}
      onKeyDown={
        onClick
          ? (event) => {
              if (event.key !== 'Enter' && event.key !== ' ') return
              event.preventDefault()
              onClick()
            }
          : undefined
      }
    >
      <span
        className={`flex shrink-0 items-center justify-center ${colors.factIcon} ${
          compact ? 'mt-px size-7 rounded-lg' : 'mt-0.5 size-8 rounded-xl'
        }`}
      >
        <Icon className={compact ? 'size-3.5' : 'size-4'} aria-hidden />
      </span>
      <div className={`min-w-0 ${action ? 'flex-1' : ''}`}>
        <p className="text-[11px] font-medium text-ink-500">{label}</p>
        <div
          className={`font-semibold break-words ${compact ? 'mt-px text-[13px]' : 'mt-0.5 text-sm'} ${
            isEmpty ? 'text-ink-400' : 'text-ink-900'
          }`}
        >
          {display}
        </div>
      </div>
      {action ? <div className="ms-auto shrink-0 self-center">{action}</div> : null}
    </article>
  )
}

export function FormEmptyHint({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-line bg-cream-50 px-4 py-6 text-center text-sm text-ink-400">
      {children}
    </p>
  )
}
