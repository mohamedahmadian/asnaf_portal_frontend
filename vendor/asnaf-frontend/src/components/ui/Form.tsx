import { ArrowRight, Check, Ellipsis, type LucideIcon, Pencil, Trash2, X } from 'lucide-react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type KeyboardEvent,
  type FormHTMLAttributes,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { CopyableDigits } from './CopyableDigits'
import { cardClassName, FormCardHeader } from './FormLayout'
import { useRegisterDetailEditTo } from '../../hooks/useDetailEditTo'
import { useEditFormDoubleSave, useEscapeBack, useEscapeCancel } from '../../hooks/useEscapeLeave'
import { useNavigationHistory } from '../../lib/navigation-history'

export { cardClassName }

const PAGE_HEADER_ACTIONS_SLOT_ID = 'page-header-actions'
const AppFormContext = createContext<string | null>(null)

const variants = {
  primary:
    'bg-teal-500 text-white hover:bg-teal-600 disabled:opacity-60 shadow-sm',
  soft: 'bg-mint-500 text-white hover:bg-mint-600 disabled:opacity-60 shadow-sm',
  ghost:
    'cursor-pointer bg-white text-ink-700 hover:bg-teal-50 border border-teal-400 shadow-[0_4px_12px_rgba(46,189,182,0.16)]',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-60',
}

export const formShellClassName = 'mx-auto w-full min-w-0'
/** فرم‌ها و فهرست‌های اطلاعات پایه: وسط صفحه و سه‌چهارم عرض ناحیهٔ محتوا */
export const baseInfoFormShellClassName = 'mx-auto w-full min-w-0 lg:w-3/4'
export const userFormShellClassName = 'mx-auto w-full min-w-0'
export const listShellClassName = 'mx-auto w-full min-w-0'
/** صفحات ماژول پرونده: تمام عرض ناحیهٔ محتوا */
export const caseShellClassName = 'w-full min-w-0 max-w-none'

