import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarClock,
  CalendarDays,
  Check,
  CircleCheck,
  CircleUserRound,
  CircleX,
  Clock3,
  Eye,
  FileText,
  Hourglass,
  IdCard,
  Landmark,
  Paperclip,
  ShieldCheck,
  UserRound,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { DateText } from '@asnaf/components/ui/DateText'
import { FileDropField } from '@asnaf/components/ui/FileDropField'
import { Button, FormField, caseShellClassName } from '@asnaf/components/ui/Form'
import {
  FormCard,
  FormCardHeader,
  FormEmptyHint,
  FormFactTile,
  cardClassName,
  formCardBodyClassName,
} from '@asnaf/components/ui/FormLayout'
import { LoadingState } from '@asnaf/components/ui/LoadingState'
import { InquiryElapsedBadge } from '@asnaf/pages/cases/InquiryDateBadges'
import { CaseIdentityFields } from '@asnaf/pages/cases/CaseIdentityFields'
import {
  STEWARDSHIP_ISSUANCE_STEP,
  STEWARDSHIP_STEPS,
  fillPerson,
  matchesDocumentGender,
  type DocumentTypeRow,
  type IdentityPerson,
} from '@asnaf/pages/cases/formation-types'
import { optimizeImageFile } from '@asnaf/lib/optimize-image'
import { formatNumber } from '@asnaf/lib/datetime'
import { PortalLetterButtons, PortalLettersToolbar } from '../components/PortalLetters'
import { getApiErrorMessage, portalApi } from '../lib/api'
import type { PortalStewardFormationReview, PortalStewardFormationState } from '../types/portal'

