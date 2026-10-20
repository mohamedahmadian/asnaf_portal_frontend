import {
  ArrowRight,
  BadgeCheck,
  BadgePercent,
  Building2,
  CalendarClock,
  CalendarDays,
  Check,
  CircleCheck,
  CircleUserRound,
  CircleX,
  Clock3,
  FileText,
  Gavel,
  Landmark,
  Heading,
  Package,
  Paperclip,
  Percent,
  Plus,
  Trash2,
  UserRound,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { AmountInput } from '../../../frontend/src/components/ui/AmountInput'
import { DateText } from '../../../frontend/src/components/ui/DateText'
import {
  AppForm,
  Button,
  FormField,
  caseShellClassName,
  fieldClassName,
} from '../../../frontend/src/components/ui/Form'
import {
  FormCard,
  FormCardHeader,
  FormFactTile,
  FormSectionTitle,
  cardClassName,
  formCardBodyClassName,
} from '../../../frontend/src/components/ui/FormLayout'
import { LoadingState } from '../../../frontend/src/components/ui/LoadingState'
import { PersianDateField } from '../../../frontend/src/components/ui/PersianDateField'
import { AuctionCaseSubtitle, AuctionStepRing, AuctionWizardNav } from '../../../frontend/src/pages/cases/AuctionWizard'
import { InquiryElapsedBadge } from '../../../frontend/src/pages/cases/InquiryDateBadges'
import {
  AUCTION_WIZARD_STEPS,
  auctionWizardFinished,
  auctionWizardReached,
  priceAfterDiscount,
  type AuctionWizardStep,
} from '../../../frontend/src/pages/cases/auction'
import { formatGroupedNumber, formatNumber, localizeDigits, parseGroupedAmount, toLatinDigits } from '../../../frontend/src/lib/datetime'
import { PortalLetterButtons, PortalLettersToolbar } from '../components/PortalLetters'
import { getApiErrorMessage, portalApi } from '../lib/api'
import type { CaseDetail, PortalRenewalReview } from '../types/portal'

type ItemDraft = {
  key: string
  name: string
  price: string
  discountPercent: string
}

type AuctionReviewFile = {
  id: string
  originalName: string | null
  mimeType: string
  byteSize: number
}

type AuctionReview = {
  id: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  note: string | null
  referredAt: string
  decidedAt: string | null
  decidedBy: { id: string; fullName: string } | null
  title: string
  people: { id: string; fullName: string }[]
  files: AuctionReviewFile[]
}

type PortalAuctionRequest = {
  id: string
  caseId: string
  number: string
  status: 'OPEN' | 'ISSUED' | 'COMPLETED' | 'REJECTED' | 'CANCELLED'
  editable: boolean
  phase: number
  awaitingIntake?: boolean
  title: string | null
  startsAt: string
  endsAt: string
  discountMin: number
  discountMax: number
  items: {
    id: string
    name: string
    price: number
    discountPercent: number
    priceAfterDiscount: number
  }[]
  inquiries: Array<PortalRenewalReview & { inquiryCenter: { name: string } }>
  placesReview: PortalRenewalReview | null
  reviews: AuctionReview[]
  caseFile: {
    businessUnitTitle: string | null
    licenseNumber: string | null
    jobTitle: string | null
    person: { firstName: string; lastName: string; fullName: string }
  }
}

function emptyItem(): ItemDraft {
  return { key: crypto.randomUUID(), name: '', price: '', discountPercent: '' }
}

function parsePercent(raw: string) {
  const normalized = toLatinDigits(raw).trim().replace(/,/g, '.').replace(/٬/g, '')
  if (!normalized) return null
  const value = Number(normalized)
  if (!Number.isFinite(value)) return null
  return Math.round(value * 100) / 100
}

function hundredths(value: number) {
  return Math.round(value * 100)
}

function itemNameKey(name: string) {
  return name
    .trim()
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/\s+/g, ' ')
    .toLowerCase()
}

function percentText(value: number, locale: string) {
  const rounded = Math.round(value * 100) / 100
  const text = Number.isInteger(rounded) ? String(rounded) : String(rounded)
  return `${localizeDigits(text, locale)}٪`
}