export function Button({
  variant = 'primary',
  icon,
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants
  icon?: boolean
  children: ReactNode
}) {
  return (
    <button
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl text-sm font-medium transition ${
        icon ? 'size-9 p-0' : 'px-[0.9rem] py-2.5'
      } ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function FormField({
  icon: Icon,
  label,
  htmlFor,
  error,
  children,
}: {
  icon: LucideIcon
  label: string
  htmlFor?: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="flex w-full min-w-0 max-w-full flex-col gap-1.5 has-[[data-toggle]]:w-fit">
      <label
        htmlFor={htmlFor}
        className="flex items-center gap-2 text-sm font-medium text-ink-900"
      >
        <Icon className="size-4 text-teal-600" aria-hidden />
        {label}
      </label>
      {children}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  )
}

export const fieldClassName =
  'w-full rounded-2xl border border-line bg-cream-50 px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-400'

export const fieldErrorClassName =
  '!border-red-300 !bg-red-50/70 focus:!border-red-400 focus:!outline-none focus:!ring-2 focus:!ring-red-200/70'

export function inputClassName(error?: boolean) {
  return error ? `${fieldClassName} ${fieldErrorClassName}` : fieldClassName
}

export function ToggleField({
  id,
  checked,
  onChange,
  onLabel,
  offLabel,
  disabled,
}: {
  id?: string
  checked: boolean
  onChange: (checked: boolean) => void
  onLabel: ReactNode
  offLabel: ReactNode
  disabled?: boolean
}) {
  const segmentClass = (active: boolean) =>
    `inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium transition ${
      active ? 'bg-teal-500 text-white shadow-sm' : 'text-ink-600 hover:bg-white'
    } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`

  return (
    <div
      id={id}
      data-toggle
      role="group"
      className="inline-flex w-fit max-w-full shrink-0 self-start rounded-2xl border border-line bg-cream-50 p-1"
    >
      <button
        type="button"
        disabled={disabled}
        aria-pressed={checked}
        className={segmentClass(checked)}
        onClick={() => onChange(true)}
      >
        {onLabel}
      </button>
      <button
        type="button"
        disabled={disabled}
        aria-pressed={!checked}
        className={segmentClass(!checked)}
        onClick={() => onChange(false)}
      >
        {offLabel}
      </button>
    </div>
  )
}

const PAGE_BACK_LEAVES = new Set([
  'new',
  'edit',
  'card',
  'sms',
  'password',
  'import',
  'pilgrimage-history',
  'location',
  'history',
])

const PAGE_BACK_NESTED_LISTS = new Set([
  'items',
  'vouchers',
  'phones',
  'distribute',
  'contractors',
  'team',
  'phases',
  'payments',
  'progress',
  'projects',
  'restaurants',
  'floors',
  'lanes',
  'units',
  'jobs',
  'proceedings',
])

const UUID_SEGMENT =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function looksLikeId(segment: string) {
  return UUID_SEGMENT.test(segment)
}

function joinPath(segments: string[]) {
  return `/${segments.join('/')}`
}

function isCreateOrEditPath(pathname: string) {
  const last = pathname.replace(/\/+$/, '').split('/').filter(Boolean).at(-1)
  return last === 'edit' || last === 'new'
}

/** مسیر مرحلهٔ قبل یا فهرست والد از روی URL فعلی */
function resolvePageBackTo(pathname: string): string | undefined {
  const segments = pathname.replace(/\/+$/, '').split('/').filter(Boolean)
  if (segments.length === 0 || segments[0] === 'v') return undefined

  const last = segments[segments.length - 1]
  if (PAGE_BACK_LEAVES.has(last)) {
    return segments.length > 1 ? joinPath(segments.slice(0, -1)) : undefined
  }
  if (
    PAGE_BACK_NESTED_LISTS.has(last) &&
    segments.length >= 2 &&
    looksLikeId(segments[segments.length - 2])
  ) {
    return joinPath(segments.slice(0, -1))
  }
  if (looksLikeId(last) && segments.length > 1) {
    return joinPath(segments.slice(0, -1))
  }
  return undefined
}

export function PageHeader({
  title,
  titleExtra,
  subtitle,
  action,
  backTo,
  icon,
  className = 'mb-6',
}: {
  title: string
  titleExtra?: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
  icon: LucideIcon
  /** مسیر بازگشت اگر تاریخچه خالی باشد. `false` آیکون را مخفی می‌کند. */
  backTo?: string | false
  className?: string
}) {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const { goBack } = useNavigationHistory()
  const fallback = backTo === false ? undefined : backTo ?? resolvePageBackTo(pathname)
  const showBack = Boolean(fallback)
  useEscapeBack(showBack, () => {
    if (fallback) goBack(fallback)
  })
  const backButton = showBack ? (
    <button
      type="button"
      aria-label={t('common.back')}
      className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-2xl text-teal-700 transition hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 print:hidden"
      onClick={() => goBack(fallback)}
    >
      <ArrowRight className="size-5 ltr:rotate-180" aria-hidden />
    </button>
  ) : null

  return (
    <section className={`${cardClassName} overflow-hidden ${className}`}>
      <FormCardHeader
        icon={icon}
        heading="h1"
        title={title}
        titleExtra={titleExtra}
        subtitle={subtitle}
        action={
          <div className="flex items-center gap-2">
            {action}
            <div id={PAGE_HEADER_ACTIONS_SLOT_ID} className="flex items-center gap-2" />
          </div>
        }
        leading={backButton}
      />
    </section>
  )
}

/** نام موجودیت زیر عنوان در صفحات ویرایش و جزئیات */
export function EntityNameSubtitle({
  name,
  icon: Icon,
  copyValue,
  label,
}: {
  name: string
  icon: LucideIcon
  copyValue?: string | null
  label?: string
}) {
  return (
    <span className="inline-flex max-w-full items-center gap-2 rounded-2xl bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-800">
      <Icon className="size-4 shrink-0" aria-hidden />
      <span className="truncate">
        {label ? <span>{label} : </span> : null}
        {copyValue ? <CopyableDigits value={copyValue} /> : name}
      </span>
    </span>
  )
}

function submitIfValid(form: HTMLFormElement) {
  if (form.noValidate || form.checkValidity()) {
    form.requestSubmit()
    return
  }
  form.querySelector<HTMLElement>(':invalid')?.focus()
}

function isCreateFormPath(pathname: string) {
  return /\/new\/?$/.test(pathname)
}

function isVisibleFocusableField(el: HTMLElement) {
  if (el.closest('[hidden], [aria-hidden="true"]')) return false
  if (el.closest('.hidden')) return false
  if (!el.getClientRects().length) return false

  if (el instanceof HTMLInputElement) {
    if (el.disabled || el.readOnly) return false
    if (el.tabIndex < 0) return false
    if (
      el.type === 'hidden' ||
      el.type === 'submit' ||
      el.type === 'button' ||
      el.type === 'reset' ||
      el.type === 'file' ||
      el.type === 'checkbox' ||
      el.type === 'radio'
    ) {
      return false
    }
    return true
  }

  if (el instanceof HTMLTextAreaElement) {
    return !el.disabled && !el.readOnly && el.tabIndex >= 0
  }

  if (el instanceof HTMLSelectElement) {
    return !el.disabled && el.tabIndex >= 0
  }

  if (el instanceof HTMLButtonElement) {
    if (el.disabled || el.tabIndex < 0) return false
    if (el.type === 'submit' || el.type === 'reset') return false
    if (el.dataset.formCancel != null || el.closest('[data-form-cancel]')) return false
    if (el.closest('[data-toggle]')) return false
    return true
  }

  return false
}

function focusFirstFormField(form: HTMLFormElement) {
  const candidates = form.querySelectorAll<HTMLElement>('input, textarea, select, button')
  for (const el of candidates) {
    if (!isVisibleFocusableField(el)) continue
    el.focus()
    return
  }
}

const FORM_ENTER_DOUBLE_MS = 500
let pendingEnterTimer: ReturnType<typeof setTimeout> | null = null

export function cancelPendingFormEnter() {
  if (pendingEnterTimer != null) {
    clearTimeout(pendingEnterTimer)
    pendingEnterTimer = null
  }
}

function shouldDelayFormEnter(form: HTMLFormElement) {
  if (form.dataset.enterImmediate != null) return false
  return Boolean(document.querySelector('[data-quick-tools]'))
}

export function handleFormEnter(event: KeyboardEvent<HTMLFormElement>) {
  if (event.key !== 'Enter' || event.nativeEvent.isComposing) return
  const target = event.target as HTMLElement | null
  if (!target) return
  if (target.closest('textarea')) return
  if (target.closest('[data-enter-ignore]')) return
  if (target instanceof HTMLSelectElement) return

  const button = target instanceof HTMLButtonElement ? target : target.closest('button')
  if (button instanceof HTMLButtonElement) {
    if (button.type === 'submit') return
    if (button.dataset.formCancel != null || button.closest('[data-form-cancel]')) return
  }

  event.preventDefault()
  const form = event.currentTarget
  if (shouldDelayFormEnter(form) && (form.noValidate || form.checkValidity())) {
    cancelPendingFormEnter()
    pendingEnterTimer = setTimeout(() => {
      pendingEnterTimer = null
      if (!form.isConnected) return
      submitIfValid(form)
    }, FORM_ENTER_DOUBLE_MS)
    return
  }
  submitIfValid(form)
}

export function AppForm({
  onKeyDown,
  onSubmit,
  children,
  autoFocusFirst,
  id,
  ...props
}: FormHTMLAttributes<HTMLFormElement> & {
  /** Focus the first field on mount. Defaults to true on `/…/new` create routes. */
  autoFocusFirst?: boolean
}) {
  const formRef = useRef<HTMLFormElement>(null)
  const generatedId = useId()
  const formId = id ?? `app-form-${generatedId.replace(/:/g, '')}`
  const location = useLocation()
  const shouldFocus = autoFocusFirst ?? isCreateFormPath(location.pathname)

  useEffect(() => {
    if (!shouldFocus) return
    const form = formRef.current
    if (!form) return
    const frame = requestAnimationFrame(() => focusFirstFormField(form))
    return () => cancelAnimationFrame(frame)
  }, [shouldFocus, location.pathname])

  return (
    <AppFormContext.Provider value={formId}>
      <form
        {...props}
        id={formId}
        ref={formRef}
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit?.(event)
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event)
          if (event.defaultPrevented) return
          handleFormEnter(event)
        }}
      >
        {children}
      </form>
    </AppFormContext.Provider>
  )
}