function PageHeader({
  icon,
  title,
  subtitle,
  backTo,
  action,
}: {
  icon: LucideIcon
  title: string
  subtitle?: ReactNode
  backTo: string
  action?: ReactNode
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
        subtitle={subtitle}
        action={action}
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

function toIdentityPerson(
  person: PortalStewardFormationState['person'],
  extras: { caseId: string; formationStep: number },
): IdentityPerson {
  return fillPerson({
    id: person.id,
    firstName: person.firstName,
    lastName: person.lastName,
    fatherName: person.fatherName,
    lastNameEn: person.lastNameEn,
    gender: (person.gender as IdentityPerson['gender']) ?? null,
    religion: (person.religion as IdentityPerson['religion']) ?? null,
    religionOther: person.religionOther,
    nationalId: person.nationalId,
    birthDate: person.birthDate,
    residencyStatus: (person.residencyStatus as IdentityPerson['residencyStatus']) ?? null,
    passportNumber: person.passportNumber,
    nationalCardExpiresAt: person.nationalCardExpiresAt,
    passportExpiresAt: person.passportExpiresAt,
    identityCertificateNo: person.identityCertificateNo,
    birthPlace: person.birthPlace,
    identityIssuedIn: person.identityIssuedIn,
    countryId: person.countryId,
    phone: person.phone,
    homePhone: person.homePhone,
    postalCode: person.postalCode,
    address: person.address,
    email: person.email,
    educationLevel: (person.educationLevel as IdentityPerson['educationLevel']) ?? null,
    citizenGroup: person.citizenGroup,
    jobId: person.jobId,
    caseId: extras.caseId,
    formationStep: extras.formationStep,
    caseTrackingCode: null,
  })
}

type ReviewRow = PortalStewardFormationReview

function ReviewCard({
  title,
  icon: Icon,
  review,
  hrefOf,
  letterUrl,
}: {
  title: string
  icon: LucideIcon
  review: ReviewRow
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
            {review.files.map((file) => (
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
  version: PortalStewardFormationState['documents'][number]['current']
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
        const typed = blob.type ? blob : new Blob([blob], { type: mimeType })
        url = URL.createObjectURL(typed)
        setPreviewKind(kind)
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

export function CaseStewardshipFormationPage() {
  const { caseId = '' } = useParams()
  const { t, i18n } = useTranslation()
  const locale = i18n.language.split('-')[0] ?? 'fa'
  const queryClient = useQueryClient()
  const [viewStep, setViewStep] = useState<number | null>(null)
  const [tab, setTab] = useState<'identity' | 'documents'>('identity')
  const [person, setPerson] = useState<IdentityPerson | null>(null)
  const [saving, setSaving] = useState(false)
  const [advancing, setAdvancing] = useState(false)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [activeDoc, setActiveDoc] = useState('')

  const query = useQuery({
    queryKey: ['portal-steward-formation', caseId],
    enabled: Boolean(caseId),
    queryFn: () =>
      portalApi.get<PortalStewardFormationState>(`/cases/${caseId}/stewardship/formation`).then(({ data }) => data),
  })
  const item = query.data
  const countries = useQuery({
    queryKey: ['lookups', 'countries'],
    queryFn: () => portalApi.get<{ id: string; nameFa: string; nameEn?: string }[]>('/lookups/countries').then(({ data }) => data),
  })
  const jobs = useQuery({
    queryKey: ['lookups', 'jobs'],
    queryFn: () => portalApi.get<{ id: string; title: string }[]>('/lookups/jobs').then(({ data }) => data),
  })

  const reached = item?.formationStep ?? 0
  const step = viewStep != null && viewStep <= reached ? viewStep : reached
  const identity = person ?? (item ? toIdentityPerson(item.person, { caseId: item.caseId, formationStep: item.formationStep }) : null)

  const documentTypes: DocumentTypeRow[] = useMemo(
    () =>
      (item?.requirements ?? []).map((row) => ({
        id: row.id,
        code: row.code,
        title: row.title,
        gender: 'BOTH' as const,
        isRequired: row.isRequired,
      })),
    [item?.requirements],
  )

  const visibleDocuments = useMemo(
    () => documentTypes.filter((row) => matchesDocumentGender(row.gender, identity?.gender)),
    [documentTypes, identity?.gender],
  )

  useEffect(() => {
    if (!item) return
    const first = item.requirements[0]?.id ?? ''
    if (!first) return
    if (item.requirements.some((row) => row.id === activeDoc)) return
    setActiveDoc(first)
  }, [activeDoc, item])

  const backTo = `/cases/${caseId}`
  const nextStepKey = STEWARDSHIP_STEPS[step + 1]

  async function saveIdentity() {
    if (!identity) return false
    if (!identity.firstName.trim() || !identity.lastName.trim()) {
      toast.error(t('cases.firstNameRequired'))
      return false
    }
    setSaving(true)
    try {
      await portalApi.patch(`/cases/${caseId}/stewardship/formation/identity`, {
        firstName: identity.firstName,
        lastName: identity.lastName,
        fatherName: identity.fatherName || null,
        lastNameEn: identity.lastNameEn || null,
        gender: identity.gender || null,
        religion: identity.religion || null,
        religionOther: identity.religionOther || null,
        birthDate: identity.birthDate || null,
        residencyStatus: identity.residencyStatus || null,
        passportNumber: identity.passportNumber || null,
        nationalCardExpiresAt: identity.nationalCardExpiresAt || null,
        passportExpiresAt: identity.passportExpiresAt || null,
        identityCertificateNo: identity.identityCertificateNo || null,
        birthPlace: identity.birthPlace || null,
        identityIssuedIn: identity.identityIssuedIn || null,
        countryId: identity.countryId || null,
        phone: identity.phone || null,
        homePhone: identity.homePhone || null,
        postalCode: identity.postalCode || null,
        address: identity.address || null,
        email: identity.email || null,
        educationLevel: identity.educationLevel || null,
        citizenGroup: identity.citizenGroup || null,
        jobId: identity.jobId || null,
      })
      setPerson(null)
      await queryClient.invalidateQueries({ queryKey: ['portal-steward-formation', caseId] })
      return true
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('cases.saveFailed')))
      return false
    } finally {
      setSaving(false)
    }
  }

  async function upload(documentId: string, file: File) {
    setUploadingId(documentId)
    try {
      const prepared = file.type.startsWith('image/') ? await optimizeImageFile(file) : file
      const body = new FormData()
      body.append('documentId', documentId)
      body.append('file', prepared)
      await portalApi.post(`/cases/${caseId}/stewardship/formation/documents`, body, { timeout: 60_000 })
      toast.success(t('cases.documentUploaded'))
      await queryClient.invalidateQueries({ queryKey: ['portal-steward-formation', caseId] })
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('cases.saveFailed')))
    } finally {
      setUploadingId(null)
    }
  }

  async function continueStep() {
    setAdvancing(true)
    try {
      if (step === 0) {
        const saved = await saveIdentity()
        if (!saved) return
      }
      await portalApi.post(`/cases/${caseId}/stewardship/formation/continue`)
      setViewStep(null)
      await queryClient.invalidateQueries({ queryKey: ['portal-steward-formation', caseId] })
      await queryClient.invalidateQueries({ queryKey: ['case', caseId] })
      toast.success(t('cases.saved'))
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('cases.saveFailed')))
    } finally {
      setAdvancing(false)
    }
  }

  const continueButton =
    item?.editable && nextStepKey && step < STEWARDSHIP_ISSUANCE_STEP ? (
      <Button type="button" disabled={advancing || saving || (step === 0 && item.documentsMissing)} onClick={() => void continueStep()}>
        <Check className="size-4" aria-hidden />
        {step === 0
          ? t('cases.stewardship.submitFormation')
          : t('cases.stewardship.continueToStep', { step: t(`cases.steps.${nextStepKey}`) })}
      </Button>
    ) : null

  function fileHref(scope: 'inquiries' | 'places' | 'management', id: string, fileId: string) {
    if (scope === 'inquiries') return `/cases/${caseId}/stewardship/formation/inquiries/${id}/files/${fileId}`
    if (scope === 'places') return `/cases/${caseId}/stewardship/formation/places/files/${fileId}`
    return `/cases/${caseId}/stewardship/formation/management-reviews/${id}/files/${fileId}`
  }

  if (query.isLoading) {
    return (
      <div className={caseShellClassName}>
        <LoadingState />
      </div>
    )
  }

  if (!item || query.isError) {
    return (
      <div className={caseShellClassName}>
        <FormEmptyHint>{t('app.error')}</FormEmptyHint>
      </div>
    )
  }

  const stepName = STEWARDSHIP_STEPS[step] ?? 'identity'
  const activeRequirement = item.requirements.find((row) => row.id === activeDoc) ?? item.requirements[0]

  return (
    <div className={caseShellClassName}>
      <PageHeader
        icon={IdCard}
        title={t('cases.formationTitle')}
        backTo={backTo}
        action={
          <div className="flex flex-wrap items-center justify-end gap-2">
            {item.cardNumber ? (
              <Link to={`/cases/${caseId}/dossier`}>
                <Button type="button" variant="ghost">
                  <Eye className="size-4" aria-hidden />
                  {t('cases.viewDossier')}
                </Button>
              </Link>
            ) : null}
            <Link to={`/cases/${caseId}/finance`}>
              <Button type="button" variant="ghost">
                <Wallet className="size-4" aria-hidden />
                {t('cases.finance')}
              </Button>
            </Link>
          </div>
        }
        subtitle={
          item.host ? (
            <span className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex max-w-full items-center gap-2 rounded-2xl bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-800">
                <BadgeCheck className="size-4 shrink-0" aria-hidden />
                <span className="text-teal-700">{t('cases.stewardship.hostLicense')}</span>
                <span>{item.host.licenseNumber ?? '—'}</span>
              </span>
              {item.host.jobTitle ? (
                <span className="inline-flex max-w-full items-center gap-2 rounded-2xl bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-800">
                  <Building2 className="size-4 shrink-0" aria-hidden />
                  <span>{item.host.jobTitle}</span>
                </span>
              ) : null}
            </span>
          ) : (
            t('cases.formationSubtitle')
          )
        }
      />

      <ol className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
        {STEWARDSHIP_STEPS.map((name, index) => {
          const done = index < reached
          const current = index === step
          const disabled = index > reached
          return (
            <li key={name}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => setViewStep(index)}
                className={`relative flex h-full min-h-[4.75rem] w-full flex-col items-center justify-center gap-1.5 rounded-2xl border-2 px-3 py-3 text-center text-sm ${
                  done
                    ? 'cursor-pointer border-emerald-400 bg-white text-ink-800'
                    : current
                      ? 'case-step-done-pulse cursor-pointer border-emerald-500 bg-white text-ink-800'
                      : 'cursor-default border-line bg-white text-ink-400'
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
                <span className="text-center leading-5">{t(`cases.steps.${name}`)}</span>
              </button>
            </li>
          )
        })}
      </ol>

      {stepName === 'identity' && identity ? (
        <FormCard icon={UserRound} title={t('cases.steps.identity')} action={continueButton}>
          <div className={formCardBodyClassName}>
            <div className="flex flex-wrap gap-2">
              {(['identity', 'documents'] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  className={`cursor-pointer rounded-2xl px-4 py-2 text-sm ${
                    tab === key ? 'bg-teal-500 text-white' : 'border border-teal-400 bg-white text-ink-700'
                  }`}
                  onClick={() => setTab(key)}
                >
                  {t(key === 'identity' ? 'cases.identityTab' : 'cases.documentsTab')}
                </button>
              ))}
            </div>
            {tab === 'identity' ? (
              <CaseIdentityFields
                person={identity}
                countries={countries.data ?? []}
                jobs={jobs.data ?? []}
                locale={locale}
                locked={!item.editable}
                onChange={(key, value) =>
                  setPerson((current) => {
                    const base = current ?? toIdentityPerson(item.person, { caseId: item.caseId, formationStep: item.formationStep })
                    return { ...base, [key]: value }
                  })
                }
                onSubmit={() => void saveIdentity()}
              />
            ) : visibleDocuments.length ? (
              <div className="space-y-4">
                <div role="tablist" className="flex flex-wrap gap-2">
                  {visibleDocuments.map((row) => {
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
                      editable={item.editable}
                      uploading={uploadingId === activeRequirement.id}
                      onFile={(file) => void upload(activeRequirement.id, file)}
                    />
                  </div>
                ) : null}
              </div>
            ) : (
              <FormEmptyHint>{t('cases.renewalViewNoDocuments')}</FormEmptyHint>
            )}
            {item.editable ? (
              <div className="flex justify-end">
                <Button type="button" variant="ghost" disabled={saving} onClick={() => void saveIdentity().then((ok) => ok && toast.success(t('cases.saved')))}>
                  <Check className="size-4" aria-hidden />
                  {t('common.save')}
                </Button>
              </div>
            ) : null}
          </div>
        </FormCard>
      ) : null}

      {stepName === 'inquiries' ? (
        <FormCard icon={ShieldCheck} title={t('cases.steps.inquiries')}>
          <div className={formCardBodyClassName}>
            {item.inquiries.length ? (
              <div className="space-y-4">
                <PortalLettersToolbar
                  letterUrls={[
                    ...item.inquiries.map((row) => `/cases/${caseId}/stewardship/formation/inquiries/${row.id}/letter`),
                    ...(item.placesReview ? [`/cases/${caseId}/stewardship/formation/places/letter`] : []),
                  ]}
                />
                {item.inquiries.map((row) => (
                  <ReviewCard
                    key={row.id}
                    title={row.inquiryCenter.name}
                    icon={Landmark}
                    review={row}
                    hrefOf={(fileId) => fileHref('inquiries', row.id, fileId)}
                    letterUrl={`/cases/${caseId}/stewardship/formation/inquiries/${row.id}/letter`}
                  />
                ))}
              </div>
            ) : (
              <FormEmptyHint>{t('cases.renewalViewNoInquiries')}</FormEmptyHint>
            )}
          </div>
        </FormCard>
      ) : null}

      {stepName === 'places' ? (
        <FormCard icon={Building2} title={t('cases.steps.places')}>
          <div className={formCardBodyClassName}>
            {item.placesReview ? (
              <ReviewCard
                title={t('cases.steps.places')}
                icon={Building2}
                review={item.placesReview}
                hrefOf={(fileId) => fileHref('places', item.placesReview!.id, fileId)}
                letterUrl={`/cases/${caseId}/stewardship/formation/places/letter`}
              />
            ) : (
              <FormEmptyHint>{t('cases.renewalViewNoPlaces')}</FormEmptyHint>
            )}
          </div>
        </FormCard>
      ) : null}

      {stepName === 'managementReview' ? (
        <FormCard icon={CircleUserRound} title={t('cases.steps.managementReview')}>
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
              <FormEmptyHint>{t('cases.renewalViewNoManagement')}</FormEmptyHint>
            )}
          </div>
        </FormCard>
      ) : null}

      {stepName === 'cardIssuance' ? (
        <FormCard icon={BadgeCheck} title={t('cases.steps.cardIssuance')}>
          <div className={formCardBodyClassName}>
            <div
              role="alert"
              className="case-awaiting-issue-blink flex items-center justify-center gap-3 rounded-2xl border-2 border-amber-400 bg-amber-50 px-4 py-4 text-center"
            >
              <Hourglass className="size-5 shrink-0 text-amber-700" aria-hidden />
              <p className="text-sm font-semibold text-amber-950">{t('cases.stewardInProgress')}</p>
            </div>
          </div>
        </FormCard>
      ) : null}
    </div>
  )
}
