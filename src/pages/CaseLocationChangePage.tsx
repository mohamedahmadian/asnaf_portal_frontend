import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarClock,
  CalendarDays,
  Check,
  Hash,
  MapPin,
  MapPinned,
  CircleCheck,
  CircleUserRound,
  CircleX,
  Clock3,
  FileText,
  Landmark,
  Paperclip,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { DateText } from '../../../frontend/src/components/ui/DateText'
import { FileDropField } from '../../../frontend/src/components/ui/FileDropField'
import { Button, FormField, caseShellClassName, inputClassName } from '../../../frontend/src/components/ui/Form'
import {
  FormCard,
  FormCardHeader,
  FormEmptyHint,
  FormFactTile,
  FormSectionTitle,
  cardClassName,
  formCardBodyClassName,
} from '../../../frontend/src/components/ui/FormLayout'
import { LoadingState } from '../../../frontend/src/components/ui/LoadingState'
import { CaseLocationStep } from '../../../frontend/src/pages/cases/CaseLocationStep'
import { AuctionCaseSubtitle, AuctionStepRing } from '../../../frontend/src/pages/cases/AuctionWizard'
import { InquiryElapsedBadge } from '../../../frontend/src/pages/cases/InquiryDateBadges'
import {
  emptyLocationForm,
  type LocationForm,
} from '../../../frontend/src/pages/cases/formation-types'
import { optimizeImageFile } from '../../../frontend/src/lib/optimize-image'
import { formatNumber, localizeDigits } from '../../../frontend/src/lib/datetime'
import { PortalLetterButtons, PortalLettersToolbar } from '../components/PortalLetters'
import { getApiErrorMessage, portalApi } from '../lib/api'
import type { Lookup, PortalLocationState, PortalRenewalReview } from '../types/portal'
import type { City, CommercialComplex } from '../../../frontend/src/types/app'

const LOCATION_STEPS = ['location', 'documents', 'inquiries', 'places', 'management', 'request'] as const
type LocationStep = (typeof LOCATION_STEPS)[number]

type ReviewFile = PortalRenewalReview['files'][number]

function locationFrom(value: PortalLocationState['location']): LocationForm {
  const empty = emptyLocationForm()
  if (!value) return empty
  return {
    ...empty,
    area: value.area == null || value.area === '' ? '' : String(value.area),
    cityId: value.cityId ?? '',
    establishment: (value.establishment ?? 'INDEPENDENT') as LocationForm['establishment'],
    complexId: value.complexId ?? '',
    address: value.address ?? '',
    addressEn: value.addressEn ?? '',
    plaque: value.plaque ?? '',
    plaqueSeries: value.plaqueSeries ?? '',
    floor: value.floor ?? '',
    unitNo: value.unitNo ?? '',
    postalCode: value.postalCode ?? '',
    phone: value.phone ?? '',
    fax: value.fax ?? '',
    geoPosition: (value.geoPosition ?? '') as LocationForm['geoPosition'],
    publicAccess: (value.publicAccess ?? '') as LocationForm['publicAccess'],
    ownership: (value.ownership ?? 'OWNED') as LocationForm['ownership'],
    deedNo: value.deedNo ?? '',
    leaseIssuedAt: value.leaseIssuedAt ?? '',
    leaseExpiresAt: value.leaseExpiresAt ?? '',
    leaseAgency: value.leaseAgency ?? '',
    ownerName: value.ownerName ?? '',
  }
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

function inquiryStatusMeta(status: string): { icon: LucideIcon; badge: string } {
  if (status === 'APPROVED') return { icon: CircleCheck, badge: 'bg-teal-50 text-teal-800 ring-teal-200' }
  if (status === 'REJECTED') return { icon: CircleX, badge: 'bg-red-50 text-red-700 ring-red-200' }
  return { icon: Clock3, badge: 'bg-amber-50 text-amber-800 ring-amber-200' }
}

function DateTimeValue({ value }: { value: string }) {
  return <DateText value={value} withTime />
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

function ReviewCard({
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
  letterUrl?: string
}) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language.split('-')[0] ?? 'fa'
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
        {letterUrl ? <PortalLetterButtons letterUrl={letterUrl} /> : null}
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
        {review.note ? <FormFactTile icon={FileText} label={t('cases.auction.note')} value={review.note} /> : null}
        {review.files.length ? (
          <div className="flex flex-wrap gap-2">
            {review.files.map((file: ReviewFile) => (
              <ReviewFileButton
                key={file.id}
                href={hrefOf(file.id)}
                name={file.originalName || t('cases.inquiryAttachment')}
              />
            ))}
          </div>
        ) : null}
      </div>
    </article>
  )
}