function wizardStepIndex(value: string | null) {
  const index = AUCTION_WIZARD_STEPS.indexOf(value as AuctionWizardStep)
  return index >= 0 ? index : null
}

function PageHeader({
  icon,
  title,
  titleExtra,
  subtitle,
  backTo,
}: {
  icon: LucideIcon
  title: string
  titleExtra?: ReactNode
  subtitle?: ReactNode
  backTo: string
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (document.querySelector('[aria-modal="true"], [role="listbox"], .rmdp-wrapper')) return
      event.preventDefault()
      navigate(backTo)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [backTo, navigate])
  return (
    <section className={`${cardClassName} mb-6 overflow-hidden`}>
      <FormCardHeader
        icon={icon}
        heading="h1"
        title={title}
        titleExtra={titleExtra}
        subtitle={subtitle}
        leading={
          <Link
            to={backTo}
            aria-label={t('common.back')}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-2xl text-teal-700 transition hover:bg-teal-50"
          >
            <ArrowRight className="size-5" aria-hidden />
          </Link>
        }
      />
    </section>
  )
}

function AuctionFormActions({
  submitting,
  onCancel,
}: {
  submitting: boolean
  onCancel: () => void
}) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <Button type="submit" disabled={submitting}>
        <Check className="size-4" aria-hidden />
        {t('common.save')}
      </Button>
      <Button type="button" variant="ghost" data-form-cancel onClick={onCancel}>
        <X className="size-4" aria-hidden />
        {t('common.cancel')}
      </Button>
    </div>
  )
}

function AuctionPageHeader({
  finished,
  reached,
  caseFile,
  backTo,
}: {
  finished: boolean
  reached: number
  backTo: string
  caseFile?: PortalAuctionRequest['caseFile'] | CaseDetail
}) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language.split('-')[0] ?? 'fa'
  const stepCurrent = Math.min(reached + 1, AUCTION_WIZARD_STEPS.length)
  const stepTotal = AUCTION_WIZARD_STEPS.length
  const person = 'person' in (caseFile ?? {}) ? (caseFile as PortalAuctionRequest['caseFile']).person : undefined
  const detail = caseFile as CaseDetail | undefined
  return (
    <PageHeader
      icon={Gavel}
      title={finished ? t('cases.auction.title') : t('cases.auction.wizardTitle')}
      titleExtra={
        <AuctionStepRing
          currentLabel={formatNumber(stepCurrent, locale)}
          totalLabel={formatNumber(stepTotal, locale)}
          ratio={stepCurrent / stepTotal}
          label={t('cases.stepOf', {
            current: formatNumber(stepCurrent, locale),
            total: formatNumber(stepTotal, locale),
          })}
        />
      }
      subtitle={
        caseFile ? (
          <AuctionCaseSubtitle
            firstName={person?.firstName}
            lastName={person?.lastName}
            fullName={person?.fullName || detail?.ownerName}
            jobTitle={
              ('jobTitle' in caseFile ? caseFile.jobTitle : undefined) ||
              detail?.job?.title ||
              detail?.activityJob?.title
            }
            businessUnitTitle={caseFile.businessUnitTitle}
            licenseNumber={caseFile.licenseNumber}
          />
        ) : undefined
      }
      backTo={backTo}
    />
  )
}