function PageHeaderActionsPortal({ children }: { children: ReactNode }) {
  const [slot, setSlot] = useState<HTMLElement | null>(null)
  useLayoutEffect(() => {
    setSlot(document.getElementById(PAGE_HEADER_ACTIONS_SLOT_ID))
  }, [])
  if (!slot) return null
  return createPortal(children, slot)
}

/** آیکون ویرایش و حذف در هدر صفحه (جزئیات) */
export function HeaderDetailActions({
  editTo,
  editLabel,
  deleteLabel,
  onDelete,
}: {
  editTo: string
  editLabel?: string
  deleteLabel?: string
  onDelete?: () => void
}) {
  const { t } = useTranslation()
  const edit = editLabel ?? t('common.edit')
  const remove = deleteLabel ?? t('common.delete')
  return (
    <div className="flex flex-nowrap items-center gap-2 print:hidden">
      <Link to={editTo} aria-label={edit} title={edit}>
        <Button type="button" variant="ghost" icon>
          <Pencil className="size-4" aria-hidden />
        </Button>
      </Link>
      {onDelete ? (
        <Button
          type="button"
          variant="ghost"
          icon
          className="text-red-600 hover:bg-red-50 hover:text-red-700"
          aria-label={remove}
          title={remove}
          onClick={onDelete}
        >
          <Trash2 className="size-4" aria-hidden />
        </Button>
      ) : null}
    </div>
  )
}