function EmptyHint({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-teal-200 bg-cream-50/70 px-4 py-8 text-center text-sm text-ink-500">
      <Icon className="size-6 text-teal-500" aria-hidden />
      <p>{text}</p>
    </div>
  )
}

function DocumentSlot({
  title,
  required,
  version,
  editable,
  uploading,
  onFile,
}: {
  title: string
  required: boolean
  version: NonNullable<PortalLocationState['documents'][number]['current']> | null
  editable: boolean
  uploading: boolean
  onFile: (file: File) => void
}) {
  const { t } = useTranslation()
  const [previewUrl, setPreviewUrl] = useState<string>()
  const [previewKind, setPreviewKind] = useState<'image' | 'pdf'>('image')
  const versionId = version?.id
  const mimeType = version?.mimeType

  useEffect(() => {
    if (!versionId || !mimeType) {
      setPreviewUrl(undefined)
      return
    }
    const kind = mimeType.startsWith('image/') ? 'image' : mimeType === 'application/pdf' ? 'pdf' : null
    if (!kind) {
      setPreviewUrl(undefined)
      return
    }
    let cancelled = false
    let url = ''
    void portalApi
      .get<Blob>(`/cases/documents/${versionId}/file`, { responseType: 'blob', timeout: 60_000 })
      .then(({ data: blob }) => {
        if (cancelled) return
        const type = (blob.type || mimeType).toLowerCase()
        if (type.includes('json') || type.startsWith('text/')) {
          setPreviewUrl(undefined)
          return
        }
        const typed = blob.type ? blob : new Blob([blob], { type: mimeType })
        url = URL.createObjectURL(typed)
        setPreviewKind(type === 'application/pdf' ? 'pdf' : 'image')
        setPreviewUrl(url)
      })
      .catch(() => {
        if (!cancelled) setPreviewUrl(undefined)
      })
    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [mimeType, versionId])

  return (
    <FormField icon={FileText} label={required ? `${title} *` : title}>
      <p className="text-xs text-ink-400">
        {required ? t('issuance.required') : t('cases.documentOptional')}
        {version?.originalName ? ` · ${version.originalName}` : ''}
      </p>
      {previewKind === 'pdf' && previewUrl ? (
        <iframe
          src={previewUrl}
          title={title}
          className="mx-auto mb-4 h-[28rem] w-full max-w-3xl rounded-2xl border border-teal-100 bg-white"
        />
      ) : null}
      {editable ? (
        <FileDropField
          accept="image/jpeg,image/png,image/webp,application/pdf"
          previewUrl={previewKind === 'image' ? previewUrl : undefined}
          previewClassName="mx-auto mb-4 max-h-[28rem] w-full max-w-3xl rounded-2xl object-contain"
          hideLocalPreview
          uploading={uploading}
          onFile={onFile}
        />
      ) : previewKind === 'image' && previewUrl ? (
        <img src={previewUrl} alt="" className="mx-auto mb-4 max-h-[28rem] w-full max-w-3xl rounded-2xl object-contain" />
      ) : !previewUrl ? (
        <FormEmptyHint>{t('cases.renewalViewNoDocuments')}</FormEmptyHint>
      ) : null}
    </FormField>
  )
}

export function PortalLocationChangePage() {
  const { caseId = '', requestId = '' } = useParams()
  const { t, i18n } = useTranslation()
  const locale = i18n.language.split('-')[0] ?? 'fa'
  const queryClient = useQueryClient()
  const [viewStep, setViewStep] = useState<number | null>(null)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [activeDoc, setActiveDoc] = useState('')
  const [locationForm, setLocationForm] = useState<LocationForm>(() => emptyLocationForm())
  const citiesQuery = useQuery({
    queryKey: ['lookups', 'cities'],
    queryFn: () => portalApi.get<Lookup[]>('/lookups/cities').then(({ data }) => data),
  })
  const complexesQuery = useQuery({
    queryKey: ['lookups', 'commercial-complexes'],
    queryFn: () => portalApi.get<Lookup[]>('/lookups/commercial-complexes').then(({ data }) => data),
  })
  const query = useQuery({
    queryKey: ['portal-location-change', caseId, requestId],
    enabled: Boolean(caseId && requestId),
    queryFn: () =>
      portalApi
        .get<PortalLocationState>(`/cases/${caseId}/location-change/${requestId}`)
        .then(({ data }) => data),
  })
  const item = query.data
  const hideDocuments = Boolean(item && !item.needsDocuments)
  const awaitingIntake = Boolean(item?.awaitingIntake)
  const wizardSteps = hideDocuments
    ? LOCATION_STEPS.filter((name) => name !== 'documents')
    : [...LOCATION_STEPS]
  const reached = item?.formationStep ?? 0
  const review = item?.status !== 'OPEN'
  const progress = review
    ? 6
    : awaitingIntake
      ? hideDocuments
        ? 0
        : 1
      : hideDocuments && reached === 1
        ? 2
        : reached
  const serverStep = Math.min(viewStep ?? (review ? 0 : reached), reached)
  const step = hideDocuments && serverStep === 1 && !awaitingIntake ? 2 : serverStep
  const stepName = (LOCATION_STEPS[step] ?? 'location') as LocationStep
  const stepTotal = wizardSteps.length
  const stepCurrent = Math.min(
    wizardSteps.filter((name) => LOCATION_STEPS.indexOf(name) <= progress).length,
    stepTotal,
  )

  useEffect(() => {
    if (!item?.location) return
    setLocationForm(locationFrom(item.location))
  }, [item?.location])

  useEffect(() => {
    const first = item?.requirements[0]?.id ?? ''
    if (!first) return
    if (item.requirements.some((row) => row.id === activeDoc)) return
    setActiveDoc(first)
  }, [activeDoc, item])

  const cities = (citiesQuery.data ?? []) as City[]
  const complexes = (complexesQuery.data ?? []).map((row) => ({
    id: row.id,
    name: row.name ?? row.title ?? '',
    nameEn: null,
    address: null,
  })) as CommercialComplex[]

  function nextProcessStep(from: number) {
    let next = from + 1
    if (hideDocuments && next === 1) next = 2
    return next
  }

  async function goToStep(index: number) {
    if (index > reached || (hideDocuments && index === 1)) return
    setViewStep(index)
  }

  async function saveLocationDraft() {
    if (!item?.canSaveLocation) return false
    if (
      !locationForm.cityId ||
      !locationForm.address.trim() ||
      locationForm.area === '' ||
      Number.isNaN(Number(locationForm.area)) ||
      (locationForm.establishment === 'COMMERCIAL_COMPLEX' && !locationForm.complexId)
    ) {
      toast.error(t('cases.locationDraftIncomplete'))
      return false
    }
    setBusy(true)
    try {
      const commercialComplex = locationForm.establishment === 'COMMERCIAL_COMPLEX'
      const { data } = await portalApi.patch<PortalLocationState>(
        `/cases/${caseId}/location-change/${requestId}/location`,
        {
          caseId,
          cityId: locationForm.cityId,
          establishment: locationForm.establishment,
          complexId: commercialComplex ? locationForm.complexId : null,
          address: locationForm.address,
          addressEn: locationForm.addressEn || null,
          plaque: locationForm.plaque || null,
          plaqueSeries: locationForm.plaqueSeries || null,
          floor: locationForm.floor || null,
          unitNo: locationForm.unitNo || null,
          postalCode: locationForm.postalCode || null,
          phone: locationForm.phone || null,
          fax: locationForm.fax || null,
          geoPosition: locationForm.geoPosition || null,
          publicAccess: locationForm.publicAccess || null,
          ownership: locationForm.ownership,
          deedNo: locationForm.deedNo || null,
          area: Number(locationForm.area),
          leaseIssuedAt: locationForm.ownership === 'RENTED' ? locationForm.leaseIssuedAt || null : null,
          leaseExpiresAt: locationForm.ownership === 'RENTED' ? locationForm.leaseExpiresAt || null : null,
          leaseAgency: locationForm.ownership === 'RENTED' ? locationForm.leaseAgency || null : null,
          ownerName: locationForm.ownership === 'RENTED' ? locationForm.ownerName || null : null,
        },
      )
      queryClient.setQueryData(['portal-location-change', caseId, requestId], data)
      return true
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('app.error')))
      return false
    } finally {
      setBusy(false)
    }
  }

  async function continueProcess() {
    if (!item || item.status !== 'OPEN') return
    if (serverStep === 0 || serverStep === 5) {
      const saved = await saveLocationDraft()
      if (!saved) return
    }
    if (serverStep < reached) {
      setViewStep(Math.min(nextProcessStep(serverStep), reached))
      return
    }
    if (!item.canContinue) return
    setBusy(true)
    try {
      const { data } = await portalApi.post<PortalLocationState>(
        `/cases/${caseId}/location-change/${requestId}/continue`,
      )
      queryClient.setQueryData(['portal-location-change', caseId, requestId], data)
      setViewStep(null)
      if (data.awaitingIntake) toast.success(t('cases.locationIntakeSubmittedTitle'))
      else if (data.formationStep >= 2) toast.success(t('cases.locationSubmitted'))
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('app.error')))
    } finally {
      setBusy(false)
    }
  }

  async function upload(documentId: string, file: File) {
    if (!item?.canUpload) return
    setUploadingId(documentId)
    try {
      const prepared = file.type.startsWith('image/') ? await optimizeImageFile(file) : file
      const body = new FormData()
      body.append('documentId', documentId)
      body.append('file', prepared)
      const { data } = await portalApi.post<PortalLocationState>(
        `/cases/${caseId}/location-change/${requestId}/documents`,
        body,
        { timeout: 60_000 },
      )
      queryClient.setQueryData(['portal-location-change', caseId, requestId], data)
      toast.success(t('cases.documentUploaded'))
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('app.error')))
    } finally {
      setUploadingId(null)
    }
  }

  const nextStepName = LOCATION_STEPS[nextProcessStep(step)]
  const submittingIntake = Boolean(item?.canContinue) && nextProcessStep(step) >= 2
  const continueLabel = submittingIntake
    ? t('cases.renewalSubmitForReview')
    : nextStepName
      ? t('cases.processContinueToStep', { step: t(`cases.locationSteps.${nextStepName}`) })
      : t('cases.processContinue')
  const mayContinue =
    item?.status === 'OPEN' &&
    !awaitingIntake &&
    (serverStep < reached || item.canContinue) &&
    step < 2
  const wizardContinue = mayContinue ? (
    <Button
      type="button"
      disabled={busy || (step === 1 && item.documentsMissing)}
      onClick={() => void continueProcess()}
    >
      <BadgeCheck className="size-4" aria-hidden />
      {continueLabel}
    </Button>
  ) : null

  if (query.isLoading) return <LoadingState />
  if (query.isError || !item) {
    return <FormEmptyHint>{getApiErrorMessage(query.error, t('app.error'))}</FormEmptyHint>
  }

  const activeRequirement = item.requirements.find((row) => row.id === activeDoc) ?? item.requirements[0]
  const fileHref = (kind: 'inquiries' | 'places' | 'management', id: string, fileId: string) =>
    kind === 'places'
      ? `/cases/${caseId}/location-change/${requestId}/places/files/${fileId}`
      : kind === 'inquiries'
        ? `/cases/${caseId}/location-change/${requestId}/inquiries/${id}/files/${fileId}`
        : `/cases/${caseId}/location-change/${requestId}/management-reviews/${id}/files/${fileId}`

  return (
    <div className={caseShellClassName}>
      <PageHeader
        icon={MapPinned}
        title={t('cases.locationChange')}
        titleExtra={
          <AuctionStepRing
            currentLabel={formatNumber(stepCurrent, locale)}
            totalLabel={formatNumber(stepTotal, locale)}
            ratio={stepTotal ? stepCurrent / stepTotal : 0}
            label={t('cases.stepOf', {
              current: formatNumber(stepCurrent, locale),
              total: formatNumber(stepTotal, locale),
            })}
          />
        }
        subtitle={
          <AuctionCaseSubtitle
            firstName={item.person.firstName}
            lastName={item.person.lastName}
            fullName={item.person.fullName}
            jobTitle={item.jobTitle}
            businessUnitTitle={item.businessUnitTitle}
            licenseNumber={item.licenseNumber}
          />
        }
        backTo={`/cases/${caseId}`}
      />
      <ol
        className={`mb-5 grid grid-cols-2 gap-2 ${
          wizardSteps.length > 5
            ? 'sm:grid-cols-3 lg:grid-cols-6'
            : wizardSteps.length > 4
              ? 'sm:grid-cols-3 lg:grid-cols-5'
              : 'sm:grid-cols-3'
        }`}
      >
        {wizardSteps.map((name, position) => {
          const index = LOCATION_STEPS.indexOf(name)
          const done = index < progress
          const current = index === progress
          const docsMissing = name === 'documents' && (done || current) && item.documentsMissing
          const tone = docsMissing
            ? 'cursor-pointer border-orange-400 bg-white text-ink-800'
            : done
              ? 'cursor-pointer border-emerald-400 bg-white text-ink-800'
              : current
                ? 'case-step-done-pulse cursor-pointer border-emerald-500 bg-white text-ink-800'
                : 'cursor-default border-line bg-white text-ink-400'
          return (
            <li key={name}>
              <button
                type="button"
                disabled={!done && !current}
                onClick={() => void goToStep(index)}
                className={`relative flex h-full min-h-[4.75rem] w-full flex-col items-center justify-center gap-1.5 rounded-2xl border-2 px-3 py-3 text-center text-sm ${tone} ${
                  index === step && !current ? 'ring-2 ring-teal-300' : ''
                }`}
              >
                {done ? (
                  <span className="case-step-check absolute top-1.5 end-1.5 inline-flex size-4 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <Check className="size-2.5" strokeWidth={3} aria-hidden />
                  </span>
                ) : null}
                <span
                  className={`inline-flex size-6 shrink-0 items-center justify-center rounded-full border-2 text-xs ${
                    docsMissing
                      ? 'border-orange-300 bg-orange-50 text-orange-700'
                      : current
                        ? 'case-step-num-pulse border-emerald-500 bg-emerald-500 text-white'
                        : done
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-transparent bg-cream-100 text-ink-700'
                  }`}
                >
                  {formatNumber(position + 1, locale)}
                </span>
                <span className="text-center leading-5">{t(`cases.locationSteps.${name}`)}</span>
                {docsMissing ? (
                  <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-medium leading-4 text-orange-700 ring-1 ring-orange-200">
                    {t('cases.requiredDocumentsPending')}
                  </span>
                ) : null}
              </button>
            </li>
          )
        })}
      </ol>

      {awaitingIntake ? (
        <section className="mb-5 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3">
          <p className="text-sm font-semibold text-teal-900">{t('cases.locationIntakeSubmittedTitle')}</p>
          <p className="mt-1 text-sm leading-7 text-ink-700">{t('cases.locationIntakeSubmittedBody')}</p>
        </section>
      ) : null}

      {stepName === 'location' ? (
        <FormCard icon={MapPinned} title={t('cases.locationPlaceContract')} action={wizardContinue}>
          <div className={formCardBodyClassName}>
            <CaseLocationStep
              value={locationForm}
              cities={cities}
              complexes={complexes}
              places={[]}
              locale={locale}
              hideRegistrationPlace
              locked={!item.canSaveLocation}
              onChange={(patch) => {
                if (item.canSaveLocation) setLocationForm({ ...locationForm, ...patch })
              }}
              onSubmit={() => void continueProcess()}
            />
          </div>
        </FormCard>
      ) : null}

      {stepName === 'documents' && !hideDocuments ? (
        <FormCard icon={FileText} title={t('cases.activityDocumentsTitle')} action={wizardContinue}>
          <div className={formCardBodyClassName}>
            {item.requirements.length ? (
              <div className="space-y-4">
                <div role="tablist" className="flex flex-wrap gap-2">
                  {item.requirements.map((row) => {
                    const uploaded = Boolean(item.documents.find((doc) => doc.documentId === row.id)?.current)
                    const selected = row.id === (activeRequirement?.id ?? '')
                    const tabTone = row.isRequired
                      ? uploaded
                        ? selected
                          ? 'border-2 border-emerald-400 bg-emerald-100 text-emerald-800'
                          : 'border border-emerald-300 bg-emerald-50 text-emerald-800'
                        : selected
                          ? 'border-2 border-red-300 bg-red-100 text-red-800'
                          : 'border border-red-200 bg-red-50 text-red-700'
                      : selected
                        ? 'bg-teal-500 text-white'
                        : 'border border-teal-400 bg-white text-ink-700'
                    return (
                      <button
                        key={row.id}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        className={`inline-flex cursor-pointer items-center gap-1.5 rounded-2xl px-4 py-2 text-sm ${tabTone}`}
                        onClick={() => setActiveDoc(row.id)}
                      >
                        <span>{row.title}</span>
                        {row.isRequired ? (
                          <span className={uploaded ? 'text-emerald-600' : 'text-red-500'} aria-hidden>
                            *
                          </span>
                        ) : null}
                        {uploaded ? <Check className="size-3.5 shrink-0" aria-hidden /> : null}
                      </button>
                    )
                  })}
                </div>
                {activeRequirement ? (
                  <div className="rounded-2xl border border-teal-100 bg-cream-50/60 p-4">
                    <DocumentSlot
                      title={activeRequirement.title}
                      required={activeRequirement.isRequired}
                      version={item.documents.find((row) => row.documentId === activeRequirement.id)?.current ?? null}
                      editable={item.canUpload}
                      uploading={uploadingId === activeRequirement.id}
                      onFile={(file) => void upload(activeRequirement.id, file)}
                    />
                  </div>
                ) : null}
              </div>
            ) : (
              <EmptyHint icon={FileText} text={t('cases.renewalViewNoDocuments')} />
            )}
          </div>
        </FormCard>
      ) : null}

      {stepName === 'inquiries' ? (
        <FormCard icon={ShieldCheck} title={t('cases.locationSteps.inquiries')}>
          <div className={formCardBodyClassName}>
            {item.inquiries.length ? (
              <div className="space-y-4">
                <PortalLettersToolbar
                  letterUrls={[
                    ...item.inquiries.map(
                      (row) => `/cases/${caseId}/location-change/${requestId}/inquiries/${row.id}/letter`,
                    ),
                    ...(item.placesReview
                      ? [`/cases/${caseId}/location-change/${requestId}/places/letter`]
                      : []),
                  ]}
                />
                {item.inquiries.map((row) => (
                  <ReviewCard
                    key={row.id}
                    title={row.inquiryCenter.name}
                    icon={Landmark}
                    review={row}
                    hrefOf={(fileId) => fileHref('inquiries', row.id, fileId)}
                    letterUrl={`/cases/${caseId}/location-change/${requestId}/inquiries/${row.id}/letter`}
                  />
                ))}
              </div>
            ) : (
              <EmptyHint icon={ShieldCheck} text={t('cases.renewalViewNoInquiries')} />
            )}
          </div>
        </FormCard>
      ) : null}

      {stepName === 'places' ? (
        <FormCard icon={Building2} title={t('cases.locationSteps.places')}>
          <div className={formCardBodyClassName}>
            {item.placesReview ? (
              <ReviewCard
                title={t('cases.locationSteps.places')}
                icon={Building2}
                review={item.placesReview}
                hrefOf={(fileId) => fileHref('places', item.placesReview!.id, fileId)}
                letterUrl={`/cases/${caseId}/location-change/${requestId}/places/letter`}
              />
            ) : (
              <EmptyHint icon={Building2} text={t('cases.renewalViewNoPlaces')} />
            )}
          </div>
        </FormCard>
      ) : null}

      {stepName === 'management' ? (
        <FormCard icon={CircleUserRound} title={t('cases.locationSteps.management')}>
          <div className={formCardBodyClassName}>
            {item.managementReviews.length ? (
              <div className="space-y-4">
                {item.managementReviews.map((row) => (
                  <ReviewCard
                    key={row.id}
                    title={row.title}
                    icon={CircleUserRound}
                    review={row}
                    hrefOf={(fileId) => fileHref('management', row.id, fileId)}
                  />
                ))}
              </div>
            ) : (
              <EmptyHint icon={CircleUserRound} text={t('cases.renewalViewNoManagement')} />
            )}
          </div>
        </FormCard>
      ) : null}

      {stepName === 'request' ? (
        <FormCard icon={MapPinned} title={t('cases.locationSteps.request')}>
          <div className={formCardBodyClassName}>
            <section className="space-y-3">
              <FormSectionTitle icon={MapPin}>{t('cases.locationCurrentAddress')}</FormSectionTitle>
              <FormField icon={MapPin} label={t('cases.premiseAddress')}>
                <textarea
                  readOnly
                  rows={2}
                  className={`${inputClassName()} bg-cream-100`}
                  value={item.currentLocation?.address ?? ''}
                />
              </FormField>
              <FormField icon={Hash} label={t('cases.premisePostalCode')}>
                <input
                  readOnly
                  inputMode="numeric"
                  className={`${inputClassName()} digit-field bg-cream-100`}
                  value={localizeDigits(item.currentLocation?.postalCode ?? '', locale)}
                />
              </FormField>
            </section>
            <section className="space-y-3">
              <FormSectionTitle icon={MapPin}>{t('cases.locationNewAddress')}</FormSectionTitle>
              <FormField icon={MapPin} label={t('cases.premiseAddress')}>
                <textarea
                  readOnly
                  rows={2}
                  className={`${inputClassName()} bg-cream-100`}
                  value={locationForm.address}
                />
              </FormField>
              <FormField icon={Hash} label={t('cases.premisePostalCode')}>
                <input
                  readOnly
                  inputMode="numeric"
                  className={`${inputClassName()} digit-field bg-cream-100`}
                  value={localizeDigits(locationForm.postalCode, locale)}
                />
              </FormField>
            </section>
          </div>
        </FormCard>
      ) : null}
    </div>
  )
}