function AuctionItemsSummary({ item, locale }: { item: PortalAuctionRequest; locale: string }) {
  const { t } = useTranslation()
  return (
    <>
      <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
        <FormFactTile
          className="sm:col-span-2"
          icon={Heading}
          label={t('cases.auction.licenseTitle')}
          value={item.title?.trim() || t('cases.auction.title')}
        />
        <FormFactTile icon={CalendarDays} label={t('cases.auction.startsAt')} value={<DateText value={item.startsAt} />} />
        <FormFactTile icon={CalendarDays} label={t('cases.auction.endsAt')} value={<DateText value={item.endsAt} />} />
        <FormFactTile icon={Percent} label={t('cases.auction.discountFrom')} value={percentText(item.discountMin, locale)} />
        <FormFactTile icon={Percent} label={t('cases.auction.discountTo')} value={percentText(item.discountMax, locale)} tone="mint" />
      </div>
      <FormSectionTitle icon={Package}>{t('cases.auction.items')}</FormSectionTitle>
      <div className="overflow-x-auto rounded-2xl border border-teal-100">
        <table className="w-full text-sm">
          <thead className="bg-cream-50 text-ink-700">
            <tr>
              <th className="px-4 py-3 text-start font-medium">{t('cases.auction.itemName')}</th>
              <th className="px-4 py-3 text-start font-medium">{t('cases.auction.itemPrice')}</th>
              <th className="px-4 py-3 text-start font-medium">{t('cases.auction.itemDiscount')}</th>
              <th className="px-4 py-3 text-start font-medium">{t('cases.auction.itemPriceAfter')}</th>
            </tr>
          </thead>
          <tbody>
            {item.items.map((row) => (
              <tr key={row.id} className="border-t border-line">
                <td className="px-4 py-3">{row.name}</td>
                <td className="px-4 py-3">{formatGroupedNumber(row.price, locale)}</td>
                <td className="px-4 py-3">{percentText(row.discountPercent, locale)}</td>
                <td className="px-4 py-3">{formatGroupedNumber(row.priceAfterDiscount, locale)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

function inquiryStatusMeta(status: string): { icon: LucideIcon; badge: string } {
  if (status === 'APPROVED') return { icon: CircleCheck, badge: 'bg-teal-50 text-teal-800 ring-teal-200' }
  if (status === 'REJECTED') return { icon: CircleX, badge: 'bg-red-50 text-red-700 ring-red-200' }
  return { icon: Clock3, badge: 'bg-amber-50 text-amber-800 ring-amber-200' }
}

function DateTimeValue({ value }: { value: string }) {
  return <DateText value={value} withTime />
}

function AuctionReviewCard({
  review,
  hrefOf,
}: {
  review: AuctionReview
  hrefOf: (fileId: string) => string
}) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language.split('-')[0] ?? 'fa'
  const status = inquiryStatusMeta(review.status)
  const StatusIcon = status.icon
  return (
    <article className="overflow-hidden rounded-2xl border border-teal-100 bg-white shadow-[0_8px_20px_rgba(46,189,182,0.08)]">
      <header className="flex items-center gap-3 bg-gradient-to-e from-teal-50 via-white to-mint-50 px-4 py-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-teal-500 text-white shadow-[0_6px_14px_rgba(46,189,182,0.32)]">
          <CircleUserRound className="size-5" aria-hidden />
        </span>
        <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-ink-900">{review.title}</h3>
      </header>
      <div className="space-y-4 p-4">
        {review.people.length ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {review.people.map((person) => (
              <FormFactTile key={person.id} icon={UserRound} label={t('users.fullName')} value={person.fullName} tone="mint" />
            ))}
          </div>
        ) : null}
        <div className="grid gap-2 sm:grid-cols-2">
          <FormFactTile icon={CalendarClock} label={t('issuance.referredAt')} value={<DateTimeValue value={review.referredAt} />} />
          <FormFactTile
            icon={CalendarDays}
            label={t('issuance.decidedAt')}
            tone="mint"
            value={
              <span className="flex flex-wrap items-center gap-2">
                {review.decidedAt ? <DateTimeValue value={review.decidedAt} /> : null}
                <InquiryElapsedBadge from={review.referredAt} to={review.decidedAt} locale={locale} />
              </span>
            }
          />
          <FormFactTile icon={UserRound} label={t('issuance.decidedBy')} value={review.decidedBy?.fullName} />
          <FormFactTile
            icon={StatusIcon}
            label={t('issuance.status')}
            tone="mint"
            value={
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${status.badge}`}>
                <StatusIcon className="size-3.5" aria-hidden />
                {t(`status.${review.status}`)}
              </span>
            }
          />
        </div>
        {review.note ? <FormFactTile icon={FileText} label={t('cases.auction.note')} value={review.note} className="sm:col-span-2" /> : null}
        {review.files.length ? (
          <div className="space-y-3">
            <FormSectionTitle icon={Paperclip} className="mb-0">
              {t('issuance.attachments')}
            </FormSectionTitle>
            <div className="flex flex-wrap gap-2">
              {review.files.map((file) => (
                <ReviewFileButton key={file.id} href={hrefOf(file.id)} name={file.originalName || t('cases.inquiryAttachment')} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </article>
  )
}

function ProcessReviewCard({
  title,
  icon: Icon,
  review,
  hrefOf,
  letterUrl,
}: {
  title: string
  icon: LucideIcon
  review: PortalRenewalReview
  hrefOf: (fileId: string) => string
  letterUrl: string
}) {
  const { t } = useTranslation()
  const status = inquiryStatusMeta(review.status)
  const StatusIcon = status.icon
  return (
    <article className="overflow-hidden rounded-2xl border border-teal-100 bg-white shadow-[0_8px_20px_rgba(46,189,182,0.08)]">
      <header className="flex items-center gap-3 bg-gradient-to-e from-teal-50 via-white to-mint-50 px-4 py-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-teal-500 text-white shadow-[0_6px_14px_rgba(46,189,182,0.32)]">
          <Icon className="size-5" aria-hidden />
        </span>
        <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-ink-900">{title}</h3>
      </header>
      <div className="space-y-4 p-4">
        <PortalLetterButtons letterUrl={letterUrl} />
        <div className="grid gap-2 sm:grid-cols-2">
          <FormFactTile
            icon={CalendarClock}
            label={t('issuance.referredAt')}
            value={review.referredAt ? <DateTimeValue value={review.referredAt} /> : undefined}
          />
          <FormFactTile
            icon={CalendarDays}
            label={t('issuance.decidedAt')}
            tone="mint"
            value={review.decidedAt ? <DateTimeValue value={review.decidedAt} /> : undefined}
          />
          <FormFactTile icon={UserRound} label={t('issuance.decidedBy')} value={review.decidedBy?.fullName} />
          <FormFactTile
            icon={StatusIcon}
            label={t('issuance.status')}
            tone="mint"
            value={
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${status.badge}`}>
                <StatusIcon className="size-3.5" aria-hidden />
                {t(`status.${review.status}`)}
              </span>
            }
          />
        </div>
        {review.note ? <FormFactTile icon={FileText} label={t('cases.auction.note')} value={review.note} /> : null}
        {review.files.length ? (
          <div className="flex flex-wrap gap-2">
            {review.files.map((file) => (
              <ReviewFileButton key={file.id} href={hrefOf(file.id)} name={file.originalName || t('cases.inquiryAttachment')} />
            ))}
          </div>
        ) : null}
      </div>
    </article>
  )
}

function ReviewFileButton({ href, name }: { href: string; name: string }) {
  const { t } = useTranslation()
  async function open() {
    try {
      const { data } = await portalApi.get<Blob>(href, { responseType: 'blob', timeout: 60_000 })
      const url = URL.createObjectURL(data)
      window.open(url, '_blank', 'noopener')
    } catch {
      toast.error(t('cases.attachmentFailed'))
    }
  }
  return (
    <button
      type="button"
      onClick={() => void open()}
      className="inline-flex max-w-full cursor-pointer items-center gap-1.5 rounded-2xl bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-800 ring-1 ring-teal-200"
    >
      <Paperclip className="size-3.5 shrink-0" aria-hidden />
      <span className="truncate">{name}</span>
    </button>
  )
}

function AuctionRequestForm({
  caseId,
  request,
  onSaved,
  onCancel,
}: {
  caseId: string
  request?: PortalAuctionRequest
  onSaved: (saved: PortalAuctionRequest) => void
  onCancel: () => void
}) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language.split('-')[0] ?? 'fa'
  const defaultTitle = t('cases.auction.title')
  const [title, setTitle] = useState(request?.title?.trim() || defaultTitle)
  const [startsAt, setStartsAt] = useState(request?.startsAt ?? '')
  const [endsAt, setEndsAt] = useState(request?.endsAt ?? '')
  const [discountMin, setDiscountMin] = useState(request ? String(request.discountMin) : '')
  const [discountMax, setDiscountMax] = useState(request ? String(request.discountMax) : '')
  const [items, setItems] = useState<ItemDraft[]>(
    request?.items.length
      ? request.items.map((item) => ({
          key: item.id,
          name: item.name,
          price: String(item.price),
          discountPercent: String(item.discountPercent),
        }))
      : [emptyItem()],
  )
  const [saving, setSaving] = useState(false)

  function patchItem(key: string, patch: Partial<ItemDraft>) {
    setItems((current) => current.map((item) => (item.key === key ? { ...item, ...patch } : item)))
  }

  function discountBounds() {
    const min = parsePercent(discountMin)
    const max = parsePercent(discountMax)
    if (min == null || max == null || hundredths(max) < hundredths(min)) return null
    return { min, max }
  }

  function discountViolation(raw: string) {
    const percent = parsePercent(raw)
    const range = discountBounds()
    if (percent == null || !range) return null
    if (hundredths(percent) < hundredths(range.min)) return 'low' as const
    if (hundredths(percent) > hundredths(range.max)) return 'high' as const
    return null
  }

  function duplicateItemName(key: string, raw: string) {
    const name = itemNameKey(raw)
    if (!name) return false
    return items.some((row) => row.key !== key && itemNameKey(row.name) === name)
  }

  function focusItemField(id: string) {
    window.setTimeout(() => {
      const input = document.getElementById(id)
      if (!(input instanceof HTMLInputElement)) return
      input.focus()
      input.select()
    }, 0)
  }

  function warnDuplicateName(key: string) {
    toast.error(t('cases.auction.itemNameDuplicate'), { id: 'auction-item-name-duplicate' })
    focusItemField(`auctionItemName-${key}`)
    return true
  }

  function warnItemDiscount(key: string) {
    const range = discountBounds()
    if (!range) return false
    toast.error(
      t('cases.auction.itemDiscountRange', {
        min: localizeDigits(String(range.min), locale),
        max: localizeDigits(String(range.max), locale),
      }),
      { id: 'auction-item-discount-range' },
    )
    focusItemField(`auctionItemDiscount-${key}`)
    return true
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    const min = parsePercent(discountMin)
    const max = parsePercent(discountMax)
    if (!startsAt || !endsAt || min == null || max == null) {
      toast.error(t('cases.auction.required'))
      return
    }
    if (endsAt < startsAt) {
      toast.error(t('cases.auction.dateOrder'))
      return
    }
    if (hundredths(max) < hundredths(min)) {
      toast.error(t('cases.auction.discountOrder'))
      return
    }
    const payloadItems = []
    const names = new Set<string>()
    for (const item of items) {
      const price = parseGroupedAmount(item.price)
      const discountPercent = parsePercent(item.discountPercent)
      const nameKey = itemNameKey(item.name)
      if (nameKey && names.has(nameKey)) {
        warnDuplicateName(item.key)
        return
      }
      if (nameKey) names.add(nameKey)
      if (!item.name.trim() || price == null || price < 1 || discountPercent == null) {
        toast.error(t('cases.auction.required'))
        return
      }
      if (hundredths(discountPercent) < hundredths(min) || hundredths(discountPercent) > hundredths(max)) {
        warnItemDiscount(item.key)
        return
      }
      payloadItems.push({ name: item.name.trim(), price, discountPercent })
    }
    setSaving(true)
    try {
      const body = { title: title.trim() || null, startsAt, endsAt, discountMin: min, discountMax: max, items: payloadItems }
      const saved = request
        ? (await portalApi.patch<PortalAuctionRequest>(`/cases/${caseId}/auction/${request.id}`, body)).data
        : (await portalApi.post<PortalAuctionRequest>(`/cases/${caseId}/auction`, body)).data
      toast.success(t(request ? 'cases.auction.updated' : 'cases.auction.saved'))
      onSaved(saved)
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('app.error')))
    } finally {
      setSaving(false)
    }
  }

  return (
    <FormCard
      icon={Gavel}
      title={t('cases.auction.wizardSteps.request')}
      subtitle={request ? undefined : t('cases.auction.createSubtitle')}
    >
      <AppForm onSubmit={submit} className={formCardBodyClassName}>
        <FormField icon={Heading} label={t('cases.auction.licenseTitle')} htmlFor="auctionTitle">
          <input
            id="auctionTitle"
            className={fieldClassName}
            value={title}
            maxLength={200}
            onChange={(event) => setTitle(event.target.value)}
          />
        </FormField>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField icon={CalendarDays} label={t('cases.auction.startsAt')} htmlFor="auctionStartsAt">
            <PersianDateField id="auctionStartsAt" value={startsAt} onChange={(value) => setStartsAt(value ?? '')} maxDate={endsAt || undefined} />
            <input className="sr-only" tabIndex={-1} value={startsAt} required onChange={() => undefined} />
          </FormField>
          <FormField icon={CalendarDays} label={t('cases.auction.endsAt')} htmlFor="auctionEndsAt">
            <PersianDateField id="auctionEndsAt" value={endsAt} onChange={(value) => setEndsAt(value ?? '')} minDate={startsAt || undefined} />
            <input className="sr-only" tabIndex={-1} value={endsAt} required onChange={() => undefined} />
          </FormField>
          <FormField icon={Percent} label={t('cases.auction.discountFrom')} htmlFor="auctionDiscountMin">
            <input
              id="auctionDiscountMin"
              inputMode="decimal"
              autoComplete="off"
              className={`${fieldClassName} digit-field`}
              value={discountMin}
              onChange={(event) => setDiscountMin(event.target.value)}
              required
            />
          </FormField>
          <FormField icon={Percent} label={t('cases.auction.discountTo')} htmlFor="auctionDiscountMax">
            <input
              id="auctionDiscountMax"
              inputMode="decimal"
              autoComplete="off"
              className={`${fieldClassName} digit-field`}
              value={discountMax}
              onChange={(event) => setDiscountMax(event.target.value)}
              required
            />
          </FormField>
        </div>
        <FormSectionTitle icon={Package}>{t('cases.auction.items')}</FormSectionTitle>
        <div className="space-y-3">
          {items.map((item) => {
            const price = parseGroupedAmount(item.price)
            const percent = parsePercent(item.discountPercent)
            const after = price != null && percent != null ? priceAfterDiscount(price, percent) : null
            return (
              <div key={item.key} className="space-y-3 rounded-2xl border border-teal-100 bg-cream-50/40 p-3">
                <div className="grid gap-3 lg:grid-cols-4">
                  <FormField icon={Package} label={t('cases.auction.itemName')} htmlFor={`auctionItemName-${item.key}`}>
                    <input
                      id={`auctionItemName-${item.key}`}
                      className={fieldClassName}
                      value={item.name}
                      maxLength={200}
                      required
                      onChange={(event) => {
                        const value = event.target.value
                        patchItem(item.key, { name: value })
                        if (duplicateItemName(item.key, value)) warnDuplicateName(item.key)
                      }}
                      onBlur={(event) => {
                        const next = event.relatedTarget
                        if (next instanceof HTMLElement && next.closest('[data-form-cancel]')) return
                        if (duplicateItemName(item.key, event.currentTarget.value)) warnDuplicateName(item.key)
                      }}
                    />
                  </FormField>
                  <FormField icon={BadgePercent} label={t('cases.auction.itemPrice')} htmlFor={`auctionItemPrice-${item.key}`}>
                    <AmountInput
                      id={`auctionItemPrice-${item.key}`}
                      value={item.price}
                      required
                      onChange={(value) => patchItem(item.key, { price: value })}
                    />
                  </FormField>
                  <FormField icon={Percent} label={t('cases.auction.itemDiscount')} htmlFor={`auctionItemDiscount-${item.key}`}>
                    <input
                      id={`auctionItemDiscount-${item.key}`}
                      inputMode="decimal"
                      autoComplete="off"
                      className={`${fieldClassName} digit-field`}
                      value={item.discountPercent}
                      required
                      onChange={(event) => {
                        const value = event.target.value
                        patchItem(item.key, { discountPercent: value })
                        if (discountViolation(value) === 'high') warnItemDiscount(item.key)
                      }}
                      onBlur={(event) => {
                        const next = event.relatedTarget
                        if (next instanceof HTMLElement && next.closest('[data-form-cancel]')) return
                        if (discountViolation(event.currentTarget.value)) warnItemDiscount(item.key)
                      }}
                    />
                  </FormField>
                  <FormField icon={BadgePercent} label={t('cases.auction.itemPriceAfter')}>
                    <p className={`${fieldClassName} digit-field`} dir="ltr">
                      {after == null ? '—' : formatGroupedNumber(after, locale)}
                    </p>
                  </FormField>
                </div>
                {items.length > 1 ? (
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      aria-label={t('cases.auction.removeItem')}
                      onClick={() => setItems((current) => current.filter((row) => row.key !== item.key))}
                    >
                      <Trash2 className="size-4" aria-hidden />
                      {t('cases.auction.removeItem')}
                    </Button>
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
        <Button type="button" variant="ghost" onClick={() => setItems((current) => [...current, emptyItem()])}>
          <Plus className="size-4" aria-hidden />
          {t('cases.auction.addItem')}
        </Button>
        <AuctionFormActions submitting={saving} onCancel={onCancel} />
      </AppForm>
    </FormCard>
  )
}

export function PortalAuctionNewPage() {
  const { caseId = '' } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const redirected = useRef(false)
  const caseFile = useQuery({
    queryKey: ['case', caseId],
    enabled: Boolean(caseId),
    queryFn: () => portalApi.get<CaseDetail>(`/cases/${caseId}`).then(({ data }) => data),
  })

  useEffect(() => {
    const item = caseFile.data
    if (!item || redirected.current) return
    const open = item.requests.find((request) => request.status === 'OPEN')
    if (open?.type === 'AUCTION') {
      redirected.current = true
      navigate(`/cases/${caseId}/auction/${open.id}`, { replace: true })
      return
    }
    if (open) {
      redirected.current = true
      toast.error(t('cases.auction.openRequest'))
      navigate(`/cases/${caseId}`, { replace: true })
      return
    }
    if (!item.licenseNumber) {
      redirected.current = true
      toast.error(t('cases.auction.licenseRequired'))
      navigate(`/cases/${caseId}`, { replace: true })
      return
    }
    if (item.status === 'REVOKED' || item.status === 'EXPIRED') {
      redirected.current = true
      toast.error(t(item.status === 'REVOKED' ? 'cases.revokedNoRequest' : 'cases.expiredNoRequest'))
      navigate(`/cases/${caseId}`, { replace: true })
    }
  }, [caseFile.data, caseId, navigate, t])

  return (
    <div className={caseShellClassName}>
      <AuctionPageHeader finished={false} reached={0} caseFile={caseFile.data} backTo={`/cases/${caseId}`} />
      <AuctionWizardNav view={0} reached={0} onStep={() => undefined} />
      {caseFile.isLoading ? <LoadingState /> : null}
      {caseFile.data && !caseFile.data.requests.some((request) => request.status === 'OPEN') ? (
        <AuctionRequestForm
          caseId={caseId}
          onSaved={(saved) => navigate(`/cases/${caseId}/auction/${saved.id}`)}
          onCancel={() => navigate(`/cases/${caseId}`)}
        />
      ) : null}
    </div>
  )
}

export function PortalAuctionDetailPage() {
  const { caseId = '', requestId = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { t, i18n } = useTranslation()
  const locale = i18n.language.split('-')[0] ?? 'fa'
  const redirected = useRef(false)
  const query = useQuery({
    queryKey: ['portal-auction', caseId, requestId],
    enabled: Boolean(caseId && requestId),
    queryFn: () => portalApi.get<PortalAuctionRequest>(`/cases/${caseId}/auction/${requestId}`).then(({ data }) => data),
  })

  useEffect(() => {
    if (!query.isError || redirected.current) return
    redirected.current = true
    toast.error(getApiErrorMessage(query.error, t('app.error')))
    navigate(`/cases/${caseId}`, { replace: true })
  }, [caseId, navigate, query.error, query.isError, t])

  const item = query.data
  const reached = auctionWizardReached(item)
  const finished = auctionWizardFinished(item)
  const requestedStep = wizardStepIndex(params.get('step'))
  const step = Math.min(requestedStep ?? (item?.editable ? 0 : reached), reached)
  const backTo = `/cases/${caseId}`

  function openStep(index: number) {
    if (index > reached) return
    const name = AUCTION_WIZARD_STEPS[index]
    if (!name) return
    setParams({ step: name }, { replace: true })
  }

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ['portal-auction', caseId, requestId] })
    await queryClient.invalidateQueries({ queryKey: ['case', caseId] })
  }

  return (
    <div className={caseShellClassName}>
      <AuctionPageHeader finished={finished} reached={reached} caseFile={item?.caseFile} backTo={backTo} />
      {item ? <AuctionWizardNav view={step} reached={reached} finished={finished} onStep={openStep} /> : null}
      {item?.awaitingIntake ? (
        <section className="mb-5 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3">
          <p className="text-sm font-semibold text-teal-900">{t('cases.auctionIntakeSubmittedTitle')}</p>
          <p className="mt-1 text-sm leading-7 text-ink-700">{t('cases.auctionIntakeSubmittedBody')}</p>
        </section>
      ) : null}
      {query.isLoading ? <LoadingState /> : null}
      {item && step === 0 ? (
        item.editable ? (
          <AuctionRequestForm
            caseId={caseId}
            request={item}
            onSaved={async (saved) => {
              await refresh()
              navigate(`/cases/${caseId}/auction/${saved.id}`, { replace: true })
            }}
            onCancel={() => navigate(backTo)}
          />
        ) : (
          <FormCard icon={Gavel} title={t('cases.auction.wizardSteps.request')}>
            <div className={formCardBodyClassName}>
              <AuctionItemsSummary item={item} locale={locale} />
            </div>
          </FormCard>
        )
      ) : null}
      {item && step >= 1 && (item.inquiries?.length ?? 0) > 0 ? (
        <FormCard icon={Landmark} title={t('cases.steps.inquiries')}>
          <div className={`${formCardBodyClassName} space-y-4`}>
            <PortalLettersToolbar
              letterUrls={[
                ...item.inquiries.map((row) => `/cases/${caseId}/auction/${requestId}/inquiries/${row.id}/letter`),
                ...(item.placesReview ? [`/cases/${caseId}/auction/${requestId}/places/letter`] : []),
              ]}
            />
            {item.inquiries.map((row) => (
              <ProcessReviewCard
                key={row.id}
                title={row.inquiryCenter.name}
                icon={Landmark}
                review={row}
                hrefOf={(fileId) => `/cases/${caseId}/auction/${requestId}/inquiries/${row.id}/files/${fileId}`}
                letterUrl={`/cases/${caseId}/auction/${requestId}/inquiries/${row.id}/letter`}
              />
            ))}
          </div>
        </FormCard>
      ) : null}
      {item && step >= 1 && item.placesReview ? (
        <FormCard icon={Building2} title={t('cases.steps.places')}>
          <div className={formCardBodyClassName}>
            <ProcessReviewCard
              title={t('cases.steps.places')}
              icon={Building2}
              review={item.placesReview}
              hrefOf={(fileId) => `/cases/${caseId}/auction/${requestId}/places/files/${fileId}`}
              letterUrl={`/cases/${caseId}/auction/${requestId}/places/letter`}
            />
          </div>
        </FormCard>
      ) : null}
      {item && step === 1 ? (
        <FormCard icon={BadgeCheck} title={t('cases.auction.wizardSteps.management')}>
          <div className={`${formCardBodyClassName} space-y-4`}>
            {item.reviews.length ? (
              item.reviews.map((review) => (
                <AuctionReviewCard
                  key={review.id}
                  review={review}
                  hrefOf={(fileId) =>
                    `/cases/${caseId}/auction/${requestId}/management-reviews/${review.id}/files/${fileId}`
                  }
                />
              ))
            ) : (
              <p className="text-sm text-ink-500">{t('cases.auction.managementEmpty')}</p>
            )}
          </div>
        </FormCard>
      ) : null}
      {item && step === 2 ? (
        <FormCard icon={BadgeCheck} title={finished ? t('cases.auction.title') : t('cases.auction.wizardSteps.issue')}>
          <div className={formCardBodyClassName}>
            <AuctionItemsSummary item={item} locale={locale} />
            <p className="text-sm font-medium text-teal-800">
              {finished ? t('cases.auction.issued') : t('cases.auction.awaitingIssue')}
            </p>
          </div>
        </FormCard>
      ) : null}
    </div>
  )
}