/** آیکون ذخیره و انصراف در هدر صفحه (ویرایش) */
export function HeaderFormActions({
  form,
  submitLabel,
  cancelLabel,
  submitting,
  onCancel,
}: {
  form: string
  submitLabel: string
  cancelLabel?: string
  submitting?: boolean
  onCancel?: () => void
}) {
  return (
    <div className="flex flex-nowrap items-center gap-2 print:hidden">
      <Button type="submit" form={form} icon disabled={submitting} aria-label={submitLabel} title={submitLabel}>
        <Check className="size-4" aria-hidden />
      </Button>
      {onCancel && cancelLabel ? (
        <Button
          type="button"
          variant="ghost"
          icon
          data-form-cancel={form}
          aria-label={cancelLabel}
          title={cancelLabel}
          onClick={onCancel}
        >
          <X className="size-4" aria-hidden />
        </Button>
      ) : null}
    </div>
  )
}

export function FormActions({
  submitLabel,
  cancelLabel,
  submitting,
  onCancel,
  className = '',
  headerIcons,
  extraItems,
  cancelEnd = false,
  submitVariant = 'primary',
}: {
  submitLabel: string
  cancelLabel?: string
  submitting?: boolean
  onCancel?: () => void
  className?: string
  /** آیکون ذخیره/انصراف در هدر. پیش‌فرض روی مسیر ایجاد/ویرایش روشن است */
  headerIcons?: boolean
  extraItems?: DetailActionExtraItem[]
  /** انصراف در انتهای اینلاین فرم (سمت چپ در RTL) */
  cancelEnd?: boolean
  /** عملیات مخرب مانند ابطال با دکمه قرمز نمایش داده می‌شود. */
  submitVariant?: 'primary' | 'danger'
}) {
  const { pathname } = useLocation()
  const formId = useContext(AppFormContext)
  const showHeaderIcons = headerIcons ?? isCreateOrEditPath(pathname)
  const isEntryPath = isCreateOrEditPath(pathname)
  const isEditPath = pathname.replace(/\/+$/, '').split('/').filter(Boolean).at(-1) === 'edit'
  useEscapeCancel(onCancel && cancelLabel ? onCancel : undefined)
  useEditFormDoubleSave(isEditPath && !submitting, formId)
  const extras = extraItems ?? []
  const hasExtra = extras.length > 0
  const showCancel = Boolean(onCancel && cancelLabel)
  const cancelButton = showCancel ? (
    <Button type="button" variant="ghost" data-form-cancel={formId ?? ''} onClick={onCancel}>
      <X className="size-4" aria-hidden />
      {cancelLabel}
    </Button>
  ) : null
  return (
    <>
      <div
        className={`flex flex-wrap items-center gap-3 ${hasExtra || cancelEnd ? 'w-full justify-between' : ''} ${isEntryPath ? 'pt-4' : ''} ${className}`.trim()}
      >
        <div className="flex flex-wrap gap-3">
          <Button type="submit" variant={submitVariant} disabled={submitting}>
            <Check className="size-4" aria-hidden />
            {submitLabel}
          </Button>
          {cancelEnd ? null : cancelButton}
        </div>
        {hasExtra || (cancelEnd && showCancel) ? (
          <div className="flex flex-wrap gap-3">
            {hasExtra ? renderDetailExtraButtons(extras) : null}
            {cancelEnd ? cancelButton : null}
          </div>
        ) : null}
      </div>
      {showHeaderIcons && formId ? (
        <PageHeaderActionsPortal>
          <HeaderFormActions
            form={formId}
            submitLabel={submitLabel}
            cancelLabel={cancelLabel}
            submitting={submitting}
            onCancel={onCancel}
          />
        </PageHeaderActionsPortal>
      ) : null}
    </>
  )
}

