import { BadgeCheck, Briefcase, Building2, Check, UserRound, type LucideIcon } from 'lucide-react'
import { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { CopyableDigits } from '../../components/ui/CopyableDigits'
import { formatNumber } from '../../lib/datetime'
import type { TFunction } from 'i18next'
import { AUCTION_WIZARD_STEPS } from './auction'

export function auctionIssueButtonLabel(t: TFunction, locale: string, name: string, count: number) {
  const personName = name.trim()
  if (!personName) return t('cases.auction.issueLicense')
  return t('cases.auction.issueButton', { name: personName, count: formatNumber(count, locale) })
}

function HeaderBadge({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon
  label: string
  children: ReactNode
}) {
  return (
    <span
      className="inline-flex max-w-full flex-wrap items-center gap-x-1.5 gap-y-0.5 rounded-2xl bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-800"
      aria-label={label}
    >
      <Icon className="size-4 shrink-0" aria-hidden />
      <span className="min-w-0">{children}</span>
    </span>
  )
}

export function AuctionCaseSubtitle({
  firstName,
  lastName,
  fullName,
  jobTitle,
  businessUnitTitle,
  licenseNumber,
}: {
  firstName?: string | null
  lastName?: string | null
  fullName?: string | null
  jobTitle?: string | null
  businessUnitTitle?: string | null
  licenseNumber?: string | null
}) {
  const { t } = useTranslation()
  const personName = [firstName, lastName].filter(Boolean).join(' ') || fullName?.trim() || ''
  if (!personName && !jobTitle && !businessUnitTitle && !licenseNumber) return null
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {personName ? <HeaderBadge icon={UserRound} label={t('users.fullName')}>{personName}</HeaderBadge> : null}
      {jobTitle ? <HeaderBadge icon={Briefcase} label={t('cases.job')}>{jobTitle}</HeaderBadge> : null}
      {businessUnitTitle ? (
        <HeaderBadge icon={Building2} label={t('cases.unitTitle')}>{businessUnitTitle}</HeaderBadge>
      ) : null}
      {licenseNumber ? (
        <HeaderBadge icon={BadgeCheck} label={t('cases.licenseNumber')}>
          <CopyableDigits value={licenseNumber} />
        </HeaderBadge>
      ) : null}
    </span>
  )
}

export function AuctionStepRing({
  currentLabel,
  totalLabel,
  ratio,
  label,
}: {
  currentLabel: string
  totalLabel: string
  ratio: number
  label: string
}) {
  const size = 56
  const stroke = 5.5
  const radius = (size - stroke) / 2
  const circ = 2 * Math.PI * radius
  const clamped = Math.min(1, Math.max(0, ratio))
  const dash = circ * clamped
  return (
    <div className="relative size-14 shrink-0" role="img" aria-label={label}>
      <svg viewBox={`0 0 ${size} ${size}`} className="size-14 -rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" className="stroke-teal-100" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="stroke-teal-500"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ - dash}`}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold leading-none text-teal-800" aria-hidden>
        {currentLabel}
        <span className="px-px text-ink-400">/</span>
        {totalLabel}
      </span>
    </div>
  )
}

export function AuctionWizardNav({
  view,
  reached,
  finished = false,
  onStep,
}: {
  view: number
  reached: number
  finished?: boolean
  onStep: (index: number) => void
}) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language.split('-')[0] ?? 'fa'
  return (
    <ol className="mb-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
      {AUCTION_WIZARD_STEPS.map((name, index) => {
        const done = index < reached || (finished && index <= reached)
        const current = index === reached && !finished
        const open = done || current
        const tone = done
          ? 'cursor-pointer border-emerald-400 bg-white text-ink-800'
          : current
            ? 'case-step-done-pulse cursor-pointer border-emerald-500 bg-white text-ink-800'
            : 'cursor-default border-line bg-white text-ink-400'
        return (
          <li key={name}>
            <button
              type="button"
              disabled={!open}
              onClick={() => onStep(index)}
              className={`relative flex h-full min-h-[4.75rem] w-full flex-col items-center justify-center gap-1.5 rounded-2xl border-2 px-3 py-3 text-center text-sm ${tone} ${
                index === view && !current ? 'ring-2 ring-teal-300' : ''
              }`}
            >
              {done ? (
                <span className="case-step-check absolute top-1.5 end-1.5 inline-flex size-4 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <Check className="size-2.5" strokeWidth={3} aria-hidden />
                </span>
              ) : null}
              <span
                className={`inline-flex size-6 shrink-0 items-center justify-center rounded-full border-2 text-xs ${
                  current
                    ? 'case-step-num-pulse border-emerald-500 bg-emerald-500 text-white'
                    : done
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-transparent bg-cream-100 text-ink-700'
                }`}
              >
                {formatNumber(index + 1, locale)}
              </span>
              <span className="text-center leading-5">{t(`cases.auction.wizardSteps.${name}`)}</span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}