export type DetailActionExtraItem = {
  to?: string
  onClick?: () => void
  label: string
  icon: LucideIcon
  variant?: 'soft' | 'ghost'
}

function DetailActionSheetRow({
  icon: Icon,
  label,
  tone = 'teal',
  to,
  onClick,
}: {
  icon: LucideIcon
  label: string
  tone?: 'teal' | 'mint' | 'danger'
  to?: string
  onClick?: () => void
}) {
  const toneClass =
    tone === 'danger' ? 'text-red-700 hover:bg-red-50' : 'text-ink-800 hover:bg-teal-50'
  const iconWrap =
    tone === 'danger' ? 'bg-red-600 text-white' : tone === 'mint' ? 'bg-mint-500 text-white' : 'bg-teal-500 text-white'
  const className = `flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-2xl px-2 py-2 text-start text-sm font-medium ${toneClass}`
  const content = (
    <>
      <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${iconWrap}`}>
        <Icon className="size-4" aria-hidden />
      </span>
      {label}
    </>
  )
  if (to) {
    return (
      <Link to={to} className={className} onClick={onClick}>
        {content}
      </Link>
    )
  }
  return (
    <button type="button" className={className} onClick={onClick}>
      {content}
    </button>
  )
}

function DetailActionsSheet({
  titleId,
  title,
  closeLabel,
  editTo,
  editLabel,
  deleteLabel,
  extraItems,
  onClose,
  onDelete,
}: {
  titleId: string
  title: string
  closeLabel: string
  editTo: string
  editLabel: string
  deleteLabel?: string
  extraItems: DetailActionExtraItem[]
  onClose: () => void
  onDelete?: () => void
}) {
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const first = sheetRef.current?.querySelector<HTMLElement>('[data-sheet-actions] a, [data-sheet-actions] button')
    first?.focus()
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 z-[80]" data-enter-ignore>
      <button
        type="button"
        className="absolute inset-0 bg-ink-900/30"
        aria-label={closeLabel}
        onClick={onClose}
      />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="fixed inset-x-0 bottom-0 z-10 mx-auto flex max-h-[min(32rem,85dvh)] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-line bg-white pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-16px_40px_rgba(20,40,40,0.14)]"
      >
        <div className="mx-auto mt-2 h-1.5 w-10 shrink-0 rounded-full bg-line" aria-hidden />
        <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-3">
          <h2 id={titleId} className="text-sm font-semibold text-ink-900">
            {title}
          </h2>
          <Button type="button" variant="ghost" icon className="size-9" onClick={onClose} aria-label={closeLabel}>
            <X className="size-4" aria-hidden />
          </Button>
        </div>
        <div data-sheet-actions className="min-h-0 overflow-y-auto px-3 pb-1">
          {extraItems.length ? (
            <div className="flex flex-col gap-1">
              {extraItems.map((item) => (
                <DetailActionSheetRow
                  key={`${item.label}-${item.to ?? 'action'}`}
                  icon={item.icon}
                  label={item.label}
                  tone={item.variant === 'ghost' ? 'teal' : 'mint'}
                  to={item.to}
                  onClick={() => {
                    onClose()
                    item.onClick?.()
                  }}
                />
              ))}
            </div>
          ) : null}
          {extraItems.length ? <div className="mx-2 my-2 border-t border-line" /> : null}
          <div className="flex flex-col gap-1">
            <DetailActionSheetRow icon={Pencil} label={editLabel} to={editTo} onClick={onClose} />
            {onDelete && deleteLabel ? (
              <DetailActionSheetRow
                icon={Trash2}
                label={deleteLabel}
                tone="danger"
                onClick={() => {
                  onClose()
                  onDelete()
                }}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

function renderDetailExtraButtons(items: DetailActionExtraItem[]) {
  return items.map((item) => {
    const button = (
      <Button
        type="button"
        variant={item.variant ?? 'soft'}
        onClick={item.to ? undefined : item.onClick}
      >
        <item.icon className="size-4" aria-hidden />
        {item.label}
      </Button>
    )
    if (item.to) {
      return (
        <Link key={`${item.label}-${item.to}`} to={item.to}>
          {button}
        </Link>
      )
    }
    return <span key={item.label}>{button}</span>
  })
}

export function DetailActions({
  editTo,
  editLabel,
  deleteLabel,
  onDelete,
  extraItems,
  className = 'mt-6',
  headerIcons = true,
}: {
  editTo: string
  editLabel: string
  deleteLabel?: string
  onDelete?: () => void
  extraItems?: DetailActionExtraItem[]
  className?: string
  /** آیکون ویرایش/حذف در هدر صفحه برای دسترسی سریع */
  headerIcons?: boolean
}) {
  const { t } = useTranslation()
  useRegisterDetailEditTo(editTo)
  const titleId = useId()
  const [open, setOpen] = useState(false)
  const closeSheet = useCallback(() => setOpen(false), [])
  const extras = extraItems ?? []
  const hasExtra = extras.length > 0

  const coreButtons = (
    <>
      <Link to={editTo}>
        <Button type="button" className="w-full md:w-auto">
          <Pencil className="size-4" aria-hidden />
          {editLabel}
        </Button>
      </Link>
      {onDelete && deleteLabel ? (
        <Button type="button" variant="danger" className="w-full md:w-auto" onClick={onDelete}>
          <Trash2 className="size-4" aria-hidden />
          {deleteLabel}
        </Button>
      ) : null}
    </>
  )

  return (
    <div
      className={`rounded-2xl border border-teal-100 bg-gradient-to-b from-teal-50/70 to-white p-4 sm:p-5 ${className}`}
    >
      {hasExtra ? (
        <div className="md:hidden">
          <Button
            type="button"
            variant="soft"
            className="w-full"
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <Ellipsis className="size-4" aria-hidden />
            {t('common.actions')}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 md:hidden">{coreButtons}</div>
      )}
      <div
        className={`hidden items-center gap-3 md:flex md:flex-wrap ${hasExtra ? 'justify-between' : ''}`}
      >
        <div className="flex flex-wrap gap-3">{coreButtons}</div>
        {hasExtra ? <div className="flex flex-wrap gap-3">{renderDetailExtraButtons(extras)}</div> : null}
      </div>
      {open && hasExtra ? (
        <DetailActionsSheet
          titleId={titleId}
          title={t('common.actions')}
          closeLabel={t('common.close')}
          editTo={editTo}
          editLabel={editLabel}
          deleteLabel={deleteLabel}
          extraItems={extras}
          onClose={closeSheet}
          onDelete={onDelete}
        />
      ) : null}
      {headerIcons ? (
        <PageHeaderActionsPortal>
          <HeaderDetailActions
            editTo={editTo}
            editLabel={editLabel}
            deleteLabel={deleteLabel}
            onDelete={onDelete}
          />
        </PageHeaderActionsPortal>
      ) : null}
    </div>
  )
}

export { LoadingState } from './LoadingState'
