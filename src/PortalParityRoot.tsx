import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  Ban,
  BadgeCheck,
  Banknote,
  BookOpen,
  Briefcase,
  BriefcaseBusiness,
  Building2,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  Camera,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleChevronDown,
  CircleChevronUp,
  CircleAlert,
  CircleCheck,
  CircleDashed,
  CircleUserRound,
  CirclePause,
  CirclePlay,
  CircleX,
  Clock3,
  Car,
  ContactRound,
  Flag,
  CreditCard,
  ClipboardList,
  Eye,
  EyeOff,
  FileBadge2,
  FilePlus,
  Files,
  Fingerprint,
  FileText,
  FilterX,
  FolderKanban,
  FolderOpen,
  Gavel,
  Gauge,
  Globe,
  GraduationCap,
  HardHat,
  Hash,
  History,
  Home,
  IdCard,
  Info,
  Languages,
  ImagePlus,
  KeyRound,
  Landmark,
  Layers,
  ListOrdered,
  LogOut,
  Mail,
  MapPin,
  MapPinned,
  Menu,
  MessageCircle,
  MessageSquareText,
  Mic,
  PanelLeftClose,
  PanelLeftOpen,
  Percent,
  Paperclip,
  Play,
  Phone,
  PhoneOff,
  Plus,
  ReceiptText,
  RefreshCw,
  Ruler,
  Scale,
  Search,
  Send,
  SlidersHorizontal,
  ShieldAlert,
  ShieldCheck,
  Share2,
  Signpost,
  Store,
  Tag,
  Trash2,
  Type,
  Users,
  UserPlus,
  UserRound,
  Wallet,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import {
  BrowserRouter,
  Link,
  Navigate,
  NavLink,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import { Toaster, toast } from 'sonner'
import { DateText } from '@asnaf/components/ui/DateText'
import { PersianDateField } from '@asnaf/components/ui/PersianDateField'
import { parseDigitString, toLatinDigits } from '@asnaf/lib/datetime'
import { optimizeImageFile } from '@asnaf/lib/optimize-image'
import { isValidIranianNationalId, normalizeNationalId } from '@asnaf/lib/national-id'
import { IssuedActivityLicense } from '@asnaf/pages/cases/IssuedActivityLicense'
import {
  PREMISE_ESTABLISHMENTS,
  PREMISE_GEO_POSITIONS,
  PREMISE_OWNERSHIPS,
  PREMISE_PUBLIC_ACCESSES,
  PREVIOUS_OCCUPATIONS,
} from '@asnaf/pages/cases/formation-types'
import type { ActivityLicense } from '@asnaf/pages/cases/activity-license'
import { clearPortalToken, getPortalToken, setPortalToken } from './lib/auth-token'
import { HeaderToday } from './HeaderToday'
import { getApiErrorMessage, portalApi } from './lib/api'
import { PortalLetterButtons, PortalLettersToolbar } from './components/PortalLetters'
import { PortalAuctionDetailPage, PortalAuctionNewPage } from './pages/CaseAuctionPages'
import { PortalRenewalPage } from './pages/CaseRenewalPage'
import { CaseStewardshipFormationPage } from './pages/CaseStewardshipFormationPage'
import { PortalLocationChangePage } from './pages/CaseLocationChangePage'
import type {
  CaseDetail,
  CaseListKind,
  CaseSuspension,
  CaseRequest,
  CaseRequestBadge,
  CaseSummary,
  CatalogJob,
  CatalogJobGroup,
  CatalogJobStats,
  CatalogJobType,
  IssuanceDocument,
  IssuanceState,
  Lookup,
  Paginated,
  PortalDossier,
  PortalDossierDocument,
  PortalDossierPlace,
  PortalLicense,
  PortalStewardshipCard,
  PortalStewardLookup,
  PortalStewardRow,
  PortalUser,
  PortalSmsMessage,
  PortalViolation,
  PortalViolationSummary,
  PortalViolationAttachment,
} from './types/portal'

const cardClassName =
  'rounded-[22px] border border-white bg-white shadow-[0_10px_30px_rgba(20,40,40,0.05)]'
const fieldClassName =
  'w-full rounded-2xl border border-line bg-cream-50 px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 disabled:cursor-not-allowed disabled:opacity-60'
const shellClassName = 'mx-auto w-full min-w-0'
const catalogShellClassName = 'mx-auto w-full min-w-0 lg:w-3/4'
const actionsColClassName = 'w-px min-w-max whitespace-nowrap px-4 py-3'
const formBodyClassName = 'space-y-4 p-5 sm:p-6'

type RegisterPayload = {
  firstName: string
  lastName: string
  nationalId: string
  phone: string
  password: string
}

type AuthValue = {
  user: PortalUser | null
  loading: boolean
  login: (identifier: string, password: string) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthValue | null>(null)

function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('AuthContext is missing')
  return value
}

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PortalUser | null>(null)
  const [loading, setLoading] = useState(Boolean(getPortalToken()))

  useEffect(() => {
    const logout = () => {
      clearPortalToken()
      setUser(null)
      setLoading(false)
    }
    window.addEventListener('portal:unauthorized', logout)
    if (getPortalToken()) {
      portalApi
        .get<PortalUser>('/auth/me')
        .then(({ data }) => setUser(data))
        .catch(logout)
        .finally(() => setLoading(false))
    }
    return () => window.removeEventListener('portal:unauthorized', logout)
  }, [])

  const value = useMemo<AuthValue>(
    () => ({
      user,
      loading,
      login: async (identifier, password) => {
        const { data } = await portalApi.post<{ accessToken: string; user: PortalUser }>(
          '/auth/login',
          { identifier, password },
        )
        setPortalToken(data.accessToken)
        setUser(data.user)
      },
      register: async (payload) => {
        const { data } = await portalApi.post<{ accessToken: string; user: PortalUser }>(
          '/auth/register',
          payload,
        )
        setPortalToken(data.accessToken)
        setUser(data.user)
      },
      logout: () => {
        clearPortalToken()
        setUser(null)
      },
    }),
    [loading, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function Button({
  variant = 'primary',
  icon,
  className = '',
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'soft' | 'ghost' | 'danger'
  icon?: boolean
  children: ReactNode
}) {
  const variants = {
    primary: 'bg-teal-500 text-white hover:bg-teal-600 disabled:opacity-60 shadow-sm',
    soft: 'bg-mint-500 text-white hover:bg-mint-600 disabled:opacity-60 shadow-sm',
    ghost:
      'bg-white text-ink-700 hover:bg-teal-50 border border-teal-400 shadow-[0_4px_12px_rgba(46,189,182,0.16)]',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-60',
  }
  return (
    <button
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl text-sm font-medium transition disabled:cursor-not-allowed ${
        icon ? 'size-9 p-0' : 'px-[0.9rem] py-2.5'
      } ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

function AppForm({
  children,
  autoFocusFirst,
  onKeyDown,
  onSubmit,
  ...props
}: React.FormHTMLAttributes<HTMLFormElement> & { autoFocusFirst?: boolean }) {
  const ref = useRef<HTMLFormElement>(null)
  useEffect(() => {
    if (!autoFocusFirst) return
    const frame = requestAnimationFrame(() => {
      ref.current
        ?.querySelector<HTMLElement>('input:not([disabled]), textarea:not([disabled]), button[aria-haspopup="listbox"]')
        ?.focus()
    })
    return () => cancelAnimationFrame(frame)
  }, [autoFocusFirst])
  return (
    <form
      ref={ref}
      {...props}
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit?.(event)
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (event.defaultPrevented || event.key !== 'Enter' || event.nativeEvent.isComposing) return
        const target = event.target as HTMLElement
        if (target.closest('textarea, [data-enter-ignore]')) return
        if (target.closest('button:not([type="submit"])')) return
        event.preventDefault()
        if (event.currentTarget.checkValidity()) event.currentTarget.requestSubmit()
        else event.currentTarget.querySelector<HTMLElement>(':invalid')?.focus()
      }}
    >
      {children}
    </form>
  )
}

function FormField({
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
    <div className="flex w-full min-w-0 flex-col gap-1.5">
      <label htmlFor={htmlFor} className="flex items-center gap-2 text-sm font-medium text-ink-900">
        <Icon className="size-4 text-teal-600" aria-hidden />
        {label}
      </label>
      {children}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  )
}

function GuestAuthShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  return (
    <div className="flex min-h-svh flex-col bg-cream-50">
      <header className="border-b border-line/70 bg-white/90 px-4 py-3 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-center">
          <img src="/head3.png" alt={t('app.title')} className="h-16 w-auto max-w-full object-contain" />
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  )
}

function AuthNotice({
  icon: Icon,
  tone = 'teal',
  children,
}: {
  icon: LucideIcon
  tone?: 'teal' | 'mint' | 'warn'
  children: ReactNode
}) {
  const toneClass =
    tone === 'mint'
      ? 'border-mint-100 bg-gradient-to-b from-mint-50 to-white text-ink-800'
      : tone === 'warn'
        ? 'border-amber-100 bg-gradient-to-b from-amber-50 to-white text-ink-800'
        : 'border-teal-100 bg-gradient-to-b from-teal-50 to-white text-ink-800'
  const iconClass =
    tone === 'mint'
      ? 'bg-mint-500 text-white'
      : tone === 'warn'
        ? 'bg-amber-500 text-white'
        : 'bg-teal-500 text-white'
  return (
    <div className={`flex items-start gap-3 rounded-2xl border px-4 py-4 text-sm leading-7 ${toneClass}`}>
      <span className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl ${iconClass}`}>
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 pt-1">{children}</div>
    </div>
  )
}

const guestLinkClassName =
  'block text-center text-sm leading-7 text-teal-700 transition hover:text-teal-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 rounded-xl'

function HeaderDecor() {
  return (
    <>
      <div className="pointer-events-none absolute -start-8 -top-10 size-32 rounded-full bg-teal-200/30" />
      <div className="pointer-events-none absolute -end-6 -bottom-12 size-28 rounded-full bg-mint-100/70" />
    </>
  )
}

function CardHeader({
  icon: Icon,
  title,
  titleExtra,
  subtitle,
  action,
  leading,
  page,
  avatar,
}: {
  icon: LucideIcon
  title: ReactNode
  titleExtra?: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
  leading?: ReactNode
  page?: boolean
  avatar?: { photoUrl: string | null; fullName: string }
}) {
  const Heading = page ? 'h1' : 'h2'
  return (
    <header className="relative shrink-0 overflow-hidden bg-gradient-to-e from-mint-50 via-white to-teal-50 px-5 py-5 sm:px-6">
      <HeaderDecor />
      <div className="relative flex flex-wrap items-center justify-between gap-3 sm:flex-nowrap">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {leading}
          {avatar ? (
            <PersonAvatar photoUrl={avatar.photoUrl} fullName={avatar.fullName} size="header" />
          ) : (
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-teal-500 text-white shadow-[0_10px_22px_rgba(46,189,182,0.32)]">
              <Icon className="size-6" aria-hidden />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-wrap items-center gap-3">
              <Heading
                className={
                  page
                    ? 'text-xl font-semibold leading-snug text-ink-900 sm:text-2xl'
                    : 'text-base font-semibold leading-snug text-ink-900'
                }
              >
                {title}
              </Heading>
              {titleExtra}
            </div>
            {subtitle ? (
              <div className={page ? 'mt-1 text-sm leading-6 text-ink-500' : 'mt-0.5 text-xs leading-5 text-ink-500'}>
                {subtitle}
              </div>
            ) : null}
          </div>
        </div>
        {action ? <div className="relative z-10 flex shrink-0 items-center">{action}</div> : null}
      </div>
    </header>
  )
}

function PageHeader({
  icon,
  title,
  titleExtra,
  subtitle,
  action,
  backTo,
}: {
  icon: LucideIcon
  title: string
  titleExtra?: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
  backTo?: string
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useEffect(() => {
    if (!backTo) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (document.querySelector('[aria-modal="true"]')) return
      event.preventDefault()
      navigate(backTo)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [backTo, navigate])
  return (
    <section className={`${cardClassName} mb-6 overflow-hidden`}>
      <CardHeader
        page
        icon={icon}
        title={title}
        titleExtra={titleExtra}
        subtitle={subtitle}
        action={action}
        leading={
          backTo ? (
            <Link
              to={backTo}
              aria-label={t('common.back')}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-2xl text-teal-700 transition hover:bg-teal-50"
            >
              <ArrowRight className="size-5" aria-hidden />
            </Link>
          ) : null
        }
      />
    </section>
  )
}

function FormCard({
  icon,
  title,
  subtitle,
  titleExtra,
  chips,
  action,
  avatar,
  className = '',
  children,
}: {
  icon: LucideIcon
  title: ReactNode
  subtitle?: ReactNode
  titleExtra?: ReactNode
  chips?: ReactNode
  action?: ReactNode
  avatar?: { photoUrl: string | null; fullName: string }
  className?: string
  children: ReactNode
}) {
  return (
    <section className={`${cardClassName} overflow-hidden ${className}`}>
      <CardHeader
        icon={icon}
        title={
          titleExtra ? (
            <span className="flex flex-wrap items-center gap-2">
              <span>{title}</span>
              {titleExtra}
            </span>
          ) : title
        }
        subtitle={
          chips ? (
            <span className="flex flex-wrap items-center gap-1.5">
              {subtitle}
              {chips}
            </span>
          ) : subtitle
        }
        action={action}
        avatar={avatar}
      />
      {children}
    </section>
  )
}

function FormSectionTitle({
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

type FormTabItem = { id: string; label: string; icon: LucideIcon }

function FormTabs({ tabs, value, onChange }: {
  tabs: FormTabItem[]
  value: string
  onChange: (id: string) => void
}) {
  function move(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    const index = tabs.findIndex((item) => item.id === value)
    if (index < 0) return
    const forward = event.key === 'ArrowLeft'
      ? document.documentElement.dir === 'rtl'
      : document.documentElement.dir !== 'rtl'
    const next = tabs[(index + (forward ? 1 : -1) + tabs.length) % tabs.length]
    if (!next) return
    onChange(next.id)
    document.getElementById(`form-tab-${next.id}`)?.focus()
  }
  return (
    <div role="tablist" onKeyDown={move} className="flex flex-wrap gap-2 border-b border-teal-100 px-4 pt-4 sm:px-6">
      {tabs.map(({ id, label, icon: Icon }) => {
        const active = id === value
        return (
          <button
            key={id}
            id={`form-tab-${id}`}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={`form-panel-${id}`}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(id)}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-t-xl px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 ${
              active
                ? 'bg-teal-500 bg-[linear-gradient(to_inline-end,var(--color-teal-500),var(--color-mint-500))] text-white shadow-sm'
                : 'text-ink-600 hover:bg-teal-50 hover:text-teal-700'
            }`}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </button>
        )
      })}
    </div>
  )
}

function CopyableDigits({ value }: { value: string }) {
  const { t } = useTranslation()
  return (
    <button
      type="button"
      className="cursor-pointer text-start"
      onClick={(event) => {
        event.stopPropagation()
        void navigator.clipboard.writeText(value).then(
          () => toast.success(t('common.copied')),
          () => toast.error(t('app.error')),
        )
      }}
    >
      {localizeDigits(value)}
    </button>
  )
}

function FormFactTile({
  icon: Icon,
  label,
  value,
  tone = 'teal',
  className = '',
  copyValue,
}: {
  icon: LucideIcon
  label: string
  value?: ReactNode
  tone?: 'teal' | 'mint' | 'ink'
  className?: string
  copyValue?: string | null
}) {
  const tones = {
    teal: 'border-teal-100 bg-gradient-to-b from-teal-50 to-white',
    mint: 'border-mint-100 bg-gradient-to-b from-mint-50 to-white',
    ink: 'border-line bg-gradient-to-b from-cream-50 to-white',
  }
  const icons = {
    teal: 'bg-teal-100 text-teal-500',
    mint: 'bg-mint-100 text-mint-500',
    ink: 'bg-cream-100 text-ink-500',
  }
  const shown = copyValue !== undefined ? (copyValue ? <CopyableDigits value={copyValue} /> : undefined) : value
  return (
    <article className={`flex min-w-0 items-start gap-3 rounded-2xl border px-3 py-3 ${tones[tone]} ${className}`}>
      <span className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl ${icons[tone]}`}>
        <Icon className="size-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-ink-500">{label}</p>
        <div className={`mt-0.5 break-words text-sm font-semibold ${shown ? 'text-ink-900' : 'text-ink-400'}`}>
          {shown || '—'}
        </div>
      </div>
    </article>
  )
}

function LoadingState({ fullscreen = false }: { fullscreen?: boolean }) {
  const { t } = useTranslation()
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 text-ink-500 ${
        fullscreen ? 'min-h-svh' : 'py-16'
      }`}
      role="status"
    >
      <span className="relative size-12">
        <span className="absolute inset-0 rounded-full border-2 border-teal-100" />
        <span className="absolute inset-0 animate-loading-spin rounded-full border-2 border-transparent border-r-teal-400 border-t-teal-500" />
        <span className="absolute inset-[35%] animate-loading-pulse rounded-full bg-teal-500/70" />
      </span>
      <p className="text-sm tracking-wide text-ink-400">{t('app.loading')}</p>
    </div>
  )
}

function ErrorState({ error }: { error: unknown }) {
  const { t } = useTranslation()
  return (
    <div className={`${cardClassName} border-red-100 px-4 py-10 text-center text-sm text-red-700`}>
      {getApiErrorMessage(error, t('app.error'))}
    </div>
  )
}

function EmptyState({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-cream-50 px-4 py-10 text-center text-sm text-ink-400">
      <span className="flex size-11 items-center justify-center rounded-2xl bg-white text-teal-500 shadow-sm">
        <Icon className="size-5" aria-hidden />
      </span>
      {text}
    </div>
  )
}

function localizeDigits(value: string) {
  const digits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return value.replace(/\d/g, (digit) => digits[Number(digit)] ?? digit)
}

function formatNumber(value: number | string | null | undefined) {
  if (value == null || value === '') return '—'
  return new Intl.NumberFormat('fa-IR').format(Number(value))
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—'
  const parts = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(new Date(value))
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? ''
  return `${get('year')}/${get('month')}/${get('day')}`
}

function formatClock(value: string) {
  return new Intl.DateTimeFormat('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(value))
}

function statusLabel(value: string, translate: (key: string) => string) {
  const translated = translate(`status.${value}`)
  return translated === `status.${value}` ? value : translated
}

type PortalNavMenu = { to: string; key: string; icon: LucideIcon; end?: boolean }

type PortalNavModule = {
  code: string
  nameKey: string
  icon: LucideIcon
  menus: PortalNavMenu[]
}

const portalNav: PortalNavModule[] = [
  {
    code: 'dashboard',
    nameKey: 'nav.dashboard',
    icon: Gauge,
    menus: [{ to: '/dashboard', key: 'nav.overview', icon: Gauge, end: true }],
  },
  {
    code: 'cases',
    nameKey: 'nav.casesModule',
    icon: FolderKanban,
    menus: [
      { to: '/cases/formation', key: 'nav.formation', icon: FilePlus },
      { to: '/cases', key: 'nav.cases', icon: Files },
    ],
  },
  {
    code: 'inspection',
    nameKey: 'nav.inspection',
    icon: Scale,
    menus: [{ to: '/violations', key: 'nav.myViolations', icon: Gavel }],
  },
  {
    code: 'base-info',
    nameKey: 'nav.baseInfo',
    icon: Globe,
    menus: [
      { to: '/base-info/job-types', key: 'nav.jobTypes', icon: Briefcase },
      { to: '/base-info/job-groups', key: 'nav.jobGroups', icon: FolderKanban },
      { to: '/base-info/jobs', key: 'nav.jobs', icon: HardHat },
    ],
  },
  {
    code: 'account',
    nameKey: 'nav.account',
    icon: CircleUserRound,
    menus: [
      { to: '/account', key: 'nav.account', icon: CircleUserRound },
      { to: '/account/sms', key: 'nav.mySms', icon: MessageSquareText },
    ],
  },
]

function Protected() {
  const { user, loading } = useAuth()
  if (loading) return <LoadingState fullscreen />
  return user ? <Outlet /> : <Navigate to="/login" replace />
}

function useAccountPhoto(userId: string | undefined, hasPhoto: boolean) {
  const photo = useQuery({
    queryKey: ['account-photo', userId],
    enabled: Boolean(userId && hasPhoto),
    staleTime: Number.POSITIVE_INFINITY,
    queryFn: () =>
      portalApi
        .get<Blob>('/account/photo', { responseType: 'blob' })
        .then(({ data }) => data),
  })
  const photoUrl = useMemo(
    () => (photo.data ? URL.createObjectURL(photo.data) : null),
    [photo.data],
  )
  useEffect(() => {
    return () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl)
    }
  }, [photoUrl])
  return photoUrl
}

function avatarInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  return `${parts[0]?.[0] ?? ''}${parts.length > 1 ? parts.at(-1)?.[0] ?? '' : ''}` || '؟'
}

function PersonAvatar({
  photoUrl,
  fullName,
  size = 'menu',
}: {
  photoUrl: string | null
  fullName: string
  size?: 'menu' | 'header' | 'profile' | 'list'
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const visiblePhoto = photoUrl && photoUrl !== failedUrl ? photoUrl : null
  const sizes = {
    menu: 'size-8 rounded-full bg-teal-100 text-xs text-teal-800 ring-teal-200',
    header: 'size-12 rounded-2xl bg-teal-100 text-sm text-teal-800 ring-teal-200',
    profile: 'size-20 rounded-[22px] bg-teal-100 text-xl text-teal-800 ring-teal-200',
    list: 'size-10 rounded-xl bg-teal-50 text-teal-600 ring-teal-100',
  }
  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden font-semibold ring-1 ${sizes[size]}`}
      aria-label={fullName}
    >
      {visiblePhoto ? (
        <img
          src={visiblePhoto}
          alt=""
          draggable={false}
          className="size-full object-cover"
          onError={() => setFailedUrl(photoUrl)}
        />
      ) : size === 'list' ? (
        <UserRound className="size-5" aria-hidden />
      ) : (
        avatarInitials(fullName)
      )}
    </span>
  )
}

function UserMenu() {
  const { user, logout } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const photoUrl = useAccountPhoto(user?.id, Boolean(user?.hasPhoto))
  useEffect(() => {
    const click = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', click)
    document.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('mousedown', click)
      document.removeEventListener('keydown', key)
    }
  }, [])
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="flex cursor-pointer items-center gap-2 rounded-2xl border border-line bg-white px-3 py-2 text-sm shadow-sm sm:min-w-[16.5rem]"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <PersonAvatar photoUrl={photoUrl} fullName={user?.fullName ?? ''} />
        <span className="hidden min-w-0 flex-1 text-start sm:block">
          <span className="block font-medium text-ink-900">{user?.fullName}</span>
          <span className="block text-xs text-ink-400">{user?.username}</span>
        </span>
        <ChevronDown className="size-4 shrink-0 text-ink-400" aria-hidden />
      </button>
      {open ? (
        <div className="absolute end-0 top-full z-50 mt-2 w-56 min-w-full overflow-hidden rounded-2xl border border-line bg-white shadow-lg">
          <Link
            to="/account"
            className="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-cream-50"
            onClick={() => setOpen(false)}
          >
            <UserRound className="size-4 text-teal-600" aria-hidden />
            {t('nav.account')}
          </Link>
          <Link
            to="/account/password"
            className="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-cream-50"
            onClick={() => setOpen(false)}
          >
            <KeyRound className="size-4 text-teal-600" aria-hidden />
            {t('account.changePassword')}
          </Link>
          <button
            type="button"
            className="flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50"
            onClick={() => {
              logout()
              navigate('/login')
            }}
          >
            <LogOut className="size-4" aria-hidden />
            {t('auth.logout')}
          </button>
        </div>
      ) : null}
    </div>
  )
}

function menuActive(item: PortalNavMenu, pathname: string) {
  if (item.to === '/cases') {
    return (
      pathname === '/cases' ||
      (/^\/cases\/[^/]+/.test(pathname) && !pathname.startsWith('/cases/formation'))
    )
  }
  if (item.to === '/account') {
    return pathname === '/account' || pathname.startsWith('/account/password')
  }
  if (item.end) return pathname === item.to
  return pathname === item.to || pathname.startsWith(`${item.to}/`)
}

function Breadcrumbs() {
  const { t } = useTranslation()
  const location = useLocation()
  const crumbs: Array<{ label: string; to?: string }> = [{ label: t('nav.dashboard'), to: '/dashboard' }]
  if (location.pathname === '/cases/formation') {
    crumbs.push({ label: t('nav.casesModule'), to: '/cases' }, { label: t('cases.formationTitle') })
  } else if (location.pathname.startsWith('/cases')) {
    crumbs.push({ label: t('nav.cases'), to: location.pathname === '/cases' ? undefined : '/cases' })
    if (/^\/cases\/[^/]+$/.test(location.pathname)) crumbs.push({ label: t('cases.details') })
    if (location.pathname.endsWith('/finance')) crumbs.push({ label: t('finance.title') })
    if (location.pathname.endsWith('/dossier')) crumbs.push({ label: t('cases.dossierTitle') })
    if (location.pathname.endsWith('/license')) crumbs.push({ label: t('cases.licenseTitle') })
    if (location.pathname.endsWith('/stewardship/card')) crumbs.push({ label: t('cases.stewardship.cardTitle') })
    else if (/\/cases\/[^/]+\/stewardship$/.test(location.pathname)) crumbs.push({ label: t('cases.formationTitle') })
    if (/\/cases\/[^/]+\/renewal/.test(location.pathname)) crumbs.push({ label: t('cases.renewCurrentLicense') })
    if (/\/cases\/[^/]+\/location-change/.test(location.pathname)) crumbs.push({ label: t('cases.locationChange') })
    if (location.pathname.includes('/auction')) {
      const caseId = location.pathname.split('/')[2]
      crumbs.push({ label: t('cases.details'), to: `/cases/${caseId}` }, { label: t('cases.auction.title') })
    }
  } else if (location.pathname.startsWith('/issuance')) {
    crumbs.push({ label: t('nav.casesModule'), to: '/cases' }, { label: t('cases.formationTitle') })
  } else if (location.pathname.startsWith('/base-info')) {
    crumbs.push({ label: t('nav.baseInfo'), to: '/base-info/job-types' })
    if (location.pathname.startsWith('/base-info/job-types')) {
      crumbs.push({
        label: t('nav.jobTypes'),
        to: location.pathname === '/base-info/job-types' ? undefined : '/base-info/job-types',
      })
      if (/\/base-info\/job-types\/[^/]+/.test(location.pathname)) crumbs.push({ label: t('jobTypes.details') })
    } else if (location.pathname.startsWith('/base-info/job-groups')) {
      crumbs.push({
        label: t('nav.jobGroups'),
        to: location.pathname === '/base-info/job-groups' ? undefined : '/base-info/job-groups',
      })
      if (/\/base-info\/job-groups\/[^/]+/.test(location.pathname)) crumbs.push({ label: t('jobGroups.details') })
    } else if (location.pathname.startsWith('/base-info/jobs')) {
      crumbs.push({
        label: t('nav.jobs'),
        to: location.pathname === '/base-info/jobs' ? undefined : '/base-info/jobs',
      })
      if (/\/base-info\/jobs\/[^/]+/.test(location.pathname)) crumbs.push({ label: t('jobCatalog.details') })
    }
  } else if (location.pathname.startsWith('/violations')) {
    crumbs.push(
      { label: t('nav.inspection'), to: '/violations' },
      { label: t('nav.myViolations'), to: location.pathname === '/violations' ? undefined : '/violations' },
    )
    if (/^\/violations\/[^/]+$/.test(location.pathname)) crumbs.push({ label: t('violations.details') })
  } else if (location.pathname.startsWith('/account')) {
    crumbs.push({ label: t('nav.account'), to: location.pathname === '/account' ? undefined : '/account' })
    if (location.pathname.endsWith('/password')) crumbs.push({ label: t('account.changePassword') })
    if (location.pathname.startsWith('/account/sms')) {
      crumbs.push({
        label: t('nav.mySms'),
        to: location.pathname === '/account/sms' ? undefined : '/account/sms',
      })
      if (/^\/account\/sms\/[^/]+$/.test(location.pathname)) crumbs.push({ label: t('accountSms.details') })
    }
  }
  return (
    <nav aria-label={t('nav.breadcrumb')} className="min-w-0 flex-1">
      <ol className="hidden min-w-0 flex-wrap items-center gap-1 text-sm lg:flex">
        {crumbs.map((crumb, index) => (
          <li key={`${crumb.label}-${index}`} className="flex min-w-0 items-center gap-1">
            {index ? <ChevronLeft className="size-3.5 text-ink-300" aria-hidden /> : null}
            {crumb.to ? (
              <Link
                to={crumb.to}
                className="inline-flex max-w-56 items-center gap-1 truncate rounded-lg px-1 py-0.5 text-ink-500 hover:bg-teal-50 hover:text-teal-700"
              >
                {!index ? <Home className="size-3.5" aria-hidden /> : null}
                {crumb.label}
              </Link>
            ) : (
              <span className="inline-flex max-w-64 items-center gap-1 truncate px-1 py-0.5 font-medium text-ink-900">
                {!index ? <Home className="size-3.5 text-teal-600" aria-hidden /> : null}
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

function PortalLayout() {
  const { t } = useTranslation()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [desktopOpen, setDesktopOpen] = useState(
    () => localStorage.getItem('asnaf.portal.sidebar-open') !== '0',
  )
  const [collapsedModules, setCollapsedModules] = useState<string[]>([])
  const setDesktop = (open: boolean) => {
    setDesktopOpen(open)
    localStorage.setItem('asnaf.portal.sidebar-open', open ? '1' : '0')
  }
  return (
    <div className="h-svh w-full overflow-hidden bg-cream-50">
      <div className="flex h-full w-full">
        {mobileOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-30 cursor-pointer bg-ink-900/20 lg:hidden"
            aria-label={t('nav.close')}
            onClick={() => setMobileOpen(false)}
          />
        ) : null}
        <aside
          inert={mobileOpen || desktopOpen ? undefined : true}
          className={`fixed inset-y-0 start-0 z-40 flex h-svh w-[308px] shrink-0 flex-col overflow-hidden border-e border-teal-100 bg-gradient-to-b from-white via-teal-50/70 to-cream-50 shadow-[8px_0_28px_rgba(46,189,182,0.08)] transition-[width,transform,border-color,box-shadow] duration-300 lg:relative lg:h-full lg:ltr:translate-x-0 lg:rtl:translate-x-0 ${
            mobileOpen ? 'translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full'
          } ${desktopOpen ? 'lg:w-[308px] lg:min-w-[308px]' : 'lg:w-0 lg:min-w-0 lg:border-transparent lg:shadow-none'}`}
        >
          <div className={`relative flex h-full w-[308px] min-w-[308px] flex-col transition-opacity duration-300 ${desktopOpen ? 'opacity-100' : 'lg:opacity-0'}`}>
            <div className="relative overflow-hidden border-b border-teal-100/80 bg-gradient-to-e from-mint-50 via-white to-teal-50 px-5 py-6">
              <HeaderDecor />
              <NavLink to="/dashboard" className="relative flex items-center justify-center">
                <img src="/head3.png" alt={t('app.title')} className="h-32 w-auto max-w-full object-contain" />
              </NavLink>
              <div className="absolute bottom-2 end-3">
                <button
                  type="button"
                  className="cursor-pointer rounded-lg p-1.5 text-ink-500 hover:bg-teal-50 lg:hidden"
                  onClick={() => setMobileOpen(false)}
                  aria-label={t('nav.close')}
                >
                  <X className="size-5" />
                </button>
                <button
                  type="button"
                  className="hidden cursor-pointer rounded-lg p-1.5 text-teal-700 hover:bg-teal-50 lg:inline-flex"
                  onClick={() => setDesktop(false)}
                  aria-label={t('nav.close')}
                >
                  <PanelLeftClose className="size-5 rtl:-scale-x-100" />
                </button>
              </div>
            </div>
            <nav className="sidebar-nav flex-1 space-y-3 overflow-y-auto px-2.5 py-3">
              {portalNav.map((mod, index) => {
                const mintTone = index % 2 === 1
                const moduleActive = mod.menus.some((item) => menuActive(item, location.pathname))
                const moduleExpanded = !collapsedModules.includes(mod.code)
                const moduleName = t(mod.nameKey)
                return (
                  <section
                    key={mod.code}
                    className={`overflow-hidden rounded-2xl border shadow-[0_8px_20px_rgba(46,189,182,0.08)] ${
                      moduleActive
                        ? 'border-teal-200 bg-gradient-to-b from-teal-50 to-white shadow-[0_12px_26px_rgba(46,189,182,0.16)]'
                        : mintTone
                          ? 'border-mint-100/90 bg-gradient-to-b from-mint-50/70 to-white'
                          : 'border-teal-100/90 bg-gradient-to-b from-white to-teal-50/40'
                    }`}
                  >
                    <button
                      type="button"
                      className={`flex w-full cursor-pointer items-center gap-2.5 px-3 py-2.5 text-start ${
                        mintTone
                          ? 'bg-gradient-to-e from-mint-50 via-white to-teal-50/50'
                          : 'bg-gradient-to-e from-teal-50 via-white to-mint-50/50'
                      }`}
                      aria-expanded={moduleExpanded}
                      aria-label={t(moduleExpanded ? 'nav.collapseModule' : 'nav.expandModule', {
                        name: moduleName,
                      })}
                      onClick={() => {
                        setCollapsedModules((current) =>
                          current.includes(mod.code)
                            ? current.filter((code) => code !== mod.code)
                            : [...current, mod.code],
                        )
                      }}
                    >
                      <span
                        className={`flex size-7 shrink-0 items-center justify-center rounded-xl text-white ${
                          mintTone
                            ? 'bg-mint-500 shadow-[0_6px_14px_rgba(63,214,190,0.32)]'
                            : 'bg-teal-500 shadow-[0_6px_14px_rgba(46,189,182,0.32)]'
                        }`}
                      >
                        {createElement(mod.icon, { className: 'size-3.5', 'aria-hidden': true })}
                      </span>
                      <span
                        className={`min-w-0 flex-1 text-[11px] font-semibold leading-snug ${
                          mintTone ? 'text-mint-800' : 'text-teal-800'
                        }`}
                      >
                        {moduleName}
                      </span>
                      {moduleExpanded ? (
                        <CircleChevronUp
                          className={`size-4 shrink-0 ${mintTone ? 'text-mint-600' : 'text-teal-600'}`}
                          aria-hidden
                        />
                      ) : (
                        <CircleChevronDown
                          className={`size-4 shrink-0 ${mintTone ? 'text-mint-600' : 'text-teal-600'}`}
                          aria-hidden
                        />
                      )}
                    </button>
                    <div
                      inert={moduleExpanded ? undefined : true}
                      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                        moduleExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="space-y-1 p-1.5">
                          {mod.menus.map((item) => (
                            <NavLink
                              key={item.to}
                              to={item.to}
                              end={item.to === '/cases' || item.end}
                              onClick={() => setMobileOpen(false)}
                              className={() =>
                                `group flex items-center gap-2.5 rounded-xl px-2 py-1.5 text-sm transition ${
                                  menuActive(item, location.pathname)
                                    ? 'bg-teal-500 bg-[linear-gradient(to_inline-end,var(--color-teal-500),var(--color-mint-500))] text-white shadow-[0_8px_16px_rgba(46,189,182,0.32)]'
                                    : 'text-ink-700 hover:bg-teal-50 hover:text-teal-800'
                                }`
                              }
                            >
                              {() => (
                                <>
                                  <span
                                    className={`flex size-8 shrink-0 items-center justify-center rounded-xl ${
                                      menuActive(item, location.pathname)
                                        ? 'bg-white/20 text-white'
                                        : 'bg-teal-50 text-teal-600 group-hover:bg-white'
                                    }`}
                                  >
                                    {createElement(item.icon, { className: 'size-3.5', 'aria-hidden': true })}
                                  </span>
                                  <span className="min-w-0 flex-1 truncate">{t(item.key)}</span>
                                </>
                              )}
                            </NavLink>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>
                )
              })}
            </nav>
            <div className="shrink-0 border-t border-teal-100/80 bg-gradient-to-e from-white via-teal-50/40 to-white px-3 py-3">
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-red-600 hover:bg-red-50"
                onClick={() => {
                  logout()
                  navigate('/login')
                }}
              >
                <LogOut className="size-4" />
                {t('auth.logout')}
              </button>
            </div>
          </div>
        </aside>
        <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col">
          <header className="z-20 flex shrink-0 items-center gap-3 bg-cream-50/90 px-4 py-4 backdrop-blur sm:px-8">
            <button
              type="button"
              className="cursor-pointer rounded-xl p-2 text-ink-700 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label={t('nav.open')}
            >
              <Menu className="size-5" />
            </button>
            {!desktopOpen ? (
              <button
                type="button"
                className="hidden cursor-pointer rounded-xl p-2 text-teal-700 hover:bg-teal-50 lg:inline-flex"
                onClick={() => setDesktop(true)}
                aria-label={t('nav.open')}
              >
                <PanelLeftOpen className="size-5 rtl:-scale-x-100" />
              </button>
            ) : null}
            <Breadcrumbs />
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <HeaderToday />
              <UserMenu />
            </div>
          </header>
          <main className="min-h-0 min-w-0 w-full flex-1 overflow-x-hidden overflow-y-auto px-4 pb-8 sm:px-8">
            <div key={location.pathname} className="w-full animate-page-fade-in">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

function LoginPage() {
  const { user, login } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const mutation = useMutation({
    mutationFn: () => login(toLatinDigits(identifier), toLatinDigits(password)),
    onSuccess: () => navigate('/dashboard', { replace: true }),
    onError: (error) => toast.error(getApiErrorMessage(error, t('auth.loginFailed'))),
  })
  if (user) return <Navigate to="/dashboard" replace />
  return (
    <GuestAuthShell>
      <FormCard icon={KeyRound} title={t('auth.login')}>
        <AppForm
          className={formBodyClassName}
          autoFocusFirst
          onSubmit={() => mutation.mutate()}
        >
          <FormField icon={UserRound} label={t('auth.username')} htmlFor="identifier">
            <input
              id="identifier"
              className={`${fieldClassName} digit-field`}
              value={identifier}
              onChange={(event) => setIdentifier(toLatinDigits(event.target.value))}
              placeholder={t('auth.identifier')}
              autoComplete="username"
              required
            />
          </FormField>
          <FormField icon={KeyRound} label={t('auth.password')} htmlFor="password">
            <input
              id="password"
              type="password"
              className={fieldClassName}
              value={password}
              onChange={(event) => setPassword(toLatinDigits(event.target.value))}
              autoComplete="current-password"
              required
            />
          </FormField>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            <KeyRound className="size-4" />
            {t('auth.submit')}
          </Button>
          <Link to="/forgot-password" className={guestLinkClassName}>
            {t('auth.forgotPasswordHint')}
          </Link>
          <div className="flex justify-center pt-1">
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 rounded-full bg-mint-500 bg-[linear-gradient(to_inline-end,var(--color-teal-500),var(--color-mint-500))] px-3.5 py-1.5 text-sm font-medium text-white shadow-[0_6px_14px_rgba(46,189,182,0.28)] ring-1 ring-white/30 transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
            >
              <UserPlus className="size-4 shrink-0" aria-hidden />
              {t('auth.registerHint')}
            </Link>
          </div>
        </AppForm>
      </FormCard>
    </GuestAuthShell>
  )
}

type ForgotStatus = 'sent' | 'no_phone' | 'no_email' | 'not_found'
type ForgotChannel = 'sms' | 'email'
type ForgotStep = 'identify' | 'channel'

function ForgotPasswordPage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [identifier, setIdentifier] = useState('')
  const [step, setStep] = useState<ForgotStep>('identify')
  const [submitting, setSubmitting] = useState<ForgotChannel | null>(null)
  const [status, setStatus] = useState<ForgotStatus | null>(null)

  if (user) return <Navigate to="/dashboard" replace />

  function onIdentify() {
    const value = toLatinDigits(identifier.trim())
    if (value.length < 3) {
      toast.error(t('auth.required'))
      return
    }
    setStatus(null)
    setStep('channel')
  }

  async function recover(channel: ForgotChannel) {
    const value = toLatinDigits(identifier.trim())
    setSubmitting(channel)
    setStatus(null)
    try {
      const { data } = await portalApi.post<{ status: ForgotStatus }>('/auth/forgot-password', {
        identifier: value,
        channel,
      })
      setStatus(data.status)
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('app.error')))
    } finally {
      setSubmitting(null)
    }
  }

  const backToLogin = (
    <Link to="/login" className={guestLinkClassName}>
      {t('auth.backToLogin')}
    </Link>
  )

  return (
    <GuestAuthShell>
      <FormCard
        icon={KeyRound}
        title={t('auth.forgotPassword')}
        subtitle={
          step === 'channel' ? t('auth.forgotPasswordChooseChannel') : t('auth.forgotPasswordSubtitle')
        }
      >
        {status === 'sent' ? (
          <div className={formBodyClassName}>
            <AuthNotice icon={KeyRound} tone="teal">
              {t('auth.forgotPasswordSent')}
            </AuthNotice>
            {backToLogin}
          </div>
        ) : step === 'identify' ? (
          <AppForm className={formBodyClassName} autoFocusFirst onSubmit={onIdentify}>
            <FormField icon={IdCard} label={t('auth.username')} htmlFor="identifier">
              <input
                id="identifier"
                className={`${fieldClassName} digit-field`}
                value={identifier}
                onChange={(event) => {
                  setIdentifier(toLatinDigits(event.target.value))
                  setStatus(null)
                }}
                placeholder={t('auth.identifier')}
                autoComplete="username"
                required
                minLength={3}
              />
            </FormField>
            <Button type="submit" className="w-full">
              <KeyRound className="size-4" aria-hidden />
              {t('auth.forgotPasswordSubmit')}
            </Button>
            {backToLogin}
          </AppForm>
        ) : (
          <div className={formBodyClassName}>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                className="w-full"
                disabled={Boolean(submitting)}
                onClick={() => void recover('sms')}
              >
                <MessageSquareText className="size-4" aria-hidden />
                {t('auth.forgotPasswordViaSms')}
              </Button>
              <Button
                type="button"
                className="w-full"
                disabled={Boolean(submitting)}
                onClick={() => void recover('email')}
              >
                <Mail className="size-4" aria-hidden />
                {t('auth.forgotPasswordViaEmail')}
              </Button>
            </div>
            {backToLogin}
          </div>
        )}
        {status === 'no_phone' ? (
          <div className="px-5 pb-5 sm:px-6 sm:pb-6">
            <AuthNotice icon={PhoneOff} tone="mint">
              {t('auth.forgotPasswordNoPhone')}
            </AuthNotice>
          </div>
        ) : null}
        {status === 'no_email' ? (
          <div className="px-5 pb-5 sm:px-6 sm:pb-6">
            <AuthNotice icon={Mail} tone="mint">
              {t('auth.forgotPasswordNoEmail')}
            </AuthNotice>
          </div>
        ) : null}
        {status === 'not_found' ? (
          <div className="px-5 pb-5 sm:px-6 sm:pb-6">
            <AuthNotice icon={CircleAlert} tone="warn">
              {t('auth.forgotPasswordNotFound')}
            </AuthNotice>
          </div>
        ) : null}
      </FormCard>
    </GuestAuthShell>
  )
}

function RegisterPage() {
  const { user, register } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [nationalId, setNationalId] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const mutation = useMutation({
    mutationFn: () =>
      register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        nationalId: normalizeNationalId(nationalId),
        phone: parseDigitString(phone).slice(0, 11),
        password: toLatinDigits(password),
      }),
    onSuccess: () => {
      toast.success(t('auth.registerSuccess'))
      navigate('/dashboard', { replace: true })
    },
    onError: (error) => toast.error(getApiErrorMessage(error, t('app.error'))),
  })

  if (user) return <Navigate to="/dashboard" replace />

  function submit() {
    const nextErrors: Record<string, string> = {}
    const id = normalizeNationalId(nationalId)
    const phoneDigits = parseDigitString(phone)
    if (!firstName.trim()) nextErrors.firstName = t('auth.required')
    if (!lastName.trim()) nextErrors.lastName = t('auth.required')
    if (!id) nextErrors.nationalId = t('auth.required')
    else if (!isValidIranianNationalId(id)) nextErrors.nationalId = t('auth.nationalIdInvalid')
    if (!phoneDigits) nextErrors.phone = t('auth.required')
    else if (!/^09\d{9}$/.test(phoneDigits)) nextErrors.phone = t('auth.phoneInvalid')
    if (password.length < 8) nextErrors.password = t('auth.passwordMin')
    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    mutation.mutate()
  }

  return (
    <GuestAuthShell>
      <FormCard icon={UserPlus} title={t('auth.register')} subtitle={t('auth.registerSubtitle')}>
        <AppForm className={formBodyClassName} autoFocusFirst onSubmit={submit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField icon={UserRound} label={t('auth.firstName')} htmlFor="firstName" error={fieldErrors.firstName}>
              <input
                id="firstName"
                className={fieldClassName}
                value={firstName}
                required
                autoComplete="given-name"
                onChange={(event) => {
                  setFirstName(event.target.value)
                  setFieldErrors((current) => {
                    const next = { ...current }
                    delete next.firstName
                    return next
                  })
                }}
              />
            </FormField>
            <FormField icon={UserRound} label={t('auth.lastName')} htmlFor="lastName" error={fieldErrors.lastName}>
              <input
                id="lastName"
                className={fieldClassName}
                value={lastName}
                required
                autoComplete="family-name"
                onChange={(event) => {
                  setLastName(event.target.value)
                  setFieldErrors((current) => {
                    const next = { ...current }
                    delete next.lastName
                    return next
                  })
                }}
              />
            </FormField>
          </div>
          <FormField icon={IdCard} label={t('auth.nationalId')} htmlFor="nationalId" error={fieldErrors.nationalId}>
            <input
              id="nationalId"
              className={`${fieldClassName} digit-field`}
              value={nationalId}
              required
              inputMode="numeric"
              autoComplete="off"
              maxLength={10}
              onChange={(event) => {
                const next = parseDigitString(event.target.value).slice(0, 10)
                setNationalId(next)
                setFieldErrors((current) => {
                  const nextErrors = { ...current }
                  if (next.length === 10 && !isValidIranianNationalId(next)) {
                    nextErrors.nationalId = t('auth.nationalIdInvalid')
                  } else {
                    delete nextErrors.nationalId
                  }
                  return nextErrors
                })
              }}
            />
          </FormField>
          <FormField icon={Phone} label={t('auth.phone')} htmlFor="phone" error={fieldErrors.phone}>
            <input
              id="phone"
              className={`${fieldClassName} digit-field`}
              value={phone}
              required
              inputMode="numeric"
              autoComplete="tel"
              maxLength={11}
              onChange={(event) => {
                setPhone(parseDigitString(event.target.value).slice(0, 11))
                setFieldErrors((current) => {
                  const next = { ...current }
                  delete next.phone
                  return next
                })
              }}
            />
          </FormField>
          <FormField icon={KeyRound} label={t('auth.password')} htmlFor="password" error={fieldErrors.password}>
            <div className="flex items-center gap-2">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={`${fieldClassName} digit-field min-w-0 flex-1`}
                value={password}
                required
                minLength={8}
                autoComplete="new-password"
                onChange={(event) => {
                  setPassword(toLatinDigits(event.target.value))
                  setFieldErrors((current) => {
                    const next = { ...current }
                    delete next.password
                    return next
                  })
                }}
              />
              <Button
                type="button"
                variant="ghost"
                icon
                className="shrink-0"
                aria-pressed={showPassword}
                aria-label={t(showPassword ? 'auth.hidePassword' : 'auth.showPassword')}
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
              </Button>
            </div>
          </FormField>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            <UserPlus className="size-4" />
            {t('auth.registerSubmit')}
          </Button>
          <Link to="/login" className={guestLinkClassName}>
            {t('auth.backToLogin')}
          </Link>
        </AppForm>
      </FormCard>
    </GuestAuthShell>
  )
}

function DashboardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const cases = useQuery({
    queryKey: ['cases', 'dashboard'],
    queryFn: () =>
      portalApi
        .get<{ items: CaseSummary[]; total: number }>('/cases?page=1&pageSize=5')
        .then(({ data }) => data),
  })
  return (
    <div className={shellClassName}>
      <PageHeader
        icon={Gauge}
        title={t('dashboard.title')}
        subtitle={t('dashboard.subtitle')}
        action={
          <Button variant="soft" onClick={() => navigate('/cases/formation')}>
            <Plus className="size-4" />
            {t('dashboard.newIssuance')}
          </Button>
        }
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <FormFactTile icon={FolderKanban} label={t('dashboard.cases')} value={formatNumber(cases.data?.total ?? 0)} />
        <FormFactTile
          icon={ShieldCheck}
          label={t('dashboard.active')}
          value={formatNumber(cases.data?.items.filter((item) => item.status === 'ACTIVE').length ?? 0)}
          tone="mint"
        />
      </div>
      <FormCard icon={FolderKanban} title={t('cases.title')}>
        <div className={formBodyClassName}>
          {cases.isLoading ? (
            <LoadingState />
          ) : cases.isError ? (
            <ErrorState error={cases.error} />
          ) : cases.data?.items.length ? (
            <div className="grid gap-2">
              {cases.data.items.map((item) => (
                <Link
                  key={item.id}
                  to={`/cases/${item.id}`}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-teal-100 bg-gradient-to-e from-teal-50 to-white px-4 py-3 text-sm font-medium text-ink-800 transition hover:ring-2 hover:ring-teal-200"
                >
                  <span>{item.businessUnitTitle ?? item.trackingCode}</span>
                  <ChevronLeft className="size-4 text-teal-600" />
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState icon={FolderKanban} text={t('app.empty')} />
          )}
        </div>
      </FormCard>
    </div>
  )
}

function nextSort(column: string, sortBy: string, sortDir: string) {
  if (sortBy !== column || !sortDir) return { sortBy: column, sortDir: 'asc' }
  if (sortDir === 'asc') return { sortBy: column, sortDir: 'desc' }
  return { sortBy: '', sortDir: '' }
}

function SortableTh({
  column,
  label,
  sortBy,
  sortDir,
  onSort,
  align = 'start',
}: {
  column: string
  label: string
  sortBy: string
  sortDir: string
  onSort: (column: string) => void
  align?: 'start' | 'center'
}) {
  const { t } = useTranslation()
  const active = sortBy === column && Boolean(sortDir)
  const hint = !active ? t('common.sortAsc') : sortDir === 'asc' ? t('common.sortDesc') : t('common.sortClear')
  return (
    <th className={`px-4 py-3 font-medium ${align === 'center' ? 'text-center' : 'text-start'}`} aria-sort={active ? (sortDir === 'desc' ? 'descending' : 'ascending') : 'none'}>
      <button
        type="button"
        className={`flex w-fit items-center gap-1.5 rounded-lg px-1 py-0.5 hover:bg-cream-100 ${align === 'center' ? 'mx-auto' : '-mx-1 text-start'} ${active ? 'text-teal-800' : 'text-ink-700'}`}
        title={hint}
        onClick={() => onSort(column)}
      >
        {label}
        {active ? (
          sortDir === 'asc' ? <ArrowUp className="size-3.5 text-teal-600" /> : <ArrowDown className="size-3.5 text-teal-600" />
        ) : (
          <ArrowUpDown className="size-3.5 text-ink-300" />
        )}
      </button>
    </th>
  )
}

function SearchBar({
  term,
  onTermChange,
  onSubmit,
  placeholder,
  extra,
  filtersActive = false,
  onClearFilters,
}: {
  term: string
  onTermChange: (value: string) => void
  onSubmit: () => void
  placeholder: string
  extra?: ReactNode
  filtersActive?: boolean
  onClearFilters?: () => void
}) {
  const { t } = useTranslation()
  const [filtersOpen, setFiltersOpen] = useState(false)
  return (
    <AppForm
      autoFocusFirst
      className={`mb-4 p-4 ${cardClassName}`}
      onSubmit={onSubmit}
    >
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:w-1/2">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-teal-500" />
          <input
            id="list-search"
            data-list-search
            className={`${fieldClassName} ps-10`}
            value={term}
            onChange={(event) => {
              const next = event.target.value
              const cleared = term !== '' && next === ''
              onTermChange(next)
              if (cleared) event.currentTarget.form?.requestSubmit()
            }}
            onKeyDown={(event) => {
              if (event.key !== 'ArrowDown') return
              const table = document.querySelector<HTMLElement>('[data-list-table]')
              const firstRow = table?.querySelector<HTMLElement>('[data-list-row]')
              if (!firstRow) return
              event.preventDefault()
              firstRow.focus()
            }}
            placeholder={placeholder}
            aria-label={t('common.search')}
          />
        </div>
        <Button type="submit" className="shrink-0 sm:min-w-28">
          <Search className="size-4" />
          {t('common.search')}
        </Button>
        {extra ? (
          <div className="flex flex-wrap items-center gap-2 sm:ms-auto">
            {filtersActive && onClearFilters ? (
              <Button
                type="button"
                variant="ghost"
                title={t('common.clearFilters')}
                onClick={() => {
                  onClearFilters()
                  document.getElementById('list-search')?.focus()
                }}
              >
                <FilterX className="size-4" />
                {t('common.clearFilters')}
              </Button>
            ) : null}
            <Button type="button" variant="ghost" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((open) => !open)}>
              <SlidersHorizontal className="size-4" />
              {t('common.filters')}
              {filtersActive ? <span className="size-2 rounded-full bg-teal-500" aria-hidden /> : null}
              <ChevronDown className={`size-4 transition ${filtersOpen ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        ) : null}
      </div>
      {extra ? (
        <div className={`mt-3 grid gap-4 border-t border-line pt-3 sm:grid-cols-2 ${filtersOpen ? '' : 'hidden'}`}>
          {extra}
        </div>
      ) : null}
    </AppForm>
  )
}

const FORMATION_STEPS = ['identity', 'activity', 'location', 'inquiries', 'places', 'managementReview', 'issuance'] as const
const STEWARDSHIP_STEPS = ['identity', 'inquiries', 'places', 'managementReview', 'cardIssuance'] as const
const RENEWAL_STEPS = ['terms', 'documents', 'inquiries', 'places', 'management', 'issue'] as const
const LOCATION_STEPS = ['location', 'documents', 'inquiries', 'places', 'management', 'request'] as const
const AUCTION_STEPS = ['request', 'management', 'issue'] as const
const CASE_KIND_OPTIONS: CaseListKind[] = ['ISSUANCE', 'RENEWAL', 'LOCATION_CHANGE', 'AUCTION', 'STEWARD_REQUEST', 'STEWARD_CARD']
const CASE_STATUS_OPTIONS: CaseSummary['status'][] = ['ACTIVE', 'SUSPENDED', 'EXPIRED', 'REVOKED']

const CASE_KIND_STYLES: Record<CaseListKind, { badge: string; icon: LucideIcon }> = {
  ISSUANCE: { badge: 'bg-white text-teal-800 ring-teal-300', icon: BadgeCheck },
  RENEWAL: { badge: 'bg-white text-sky-800 ring-sky-300', icon: RefreshCw },
  LOCATION_CHANGE: { badge: 'bg-white text-amber-900 ring-amber-300', icon: MapPinned },
  AUCTION: { badge: 'bg-white text-rose-800 ring-rose-300', icon: Gavel },
  STEWARD_REQUEST: { badge: 'bg-white text-violet-800 ring-violet-300', icon: UserRound },
  STEWARD_CARD: { badge: 'bg-white text-fuchsia-800 ring-fuchsia-300', icon: IdCard },
}

const CASE_STATUS_STYLES: Record<CaseSummary['status'], { row: string; edge: string }> = {
  ACTIVE: { row: 'bg-teal-50/80 hover:!bg-teal-50 focus:!bg-teal-50', edge: 'border-s-teal-500' },
  SUSPENDED: { row: 'bg-amber-50/80 hover:!bg-amber-50 focus:!bg-amber-50', edge: 'border-s-amber-500' },
  EXPIRED: { row: 'bg-red-50/80 hover:!bg-red-50 focus:!bg-red-50', edge: 'border-s-red-400' },
  REVOKED: { row: 'bg-rose-50/80 hover:!bg-rose-50 focus:!bg-rose-50', edge: 'border-s-rose-400' },
}

function requestBadgeKind(request: CaseRequestBadge): CaseListKind {
  if (request.type === 'STEWARDSHIP') {
    return request.status === 'ISSUED' || request.status === 'COMPLETED' ? 'STEWARD_CARD' : 'STEWARD_REQUEST'
  }
  return request.type
}

function remainingLicenseDays(expiresAt: string | null) {
  if (!expiresAt) return null
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(expiresAt)
  if (!match) return null
  const end = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  const now = new Date()
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  const days = Math.round((end - today) / 86_400_000)
  return days > 0 ? days : null
}

function displayedLicenseNumber(item: Pick<CaseSummary, 'kind' | 'licenseNumber'> & { hostLicenseNumber?: string | null }) {
  return item.kind === 'STEWARDSHIP' ? item.hostLicenseNumber ?? null : item.licenseNumber
}

function displayedLicenseExpiresAt(item: Pick<CaseSummary, 'kind' | 'licenseExpiresAt'> & { hostLicenseExpiresAt?: string | null }) {
  return item.kind === 'STEWARDSHIP' ? item.hostLicenseExpiresAt ?? null : item.licenseExpiresAt
}

function NameRequestCell({ item, caseKind }: { item: CaseSummary; caseKind: CaseListKind }) {
  const { t } = useTranslation()
  const kinds = item.requests && item.requests.length > 0 ? item.requests.map(requestBadgeKind) : [caseKind]
  const visible = kinds.slice(0, 4)
  const extra = kinds.length - visible.length
  const firstRow = visible.slice(0, 2)
  const lastRow = visible.slice(2)
  const badge = (kind: CaseListKind, index: number) => {
    const style = CASE_KIND_STYLES[kind]
    const Icon = style.icon
    return (
      <span key={`${kind}-${index}`} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${style.badge}`}>
        <Icon className="size-3.5" aria-hidden />
        {t(`cases.caseKinds.${kind}`)}
      </span>
    )
  }
  return (
    <div className="flex min-w-0 flex-col items-start gap-1.5">
      <span>{item.jobTitle || item.businessUnitTitle || '—'}</span>
      <span className="inline-flex flex-col items-start gap-1">
        <span className="inline-grid grid-cols-2 gap-1">{firstRow.map(badge)}</span>
        {lastRow.length > 0 ? (
          <span className={extra > 0 ? 'inline-flex items-center gap-1' : 'inline-grid grid-cols-2 gap-1'}>
            {lastRow.map((kind, index) => badge(kind, index + firstRow.length))}
            {extra > 0 ? (
              <span className="inline-flex items-center rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-ink-600 ring-1 ring-ink-200" title={t('cases.moreRequests')}>
                +{formatNumber(extra)}
              </span>
            ) : null}
          </span>
        ) : null}
      </span>
    </div>
  )
}

function CasePill({ children, tone }: { children: string; tone: 'teal' | 'mint' }) {
  const toneClass =
    tone === 'mint' ? 'bg-mint-50 text-teal-900 ring-mint-200' : 'bg-white text-teal-900 ring-teal-200'
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${toneClass}`}>{children}</span>
}

function LicenseNumberCell({ licenseNumber, licenseExpiresAt }: { licenseNumber: string; licenseExpiresAt: string | null }) {
  const { t } = useTranslation()
  const remaining = remainingLicenseDays(licenseExpiresAt)
  return (
    <div className="flex flex-col items-start gap-1.5">
      <span dir="ltr" className="inline-flex rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-teal-900 ring-1 ring-teal-200">
        {localizeDigits(licenseNumber)}
      </span>
      {remaining != null ? (
        <span className="inline-flex rounded-full bg-mint-50 px-2.5 py-0.5 text-xs font-medium text-teal-900 ring-1 ring-mint-200">
          {t('cases.listActiveDays', { count: formatNumber(remaining) })}
        </span>
      ) : null}
    </div>
  )
}

function CaseStepCell({ item }: { item: CaseSummary }) {
  const { t } = useTranslation()
  const hasLicense = Boolean(item.licenseNumber || item.licenseIssuedAt || item.licenseExpiresAt)
  if (hasLicense || item.status === 'SUSPENDED' || item.status === 'EXPIRED' || item.status === 'REVOKED') {
    const statusTone =
      item.status === 'REVOKED'
        ? 'bg-rose-50 text-rose-800 ring-rose-200'
        : item.status === 'EXPIRED'
          ? 'bg-red-50 text-red-700 ring-red-200'
          : item.status === 'SUSPENDED'
            ? 'bg-amber-50 text-amber-900 ring-amber-200'
            : 'bg-mint-50 text-teal-900 ring-mint-200'
    return (
      <div className="flex flex-col items-center gap-1 text-xs leading-5">
        {hasLicense ? (
          <span dir="ltr" className="inline-flex items-center justify-center gap-1.5">
            <span className="inline-flex rounded-full bg-mint-50 px-2 py-0.5 font-medium text-teal-900 ring-1 ring-mint-200">
              {formatDate(item.licenseIssuedAt)}
            </span>
            <span className="text-ink-400" aria-hidden>-</span>
            <span className="inline-flex rounded-full bg-teal-50 px-2 py-0.5 font-medium text-teal-900 ring-1 ring-teal-200">
              {formatDate(item.licenseExpiresAt)}
            </span>
          </span>
        ) : null}
        <span className={`inline-flex rounded-full px-2.5 py-0.5 font-medium ring-1 ${statusTone}`}>{t(`cases.caseStatuses.${item.status}`)}</span>
      </div>
    )
  }
  const steps = item.kind === 'STEWARDSHIP' ? STEWARDSHIP_STEPS : FORMATION_STEPS
  const current = steps[item.formationStep] ?? steps[0]
  const next = item.formationStep >= steps.length - 1 ? null : steps[item.formationStep + 1]
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 py-0.5 ps-1 pe-2.5 text-xs font-medium text-teal-900 ring-1 ring-teal-200">
        <span className="inline-flex min-w-4 items-center justify-center rounded-full bg-teal-500 px-1 text-[10px] font-semibold text-white">
          {formatNumber(item.formationStep + 1)}
        </span>
        {t(`cases.steps.${current}`)}
      </span>
      {next ? (
        <span className="inline-flex rounded-full bg-mint-500 bg-[linear-gradient(to_inline-end,var(--color-mint-500),var(--color-teal-500))] px-2.5 py-0.5 text-[10px] font-medium text-white shadow-[0_4px_10px_rgba(63,214,190,0.32)]">
          {t('cases.listStepNext')}: {t(`cases.steps.${next}`)}
        </span>
      ) : null}
    </div>
  )
}

function CasesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [term, setTerm] = useState(params.get('q') ?? '')
  const page = Math.max(1, Number(params.get('page') ?? 1))
  const pageSize = 10
  const sortBy = params.get('sortBy') ?? ''
  const sortDir = params.get('sortDir') ?? ''
  const step = params.get('step') ?? ''
  const status = params.get('status') ?? ''
  const caseKind = params.get('caseKind') ?? ''
  const jobGroupId = params.get('jobGroupId') ?? ''
  const jobId = params.get('jobId') ?? ''
  const jobs = useLookup('/lookups/jobs')
  const jobGroups = useLookup('/lookups/job-groups')
  const jobOptions = jobs.filter((item) => !jobGroupId || item.groupId === jobGroupId)
  const query = useQuery({
    queryKey: ['cases', params.toString()],
    queryFn: () =>
      portalApi
        .get<{ items: CaseSummary[]; total: number; page: number; pageSize: number }>('/cases', {
          params: Object.fromEntries(params),
        })
        .then(({ data }) => data),
  })
  const setPage = (nextPage: number) => {
    const next = new URLSearchParams(params)
    next.set('page', String(nextPage))
    setParams(next)
  }
  const setFilter = (updates: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(updates)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    next.set('page', '1')
    setParams(next)
  }
  const sort = (column: string) => {
    const state = nextSort(column, sortBy, sortDir)
    const next = new URLSearchParams(params)
    if (state.sortBy) {
      next.set('sortBy', state.sortBy)
      next.set('sortDir', state.sortDir)
    } else {
      next.delete('sortBy')
      next.delete('sortDir')
    }
    next.set('page', '1')
    setParams(next)
  }
  const search = () => {
    const input = document.querySelector<HTMLInputElement>('[data-list-search]')
    const text = (input?.value ?? term).trim()
    const next = new URLSearchParams(params)
    if (text) next.set('q', text)
    else next.delete('q')
    next.set('page', '1')
    setParams(next)
  }
  const total = query.data?.total ?? 0
  const from = total ? (page - 1) * pageSize + 1 : 0
  const to = Math.min(page * pageSize, total)
  const filtered = Boolean(params.get('q') || step || status || caseKind || jobGroupId || jobId)
  const filtersActive = Boolean(step || status || caseKind || jobGroupId || jobId)
  return (
    <div className={shellClassName}>
      <PageHeader icon={Files} title={t('cases.managementTitle')} subtitle={t('cases.managementSubtitle')} />
      <SearchBar
        term={term}
        onTermChange={setTerm}
        onSubmit={search}
        placeholder={t('cases.listSearchPlaceholder')}
        filtersActive={filtersActive}
        onClearFilters={() => setFilter({ step: undefined, status: undefined, caseKind: undefined, jobGroupId: undefined, jobId: undefined })}
        extra={
          <>
            <FormField icon={Layers} label={t('cases.filterCaseKind')} htmlFor="case-filter-kind">
              <SearchSelect
                id="case-filter-kind"
                value={caseKind}
                onChange={(next) => setFilter({ caseKind: next || undefined })}
                placeholder={t('cases.allCaseKinds')}
                options={[{ value: '', label: t('cases.allCaseKinds') }, ...CASE_KIND_OPTIONS.map((item) => ({ value: item, label: t(`cases.caseKinds.${item}`) }))]}
              />
            </FormField>
            <FormField icon={ListOrdered} label={t('cases.filterStep')} htmlFor="case-filter-step">
              <SearchSelect
                id="case-filter-step"
                value={step}
                onChange={(next) => setFilter({ step: next || undefined })}
                placeholder={t('cases.allSteps')}
                options={[{ value: '', label: t('cases.allSteps') }, ...FORMATION_STEPS.map((item, index) => ({ value: String(index), label: t(`cases.steps.${item}`) }))]}
              />
            </FormField>
            <FormField icon={BadgeCheck} label={t('cases.filterCaseStatus')} htmlFor="case-filter-status">
              <SearchSelect
                id="case-filter-status"
                value={status}
                onChange={(next) => setFilter({ status: next || undefined })}
                placeholder={t('cases.allCaseStatuses')}
                options={[{ value: '', label: t('cases.allCaseStatuses') }, ...CASE_STATUS_OPTIONS.map((item) => ({ value: item, label: t(`cases.caseStatuses.${item}`) }))]}
              />
            </FormField>
            <FormField icon={FolderKanban} label={t('cases.filterJobGroup')} htmlFor="case-filter-job-group">
              <SearchSelect
                id="case-filter-job-group"
                value={jobGroupId}
                onChange={(next) => {
                  const jobStillValid = !jobId || jobs.some((item) => item.id === jobId && (!next || item.groupId === next))
                  setFilter({ jobGroupId: next || undefined, ...(jobStillValid ? {} : { jobId: undefined }) })
                }}
                placeholder={t('cases.allJobGroups')}
                options={[{ value: '', label: t('cases.allJobGroups') }, ...jobGroups.map((item) => ({ value: item.id, label: item.title ?? item.name ?? '' }))]}
              />
            </FormField>
            <FormField icon={Briefcase} label={t('cases.filterJob')} htmlFor="case-filter-job">
              <SearchSelect
                id="case-filter-job"
                value={jobId}
                onChange={(next) => setFilter({ jobId: next || undefined })}
                placeholder={t('cases.allJobs')}
                options={[{ value: '', label: t('cases.allJobs') }, ...jobOptions.map((item) => ({ value: item.id, label: item.title ?? item.name ?? '' }))]}
              />
            </FormField>
          </>
        }
      />
      <section data-list-table className={`min-w-0 overflow-hidden border border-line ${cardClassName}`}>
        {query.isLoading ? (
          <LoadingState />
        ) : query.isError ? (
          <ErrorState error={query.error} />
        ) : query.data?.items.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-sm">
              <thead className="bg-cream-50 text-ink-700">
                <tr>
                  <SortableTh column="jobTitle" label={t('cases.listJobTitle')} sortBy={sortBy} sortDir={sortDir} onSort={sort} />
                  <SortableTh column="jobGroup" label={t('cases.listJobGroup')} sortBy={sortBy} sortDir={sortDir} onSort={sort} />
                  <SortableTh column="job" label={t('cases.job')} sortBy={sortBy} sortDir={sortDir} onSort={sort} />
                  <SortableTh column="jobType" label={t('cases.jobType')} sortBy={sortBy} sortDir={sortDir} onSort={sort} />
                  <SortableTh column="licenseNumber" label={t('cases.listLicenseNumber')} sortBy={sortBy} sortDir={sortDir} onSort={sort} />
                  <SortableTh column="formationStep" label={t('cases.listStep')} sortBy={sortBy} sortDir={sortDir} onSort={sort} align="center" />
                </tr>
              </thead>
              <tbody>
                {query.data.items.map((item) => {
                  const kind =
                    item.caseKind && item.caseKind in CASE_KIND_STYLES
                      ? item.caseKind
                      : item.kind === 'STEWARDSHIP'
                        ? 'STEWARD_REQUEST'
                        : 'ISSUANCE'
                  const statusStyle = CASE_STATUS_STYLES[item.status]
                  const jobGroup = item.job?.group?.title || item.activityJob?.group?.title
                  const jobType = item.job?.jobType?.title || item.activityJob?.jobType?.title
                  const licenseNumber = displayedLicenseNumber(item)
                  return (
                    <tr
                      key={item.id}
                      data-list-row
                      tabIndex={0}
                      className={`cursor-pointer border-t border-line focus:outline-none focus-visible:shadow-[inset_0_0_0_2px_#5ed4ce] ${statusStyle.row}`}
                      onClick={() => navigate(`/cases/${item.id}`)}
                      onKeyDown={(event) => {
                        if (event.target !== event.currentTarget) return
                        if (event.key === 'Enter') {
                          navigate(`/cases/${item.id}`)
                          return
                        }
                        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
                        event.preventDefault()
                        const rows = Array.from(
                          event.currentTarget.closest('[data-list-table]')?.querySelectorAll<HTMLTableRowElement>('[data-list-row]') ?? [],
                        )
                        const index = rows.indexOf(event.currentTarget)
                        if (event.key === 'ArrowUp' && index === 0) {
                          document.querySelector<HTMLInputElement>('[data-list-search]')?.focus()
                          return
                        }
                        rows[Math.max(0, Math.min(rows.length - 1, index + (event.key === 'ArrowDown' ? 1 : -1)))]?.focus()
                      }}
                    >
                      <td className={`border-s-4 px-4 py-3 ${statusStyle.edge}`}>
                        <NameRequestCell item={item} caseKind={kind} />
                      </td>
                      <td className="px-4 py-3">{jobGroup ? <CasePill tone="teal">{jobGroup}</CasePill> : '—'}</td>
                      <td className="px-4 py-3">{item.job?.title || item.activityJob?.title || '—'}</td>
                      <td className="px-4 py-3">{jobType ? <CasePill tone="mint">{jobType}</CasePill> : '—'}</td>
                      <td className="px-4 py-3">
                        {licenseNumber ? (
                          <LicenseNumberCell
                            licenseNumber={licenseNumber}
                            licenseExpiresAt={displayedLicenseExpiresAt(item)}
                          />
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <CaseStepCell item={item} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={Files} text={filtered ? t('cases.listNoResults') : t('cases.listEmpty')} />
        )}
      </section>
      {total ? (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink-500">
            {t('common.showingRange', { from: formatNumber(from), to: formatNumber(to), total: formatNumber(total) })}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronRight className="size-4" />
              {t('common.previous')}
            </Button>
            <span className="min-w-16 text-center text-sm text-ink-700">
              {t('common.page')} {formatNumber(page)}
            </span>
            <Button variant="ghost" disabled={page * pageSize >= total} onClick={() => setPage(page + 1)}>
              {t('common.next')}
              <ChevronLeft className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function confirmDangerToast({
  title,
  confirmLabel,
  cancelLabel,
  onConfirm,
}: {
  title: string
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void | Promise<void>
}) {
  toast.custom(
    (id) => (
      <div
        data-confirm-toast=""
        className="w-max max-w-[calc(100vw-2rem)] overflow-hidden rounded-[18px] border border-line bg-white shadow-[0_14px_36px_rgba(44,42,38,0.12)]"
      >
        <div className="h-1 bg-[linear-gradient(to_inline-end,#fb7185,#e11d48)]" />
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-[15px] bg-[linear-gradient(160deg,#fb7185,#e11d48)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_8px_16px_rgba(225,29,72,0.22)]">
              <CircleAlert className="size-[22px]" strokeWidth={2.35} aria-hidden />
            </div>
            <p className="pt-2 text-[15px] font-medium leading-7 text-ink-900">{title}</p>
          </div>
          <div className="mt-4 flex w-full flex-row items-center justify-between gap-2" dir="ltr">
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                toast.dismiss(id)
                void onConfirm()
              }}
            >
              <Trash2 className="size-3.5" aria-hidden />
              {confirmLabel}
            </Button>
            <Button type="button" variant="ghost" onClick={() => toast.dismiss(id)}>
              <X className="size-3.5" aria-hidden />
              {cancelLabel}
            </Button>
          </div>
        </div>
      </div>
    ),
    { duration: Infinity, closeButton: false, unstyled: true },
  )
}

function CaseDetailPage() {
  const { caseId = '' } = useParams()
  const { t } = useTranslation()
  const query = useQuery({
    queryKey: ['case', caseId],
    queryFn: () => portalApi.get<CaseDetail>(`/cases/${caseId}`).then(({ data }) => data),
  })
  const item = query.data
  const licenseNumber = item ? displayedLicenseNumber(item) : null
  const steward = item?.kind === 'STEWARDSHIP'
  return (
    <div className={shellClassName}>
      <PageHeader
        icon={steward ? IdCard : FolderKanban}
        title={steward ? t('cases.stewardCaseDetails') : t('cases.licenseCaseDetails')}
        subtitle={
          item ? (
            steward ? (
              <span className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex max-w-full items-center gap-2 rounded-2xl bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-800">
                  <UserRound className="size-4 shrink-0" aria-hidden />
                  <span className="truncate">{item.ownerName || t('cases.details')}</span>
                </span>
                {item.ownerPhone ? (
                  <span className="inline-flex max-w-full items-center gap-1.5 rounded-2xl bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-800">
                    <Phone className="size-4 shrink-0" aria-hidden />
                    <CopyableDigits value={item.ownerPhone} />
                  </span>
                ) : null}
                {item.ownerNationalId ? (
                  <span className="inline-flex max-w-full items-center gap-1.5 rounded-2xl bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-800">
                    <IdCard className="size-4 shrink-0" aria-hidden />
                    <CopyableDigits value={item.ownerNationalId} />
                  </span>
                ) : null}
              </span>
            ) : (
              <span className="flex flex-wrap items-center gap-1.5">
                <EntityBadge icon={Store} value={item.businessUnitTitle ?? t('cases.details')} />
                {item.trackingCode ? <EntityBadge icon={Hash} value={localizeDigits(item.trackingCode)} /> : null}
                {licenseNumber ? <EntityBadge icon={BadgeCheck} value={localizeDigits(licenseNumber)} /> : null}
              </span>
            )
          ) : undefined
        }
        backTo="/cases"
      />
      {query.isLoading ? <LoadingState /> : null}
      {query.isError ? <ErrorState error={query.error} /> : null}
      {item ? <CaseDetailContent item={item} caseId={caseId} /> : null}
    </div>
  )
}

const REQUEST_ICONS: Record<string, LucideIcon> = {
  ISSUANCE: BadgeCheck,
  RENEWAL: RefreshCw,
  LOCATION_CHANGE: MapPinned,
  STEWARDSHIP: IdCard,
  AUCTION: Gavel,
}

const REQUEST_STYLES: Record<string, { badge: string; edge: string }> = {
  ISSUANCE: { badge: 'bg-teal-50 text-teal-800 ring-teal-200', edge: 'border-s-teal-500' },
  RENEWAL: { badge: 'bg-sky-50 text-sky-800 ring-sky-200', edge: 'border-s-sky-500' },
  LOCATION_CHANGE: { badge: 'bg-amber-50 text-amber-900 ring-amber-200', edge: 'border-s-amber-500' },
  STEWARDSHIP: { badge: 'bg-violet-50 text-violet-800 ring-violet-200', edge: 'border-s-violet-500' },
  AUCTION: { badge: 'bg-rose-50 text-rose-800 ring-rose-200', edge: 'border-s-rose-400' },
}

function CaseDetailContent({ item, caseId }: { item: CaseDetail; caseId: string }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const steward = item.kind === 'STEWARDSHIP'
  const issued = steward ? Boolean(item.cardNumber) : Boolean(item.licenseNumber)
  const licenseNumber = displayedLicenseNumber(item)
  const licenseIssuedAt = steward ? item.hostLicenseIssuedAt ?? null : item.licenseIssuedAt
  const licenseExpiresAt = steward ? item.hostLicenseExpiresAt ?? null : item.licenseExpiresAt
  const [violationsOpen, setViolationsOpen] = useState(false)
  const [suspensionsOpen, setSuspensionsOpen] = useState(false)
  const [stewardRevokeOpen, setStewardRevokeOpen] = useState(false)
  const [stewardRequestOpen, setStewardRequestOpen] = useState(false)
  const licenseIssued = !steward && Boolean(item.licenseNumber)
  const stewardsQuery = useQuery({
    queryKey: ['case-stewards', caseId],
    enabled: licenseIssued,
    queryFn: () => portalApi.get<PortalStewardRow[]>(`/cases/${caseId}/stewards`).then(({ data }) => data),
  })
  const suspensions = item.suspensions ?? []
  const activeSuspension =
    item.status === 'SUSPENDED'
      ? (suspensions.find((row) => row.active) ?? suspensions[0] ?? null)
      : null
  const ownerLabel = item.ownerName || item.businessUnitTitle || t('cases.details')

  function openAuction() {
    if (item.status === 'REVOKED') {
      toast.error(t('cases.revokedNoRequest'))
      return
    }
    if (item.status === 'EXPIRED') {
      toast.error(t('cases.expiredNoRequest'))
      return
    }
    if (!item.licenseNumber) {
      toast.error(t('cases.auction.licenseRequired'))
      return
    }
    const open = item.requests.find((request) => request.status === 'OPEN')
    if (open?.type === 'AUCTION') {
      navigate(`/cases/${caseId}/auction/${open.id}`)
      return
    }
    if (open) {
      toast.error(t('cases.auction.openRequest'))
      return
    }
    navigate(`/cases/${caseId}/auction/new`)
  }

  function openStewardRequest() {
    if (item.status === 'REVOKED') {
      toast.error(t('cases.revokedNoRequest'))
      return
    }
    if (item.status === 'EXPIRED') {
      toast.error(t('cases.expiredNoSteward'))
      return
    }
    if (!item.futureActions.stewardship.enabled) return
    setStewardRequestOpen(true)
  }

  async function openLocationChange() {
    if (item.status === 'REVOKED') {
      toast.error(t('cases.revokedNoRequest'))
      return
    }
    if (item.status === 'EXPIRED') {
      toast.error(t('cases.expiredOnlyRenewal'))
      return
    }
    const open = item.requests.find((request) => request.status === 'OPEN')
    if (open && requestTypeOf(open.type) === 'LOCATION_CHANGE') {
      navigate(`/cases/${caseId}/location-change/${open.id}`)
      return
    }
    const latest = item.requests.find((request) => requestTypeOf(request.type) === 'LOCATION_CHANGE')
    if (open) {
      if (latest) {
        navigate(`/cases/${caseId}/location-change/${latest.id}`)
        return
      }
      toast.error(t('cases.openRequest'))
      return
    }
    if (!item.futureActions.locationChange.enabled) return
    try {
      const { data } = await portalApi.post<{ id: string }>(`/cases/${caseId}/location-change`)
      navigate(`/cases/${caseId}/location-change/${data.id}`)
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('app.error')))
    }
  }

  async function openRenewal() {
    if (item.status === 'REVOKED') {
      toast.error(t('cases.revokedNoRequest'))
      return
    }
    const open = item.requests.find((request) => request.status === 'OPEN')
    if (open && requestTypeOf(open.type) === 'RENEWAL') {
      navigate(`/cases/${caseId}/renewal/${open.id}`)
      return
    }
    const latestRenewal = item.requests.find((request) => requestTypeOf(request.type) === 'RENEWAL')
    if (open) {
      if (latestRenewal) {
        navigate(`/cases/${caseId}/renewal/${latestRenewal.id}`)
        return
      }
      toast.error(t('cases.openRequest'))
      return
    }
    if (!item.licenseNumber) {
      if (latestRenewal) {
        navigate(`/cases/${caseId}/renewal/${latestRenewal.id}`)
        return
      }
      toast.error(t('cases.renewalLicenseRequired'))
      return
    }
    try {
      const { data } = await portalApi.post<{ id: string }>(`/cases/${caseId}/renewal`)
      navigate(`/cases/${caseId}/renewal/${data.id}`)
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('app.error')))
    }
  }

  function askDelete() {
    confirmDangerToast({
      title: t('cases.confirmDelete'),
      confirmLabel: t('cases.deleteCase'),
      cancelLabel: t('common.cancel'),
      onConfirm: async () => {
        try {
          await portalApi.delete(`/cases/${caseId}`)
          toast.success(t('cases.deleted'))
          await queryClient.invalidateQueries({ queryKey: ['cases'] })
          navigate('/cases')
        } catch (error) {
          toast.error(getApiErrorMessage(error, t('app.error')))
        }
      },
    })
  }

  function askDeleteRequest(request: CaseRequest) {
    confirmDangerToast({
      title: t('cases.confirmDeleteRequest'),
      confirmLabel: t('cases.deleteRequest'),
      cancelLabel: t('common.cancel'),
      onConfirm: async () => {
        try {
          const { data } = await portalApi.delete<{ ok: boolean; deletedCase?: boolean }>(
            `/cases/${caseId}/requests/${request.id}`,
          )
          toast.success(t('cases.requestDeleted'))
          if (data.deletedCase) {
            await queryClient.invalidateQueries({ queryKey: ['cases'] })
            navigate('/cases')
            return
          }
          await queryClient.invalidateQueries({ queryKey: ['case', caseId] })
          await queryClient.invalidateQueries({ queryKey: ['case-stewards', caseId] })
          await queryClient.invalidateQueries({ queryKey: ['cases'] })
        } catch (error) {
          toast.error(getApiErrorMessage(error, t('app.error')))
        }
      },
    })
  }
  const statusStyle =
    item.status === 'ACTIVE'
      ? 'bg-teal-50 text-teal-800 ring-teal-200'
      : item.status === 'SUSPENDED'
        ? 'bg-amber-50 text-amber-900 ring-amber-200'
        : 'bg-red-50 text-red-700 ring-red-200'
  const borderStyle =
    item.status === 'SUSPENDED'
      ? '!border-2 !border-amber-400'
      : item.status === 'EXPIRED' || item.status === 'REVOKED'
        ? '!border-2 !border-red-400'
        : ''

  const stewardOpenRequest = item.requests.some(
    (request) => requestTypeOf(request.type) === 'STEWARDSHIP' && request.status === 'OPEN',
  )

  return (
    <div className="space-y-4">
      <FormCard
        className={borderStyle}
        icon={steward ? Briefcase : BriefcaseBusiness}
        title={steward ? item.ownerName || t('cases.stewardship.kind') : item.businessUnitTitle ?? t('cases.details')}
        titleExtra={
          steward ? (
            item.cardNumber ? (
              <span className="inline-flex max-w-full items-center gap-1.5 rounded-2xl bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-800">
                <IdCard className="size-4 shrink-0" aria-hidden />
                <CopyableDigits value={item.cardNumber} />
              </span>
            ) : licenseNumber ? (
              <EntityBadge icon={BadgeCheck} value={localizeDigits(licenseNumber)} />
            ) : undefined
          ) : licenseNumber ? (
            <EntityBadge icon={BadgeCheck} value={localizeDigits(licenseNumber)} />
          ) : undefined
        }
        chips={
          <>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusStyle}`}>
              <ShieldCheck className="size-3.5" aria-hidden />
              {statusLabel(item.status, t)}
            </span>
            {item.activityJob?.group ? (
              <MetaBadge icon={FolderKanban} label={t('cases.activityGroup')} value={item.activityJob.group.title} />
            ) : null}
            {item.activityJob ? (
              <MetaBadge icon={Briefcase} label={t('cases.activityJob')} value={item.activityJob.title} />
            ) : null}
          </>
        }
        action={
          item.violationCount > 0 || item.suspensionCount > 0 || (steward ? issued : true) ? (
            <div className="flex flex-wrap items-center justify-end gap-2">
              {item.violationCount > 0 ? (
                <CountIndicator
                  count={item.violationCount}
                  label={t('cases.violationCount')}
                  icon={ShieldAlert}
                  tone="orange"
                  onClick={() => setViolationsOpen(true)}
                />
              ) : null}
              {item.suspensionCount > 0 ? (
                <CountIndicator
                  count={item.suspensionCount}
                  label={t('cases.suspensionCount')}
                  icon={CirclePause}
                  tone="amber"
                  onClick={() => setSuspensionsOpen(true)}
                />
              ) : null}
              {steward && !issued ? null : (
                <RemainingDaysBadge
                  issuedAt={steward ? item.cardIssuedAt ?? null : item.licenseIssuedAt}
                  expiresAt={steward ? item.cardExpiresAt ?? null : item.licenseExpiresAt}
                  label={t('cases.daysRemaining')}
                  overdueLabel={t('cases.daysOverdue')}
                />
              )}
            </div>
          ) : undefined
        }
      >
        <div className={formBodyClassName}>
          {activeSuspension ? <ActiveSuspensionNotice suspension={activeSuspension} /> : null}

          {steward ? (
            <>
              <PortalHostLicenseInfo host={item.host ?? null} />
              {issued ? (
                <div className="grid gap-2 sm:grid-cols-3 sm:gap-3">
                  <FormFactTile icon={CalendarDays} label={t('cases.stewardship.cardIssued')} value={formatDate(item.cardIssuedAt)} tone="mint" />
                  <FormFactTile icon={CalendarClock} label={t('cases.stewardship.cardExpires')} value={formatDate(item.cardExpiresAt)} />
                  <FormFactTile icon={MapPin} label={t('cases.city')} value={item.premiseCity?.nameFa} tone="mint" />
                </div>
              ) : null}
              <div className="flex flex-wrap items-center justify-end gap-2">
                {issued ? (
                  <Link to={`/cases/${caseId}/dossier`}>
                    <Button type="button" className={caseQuickActionClassName}>
                      <Eye className="size-3.5" aria-hidden />
                      {t('cases.viewDossier')}
                    </Button>
                  </Link>
                ) : null}
                <Link to={`/cases/${caseId}/finance`}>
                  <Button type="button" variant="ghost" className={caseQuickActionClassName}>
                    <Wallet className="size-3.5" aria-hidden />
                    {t('cases.finance')}
                  </Button>
                </Link>
                {issued ? (
                  <Link to={`/cases/${caseId}/stewardship/card`}>
                    <Button type="button" variant="soft" className={caseQuickActionClassName}>
                      <IdCard className="size-3.5" aria-hidden />
                      {t('cases.stewardship.cardTitle')}
                    </Button>
                  </Link>
                ) : null}
              </div>
              {item.status !== 'REVOKED' && (issued || stewardOpenRequest) ? (
                <section className="rounded-2xl border border-teal-100 bg-cream-50/70 p-4">
                  <FormSectionTitle icon={ClipboardList} className="mb-3">
                    {t('cases.operationsTitle')}
                  </FormSectionTitle>
                  {issued ? (
                    <div className="flex flex-wrap justify-center gap-2">
                      <Button type="button" variant="danger" className={caseQuickActionClassName} onClick={() => setStewardRevokeOpen(true)}>
                        <Ban className="size-3.5" aria-hidden />
                        {t('cases.stewardship.revokeCard')}
                      </Button>
                    </div>
                  ) : stewardOpenRequest ? (
                    <div className="flex justify-center">
                      <Link to={`/cases/${caseId}/stewardship`}>
                        <Button type="button" className="case-formation-continue-blink">
                          <Play className="size-4" aria-hidden />
                          {t('cases.continueFormation')}
                        </Button>
                      </Link>
                    </div>
                  ) : null}
                </section>
              ) : null}
            </>
          ) : (
            <>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 sm:gap-3">
                <FormFactTile icon={FileText} label={t('cases.trackingCode')} value={item.trackingCode ? localizeDigits(item.trackingCode) : undefined} />
                <FormFactTile icon={CalendarDays} label={t('cases.licenseIssued')} value={formatDate(licenseIssuedAt)} tone="mint" />
                <FormFactTile icon={CalendarClock} label={t('cases.licenseExpires')} value={formatDate(licenseExpiresAt)} />
                <FormFactTile icon={MapPin} label={t('cases.city')} value={item.premiseCity?.nameFa} tone="mint" />
              </div>

              {issued ? (
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <Link to={`/cases/${caseId}/dossier`}>
                    <Button type="button" className={caseQuickActionClassName}>
                      <Eye className="size-3.5" aria-hidden />
                      {t('cases.viewDossier')}
                    </Button>
                  </Link>
                  <Link to={`/cases/${caseId}/finance`}>
                    <Button type="button" variant="ghost" className={caseQuickActionClassName}>
                      <Wallet className="size-3.5" aria-hidden />
                      {t('cases.finance')}
                    </Button>
                  </Link>
                  <Link to={`/cases/${caseId}/license`}>
                    <Button type="button" variant="soft" className={caseQuickActionClassName}>
                      <BadgeCheck className="size-3.5" aria-hidden />
                      {t('cases.viewLicense')}
                    </Button>
                  </Link>
                </div>
              ) : null}

              <section className="rounded-2xl border border-teal-100 bg-cream-50/70 p-4">
                <FormSectionTitle icon={ClipboardList}>{t('cases.operationsTitle')}</FormSectionTitle>
                {issued ? (
                  <>
                    <div className="flex flex-wrap justify-center gap-2">
                      <OperationTile
                        icon={RefreshCw}
                        label={t('cases.renewal')}
                        disabled={!canOpenRenewal(item)}
                        onClick={() => void openRenewal()}
                      />
                      <OperationTile
                        icon={Gavel}
                        label={t('cases.auction.title')}
                        disabled={!item.futureActions.auction.enabled}
                        onClick={openAuction}
                      />
                      <OperationTile
                        icon={IdCard}
                        label={t('cases.requestSteward')}
                        disabled={!item.futureActions.stewardship.enabled}
                        onClick={openStewardRequest}
                      />
                      <OperationTile
                        icon={MapPinned}
                        label={t('cases.locationChange')}
                        disabled={!item.futureActions.locationChange.enabled}
                        onClick={() => void openLocationChange()}
                      />
                    </div>
                    {!item.futureActions.locationChange.enabled ? (
                      <p className="mt-3 text-center text-xs leading-5 text-ink-500">{t('cases.futureOperationsHint')}</p>
                    ) : null}
                  </>
                ) : (
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                    <span />
                    <Link to={`/issuance/${caseId}`} className="justify-self-center">
                      <Button type="button" className="case-formation-continue-blink">
                        <Play className="size-4" aria-hidden />
                        {t('cases.continueFormation')}
                      </Button>
                    </Link>
                    <div className="flex justify-end">
                      <Button type="button" variant="danger" onClick={askDelete}>
                        <Trash2 className="size-4" aria-hidden />
                        {t('cases.deleteCase')}
                      </Button>
                    </div>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </FormCard>

      {licenseIssued ? (
        <CaseLicenseStewardsSection
          hostCaseId={caseId}
          items={stewardsQuery.data ?? []}
          canAdd={item.futureActions.stewardship.enabled}
          onAdd={openStewardRequest}
        />
      ) : null}

      <FormCard icon={FileText} title={t('cases.requestsTitle')}>
        <div className={formBodyClassName}>
          {item.requests.length ? (
            <div data-list-table className="overflow-x-auto rounded-2xl border border-line">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-cream-50 text-ink-700">
                  <tr>
                    <th className="px-4 py-3 text-start font-medium">{t('cases.requestDate')}</th>
                    <th className="px-4 py-3 text-start font-medium">{t('cases.requestNumber')}</th>
                    <th className="px-4 py-3 text-start font-medium">{t('cases.requestType')}</th>
                    <th className="px-4 py-3 text-start font-medium">{t('cases.requestStatus')}</th>
                    <th className="px-4 py-3 text-start font-medium">{t('cases.completedAt')}</th>
                    <th className="w-px min-w-max whitespace-nowrap px-4 py-3 text-start font-medium">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {item.requests.map((request) => {
                    const RequestIcon = REQUEST_ICONS[request.type] ?? FileText
                    const style = REQUEST_STYLES[request.type] ?? REQUEST_STYLES.ISSUANCE
                    const kind = requestTypeOf(request.type)
                    const viewTo = caseRequestViewTo(caseId, request, item)
                    const inProgress = request.status === 'OPEN'
                    const showContinue =
                      inProgress &&
                      (kind !== 'STEWARDSHIP' || request.formationStep < 1)
                    const stewardshipCardView = kind === 'STEWARDSHIP' && Boolean(item.cardNumber) && !inProgress
                    const stepLabel = inProgress
                      ? requestAwaitingIntake(request.type, request.formationStep, request.intakeSubmittedAt)
                        ? t('cases.awaitingIntakeReview')
                        : requestCurrentStepLabel(request.type, request.formationStep, t)
                      : null
                    return (
                      <tr
                        key={request.id}
                        data-list-row={viewTo ? true : undefined}
                        tabIndex={viewTo ? 0 : undefined}
                        className={`border-t border-line ${
                          viewTo
                            ? 'cursor-pointer hover:bg-cream-50 focus:outline-none focus-visible:shadow-[inset_0_0_0_2px_#5ed4ce]'
                            : ''
                        }`}
                        onClick={viewTo ? () => navigate(viewTo) : undefined}
                        onKeyDown={viewTo ? (event) => onCatalogRowKeyDown(event, viewTo, navigate) : undefined}
                      >
                        <td className={`border-s-4 px-4 py-3 ${style.edge}`}>{formatDate(request.createdAt)}</td>
                        <td className="px-4 py-3 font-medium text-ink-900">{localizeDigits(request.number)}</td>
                        <td className="px-4 py-3">
                          <RequestPill className={style.badge}>
                            <RequestIcon className="size-4" aria-hidden />
                            {requestTypeLabel(request.type, t)}
                          </RequestPill>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <RequestPill>{statusLabel(request.status, t)}</RequestPill>
                            {stepLabel ? (
                              <RequestPill className="bg-mint-50 text-teal-900 ring-mint-200">{stepLabel}</RequestPill>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-4 py-3">{formatDate(request.completedAt)}</td>
                        <td className="w-px min-w-max whitespace-nowrap px-4 py-3">
                          <div className="flex flex-nowrap items-center gap-1.5">
                            {viewTo ? (
                              <Link to={viewTo} data-row-view onClick={(event) => event.stopPropagation()}>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  className={`!rounded-xl !px-2.5 !py-1.5 !text-xs${
                                    showContinue
                                      ? ' case-continue-request-blink !border-emerald-500 !bg-emerald-600 !text-white hover:!bg-emerald-700'
                                      : ''
                                  }`}
                                >
                                  {showContinue ? (
                                    <Play className="size-3.5 -scale-x-100" aria-hidden />
                                  ) : stewardshipCardView ? (
                                    <IdCard className="size-3.5" aria-hidden />
                                  ) : (
                                    <Eye className="size-3.5" aria-hidden />
                                  )}
                                  {showContinue
                                    ? t('cases.continueRequest')
                                    : stewardshipCardView
                                      ? t('cases.stewardship.viewCard')
                                      : t('cases.viewRequest')}
                                </Button>
                              </Link>
                            ) : (
                              <Button type="button" variant="ghost" className="!rounded-xl !px-2.5 !py-1.5 !text-xs" disabled title={t('cases.future')}>
                                <Eye className="size-3.5" aria-hidden />
                                {t('cases.viewRequest')}
                              </Button>
                            )}
                            {request.canCancel ? (
                              <Button
                                type="button"
                                variant="ghost"
                                className="!rounded-xl !px-2.5 !py-1.5 !text-xs text-red-700 hover:!bg-red-50"
                                onClick={(event) => {
                                  event.stopPropagation()
                                  askDeleteRequest(request)
                                }}
                              >
                                <Trash2 className="size-3.5" aria-hidden />
                                {t('cases.deleteRequest')}
                              </Button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState icon={FileText} text={t('cases.requestsEmpty')} />
          )}
        </div>
      </FormCard>
      {violationsOpen ? (
        <PersonViolationsModal caseId={caseId} name={ownerLabel} onClose={() => setViolationsOpen(false)} />
      ) : null}
      {suspensionsOpen ? (
        <CaseSuspensionsDialog
          caseId={caseId}
          name={ownerLabel}
          items={suspensions}
          onClose={() => setSuspensionsOpen(false)}
        />
      ) : null}
      {stewardRevokeOpen ? (
        <PortalStewardRevokeDialog caseId={caseId} onClose={() => setStewardRevokeOpen(false)} />
      ) : null}
      {stewardRequestOpen ? (
        <PortalStewardRequestDialog caseId={caseId} onClose={() => setStewardRequestOpen(false)} />
      ) : null}
    </div>
  )
}

function todayIsoDateOnly() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

function PortalStewardRequestDialog({ caseId, onClose }: { caseId: string; onClose: () => void }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [nationalId, setNationalId] = useState('')
  const [phone, setPhone] = useState('')
  const [lookup, setLookup] = useState<PortalStewardLookup | null>(null)
  const [lookedUpId, setLookedUpId] = useState('')
  const [looking, setLooking] = useState(false)
  const [saving, setSaving] = useState(false)
  const inFlight = useRef(false)
  const phoneInputRef = useRef<HTMLInputElement>(null)
  useRecordDialog(onClose)

  const normalized = normalizeNationalId(nationalId)
  const person =
    lookup?.found && lookup.person && lookedUpId === normalized ? lookup.person : null
  const needsNewUserPhone = Boolean(lookup && !lookup.found && lookedUpId === normalized)
  const needsExistingPhone = Boolean(person && !person.phone?.trim())
  const needsPhone = needsNewUserPhone || needsExistingPhone
  const busy = looking || saving

  useLayoutEffect(() => {
    if (!needsPhone || busy) return
    const frame = requestAnimationFrame(() => phoneInputRef.current?.focus())
    return () => cancelAnimationFrame(frame)
  }, [busy, needsPhone])

  function changeNationalId(value: string) {
    setNationalId(value)
    setPhone('')
    setLookup(null)
    setLookedUpId('')
  }

  async function searchPerson(raw = nationalId) {
    const id = normalizeNationalId(raw)
    if (!isValidIranianNationalId(id)) {
      toast.error(t('auth.nationalIdInvalid'))
      return null
    }
    if (inFlight.current || saving) return null
    inFlight.current = true
    setLooking(true)
    try {
      const { data } = await portalApi.get<PortalStewardLookup>(`/cases/${caseId}/stewards/lookup`, {
        params: { nationalId: id },
      })
      setLookup(data)
      setLookedUpId(id)
      return data
    } catch (error) {
      setLookup(null)
      setLookedUpId('')
      toast.error(getApiErrorMessage(error, t('app.error')))
      return null
    } finally {
      inFlight.current = false
      setLooking(false)
    }
  }

  async function createCase(id: string, nextPhone?: string) {
    if (inFlight.current || saving) return
    setSaving(true)
    try {
      await portalApi.post(`/cases/${caseId}/stewards`, {
        nationalId: id,
        ...(nextPhone ? { phone: nextPhone } : {}),
      })
      toast.success(t('cases.stewardship.created'))
      await queryClient.invalidateQueries({ queryKey: ['case', caseId] })
      await queryClient.invalidateQueries({ queryKey: ['case-stewards', caseId] })
      await queryClient.invalidateQueries({ queryKey: ['case-dossier', caseId] })
      onClose()
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('app.error')))
      setSaving(false)
    }
  }

  async function submit() {
    if (person && !needsExistingPhone) {
      await createCase(person.nationalId)
      return
    }
    if (needsPhone) {
      const phoneDigits = parseDigitString(phone).slice(0, 11)
      if (!/^09\d{9}$/.test(phoneDigits)) {
        toast.error(t('auth.phoneInvalid'))
        return
      }
      await createCase(normalizeNationalId(person?.nationalId || nationalId), phoneDigits)
      return
    }
    const id = normalizeNationalId(nationalId)
    const alreadyLookedUp = Boolean(lookup && lookedUpId === id)
    const result = alreadyLookedUp ? lookup : await searchPerson(id)
    if (!result) return
    if (result.found && result.person) return
    const phoneDigits = parseDigitString(phone).slice(0, 11)
    if (!alreadyLookedUp && !phoneDigits) return
    if (!/^09\d{9}$/.test(phoneDigits)) {
      toast.error(t('auth.phoneInvalid'))
      return
    }
    await createCase(id, phoneDigits)
  }

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink-900/30 p-4" data-nested-dialog>
      <button type="button" className="absolute inset-0 cursor-default" aria-label={t('common.close')} onClick={onClose} />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="portal-steward-request-title"
        className="relative z-10 w-full max-w-3xl overflow-hidden rounded-3xl border border-line bg-white shadow-xl"
      >
        <header className="relative shrink-0 overflow-hidden bg-gradient-to-e from-mint-50 via-white to-teal-50 px-5 py-4 pe-14">
          <HeaderDecor />
          <button
            type="button"
            className="absolute end-3 top-3 z-10 cursor-pointer rounded-xl p-2 text-ink-500 hover:bg-white"
            onClick={onClose}
            aria-label={t('common.close')}
          >
            <X className="size-5" aria-hidden />
          </button>
          <div className="relative flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-teal-500 text-white shadow-[0_8px_16px_rgba(46,189,182,0.32)]">
              <UserRound className="size-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <h2 id="portal-steward-request-title" className="truncate text-sm font-semibold text-ink-900">
                {t('cases.stewardship.addNewTitle')}
              </h2>
              <p className="mt-0.5 text-xs text-ink-500">{t('cases.stewardship.addTitle')}</p>
            </div>
          </div>
        </header>
        <AppForm onSubmit={() => void submit()} autoFocusFirst className="space-y-4 p-5 sm:p-6">
          <p className="rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm leading-7 text-ink-700">
            {t('cases.stewardship.addNationalIdHint')}
          </p>
          <FormField icon={Fingerprint} label={t('auth.nationalId')} htmlFor="portalStewardNationalId">
            <input
              id="portalStewardNationalId"
              required
              inputMode="numeric"
              className={`${fieldClassName} digit-field`}
              value={nationalId}
              disabled={busy}
              onChange={(event) => changeNationalId(event.target.value)}
              onBlur={() => {
                if (isValidIranianNationalId(normalized) && lookedUpId !== normalized) {
                  void searchPerson()
                }
              }}
            />
          </FormField>
          {person ? (
            <div className="space-y-3">
              <p className="text-sm leading-7 text-ink-700">{t('cases.stewardship.personFoundHint')}</p>
              <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
                <FormFactTile icon={UserRound} label={t('auth.firstName')} value={person.firstName || undefined} tone="teal" />
                <FormFactTile icon={UserRound} label={t('auth.lastName')} value={person.lastName || undefined} tone="mint" />
                {person.phone?.trim() ? <FormFactTile icon={Phone} label={t('auth.phone')} copyValue={person.phone} /> : null}
                <FormFactTile icon={IdCard} label={t('auth.nationalId')} copyValue={person.nationalId} tone="mint" />
              </div>
            </div>
          ) : null}
          {needsPhone ? (
            <div className="space-y-3">
              <p className="rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm leading-7 text-ink-700">
                {needsExistingPhone ? (
                  t('cases.stewardship.missingPhoneHint')
                ) : (
                  <>
                    {t('cases.stewardship.newLoginHint')}
                    <span className="mt-2 block font-medium">{t('cases.stewardship.newLoginUsername')}</span>
                    <span className="block font-medium">{t('cases.stewardship.newLoginPassword')}</span>
                  </>
                )}
              </p>
              <FormField icon={Phone} label={t('auth.phone')} htmlFor="portalStewardPhone">
                <input
                  id="portalStewardPhone"
                  ref={phoneInputRef}
                  required
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={11}
                  pattern="09[0-9]{9}"
                  className={`${fieldClassName} digit-field`}
                  value={phone}
                  disabled={busy}
                  onChange={(event) => setPhone(parseDigitString(event.target.value).slice(0, 11))}
                />
              </FormField>
            </div>
          ) : null}
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            {person ? (
              <Button type="submit" disabled={busy}>
                <Check className="size-4" aria-hidden />
                {t('cases.stewardship.confirmCreate')}
              </Button>
            ) : (
              <Button type="submit" disabled={busy}>
                <UserPlus className="size-4" aria-hidden />
                {t('cases.stewardship.addTitle')}
              </Button>
            )}
          </div>
        </AppForm>
      </section>
    </div>,
    document.body,
  )
}

function CaseLicenseStewardsSection({
  hostCaseId,
  items,
  canAdd,
  onAdd,
}: {
  hostCaseId: string
  items: PortalStewardRow[]
  canAdd: boolean
  onAdd: () => void
}) {
  const { t } = useTranslation()
  if (items.length === 0) return null
  return (
    <FormCard
      icon={IdCard}
      title={t('cases.stewardsTitle')}
      action={
        canAdd ? (
          <Button type="button" variant="soft" onClick={onAdd}>
            <Plus className="size-4" aria-hidden />
            {t('cases.stewardship.add')}
          </Button>
        ) : undefined
      }
    >
      <div className="p-5 sm:p-6">
        <LicenseStewardsTable hostCaseId={hostCaseId} items={items} />
      </div>
    </FormCard>
  )
}

function LicenseStewardsTable({ hostCaseId, items }: { hostCaseId: string; items: PortalStewardRow[] }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [revokeId, setRevokeId] = useState<string | null>(null)
  function askCancel(row: PortalStewardRow) {
    confirmDangerToast({
      title: t('cases.stewardship.cancelOpenConfirmTitle'),
      confirmLabel: t('cases.stewardship.cancelOpenRequest'),
      cancelLabel: t('common.cancel'),
      onConfirm: async () => {
        try {
          await portalApi.delete(`/cases/${hostCaseId}/stewards/${row.id}`)
          toast.success(t('cases.stewardship.cancelOpenSaved'))
          await queryClient.invalidateQueries({ queryKey: ['case-stewards', hostCaseId] })
          await queryClient.invalidateQueries({ queryKey: ['case', hostCaseId] })
          await queryClient.invalidateQueries({ queryKey: ['case-dossier', hostCaseId] })
        } catch (error) {
          toast.error(getApiErrorMessage(error, t('app.error')))
        }
      },
    })
  }
  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-cream-50 text-ink-700">
            <tr>
              <th className="px-4 py-3 text-start font-medium">{t('account.fullName')}</th>
              <th className="px-4 py-3 text-start font-medium">{t('account.nationalId')}</th>
              <th className="px-4 py-3 text-start font-medium">{t('cases.cardNumber')}</th>
              <th className="px-4 py-3 text-start font-medium">{t('cases.requestAt')}</th>
              <th className="px-4 py-3 text-start font-medium">{t('cases.cardIssuedOn')}</th>
              <th className="px-4 py-3 text-start font-medium">{t('cases.cardExpiresOn')}</th>
              <th className="px-4 py-3 text-start font-medium">{t('cases.listStep')}</th>
              <th className="w-px min-w-max whitespace-nowrap px-4 py-3 text-start font-medium">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <LicenseStewardRow
                key={row.id}
                row={row}
                onCancel={() => askCancel(row)}
                onRevoke={() => setRevokeId(row.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
      {revokeId ? (
        <PortalStewardRevokeDialog
          caseId={revokeId}
          hostCaseId={hostCaseId}
          onClose={() => setRevokeId(null)}
        />
      ) : null}
    </>
  )
}

function LicenseStewardRow({
  row,
  onCancel,
  onRevoke,
}: {
  row: PortalStewardRow
  onCancel: () => void
  onRevoke: () => void
}) {
  const { t } = useTranslation()
  const revoked = row.status === 'REVOKED'
  const inReview = row.requestStatus === 'OPEN' && !row.cardNumber && !revoked
  const active = Boolean(row.cardNumber) && !revoked && row.requestStatus !== 'OPEN'
  const label = revoked ? t('cases.stewardRevoked') : active ? t('cases.stewardActive') : t('cases.stewardReviewing')
  const badge = revoked
    ? 'bg-red-50 text-red-700 ring-red-200'
    : active
      ? 'bg-mint-50 text-teal-900 ring-mint-200'
      : 'bg-amber-50 text-amber-900 ring-amber-200'
  return (
    <tr className="border-t border-line">
      <td className="px-4 py-3">
        <div className="flex flex-col items-start gap-1.5">
          <span className="inline-flex items-center gap-2 font-medium text-ink-900">
            <UserRound className="size-4 text-teal-600" aria-hidden />
            {[row.firstName, row.lastName].filter(Boolean).join(' ').trim() || row.fullName || '—'}
          </span>
          {row.phone ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-mint-50 px-2.5 py-0.5 text-xs font-medium text-teal-900 ring-1 ring-mint-200">
              <Phone className="size-3" aria-hidden />
              {localizeDigits(row.phone)}
            </span>
          ) : null}
        </div>
      </td>
      <td className="px-4 py-3">
        {row.nationalId ? (
          <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-900 ring-1 ring-teal-200">
            {localizeDigits(row.nationalId)}
          </span>
        ) : (
          '—'
        )}
      </td>
      <td className="px-4 py-3">
        {row.cardNumber ? localizeDigits(row.cardNumber) : row.requestNumber ? localizeDigits(row.requestNumber) : '—'}
      </td>
      <td className="px-4 py-3">{row.requestCreatedAt ? formatDate(row.requestCreatedAt) : '—'}</td>
      <td className="px-4 py-3">{row.cardIssuedAt ? formatDate(row.cardIssuedAt) : '—'}</td>
      <td className="px-4 py-3">{row.cardExpiresAt ? formatDate(row.cardExpiresAt) : '—'}</td>
      <td className="px-4 py-3">
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${badge}`}>{label}</span>
      </td>
      <td className="w-px min-w-max whitespace-nowrap px-4 py-3">
        {inReview ? (
          <Button type="button" variant="ghost" className="!rounded-xl !px-2.5 !py-1.5 !text-xs text-red-700 hover:!bg-red-50" onClick={onCancel}>
            <Trash2 className="size-3.5" aria-hidden />
            {t('cases.stewardship.cancelOpenRequest')}
          </Button>
        ) : row.cardNumber ? (
          <div className="flex flex-nowrap items-center justify-end gap-1.5">
            <Link to={`/cases/${row.id}/stewardship/card`}>
              <Button type="button" variant="ghost" className="!rounded-xl !px-2.5 !py-1.5 !text-xs">
                <IdCard className="size-3.5" aria-hidden />
                {t('cases.stewardship.viewCard')}
              </Button>
            </Link>
            {row.status === 'ACTIVE' ? (
              <Button
                type="button"
                variant="ghost"
                className="!rounded-xl !px-2.5 !py-1.5 !text-xs text-red-700 hover:!bg-red-50"
                onClick={onRevoke}
              >
                <Ban className="size-3.5" aria-hidden />
                {t('cases.stewardship.revokeRequest')}
              </Button>
            ) : null}
          </div>
        ) : (
          '—'
        )}
      </td>
    </tr>
  )
}

async function stewardRevocationBody(fields: Record<string, string>, file: File | null) {
  const body = new FormData()
  for (const [key, value] of Object.entries(fields)) body.append(key, value)
  if (file) {
    const prepared = file.type.startsWith('image/') ? await optimizeImageFile(file) : file
    body.append('file', prepared)
  }
  return body
}

function PortalStewardRevokeDialog({
  caseId,
  hostCaseId,
  onClose,
}: {
  caseId: string
  hostCaseId?: string
  onClose: () => void
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const requestedAt = useMemo(() => new Date().toISOString(), [])
  const [revokedAt, setRevokedAt] = useState(todayIsoDateOnly)
  const [reason, setReason] = useState('')
  const [attachment, setAttachment] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  useRecordDialog(onClose)

  async function save() {
    if (saving || !reason.trim() || !revokedAt) return
    setSaving(true)
    try {
      await portalApi.post(
        `/cases/${caseId}/stewardship/revocation`,
        await stewardRevocationBody({ reason: reason.trim(), revokedAt }, attachment),
      )
      toast.success(t('cases.stewardship.revokeSaved'))
      await queryClient.invalidateQueries({ queryKey: ['case', caseId] })
      await queryClient.invalidateQueries({ queryKey: ['case-stewardship', caseId] })
      await queryClient.invalidateQueries({ queryKey: ['case-dossier', caseId] })
      if (hostCaseId) {
        await queryClient.invalidateQueries({ queryKey: ['case', hostCaseId] })
        await queryClient.invalidateQueries({ queryKey: ['case-stewards', hostCaseId] })
        await queryClient.invalidateQueries({ queryKey: ['case-dossier', hostCaseId] })
      }
      onClose()
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('app.error')))
      setSaving(false)
    }
  }

  function submit() {
    if (saving || !reason.trim() || !revokedAt) return
    confirmDangerToast({
      title: t('cases.stewardship.revokeConfirmTitle'),
      confirmLabel: t('cases.stewardship.revokeAction'),
      cancelLabel: t('common.cancel'),
      onConfirm: () => save(),
    })
  }

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink-900/30 p-4" data-nested-dialog>
      <button type="button" className="absolute inset-0 cursor-default" aria-label={t('common.close')} onClick={onClose} />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="portal-steward-revoke-title"
        className="relative z-10 flex max-h-[min(52rem,92dvh)] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-xl"
      >
        <header className="relative shrink-0 overflow-hidden bg-gradient-to-e from-red-50 via-white to-rose-50 px-5 py-4">
          <div className="relative flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-red-600 text-white shadow-[0_8px_16px_rgba(220,38,38,0.28)]">
                <Ban className="size-5" aria-hidden />
              </span>
              <h2 id="portal-steward-revoke-title" className="truncate text-sm font-semibold text-ink-900">
                {t('cases.stewardship.revokeRequest')}
              </h2>
            </div>
            <button type="button" className="cursor-pointer rounded-xl p-2 text-ink-500 hover:bg-white" onClick={onClose} aria-label={t('common.close')}>
              <X className="size-4" aria-hidden />
            </button>
          </div>
        </header>
        <AppForm onSubmit={submit} autoFocusFirst className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField icon={CalendarClock} label={t('cases.stewardship.requestAt')}>
              <div className={`${fieldClassName} flex items-center bg-cream-50`}>
                <DateText value={requestedAt} withTime />
              </div>
            </FormField>
            <FormField icon={CalendarDays} label={t('cases.stewardship.revokeOn')} htmlFor="portalStewardRevokeOn">
              <PersianDateField id="portalStewardRevokeOn" value={revokedAt} onChange={(value) => setRevokedAt(value ?? '')} />
              <input className="sr-only" tabIndex={-1} value={revokedAt} required readOnly onChange={() => undefined} />
            </FormField>
          </div>
          <FormField icon={MessageSquareText} label={t('cases.stewardship.requestText')} htmlFor="portalStewardRevokeText">
            <textarea
              id="portalStewardRevokeText"
              rows={12}
              required
              maxLength={8000}
              value={reason}
              placeholder={t('cases.stewardship.requestTextPlaceholder')}
              onChange={(event) => setReason(event.target.value)}
              className={`${fieldClassName} min-h-64 resize-y`}
            />
          </FormField>
          <FormField icon={Paperclip} label={t('cases.suspensionFile')}>
            <FileDropField id="portalStewardRevokeFile" onFile={setAttachment} disabled={saving} />
          </FormField>
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" disabled={saving} onClick={onClose}>
              <X className="size-4" aria-hidden />
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="danger" disabled={saving || !reason.trim()}>
              <Ban className="size-4" aria-hidden />
              {t('cases.stewardship.revokeAction')}
            </Button>
          </div>
        </AppForm>
      </section>
    </div>,
    document.body,
  )
}

function EntityBadge({ icon: Icon, value }: { icon: LucideIcon; value: string }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-2xl bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-800">
      <Icon className="size-4 shrink-0" aria-hidden />
      <span className="break-words">{value}</span>
    </span>
  )
}

function MetaBadge({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-ink-800 shadow-[0_4px_10px_rgba(20,40,40,0.05)] ring-1 ring-teal-100">
      <Icon className="size-3.5 shrink-0 text-teal-600" aria-hidden />
      <span className="text-ink-500">{label}</span>
      <span>{value}</span>
    </span>
  )
}

function PortalHostLicenseInfo({ host }: { host: CaseDetail['host'] }) {
  const { t } = useTranslation()
  return (
    <div className="space-y-4">
      <FormSectionTitle icon={BadgeCheck} className="mb-0">
        {t('cases.stewardship.hostInfoTitle')}
      </FormSectionTitle>
      <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
        <FormFactTile
          icon={BadgeCheck}
          label={t('cases.stewardship.hostLicense')}
          copyValue={host?.licenseNumber ?? null}
          tone="teal"
        />
        <FormFactTile
          icon={Building2}
          label={t('cases.stewardship.hostActivityTitle')}
          value={host?.businessUnitTitle ?? undefined}
          tone="mint"
        />
      </div>
      <div className="grid gap-2 sm:grid-cols-3 sm:gap-3">
        <FormFactTile
          icon={FolderKanban}
          label={t('cases.activityGroup')}
          value={host?.jobGroupTitle ?? undefined}
          tone="teal"
        />
        <FormFactTile
          icon={Briefcase}
          label={t('cases.activityJob')}
          value={host?.jobTitle ?? undefined}
          tone="mint"
        />
        <FormFactTile
          icon={Layers}
          label={t('cases.activityType')}
          value={host?.jobTypeTitle ?? undefined}
        />
      </div>
      <div className="grid gap-2 sm:grid-cols-3 sm:gap-3">
        <FormFactTile icon={UserRound} label={t('auth.firstName')} value={host?.firstName ?? undefined} tone="teal" />
        <FormFactTile icon={UserRound} label={t('auth.lastName')} value={host?.lastName ?? undefined} tone="mint" />
        <FormFactTile icon={Phone} label={t('cases.stewardship.hostPhone')} copyValue={host?.phone ?? null} />
      </div>
    </div>
  )
}

const caseQuickActionClassName = '!h-8 !gap-1 !rounded-xl !px-2.5 !py-1 !text-xs [&_svg]:size-3.5'

function CountIndicator({
  count,
  label,
  icon: Icon,
  tone,
  onClick,
}: {
  count: number
  label: string
  icon: LucideIcon
  tone: 'orange' | 'amber'
  onClick?: () => void
}) {
  const color = tone === 'orange'
    ? {
        ring: 'ring-orange-200',
        circle: 'bg-orange-50 ring-orange-200',
        number: 'text-orange-800',
        icon: 'text-orange-600',
        hover: 'hover:bg-orange-50 focus-visible:ring-orange-300',
      }
    : {
        ring: 'ring-amber-200',
        circle: 'bg-amber-50 ring-amber-200',
        number: 'text-amber-900',
        icon: 'text-amber-600',
        hover: 'hover:bg-amber-50 focus-visible:ring-amber-300',
      }
  const text = formatNumber(count)
  const className = `flex items-center gap-2 rounded-2xl bg-white/80 px-2.5 py-1.5 ring-1 ${color.ring}${
    onClick ? ` cursor-pointer transition focus-visible:outline-none focus-visible:ring-2 ${color.hover}` : ''
  }`
  const body = (
    <>
      <span className={`flex size-[3.25rem] shrink-0 items-center justify-center rounded-full ring-[5px] ${color.circle}`}>
        <span className={`text-sm font-semibold leading-none ${color.number}`}>{text}</span>
      </span>
      <span className="flex max-w-16 flex-col items-start gap-0.5">
        <Icon className={`size-3.5 ${color.icon}`} aria-hidden />
        <span className="text-[11px] font-medium leading-4 text-ink-500">{label}</span>
      </span>
    </>
  )
  if (!onClick) {
    return (
      <div className={className} role="img" aria-label={`${label}: ${text}`}>
        {body}
      </div>
    )
  }
  return (
    <button type="button" onClick={onClick} className={className} aria-label={`${label}: ${text}`}>
      {body}
    </button>
  )
}

function ActiveSuspensionNotice({ suspension }: { suspension: CaseSuspension }) {
  const { t } = useTranslation()
  return (
    <div className="mb-4 overflow-hidden rounded-2xl bg-white shadow-[0_8px_20px_rgba(217,119,6,0.1)] ring-1 ring-amber-200">
      <div className="flex items-center gap-2 bg-gradient-to-e from-amber-500 to-orange-400 px-4 py-2.5 text-white">
        <CirclePause className="size-4 shrink-0" aria-hidden />
        <p className="text-sm font-semibold">{t('cases.suspensionActive')}</p>
      </div>
      <div className="grid gap-2 p-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-amber-50 px-3 py-2 ring-1 ring-amber-100">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-800/80">
            <CalendarDays className="size-3.5" aria-hidden />
            {t('cases.suspendStartsAt')}
          </p>
          <p className="mt-0.5 text-sm font-semibold text-ink-900">{formatDate(suspension.startsAt)}</p>
        </div>
        <div className="rounded-2xl bg-amber-50 px-3 py-2 ring-1 ring-amber-100">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-800/80">
            <CalendarClock className="size-3.5" aria-hidden />
            {t('cases.suspendEndsAt')}
          </p>
          <p className="mt-0.5 text-sm font-semibold text-ink-900">{formatDate(suspension.endsAt)}</p>
        </div>
      </div>
      <div className="mx-3 mb-3 rounded-2xl bg-cream-50 px-3 py-2.5 ring-1 ring-amber-100">
        <p className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-800/80">
          <MessageSquareText className="size-3.5" aria-hidden />
          {t('cases.suspendReason')}
        </p>
        <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-ink-900">{suspension.reason}</p>
      </div>
    </div>
  )
}

function useRecordDialog(onClose: () => void) {
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.repeat) return
      event.preventDefault()
      event.stopPropagation()
      onCloseRef.current()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKey)
    }
  }, [])
}

function violationStatusLabel(status: string, translate: (key: string) => string) {
  const key = `violationStatuses.${status}`
  const translated = translate(key)
  return translated === key ? status : translated
}

function PersonViolationsModal({
  caseId,
  name,
  onClose,
}: {
  caseId: string
  name: string
  onClose: () => void
}) {
  const { t } = useTranslation()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const query = useQuery({
    queryKey: ['case-violations', caseId],
    queryFn: () => portalApi.get<PortalViolation[]>(`/cases/${caseId}/violations`).then(({ data }) => data),
  })
  const detail = useQuery({
    queryKey: ['case-violation', caseId, selectedId],
    enabled: Boolean(selectedId),
    queryFn: () => portalApi.get<PortalViolation>(`/cases/${caseId}/violations/${selectedId}`).then(({ data }) => data),
  })
  const items = query.data ?? []
  useRecordDialog(() => {
    if (selectedId) setSelectedId(null)
    else onClose()
  })
  const selected = detail.data

  return createPortal(
    <>
      <div className="fixed inset-0 z-[80] flex items-start justify-center bg-ink-900/30 p-4 pt-[10vh]" data-nested-dialog>
        <button type="button" className="absolute inset-0 cursor-default" aria-label={t('common.close')} onClick={onClose} />
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="case-person-violations-title"
          className="relative z-10 flex max-h-[min(44rem,88dvh)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-xl"
        >
          <header className="relative shrink-0 overflow-hidden bg-gradient-to-e from-orange-50 via-white to-amber-50 px-5 py-4">
            <div className="relative flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-[0_8px_16px_rgba(234,88,12,0.28)]">
                  <ShieldAlert className="size-5" aria-hidden />
                </span>
                <h2 id="case-person-violations-title" className="truncate text-sm font-semibold text-ink-900">
                  {t('cases.personViolations', { name: name || t('cases.details') })}
                </h2>
              </div>
              <button type="button" className="cursor-pointer rounded-xl p-2 text-ink-500 hover:bg-white" onClick={onClose} aria-label={t('common.close')}>
                <X className="size-4" aria-hidden />
              </button>
            </div>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            {query.isLoading ? <LoadingState /> : null}
            {query.isError ? <p className="px-2 py-6 text-center text-sm text-red-700">{getApiErrorMessage(query.error, t('app.error'))}</p> : null}
            {!query.isLoading && !query.isError && items.length === 0 ? <EmptyState icon={ShieldAlert} text={t('violations.empty')} /> : null}
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className="flex w-full cursor-pointer items-start gap-3 rounded-2xl border border-orange-100 bg-white px-3 py-3 text-start transition hover:border-orange-300 hover:bg-orange-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
                  >
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                      <ShieldAlert className="size-4" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="min-w-0 truncate text-sm font-medium text-ink-900">{item.violationType.title}</span>
                        <span className="shrink-0 rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-800 ring-1 ring-orange-200">
                          {violationStatusLabel(item.status, t)}
                        </span>
                      </span>
                      <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="size-3.5 shrink-0 text-orange-500" aria-hidden />
                          {formatDate(item.occurredAt)}
                        </span>
                        {item.caseFile?.businessUnitTitle ? (
                          <span className="inline-flex min-w-0 items-center gap-1">
                            <Store className="size-3.5 shrink-0 text-orange-500" aria-hidden />
                            <span className="truncate">{item.caseFile.businessUnitTitle}</span>
                          </span>
                        ) : null}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
      {selectedId ? (
        <div className="fixed inset-0 z-[90] flex items-start justify-center bg-ink-900/40 p-4 pt-[8vh]" data-nested-dialog>
          <button type="button" className="absolute inset-0 cursor-default" aria-label={t('common.close')} onClick={() => setSelectedId(null)} />
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="case-violation-detail-title"
            className="relative z-10 flex max-h-[min(52rem,92dvh)] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-xl"
          >
            <header className="relative shrink-0 overflow-hidden bg-gradient-to-e from-orange-50 via-white to-amber-50 px-5 py-4">
              <div className="relative flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-[0_8px_16px_rgba(234,88,12,0.28)]">
                    <ShieldAlert className="size-5" aria-hidden />
                  </span>
                  <h2 id="case-violation-detail-title" className="truncate text-sm font-semibold text-ink-900">
                    {t('violations.details')}
                  </h2>
                </div>
                <button type="button" className="cursor-pointer rounded-xl p-2 text-ink-500 hover:bg-white" onClick={() => setSelectedId(null)} aria-label={t('common.close')}>
                  <X className="size-4" aria-hidden />
                </button>
              </div>
            </header>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
              {detail.isLoading ? <LoadingState /> : null}
              {detail.isError ? <p className="text-center text-sm text-red-700">{getApiErrorMessage(detail.error, t('app.error'))}</p> : null}
              {selected ? (
                <>
                  <FormSectionTitle icon={ShieldAlert} className="mb-0">
                    {selected.violationType.title}
                  </FormSectionTitle>
                  <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
                    <FormFactTile icon={Tag} label={t('violations.violationType')} value={selected.violationType.title} tone="teal" />
                    <FormFactTile icon={ShieldAlert} label={t('violations.status')} value={violationStatusLabel(selected.status, t)} tone="mint" />
                    <FormFactTile icon={CalendarDays} label={t('violations.occurredAt')} value={formatDate(selected.occurredAt)} tone="teal" />
                    <FormFactTile icon={UserRound} label={t('violations.personName')} value={name} tone="mint" />
                    <FormFactTile icon={IdCard} label={t('violations.nationalId')} copyValue={selected.nationalId} tone="teal" />
                    <FormFactTile
                      icon={Store}
                      label={t('cases.unitTitle')}
                      value={selected.caseFile?.businessUnitTitle || undefined}
                      tone="mint"
                    />
                    <FormFactTile
                      icon={FileText}
                      label={t('violations.description')}
                      value={selected.description?.trim() || undefined}
                      className="sm:col-span-2"
                    />
                  </div>
                  <ViolationAttachmentMedia
                    hrefFor={(attachmentId) => `/cases/${caseId}/violations/${selected.id}/attachments/${attachmentId}`}
                    items={selected.attachments}
                  />
                </>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}
    </>,
    document.body,
  )
}

const RECORD_IMAGE_NAME = /\.(jpe?g|png|gif|webp|bmp)$/i
const RECORD_AUDIO_NAME = /\.(webm|ogg|mp3|m4a|wav|aac)$/i

function isRecordImage(item: { kind?: string; mimeType?: string | null; originalName?: string | null }) {
  if (item.kind === 'IMAGE') return true
  if (item.mimeType?.toLowerCase().startsWith('image/')) return true
  return RECORD_IMAGE_NAME.test(item.originalName ?? '')
}

function isRecordAudio(item: { mimeType?: string | null; originalName?: string | null }) {
  if (item.mimeType?.toLowerCase().startsWith('audio/')) return true
  return RECORD_AUDIO_NAME.test(item.originalName ?? '')
}

function usePortalObjectUrl(href: string | null) {
  const [src, setSrc] = useState<string>()
  useEffect(() => {
    if (!href) {
      setSrc(undefined)
      return
    }
    let objectUrl: string | undefined
    let cancelled = false
    void portalApi
      .get<Blob>(href, { responseType: 'blob' })
      .then((response) => {
        if (cancelled) return
        const header = String(response.headers['content-type'] ?? '')
        const mime = header.split(';')[0].trim() || response.data.type || 'application/octet-stream'
        const blob =
          response.data.type && response.data.type.split(';')[0] === mime
            ? response.data
            : new Blob([response.data], { type: mime })
        objectUrl = URL.createObjectURL(blob)
        setSrc(objectUrl)
      })
      .catch(() => {
        if (!cancelled) setSrc(undefined)
      })
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [href])
  return src
}

async function openPortalFile(href: string) {
  const { data } = await portalApi.get<Blob>(href, { responseType: 'blob' })
  const objectUrl = URL.createObjectURL(data)
  window.open(objectUrl, '_blank', 'noopener')
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000)
}

function ViolationAttachmentMedia({
  hrefFor,
  items,
}: {
  hrefFor: (attachmentId: string) => string
  items: PortalViolationAttachment[]
}) {
  const { t } = useTranslation()
  const images = items.filter(isRecordImage)
  const audios = items.filter((item) => !isRecordImage(item) && isRecordAudio(item))
  const others = items.filter((item) => !isRecordImage(item) && !isRecordAudio(item))
  if (!items.length) return null
  return (
    <div className="space-y-3">
      <FormSectionTitle icon={Paperclip} className="mb-0">
        {t('violations.attachments')}
      </FormSectionTitle>
      {images.map((item) => (
        <RecordImage
          key={item.id}
          href={hrefFor(item.id)}
          name={item.originalName || t('violations.attachments')}
        />
      ))}
      {audios.map((item) => (
        <RecordAudio
          key={item.id}
          href={hrefFor(item.id)}
          label={item.originalName || t('violations.attachmentVoice')}
        />
      ))}
      {others.map((item) => (
        <button
          key={item.id}
          type="button"
          className="flex w-full cursor-pointer items-center gap-2 rounded-2xl bg-orange-50/70 px-3 py-2 text-start text-sm text-orange-900"
          onClick={() => {
            openPortalFile(hrefFor(item.id)).catch((error) => {
              toast.error(getApiErrorMessage(error, t('app.error')))
            })
          }}
        >
          <Paperclip className="size-4 shrink-0" aria-hidden />
          <span className="min-w-0 truncate">{item.originalName || t('violations.openAttachment')}</span>
        </button>
      ))}
    </div>
  )
}

function RecordImage({ href, name }: { href: string; name: string }) {
  const src = usePortalObjectUrl(href)
  if (!src) return <div className="h-36 animate-pulse rounded-2xl bg-orange-50" aria-hidden />
  return <img src={src} alt={name} className="max-h-[28rem] w-full rounded-2xl bg-orange-50 object-contain" />
}

function RecordAudio({ href, label }: { href: string; label: string }) {
  const src = usePortalObjectUrl(href)
  return (
    <div className="space-y-1 rounded-2xl bg-orange-50/70 px-3 py-2">
      <p className="flex min-w-0 items-center gap-1.5 truncate text-xs text-ink-600">
        <Mic className="size-3.5 shrink-0 text-orange-600" aria-hidden />
        <span className="truncate">{label}</span>
      </p>
      {src ? <audio src={src} controls preload="metadata" className="h-10 w-full" dir="ltr" /> : <div className="h-10 animate-pulse rounded-xl bg-white" aria-hidden />}
    </div>
  )
}

function CaseSuspensionsDialog({
  caseId,
  name,
  items,
  onClose,
}: {
  caseId: string
  name: string
  items: CaseSuspension[]
  onClose: () => void
}) {
  const { t } = useTranslation()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = items.find((item) => item.id === selectedId) ?? null
  useRecordDialog(() => {
    if (selectedId) setSelectedId(null)
    else onClose()
  })

  return createPortal(
    <>
      <div className="fixed inset-0 z-[80] flex items-start justify-center bg-ink-900/30 p-4 pt-[10vh]" data-nested-dialog>
        <button type="button" className="absolute inset-0 cursor-default" aria-label={t('common.close')} onClick={onClose} />
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="case-suspensions-title"
          className="relative z-10 flex max-h-[min(44rem,88dvh)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-xl"
        >
          <header className="relative shrink-0 overflow-hidden bg-gradient-to-e from-amber-50 via-white to-orange-50 px-5 py-4">
            <div className="relative flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-[0_8px_16px_rgba(217,119,6,0.28)]">
                  <CirclePause className="size-5" aria-hidden />
                </span>
                <h2 id="case-suspensions-title" className="truncate text-sm font-semibold text-ink-900">
                  {t('cases.personSuspensions', { name: name || t('cases.details') })}
                </h2>
              </div>
              <button type="button" className="cursor-pointer rounded-xl p-2 text-ink-500 hover:bg-white" onClick={onClose} aria-label={t('common.close')}>
                <X className="size-4" aria-hidden />
              </button>
            </div>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            {items.length === 0 ? <EmptyState icon={CirclePause} text={t('cases.suspensionsEmpty')} /> : null}
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className="flex w-full cursor-pointer items-start gap-3 rounded-2xl border border-amber-100 bg-white px-3 py-3 text-start transition hover:border-amber-300 hover:bg-amber-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                  >
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                      <CirclePause className="size-4" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="min-w-0 truncate text-sm font-medium text-ink-900">{item.reason}</span>
                        <SuspensionState item={item} />
                      </span>
                      <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="size-3.5 shrink-0 text-amber-600" aria-hidden />
                          {formatDate(item.startsAt)}
                        </span>
                        <span aria-hidden>—</span>
                        <span className="inline-flex items-center gap-1">
                          <CalendarClock className="size-3.5 shrink-0 text-amber-600" aria-hidden />
                          {formatDate(item.endsAt)}
                        </span>
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
      {selected ? (
        <div className="fixed inset-0 z-[90] flex items-start justify-center bg-ink-900/40 p-4 pt-[8vh]" data-nested-dialog>
          <button type="button" className="absolute inset-0 cursor-default" aria-label={t('common.close')} onClick={() => setSelectedId(null)} />
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="case-suspension-detail-title"
            className="relative z-10 flex max-h-[min(52rem,92dvh)] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-xl"
          >
            <header className="relative shrink-0 overflow-hidden bg-gradient-to-e from-amber-50 via-white to-orange-50 px-5 py-4">
              <div className="relative flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-[0_8px_16px_rgba(217,119,6,0.28)]">
                    <CirclePause className="size-5" aria-hidden />
                  </span>
                  <h2 id="case-suspension-detail-title" className="truncate text-sm font-semibold text-ink-900">
                    {t('cases.suspendTitle')}
                  </h2>
                </div>
                <button type="button" className="cursor-pointer rounded-xl p-2 text-ink-500 hover:bg-white" onClick={() => setSelectedId(null)} aria-label={t('common.close')}>
                  <X className="size-4" aria-hidden />
                </button>
              </div>
            </header>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
              <FormSectionTitle icon={CirclePause} className="mb-0" action={<SuspensionState item={selected} />}>
                {t('cases.suspendTitle')}
              </FormSectionTitle>
              <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
                <FormFactTile icon={CalendarDays} label={t('cases.suspendStartsAt')} value={formatDate(selected.startsAt)} tone="teal" />
                <FormFactTile icon={CalendarClock} label={t('cases.suspendEndsAt')} value={formatDate(selected.endsAt)} tone="mint" />
                <FormFactTile icon={MessageSquareText} label={t('cases.suspendReason')} value={selected.reason} className="sm:col-span-2" />
                {selected.liftNote ? (
                  <FormFactTile icon={CirclePlay} label={t('cases.liftNote')} value={selected.liftNote} tone="mint" className="sm:col-span-2" />
                ) : null}
              </div>
              {selected.files.length ? (
                <div className="space-y-3">
                  <FormSectionTitle icon={Paperclip} className="mb-0">
                    {t('cases.suspensionFile')}
                  </FormSectionTitle>
                  <SuspensionFiles caseId={caseId} files={selected.files} />
                </div>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}
    </>,
    document.body,
  )
}

function SuspensionState({ item }: { item: CaseSuspension }) {
  const { t } = useTranslation()
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${
        item.active ? 'bg-amber-50 text-amber-900 ring-amber-200' : 'bg-cream-50 text-ink-600 ring-line'
      }`}
    >
      {item.active ? t('cases.suspensionActive') : t('cases.suspensionEnded')}
    </span>
  )
}

function SuspensionFiles({ caseId, files }: { caseId: string; files: CaseSuspension['files'] }) {
  return (
    <div className="space-y-3">
      {files.map((file) => (
        <SuspensionFilePreview key={file.id} caseId={caseId} file={file} />
      ))}
    </div>
  )
}

function SuspensionFilePreview({ caseId, file }: { caseId: string; file: CaseSuspension['files'][number] }) {
  const { t } = useTranslation()
  const href = `/cases/${caseId}/suspensions/files/${file.id}`
  const image = isRecordImage(file)
  const audio = !image && isRecordAudio(file)
  const src = usePortalObjectUrl(image || audio ? href : null)
  const label = file.originalName || t('cases.inquiryAttachment')
  return (
    <div className="space-y-2 rounded-2xl bg-cream-50 px-3 py-3 ring-1 ring-line">
      <button
        type="button"
        className="flex w-full cursor-pointer items-center gap-2 text-start text-sm text-teal-800"
        onClick={() => {
          openPortalFile(href).catch((error) => {
            toast.error(getApiErrorMessage(error, t('app.error')))
          })
        }}
      >
        <Paperclip className="size-4 shrink-0" aria-hidden />
        <span className="min-w-0">
          <span className="mb-0.5 block text-xs text-ink-500">
            {file.kind === 'LIFT' ? t('cases.liftFile') : t('cases.suspensionFile')}
          </span>
          <span className="block truncate">{label}</span>
        </span>
      </button>
      {image ? (
        src ? <img src={src} alt={label} className="max-h-[28rem] w-full rounded-2xl bg-white object-contain" /> : <div className="h-36 animate-pulse rounded-2xl bg-white" aria-hidden />
      ) : null}
      {audio ? (
        src ? <audio src={src} controls preload="metadata" className="h-10 w-full" dir="ltr" /> : <div className="h-10 animate-pulse rounded-xl bg-white" aria-hidden />
      ) : null}
    </div>
  )
}

function isoUtcDay(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  if (!match) return null
  return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
}

function licenseSpan(issuedAt: string | null, expiresAt: string | null) {
  if (!expiresAt) return null
  const now = new Date()
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  const end = isoUtcDay(expiresAt)
  if (end == null) return null
  const diff = Math.round((end - today) / 86_400_000)
  const remaining = Math.max(0, diff)
  const overdue = Math.max(0, -diff)
  const start = issuedAt ? isoUtcDay(issuedAt) : null
  const total = start == null ? null : Math.round((end - start) / 86_400_000)
  const ratio = total == null || total <= 0 ? (remaining > 0 ? 1 : 0) : Math.min(1, remaining / total)
  return { remaining, overdue, ratio }
}

function RemainingDaysBadge({
  issuedAt,
  expiresAt,
  label,
  overdueLabel,
}: {
  issuedAt: string | null
  expiresAt: string | null
  label: string
  overdueLabel: string
}) {
  const span = licenseSpan(issuedAt, expiresAt)
  const size = 52
  const stroke = 5
  const radius = (size - stroke) / 2
  const circ = 2 * Math.PI * radius
  const dash = circ * (span?.ratio ?? 0)
  const overdue = (span?.overdue ?? 0) > 0
  const days = span ? formatNumber(overdue ? span.overdue : span.remaining) : '—'
  const caption = overdue ? overdueLabel : label
  return (
    <div
      className={`flex items-center gap-2 rounded-2xl px-2.5 py-1.5 ${overdue ? 'bg-red-50 ring-1 ring-red-200' : 'bg-white/80 ring-1 ring-mint-100'}`}
      role="img"
      aria-label={`${caption}: ${days}`}
    >
      <div className="relative size-[3.25rem] shrink-0">
        <svg viewBox={`0 0 ${size} ${size}`} className="size-[3.25rem] -rotate-90" aria-hidden>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" className={overdue ? 'stroke-red-200' : 'stroke-mint-100'} strokeWidth={stroke} />
          {dash > 0 ? <circle cx={size / 2} cy={size / 2} r={radius} fill="none" className="stroke-mint-500" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${dash} ${circ - dash}`} /> : null}
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-xs font-semibold ${overdue ? 'text-red-600' : 'text-ink-900'}`}>{days}</span>
      </div>
      <p className={`max-w-20 text-[11px] font-medium leading-4 ${overdue ? 'text-red-500' : 'text-ink-500'}`}>{caption}</p>
    </div>
  )
}

function OperationTile({
  icon: Icon,
  label,
  disabled,
  onClick,
}: {
  icon: LucideIcon
  label: string
  disabled: boolean
  onClick?: () => void
}) {
  const { t } = useTranslation()
  return (
    <button
      type="button"
      disabled={disabled}
      title={disabled ? t('cases.future') : undefined}
      onClick={disabled ? undefined : onClick}
      className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-teal-200 bg-white px-3 py-2 text-sm font-medium text-ink-800 shadow-[0_3px_10px_rgba(46,189,182,0.12)] transition hover:border-teal-400 hover:bg-teal-50 focus-visible:ring-2 focus-visible:ring-teal-300 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:border-teal-200 disabled:hover:bg-white"
    >
      <span className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
        <Icon className="size-3.5" aria-hidden />
      </span>
      {label}
    </button>
  )
}

function RequestPill({ children, className = 'bg-teal-50 text-teal-900 ring-teal-200' }: { children: ReactNode; className?: string }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ${className}`}>{children}</span>
}

function requestTypeLabel(type: string, translate: (key: string) => string) {
  const translated = translate(`cases.requestTypes.${type}`)
  return translated === `cases.requestTypes.${type}` ? type : translated
}

function requestAwaitingIntake(type: string, formationStep: number, intakeSubmittedAt?: string | null) {
  if (!intakeSubmittedAt) return false
  const kind = requestTypeOf(type)
  if (kind === 'ISSUANCE') return formationStep < 3
  if (kind === 'AUCTION') return formationStep < 1
  return formationStep < 2
}

function requestCurrentStepLabel(type: string, formationStep: number, translate: (key: string) => string) {
  const step = Math.max(formationStep, 0)
  const kind = requestTypeOf(type)
  if (kind === 'ISSUANCE') return translate(`cases.steps.${FORMATION_STEPS[step] ?? FORMATION_STEPS[0]}`)
  if (kind === 'STEWARDSHIP') return translate(`cases.steps.${STEWARDSHIP_STEPS[step] ?? STEWARDSHIP_STEPS[0]}`)
  if (kind === 'RENEWAL') return translate(`cases.renewalSteps.${RENEWAL_STEPS[step] ?? RENEWAL_STEPS[0]}`)
  if (kind === 'LOCATION_CHANGE') return translate(`cases.locationSteps.${LOCATION_STEPS[step] ?? LOCATION_STEPS[0]}`)
  if (kind === 'AUCTION') return translate(`cases.auction.wizardSteps.${AUCTION_STEPS[step] ?? AUCTION_STEPS[0]}`)
  return null
}

function requestTypeOf(type: string) {
  return type.trim().toUpperCase()
}

function caseRequestViewTo(
  caseId: string,
  request: Pick<CaseRequest, 'id' | 'type' | 'status'>,
  item: Pick<CaseDetail, 'cardNumber'>,
) {
  const kind = requestTypeOf(request.type)
  if (kind === 'ISSUANCE') return `/issuance/${caseId}`
  if (kind === 'AUCTION') return `/cases/${caseId}/auction/${request.id}`
  if (kind === 'RENEWAL') return `/cases/${caseId}/renewal/${request.id}`
  if (kind === 'LOCATION_CHANGE') return `/cases/${caseId}/location-change/${request.id}`
  if (kind === 'STEWARDSHIP') {
    if (item.cardNumber && request.status !== 'OPEN') {
      return `/cases/${caseId}/stewardship/card`
    }
    if (request.status === 'OPEN') {
      return `/cases/${caseId}/stewardship`
    }
    return `/cases/${caseId}/dossier`
  }
  return null
}

function canOpenRenewal(item: CaseDetail) {
  if (item.kind === 'STEWARDSHIP' || item.status === 'REVOKED') return false
  return Boolean(item.licenseNumber) || item.requests.some((request) => requestTypeOf(request.type) === 'RENEWAL')
}

const DOSSIER_TABS = ['identity', 'activity', 'location', 'documents'] as const
type DossierTab = (typeof DOSSIER_TABS)[number]
const DOSSIER_TAB_ICONS = {
  identity: UserRound,
  activity: Briefcase,
  location: MapPin,
  documents: Paperclip,
} satisfies Record<DossierTab, LucideIcon>

function CaseDossierPage() {
  const { caseId = '' } = useParams()
  const { t } = useTranslation()
  const [tab, setTab] = useState<DossierTab>('identity')
  const query = useQuery({
    queryKey: ['case-dossier', caseId],
    enabled: Boolean(caseId),
    queryFn: () => portalApi.get<PortalDossier>(`/cases/${caseId}/dossier`).then(({ data }) => data),
  })
  const item = query.data
  const steward = item?.kind === 'STEWARDSHIP'
  return (
    <div className={shellClassName}>
      <PageHeader
        icon={Files}
        title={t('cases.dossierTitle')}
        titleExtra={steward ? <StewardKindBadge /> : undefined}
        subtitle={
          item ? (
            <span className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex max-w-full items-center gap-2 rounded-2xl bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-800">
                <UserRound className="size-4 shrink-0" aria-hidden />
                <span className="truncate">{item.person.fullName || t('cases.dossierTitle')}</span>
              </span>
              {item.person.nationalId ? (
                <span className="inline-flex max-w-full items-center gap-1.5 rounded-2xl bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-800">
                  <IdCard className="size-4 shrink-0" aria-hidden />
                  <span className="sr-only">{t('account.nationalId')}</span>
                  <CopyableDigits value={item.person.nationalId} />
                </span>
              ) : null}
              {item.person.phone ? (
                <span className="inline-flex max-w-full items-center gap-1.5 rounded-2xl bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-800">
                  <Phone className="size-4 shrink-0" aria-hidden />
                  <span className="sr-only">{t('account.phone')}</span>
                  <CopyableDigits value={item.person.phone} />
                </span>
              ) : null}
            </span>
          ) : undefined
        }
        backTo={`/cases/${caseId}`}
      />
      {query.isLoading ? <LoadingState /> : null}
      {query.isError ? <ErrorState error={query.error} /> : null}
      {item ? (
        <FormCard
          icon={Briefcase}
          title={item.businessUnitTitle || item.person.fullName}
          titleExtra={
            !steward && item.licenseNumber ? (
              <span className="inline-flex max-w-full items-center gap-1.5 rounded-2xl bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-800">
                <BadgeCheck className="size-4 shrink-0" aria-hidden />
                <span className="sr-only">{t('cases.licenseNumber')}</span>
                <CopyableDigits value={item.licenseNumber} />
              </span>
            ) : undefined
          }
        >
          <DossierSummary item={item} />
          <FormTabs
            tabs={DOSSIER_TABS.map((key) => ({
              id: key,
              label: t(`cases.dossierTabs.${key}`),
              icon: DOSSIER_TAB_ICONS[key],
            }))}
            value={tab}
            onChange={(next) => setTab(next as DossierTab)}
          />
          <div className="space-y-6 p-5 sm:p-6" role="tabpanel">
            {tab === 'identity' ? <DossierIdentityPanel item={item} /> : null}
            {tab === 'activity' ? <DossierActivityPanel item={item} /> : null}
            {tab === 'location' ? <DossierLocationPanel item={item} /> : null}
            {tab === 'documents' ? <DossierDocumentsPanel item={item} /> : null}
          </div>
        </FormCard>
      ) : null}
      {item && !steward ? <DossierStewards hostCaseId={caseId} items={item.stewards} /> : null}
    </div>
  )
}

function StewardKindBadge() {
  const { t } = useTranslation()
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-mint-500 px-2.5 py-1 text-xs font-semibold text-white shadow-[0_4px_10px_rgba(63,214,190,0.28)]">
      <IdCard className="size-3.5 shrink-0" aria-hidden />
      {t('cases.stewardship.kind')}
    </span>
  )
}

function DossierSummary({ item }: { item: PortalDossier }) {
  const { t } = useTranslation()
  const steward = item.kind === 'STEWARDSHIP'
  return (
    <div className="grid gap-2 p-5 pb-0 sm:grid-cols-2 sm:gap-3 sm:p-6 sm:pb-0 lg:grid-cols-3">
      <FormFactTile icon={Files} label={t('cases.filterCaseStatus')} value={t(`cases.caseStatuses.${item.status}`)} tone="ink" />
      <FormFactTile icon={Hash} label={t('cases.trackingCode')} value={item.trackingCode ? localizeDigits(item.trackingCode) : undefined} tone="teal" />
      {steward ? (
        <>
          <div className="flex items-center justify-center rounded-2xl border border-mint-100 bg-gradient-to-b from-mint-50 to-white px-3 py-3">
            <DossierRemainingRing issuedAt={item.cardIssuedAt} expiresAt={item.cardExpiresAt} />
          </div>
          <FormFactTile
            icon={CalendarDays}
            label={t('cases.stewardship.cardIssued')}
            value={item.cardIssuedAt ? formatDate(item.cardIssuedAt) : undefined}
          />
          <FormFactTile
            icon={CalendarDays}
            label={t('cases.stewardship.cardExpires')}
            value={item.cardExpiresAt ? formatDate(item.cardExpiresAt) : undefined}
            tone="mint"
          />
        </>
      ) : (
        <>
          <FormFactTile icon={BadgeCheck} label={t('cases.licenseNumber')} copyValue={item.licenseNumber} tone="mint" />
          <FormFactTile icon={CalendarDays} label={t('cases.licenseIssued')} value={item.licenseIssuedAt ? formatDate(item.licenseIssuedAt) : undefined} />
          <FormFactTile icon={CalendarDays} label={t('cases.licenseExpires')} value={item.licenseExpiresAt ? formatDate(item.licenseExpiresAt) : undefined} tone="mint" />
        </>
      )}
    </div>
  )
}

function DossierRemainingRing({ issuedAt, expiresAt }: { issuedAt: string | null; expiresAt: string | null }) {
  const { t } = useTranslation()
  const span = licenseSpan(issuedAt, expiresAt)
  const size = 52
  const stroke = 5
  const radius = (size - stroke) / 2
  const circ = 2 * Math.PI * radius
  const dash = circ * (span?.ratio ?? 0)
  const daysLabel = span ? formatNumber(span.remaining) : '—'
  const caption = t('cases.daysRemaining')
  return (
    <div className="flex flex-col items-center gap-1" role="img" aria-label={span ? `${caption}: ${daysLabel}` : caption}>
      <div className="relative size-[3.25rem] shrink-0">
        <svg viewBox={`0 0 ${size} ${size}`} className="size-[3.25rem] -rotate-90" aria-hidden>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" className="stroke-mint-100" strokeWidth={stroke} />
          {dash > 0 ? (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              className="stroke-mint-500"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circ - dash}`}
            />
          ) : null}
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold leading-none text-ink-900" aria-hidden>
          {daysLabel}
        </span>
      </div>
      <span className="max-w-24 text-center text-[11px] font-medium leading-4 text-ink-500">{caption}</span>
    </div>
  )
}

function DossierSection({ icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <FormSectionTitle icon={icon}>{title}</FormSectionTitle>
      <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">{children}</div>
    </section>
  )
}

function DossierIdentityPanel({ item }: { item: PortalDossier }) {
  const { t } = useTranslation()
  const person = item.person
  const religion = person.religion
    ? person.religion === 'OTHER' && person.religionOther
      ? `${identityLabel(person.religion, 'cases.identityValues.religions', t) ?? person.religion} (${person.religionOther})`
      : identityLabel(person.religion, 'cases.identityValues.religions', t)
    : undefined
  return (
    <div className="space-y-6">
      <DossierSection icon={UserRound} title={t('cases.identitySections.personal')}>
        <FormFactTile icon={UserRound} label={t('issuance.firstName')} value={person.firstName} tone="teal" />
        <FormFactTile icon={UserRound} label={t('issuance.lastName')} value={person.lastName} tone="mint" />
        <FormFactTile icon={UserRound} label={t('issuance.fatherName')} value={person.fatherName ?? undefined} />
        <FormFactTile icon={UserRound} label={t('cases.lastNameEn')} value={person.lastNameEn ?? undefined} tone="mint" />
        <FormFactTile icon={UserRound} label={t('account.gender')} value={identityLabel(person.gender, 'account.genders', t)} />
        <FormFactTile icon={Landmark} label={t('cases.religion')} value={religion} tone="mint" />
        <FormFactTile icon={IdCard} label={t('account.nationalId')} copyValue={person.nationalId} />
      </DossierSection>
      <DossierSection icon={IdCard} title={t('cases.identitySections.birth')}>
        <FormFactTile icon={CalendarDays} label={t('account.birthDate')} value={person.birthDate ? formatDate(person.birthDate) : undefined} />
        <FormFactTile icon={MapPin} label={t('cases.birthPlace')} value={person.birthPlace ?? undefined} tone="mint" />
        <FormFactTile icon={IdCard} label={t('cases.identityCertificateNo')} value={person.identityCertificateNo ? localizeDigits(person.identityCertificateNo) : undefined} />
        <FormFactTile icon={MapPin} label={t('cases.identityIssuedIn')} value={person.identityIssuedIn ?? undefined} tone="mint" />
        <FormFactTile icon={Building2} label={t('issuance.nationality')} value={person.country?.nameFa} />
      </DossierSection>
      <DossierSection icon={IdCard} title={t('cases.identitySections.travel')}>
        <FormFactTile icon={IdCard} label={t('cases.residency')} value={identityLabel(person.residencyStatus, 'cases.identityValues.residency', t)} />
        <FormFactTile icon={IdCard} label={t('cases.passportNumber')} value={person.passportNumber ? localizeDigits(person.passportNumber) : undefined} tone="mint" />
        <FormFactTile icon={CalendarDays} label={t('cases.nationalCardExpiresAt')} value={person.nationalCardExpiresAt ? formatDate(person.nationalCardExpiresAt) : undefined} />
        <FormFactTile icon={CalendarDays} label={t('cases.passportExpiresAt')} value={person.passportExpiresAt ? formatDate(person.passportExpiresAt) : undefined} tone="mint" />
      </DossierSection>
      <DossierSection icon={Phone} title={t('cases.identitySections.contact')}>
        <FormFactTile icon={Phone} label={t('account.phone')} copyValue={person.phone} />
        <FormFactTile icon={Phone} label={t('account.homePhone')} value={person.homePhone ? localizeDigits(person.homePhone) : undefined} tone="mint" />
        <FormFactTile icon={MapPin} label={t('cases.postalCode')} value={person.postalCode ? localizeDigits(person.postalCode) : undefined} />
        <FormFactTile icon={Mail} label={t('account.email')} value={person.email ?? undefined} tone="mint" />
        <FormFactTile className="sm:col-span-2" icon={MapPin} label={t('account.address')} value={person.address ?? undefined} />
      </DossierSection>
      <DossierSection icon={GraduationCap} title={t('cases.identitySections.work')}>
        <FormFactTile icon={GraduationCap} label={t('cases.education')} value={identityLabel(person.educationLevel, 'cases.identityValues.education', t)} />
        <FormFactTile icon={FolderKanban} label={t('cases.jobGroup')} value={person.citizenGroup ?? undefined} tone="mint" />
        <FormFactTile icon={Briefcase} label={t('cases.job')} value={person.economicJob?.title} />
      </DossierSection>
    </div>
  )
}

function DossierActivityPanel({ item }: { item: PortalDossier }) {
  const { t } = useTranslation()
  const activity = item.activity
  return (
    <DossierSection icon={Briefcase} title={t('cases.dossierTabs.activity')}>
      <FormFactTile icon={Building2} label={t('cases.unitTitle')} value={activity.businessUnitTitle ?? undefined} />
      <FormFactTile icon={FolderKanban} label={t('cases.activityGroup')} value={activity.jobGroupTitle ?? undefined} tone="mint" />
      <FormFactTile icon={Briefcase} label={t('cases.activityJob')} value={activity.jobTitle ?? undefined} />
      <FormFactTile icon={Briefcase} label={t('cases.activityType')} value={activity.jobTypeTitle ?? undefined} tone="mint" />
      <FormFactTile icon={Briefcase} label={t('cases.previousOccupation')} value={identityLabel(activity.previousOccupation, 'cases.previousOccupations', t)} />
      <FormFactTile icon={CreditCard} label={t('cases.posCount')} value={activity.posDeviceCount == null ? undefined : formatNumber(activity.posDeviceCount)} tone="mint" />
    </DossierSection>
  )
}

function DossierLocationPanel({ item }: { item: PortalDossier }) {
  const { t } = useTranslation()
  const [historyOpen, setHistoryOpen] = useState(false)
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button type="button" variant="ghost" onClick={() => setHistoryOpen(true)}>
          <History className="size-4" aria-hidden />
          {t('cases.viewLocationHistory')}
        </Button>
      </div>
      <DossierPlaceFacts place={item.location} />
      {historyOpen ? (
        <DossierLocationHistory items={item.locationHistory} onClose={() => setHistoryOpen(false)} />
      ) : null}
    </div>
  )
}

function DossierPlaceFacts({ place }: { place: PortalDossierPlace }) {
  const { t } = useTranslation()
  const complex = place.complex?.name || place.complex?.nameEn
  const rented = place.ownership === 'RENTED'
  return (
    <div className="space-y-6">
      <DossierSection icon={MapPin} title={t('cases.locationSections.place')}>
        <FormFactTile icon={MapPin} label={t('cases.premiseCity')} value={place.city?.nameFa} />
        <FormFactTile icon={Building2} label={t('cases.establishment')} value={identityLabel(place.establishment, 'cases.establishments', t)} tone="mint" />
        {place.establishment === 'COMMERCIAL_COMPLEX' ? (
          <FormFactTile icon={Building2} label={t('cases.complex')} value={complex} />
        ) : null}
        <FormFactTile className="sm:col-span-2" icon={MapPin} label={t('cases.premiseAddress')} value={place.address ?? undefined} />
        <FormFactTile className="sm:col-span-2" icon={MapPin} label={t('cases.premiseAddressEn')} value={place.addressEn ?? undefined} tone="mint" />
        <FormFactTile icon={Hash} label={t('cases.plaque')} value={place.plaque ? localizeDigits(place.plaque) : undefined} />
        <FormFactTile icon={Hash} label={t('cases.plaqueSeries')} value={place.plaqueSeries ? localizeDigits(place.plaqueSeries) : undefined} tone="mint" />
        <FormFactTile icon={Hash} label={t('cases.floor')} value={place.floor ? localizeDigits(place.floor) : undefined} />
        <FormFactTile icon={Hash} label={t('cases.unitNo')} value={place.unitNo ? localizeDigits(place.unitNo) : undefined} tone="mint" />
      </DossierSection>
      <DossierSection icon={Phone} title={t('cases.locationSections.contact')}>
        <FormFactTile icon={MapPin} label={t('cases.premisePostalCode')} value={place.postalCode ? localizeDigits(place.postalCode) : undefined} />
        <FormFactTile icon={Phone} label={t('cases.locationPhone')} value={place.phone ? localizeDigits(place.phone) : undefined} tone="mint" />
        <FormFactTile icon={Phone} label={t('cases.premiseFax')} value={place.fax ? localizeDigits(place.fax) : undefined} />
      </DossierSection>
      <DossierSection icon={MapPin} title={t('cases.locationSections.position')}>
        <FormFactTile icon={MapPin} label={t('cases.geoPosition')} value={identityLabel(place.geoPosition, 'cases.geoPositions', t)} />
        <FormFactTile icon={UserRound} label={t('cases.publicAccess')} value={identityLabel(place.publicAccess, 'cases.publicAccesses', t)} tone="mint" />
        <FormFactTile icon={Landmark} label={t('cases.registrationPlace')} value={place.registrationPlaceTitle ?? undefined} />
      </DossierSection>
      <DossierSection icon={Ruler} title={t('cases.locationSections.ownership')}>
        <FormFactTile icon={Landmark} label={t('cases.ownership')} value={identityLabel(place.ownership, 'cases.ownerships', t)} />
        <FormFactTile icon={Hash} label={t('cases.deedNo')} value={place.deedNo ? localizeDigits(place.deedNo) : undefined} tone="mint" />
        <FormFactTile icon={Ruler} label={t('cases.buildingArea')} value={place.area ? formatNumber(place.area) : undefined} tone="mint" />
      </DossierSection>
      {rented ? (
        <DossierSection icon={CalendarDays} title={t('cases.locationSections.lease')}>
          <FormFactTile icon={CalendarDays} label={t('cases.leaseIssuedAt')} value={place.leaseIssuedAt ? formatDate(place.leaseIssuedAt) : undefined} />
          <FormFactTile icon={CalendarDays} label={t('cases.leaseExpiresAt')} value={place.leaseExpiresAt ? formatDate(place.leaseExpiresAt) : undefined} tone="mint" />
          <FormFactTile icon={Building2} label={t('cases.leaseAgency')} value={place.leaseAgency ?? undefined} />
          <FormFactTile icon={UserRound} label={t('cases.ownerName')} value={place.ownerName ?? undefined} tone="mint" />
        </DossierSection>
      ) : null}
    </div>
  )
}

function DossierLocationHistory({
  items,
  onClose,
}: {
  items: PortalDossier['locationHistory']
  onClose: () => void
}) {
  const { t } = useTranslation()
  const [activeId, setActiveId] = useState(items[0]?.id ?? '')
  useEffect(() => {
    if (items.some((row) => row.id === activeId)) return
    setActiveId(items[0]?.id ?? '')
  }, [activeId, items])
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.repeat) return
      event.preventDefault()
      onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose])
  const active = items.find((row) => row.id === activeId) ?? items[0]
  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-ink-900/30 p-4 pt-[8vh]"
      data-nested-dialog
      role="dialog"
      aria-modal="true"
      aria-labelledby="location-history-title"
      onClick={onClose}
    >
      <div className="mb-8 w-full max-w-3xl" onClick={(event) => event.stopPropagation()}>
        <FormCard
          icon={History}
          title={<span id="location-history-title">{t('cases.locationHistoryTitle')}</span>}
          action={
            <Button type="button" variant="ghost" icon onClick={onClose} aria-label={t('common.close')}>
              <X className="size-4" aria-hidden />
            </Button>
          }
        >
          {items.length === 0 ? (
            <div className="p-5 sm:p-6">
              <EmptyState icon={History} text={t('cases.locationHistoryEmpty')} />
            </div>
          ) : (
            <>
              <FormTabs
                tabs={items.map((row) => ({
                  id: row.id,
                  label: `${t('cases.locationHistoryFrom')} ${formatDate(row.startedAt)} ${t('cases.locationHistoryUntil')} ${formatDate(row.endedAt)}`,
                  icon: MapPin,
                }))}
                value={active?.id ?? ''}
                onChange={setActiveId}
              />
              {active ? (
                <div className="space-y-4 p-5 sm:p-6">
                  <p className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-ink-800">
                    <CalendarDays className="size-4 text-teal-600" aria-hidden />
                    <span>{t('cases.locationHistoryFrom')}</span>
                    {formatDate(active.startedAt)}
                    <span>{t('cases.locationHistoryUntil')}</span>
                    {formatDate(active.endedAt)}
                  </p>
                  <DossierPlaceFacts place={active} />
                </div>
              ) : null}
            </>
          )}
        </FormCard>
      </div>
    </div>,
    document.body,
  )
}

function DossierDocumentsPanel({ item }: { item: PortalDossier }) {
  const { t } = useTranslation()
  const requests = item.requestDocuments
  const [active, setActive] = useState(() => requests.at(-1)?.id ?? 'identity')
  useEffect(() => {
    if (active === 'identity' || requests.some((request) => request.id === active)) return
    setActive(requests.at(-1)?.id ?? 'identity')
  }, [active, requests])
  const typeCounts = new Map<string, number>()
  for (const request of requests) typeCounts.set(request.type, (typeCounts.get(request.type) ?? 0) + 1)
  const selectedRequest = requests.find((request) => request.id === active)
  const documents = active === 'identity' ? item.identityDocuments : selectedRequest?.documents ?? []
  return (
    <div className="space-y-4">
      <div role="tablist" className="flex flex-wrap gap-2">
        <button type="button" role="tab" aria-selected={active === 'identity'} className={dossierDocTabClass(active === 'identity')} onClick={() => setActive('identity')}>
          {t('cases.dossierIdentityDocuments')}
        </button>
        {requests.map((request) => {
          const repeated = (typeCounts.get(request.type) ?? 0) > 1
          const label = repeated ? `${requestTypeLabel(request.type, t)} ${localizeDigits(request.number)}` : requestTypeLabel(request.type, t)
          return (
            <button key={request.id} type="button" role="tab" aria-selected={active === request.id} className={dossierDocTabClass(active === request.id)} onClick={() => setActive(request.id)}>
              {label}
            </button>
          )
        })}
      </div>
      {selectedRequest ? (
        <p className="text-sm text-ink-500">
          {t('cases.requestNumber')}: {localizeDigits(selectedRequest.number)}
          {' · '}
          {formatDate(selectedRequest.createdAt)}
        </p>
      ) : null}
      {documents.length === 0 ? (
        <EmptyState icon={Paperclip} text={t('cases.dossierDocumentsEmpty')} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((document) => (
            <DossierDocumentCard key={document.documentId} item={document} />
          ))}
        </div>
      )}
    </div>
  )
}

function dossierDocTabClass(selected: boolean) {
  return `inline-flex cursor-pointer items-center rounded-2xl px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 ${
    selected
      ? 'bg-teal-500 bg-[linear-gradient(to_inline-end,var(--color-teal-500),var(--color-mint-500))] text-white'
      : 'border border-teal-400 bg-white text-ink-700 hover:bg-teal-50'
  }`
}

function DossierDocumentCard({ item }: { item: PortalDossierDocument }) {
  const { t } = useTranslation()
  const [previewUrl, setPreviewUrl] = useState<string>()
  const [enlarged, setEnlarged] = useState(false)
  const isImage = item.file.mimeType.startsWith('image/')
  useEffect(() => {
    if (!isImage) {
      setPreviewUrl(undefined)
      return
    }
    let cancelled = false
    let url = ''
    void portalApi
      .get<Blob>(`/cases/documents/${item.file.id}/file`, { responseType: 'blob' })
      .then(({ data }) => {
        if (cancelled) return
        url = URL.createObjectURL(data)
        setPreviewUrl(url)
      })
      .catch(() => {
        if (!cancelled) setPreviewUrl(undefined)
      })
    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [isImage, item.file.id])
  useEffect(() => {
    if (!enlarged) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.repeat) return
      event.preventDefault()
      setEnlarged(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [enlarged])

  async function openFile() {
    if (isImage && previewUrl) {
      setEnlarged(true)
      return
    }
    const { data } = await portalApi.get<Blob>(`/cases/documents/${item.file.id}/file`, { responseType: 'blob' })
    const url = URL.createObjectURL(data)
    window.open(url, '_blank', 'noopener')
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
  }

  return (
    <article className="flex flex-col items-center rounded-2xl border border-teal-100 bg-cream-50/60 p-3">
      {previewUrl ? (
        <button type="button" className="flex h-44 w-full cursor-pointer items-center justify-center" aria-label={t('cases.inquiryDocEnlarge')} onClick={() => void openFile()}>
          <img src={previewUrl} alt="" className="max-h-44 max-w-full object-contain" />
        </button>
      ) : (
        <button type="button" className="cursor-pointer text-xs text-teal-700" onClick={() => void openFile()}>
          <Paperclip className="mx-auto mb-1 size-4" aria-hidden />
          {t('cases.inquiryViewFile')}
        </button>
      )}
      <p className="mt-2 text-center text-sm font-semibold text-ink-900">{item.title}</p>
      {enlarged && previewUrl
        ? createPortal(
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/70 p-4"
              data-nested-dialog
              role="dialog"
              aria-modal="true"
              aria-label={t('cases.inquiryDocEnlarge')}
              onClick={() => setEnlarged(false)}
            >
              <img src={previewUrl} alt={item.title} className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl" onClick={(event) => event.stopPropagation()} />
            </div>,
            document.body,
          )
        : null}
    </article>
  )
}

function DossierStewards({ hostCaseId, items }: { hostCaseId: string; items: PortalDossier['stewards'] }) {
  const { t } = useTranslation()
  if (items.length === 0) return null
  return (
    <div className="mt-4">
      <FormCard icon={IdCard} title={t('cases.stewardsTitle')}>
        <div className="p-5 sm:p-6">
          <LicenseStewardsTable hostCaseId={hostCaseId} items={items} />
        </div>
      </FormCard>
    </div>
  )
}

function issuedLicense(item: PortalLicense): ActivityLicense | null {
  if (!item.licenseNumber) return null
  return {
    licenseNumber: item.licenseNumber,
    issuedAt: item.issuedAt,
    expiresAt: item.expiresAt,
    requestNumber: item.requestNumber,
    trackingCode: item.trackingCode,
    firstName: item.firstName,
    lastName: item.lastName,
    lastNameEn: item.lastNameEn,
    gender: item.gender,
    birthDate: item.birthDate,
    nationalityIso2: item.nationalityIso2,
    nationalityFa: item.nationalityFa,
    nationalityEn: item.nationalityEn,
    passportNumber: item.passportNumber,
    phone: item.phone,
    tradeName: item.tradeName,
    activityTitle: item.activityTitle,
    activityTitleEn: item.activityTitleEn,
    photoId: null,
    signerName: item.signerName,
    signerTitle: item.signerTitle,
    signatureId: null,
    address: item.address,
    addressEn: item.addressEn,
    plaque: item.plaque,
    floor: item.floor,
    unitNo: item.unitNo,
    postalCode: item.postalCode,
    cityNameFa: item.cityNameFa,
    cityNameEn: item.cityNameEn,
    complexName: item.complexName,
    complexNameEn: item.complexNameEn,
  }
}

async function accountPhotoDataUrl() {
  const { data } = await portalApi.get<Blob>('/account/photo', { responseType: 'blob' })
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(data)
  })
}

function IssuedLicenseView({ caseId, emptyText }: { caseId: string; emptyText?: string }) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const query = useQuery({
    queryKey: ['case-license', caseId],
    queryFn: () => portalApi.get<PortalLicense>(`/cases/${caseId}/license`).then(({ data }) => data),
  })
  const photoUrl = useAccountPhoto(user?.id, Boolean(query.data?.hasPhoto))
  const item = query.data
  const license = item ? issuedLicense(item) : null

  if (query.isLoading) return <LoadingState />
  if (query.isError || !item) return <ErrorState error={query.error} />
  if (!license) return <EmptyState icon={BadgeCheck} text={emptyText ?? t('cases.licenseNotIssued')} />
  return (
    <IssuedActivityLicense
      license={license}
      photoUrl={photoUrl}
      signatureUrl={item.signatureDataUrl}
      loadPrintPhoto={() => (item.hasPhoto ? accountPhotoDataUrl() : Promise.resolve(null))}
      loadPrintSignature={() => Promise.resolve(item.signatureDataUrl)}
      onError={(error) => toast.error(getApiErrorMessage(error, t('cases.licenseFailed')))}
    />
  )
}

function CaseLicensePage() {
  const { caseId = '' } = useParams()
  const { t } = useTranslation()
  return (
    <div className={shellClassName}>
      <div className="print:hidden">
        <PageHeader icon={BadgeCheck} title={t('cases.licenseTitle')} backTo={`/cases/${caseId}`} />
      </div>
      <IssuedLicenseView caseId={caseId} />
    </div>
  )
}

function StewardCardHeaderBadge({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-ink-800 shadow-[0_4px_10px_rgba(20,40,40,0.05)] ring-1 ring-teal-100">
      <Icon className="size-3.5 shrink-0 text-teal-600" aria-hidden />
      {children}
    </span>
  )
}

function CaseStewardCardPage() {
  const { caseId = '' } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [stewardRevokeOpen, setStewardRevokeOpen] = useState(false)
  const query = useQuery({
    queryKey: ['case-stewardship', caseId],
    enabled: Boolean(caseId),
    queryFn: () => portalApi.get<PortalStewardshipCard>(`/cases/${caseId}/stewardship`).then(({ data }) => data),
  })
  const item = query.data
  const holderName = item
    ? `${item.person.firstName} ${item.person.lastName}`.replace(/\s+/g, ' ').trim() || item.person.fullName
    : ''

  useEffect(() => {
    if (query.isError) return
    if (item && query.isSuccess && !item.cardNumber) {
      navigate(`/cases/${caseId}`, { replace: true })
    }
  }, [caseId, item, navigate, query.isError, query.isSuccess])

  return (
    <div className={shellClassName}>
      <PageHeader
        icon={IdCard}
        title={t('cases.stewardship.cardTitle')}
        subtitle={
          item ? (
            <span className="flex flex-wrap gap-1.5">
              {holderName ? (
                <StewardCardHeaderBadge icon={UserRound}>
                  <span>{holderName}</span>
                </StewardCardHeaderBadge>
              ) : null}
              {item.person.nationalId ? (
                <StewardCardHeaderBadge icon={Fingerprint}>
                  <span className="text-ink-500">{t('account.nationalId')}</span>
                  <CopyableDigits value={item.person.nationalId} />
                </StewardCardHeaderBadge>
              ) : null}
            </span>
          ) : undefined
        }
        backTo={item?.viewerIsHolder === false && item.host?.id ? `/cases/${item.host.id}` : `/cases/${caseId}`}
      />
      {query.isLoading ? <LoadingState /> : null}
      {query.isError ? <ErrorState error={query.error} /> : null}
      {item && item.cardNumber ? (
        <div className="space-y-4">
          <FormCard
            className={item.status === 'REVOKED' ? '!border-2 !border-red-200' : undefined}
            icon={IdCard}
            title={holderName || t('cases.stewardship.cardTitle')}
            titleExtra={
              item.cardNumber ? (
                <span
                  className="inline-flex max-w-full items-center gap-1.5 rounded-2xl bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-800"
                  aria-label={t('cases.stewardship.cardNumber')}
                >
                  <IdCard className="size-4 shrink-0" aria-hidden />
                  <CopyableDigits value={item.cardNumber} />
                </span>
              ) : undefined
            }
          >
            <div className="grid gap-2 p-5 sm:grid-cols-2 sm:gap-3 sm:p-6">
              <FormFactTile
                icon={CalendarDays}
                label={t('cases.stewardship.cardIssued')}
                value={item.cardIssuedAt ? <DateText value={item.cardIssuedAt} /> : '—'}
                tone="teal"
              />
              <FormFactTile
                icon={CalendarDays}
                label={t('cases.stewardship.cardExpires')}
                value={item.cardExpiresAt ? <DateText value={item.cardExpiresAt} /> : '—'}
                tone="mint"
              />
              <FormFactTile
                icon={UserRound}
                label={t('cases.stewardship.hostName')}
                value={item.host?.firstName || '—'}
                tone="teal"
              />
              <FormFactTile
                icon={UserRound}
                label={t('cases.stewardship.hostLastName')}
                value={item.host?.lastName || '—'}
              />
              <FormFactTile
                icon={BadgeCheck}
                label={t('cases.stewardship.hostLicense')}
                copyValue={item.host?.licenseNumber ?? null}
                tone="mint"
              />
              <FormFactTile
                icon={Building2}
                label={t('cases.unitTitle')}
                value={item.host?.businessUnitTitle || '—'}
              />
              <FormFactTile
                icon={FolderKanban}
                label={t('cases.activityGroup')}
                value={item.host?.jobGroupTitle || '—'}
                tone="mint"
              />
              <FormFactTile
                icon={Briefcase}
                label={t('cases.activityJob')}
                value={item.host?.jobTitle || '—'}
              />
            </div>
          </FormCard>
          {item.status === 'REVOKED' ? (
            <FormCard className="!border-2 !border-red-200" icon={Ban} title={t('cases.stewardship.revokeInfoTitle')}>
              <div className="grid gap-2 p-5 sm:grid-cols-2 sm:gap-3 sm:p-6">
                <FormFactTile
                  icon={UserRound}
                  label={t('cases.stewardship.revokedBy')}
                  value={
                    item.revokedBy
                      ? `${item.revokedBy.firstName} ${item.revokedBy.lastName}`.replace(/\s+/g, ' ').trim() ||
                        item.revokedBy.fullName
                      : '—'
                  }
                  tone="teal"
                />
                <FormFactTile
                  icon={CalendarClock}
                  label={t('cases.stewardship.revokeRequestedAt')}
                  value={item.revokeRequestedAt ? <DateText value={item.revokeRequestedAt} withTime /> : '—'}
                />
                <FormFactTile
                  icon={CalendarDays}
                  label={t('cases.stewardship.revokeOn')}
                  value={item.revokedAt ? <DateText value={item.revokedAt} /> : '—'}
                  tone="mint"
                />
                <FormFactTile
                  icon={MessageSquareText}
                  label={t('cases.stewardship.requestText')}
                  value={item.revokeReason || '—'}
                  className="sm:col-span-2"
                />
              </div>
            </FormCard>
          ) : null}
          {item.status !== 'REVOKED' ? (
            <div className="flex justify-center">
              <Button type="button" variant="danger" onClick={() => setStewardRevokeOpen(true)}>
                <Ban className="size-4" aria-hidden />
                {t('cases.stewardship.revokeCard')}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
      {stewardRevokeOpen ? (
        <PortalStewardRevokeDialog
          caseId={caseId}
          hostCaseId={item?.viewerIsHolder === false ? item.host?.id : undefined}
          onClose={() => setStewardRevokeOpen(false)}
        />
      ) : null}
    </div>
  )
}

type FeeStatus = 'PAID' | 'PENDING' | 'UNPAID'
type PaymentMethod = 'ONLINE' | 'POS' | 'BANK_RECEIPT'
type PaymentState = 'PAID' | 'PENDING' | 'FAILED'

type FinanceFee = {
  id: string
  title: string
  amount: number
  isActive: boolean
  status: FeeStatus
  discount: number
}

type FinancePayment = {
  id: string
  receiptNumber: string
  method: PaymentMethod
  status: PaymentState
  paidAt: string | null
  deletedAt: string | null
  createdAt: string
  subtotal: number
  discountAmount: number
  finalAmount: number
  recordedBy: string
  request: { id: string; number: string; type: string } | null
  lines: Array<{ id: string; title: string; amount: number }>
}

type FinanceTotals = {
  total: number
  paid: number
  discount: number
  pending: number
  remaining: number
}

type FinanceItem = {
  request: { id: string; number: string; type: string; status: string }
  finance: null | {
    bankAccount: { bankName: string; accountNumber: string; isActive: boolean }
    fees: FinanceFee[]
  }
  payments: FinancePayment[]
  totals: FinanceTotals
}

type FinanceData = {
  caseFile: { id: string; businessUnitTitle: string | null }
  payer: { fullName: string; phone: string | null }
  items: FinanceItem[]
  totals: FinanceTotals
}

const headerChipClassName =
  'inline-flex max-w-full items-center gap-1.5 rounded-2xl bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-800'
const pillClassName = 'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1'

const feeStatusStyles: Record<FeeStatus, { icon: LucideIcon; className: string }> = {
  PAID: { icon: CircleCheck, className: 'bg-teal-50 text-teal-700 ring-teal-200' },
  PENDING: { icon: Clock3, className: 'bg-amber-50 text-amber-700 ring-amber-200' },
  UNPAID: { icon: CircleDashed, className: 'bg-cream-50 text-ink-600 ring-line' },
}

const paymentMethodIcons: Record<PaymentMethod, LucideIcon> = {
  ONLINE: Globe,
  POS: CreditCard,
  BANK_RECEIPT: ReceiptText,
}

const paymentStatusStyles: Record<PaymentState, { icon: LucideIcon; className: string }> = {
  PAID: { icon: CircleCheck, className: 'bg-teal-50 text-teal-700 ring-teal-200' },
  PENDING: { icon: Clock3, className: 'bg-amber-50 text-amber-700 ring-amber-200' },
  FAILED: { icon: CircleX, className: 'bg-red-50 text-red-700 ring-red-200' },
}

function financeRequestLabel(request: { type: string; number: string }, translate: (key: string) => string) {
  return `${requestTypeLabel(request.type, translate)} — ${localizeDigits(request.number)}`
}

function FeeStatusBadge({ status }: { status: FeeStatus }) {
  const { t } = useTranslation()
  const { icon: Icon, className } = feeStatusStyles[status]
  return (
    <span className={`${pillClassName} ${className}`}>
      <Icon className="size-3.5" aria-hidden />
      {t(`finance.feeStatuses.${status}`)}
    </span>
  )
}

function PaymentMethodBadge({ method }: { method: PaymentMethod }) {
  const { t } = useTranslation()
  const Icon = paymentMethodIcons[method]
  return (
    <span className={`${pillClassName} bg-cream-50 text-ink-700 ring-line`}>
      <Icon className="size-3.5 text-teal-600" aria-hidden />
      {t(`finance.methods.${method}`)}
    </span>
  )
}

function PaymentStatusBadge({ status, deleted }: { status: PaymentState; deleted?: boolean }) {
  const { t } = useTranslation()
  if (deleted) {
    return (
      <span className={`${pillClassName} bg-cream-100 text-ink-500 ring-line`}>
        <ReceiptText className="size-3.5" aria-hidden />
        {t('finance.deleted')}
      </span>
    )
  }
  const { icon: Icon, className } = paymentStatusStyles[status]
  return (
    <span className={`${pillClassName} ${className}`}>
      <Icon className="size-3.5" aria-hidden />
      {t(`finance.statuses.${status}`)}
    </span>
  )
}

function FinanceDateTime({ value }: { value: string | null }) {
  if (!value) return <span className="text-ink-400">—</span>
  return (
    <span dir="ltr" className="inline-flex items-center gap-2">
      <span>{formatDate(value)}</span>
      <span>{formatClock(value)}</span>
    </span>
  )
}

function FinanceFeesCard({ item }: { item: FinanceItem }) {
  const { t } = useTranslation()
  const finance = item.finance
  const total = finance?.fees.reduce((sum, fee) => sum + fee.amount, 0) ?? 0
  const account = finance?.bankAccount
  const accountLabel = account
    ? `${account.bankName} — ${localizeDigits(account.accountNumber)}${account.isActive ? '' : ` (${t('finance.inactiveAccount')})`}`
    : ''
  return (
    <FormCard
      icon={Banknote}
      title={financeRequestLabel(item.request, t)}
      chips={
        account ? (
          <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-xs font-medium text-teal-800 ring-1 ring-teal-100">
            <Landmark className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">{accountLabel}</span>
          </span>
        ) : undefined
      }
    >
      {finance ? (
        <div className="p-5 sm:p-6">
          <div className="overflow-x-auto rounded-2xl border border-line">
            <table className="w-full text-sm">
              <thead className="bg-cream-50 text-ink-700">
                <tr>
                  <th className="px-4 py-3 text-start font-medium">{t('finance.feeTitle')}</th>
                  <th className="w-64 px-4 py-3 text-start font-medium">{t('finance.feeAmount')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('finance.feeStatus')}</th>
                </tr>
              </thead>
              <tbody>
                {finance.fees.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-10 text-center text-ink-500">
                      {t('finance.noFees')}
                    </td>
                  </tr>
                ) : (
                  finance.fees.map((fee) => (
                    <tr key={fee.id} className="border-t border-line">
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5">
                          {fee.status === 'PAID' ? (
                            <CircleCheck className="size-5 shrink-0 text-emerald-600" aria-label={t('finance.feeStatuses.PAID')} />
                          ) : null}
                          {fee.title}
                          {fee.isActive ? '' : ` (${t('finance.inactiveFee')})`}
                        </span>
                      </td>
                      <td className="px-4 py-3">{formatNumber(fee.amount)}</td>
                      <td className="px-4 py-3">
                        <span className="flex flex-wrap items-center gap-1.5">
                          <FeeStatusBadge status={fee.status} />
                          {fee.status !== 'UNPAID' && fee.discount > 0 ? (
                            <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-mint-50 px-2.5 py-1 text-xs font-medium text-teal-800 ring-1 ring-mint-300">
                              <Percent className="size-3.5" aria-hidden />
                              {t('finance.discountBadge', { value: formatNumber(fee.discount) })}
                            </span>
                          ) : null}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {finance.fees.length > 0 ? (
                <tfoot>
                  <tr className="border-t border-line bg-cream-50 text-ink-800">
                    <td className="px-4 py-4 text-base font-semibold">{t('finance.totalFees')}</td>
                    <td className="px-4 py-4 text-xl font-bold text-teal-700" colSpan={2}>
                      {formatNumber(total)}
                    </td>
                  </tr>
                </tfoot>
              ) : null}
            </table>
          </div>
        </div>
      ) : (
        <div className="p-5 sm:p-6">
          <EmptyState icon={Banknote} text={t('finance.noSettings')} />
        </div>
      )}
    </FormCard>
  )
}

function FinancePaymentDetail({ payment, onClose }: { payment: FinancePayment; onClose: () => void }) {
  const { t } = useTranslation()
  const dialog = useRef<HTMLDivElement>(null)
  useEffect(() => {
    dialog.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      event.stopPropagation()
      onClose()
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [onClose])
  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4">
      <button type="button" className="absolute inset-0 cursor-default bg-ink-900/40" aria-label={t('finance.close')} onClick={onClose} />
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-label={t('finance.details')}
        tabIndex={-1}
        className="relative z-10 max-h-[calc(100vh-2rem)] w-full max-w-3xl overflow-y-auto rounded-3xl outline-none"
      >
        <FormCard
          icon={Banknote}
          title={localizeDigits(payment.receiptNumber)}
          subtitle={payment.request ? financeRequestLabel(payment.request, t) : undefined}
          chips={
            <>
              <PaymentMethodBadge method={payment.method} />
              <PaymentStatusBadge status={payment.status} deleted={Boolean(payment.deletedAt)} />
            </>
          }
          action={
            <Button type="button" variant="ghost" icon aria-label={t('finance.close')} title={t('finance.close')} onClick={onClose}>
              <X className="size-4" aria-hidden />
            </Button>
          }
        >
          <div className="space-y-4 p-5 sm:p-6">
            <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
              <FormFactTile icon={Hash} label={t('finance.receiptNumber')} value={<span dir="ltr">{localizeDigits(payment.receiptNumber)}</span>} />
              <FormFactTile icon={CalendarDays} label={t('finance.paidAt')} value={<FinanceDateTime value={payment.paidAt} />} tone="mint" />
              <FormFactTile icon={UserRound} label={t('finance.recordedBy')} value={payment.recordedBy} />
              <FormFactTile icon={ClipboardList} label={t('finance.caseRequest')} value={payment.request ? financeRequestLabel(payment.request, t) : undefined} tone="mint" />
              <FormFactTile icon={Banknote} label={t('finance.totalAmount')} value={formatNumber(payment.subtotal)} />
              <FormFactTile icon={Percent} label={t('finance.discountAmount')} value={formatNumber(payment.discountAmount)} tone="mint" />
              <FormFactTile icon={Wallet} label={t('finance.finalAmount')} value={formatNumber(payment.finalAmount)} />
            </div>
            <FormSectionTitle icon={ReceiptText}>{t('finance.lines')}</FormSectionTitle>
            {payment.lines.length ? (
              <div className="overflow-hidden rounded-2xl border border-line">
                <table className="w-full text-sm">
                  <tbody>
                    {payment.lines.map((line) => (
                      <tr key={line.id} className="border-t border-line first:border-t-0">
                        <td className="px-4 py-3">{line.title}</td>
                        <td className="px-4 py-3 text-end font-medium">{formatNumber(line.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState icon={ReceiptText} text={t('finance.noFees')} />
            )}
          </div>
        </FormCard>
      </div>
    </div>,
    document.body,
  )
}

function FinancePage() {
  const { caseId = '' } = useParams()
  const { t } = useTranslation()
  const [paymentsRequestId, setPaymentsRequestId] = useState('')
  const [viewingId, setViewingId] = useState<string | null>(null)
  const query = useQuery({
    queryKey: ['finance', caseId],
    queryFn: () => portalApi.get<FinanceData>(`/cases/${caseId}/finance`).then(({ data }) => data),
  })
  const data = query.data
  const items = data?.items ?? []
  const payments = useMemo(
    () =>
      items
        .filter((item) => !paymentsRequestId || item.request.id === paymentsRequestId)
        .flatMap((item) => item.payments)
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0)),
    [items, paymentsRequestId],
  )
  const viewing = payments.find((item) => item.id === viewingId) ?? items.flatMap((item) => item.payments).find((item) => item.id === viewingId)
  const allPaymentCount = items.reduce((sum, item) => sum + item.payments.length, 0)
  if (query.isLoading) return <LoadingState />
  if (query.isError || !data) return <ErrorState error={query.error} />
  return (
    <div className={shellClassName}>
      <PageHeader
        icon={Wallet}
        title={t('finance.title')}
        backTo={`/cases/${caseId}`}
        subtitle={
          <span className="flex flex-wrap items-center gap-1.5">
            <span className={headerChipClassName}>
              <UserRound className="size-4 shrink-0" aria-hidden />
              <span className="truncate">{data.payer.fullName}</span>
            </span>
            {data.caseFile.businessUnitTitle ? (
              <span className={headerChipClassName}>
                <Store className="size-4 shrink-0" aria-hidden />
                <span className="truncate">{data.caseFile.businessUnitTitle}</span>
              </span>
            ) : null}
            {data.payer.phone ? (
              <span className={headerChipClassName}>
                <Phone className="size-4 shrink-0" aria-hidden />
                <span dir="ltr">{localizeDigits(data.payer.phone)}</span>
              </span>
            ) : null}
          </span>
        }
      />
      <div className="space-y-5">
        <div className="grid gap-2 sm:grid-cols-2 sm:gap-3 xl:grid-cols-4">
          <FormFactTile icon={Banknote} label={t('finance.totalFees')} value={formatNumber(data.totals.total)} />
          <FormFactTile icon={CircleCheck} tone="mint" label={t('finance.paidAmount')} value={formatNumber(data.totals.paid)} />
          <FormFactTile icon={Percent} label={t('finance.discountAmount')} value={formatNumber(data.totals.discount)} />
          <FormFactTile
            icon={Wallet}
            tone="mint"
            label={t('finance.remainingAmount')}
            value={formatNumber(data.totals.remaining + data.totals.pending)}
          />
        </div>
        {items.length === 0 ? <EmptyState icon={Banknote} text={t('finance.noRequests')} /> : null}
        {items.map((item) => (
          <FinanceFeesCard key={item.request.id} item={item} />
        ))}
        <FormCard icon={ReceiptText} title={t('finance.paymentsTitle')}>
          <div className="space-y-4 p-5 sm:p-6">
            {items.length > 1 ? (
              <div className="flex flex-wrap gap-2" role="group" aria-label={t('finance.filterByRequest')}>
                {[{ id: '', label: t('finance.allRequests'), count: allPaymentCount }, ...items.map((item) => ({
                  id: item.request.id,
                  label: financeRequestLabel(item.request, t),
                  count: item.payments.length,
                }))].map((filter) => {
                  const active = filter.id === paymentsRequestId
                  return (
                    <button
                      key={filter.id || 'all'}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setPaymentsRequestId(filter.id)}
                      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 ${
                        active
                          ? 'bg-teal-500 bg-[linear-gradient(to_inline-end,var(--color-teal-500),var(--color-mint-500))] text-white shadow-[0_6px_14px_rgba(46,189,182,0.28)]'
                          : 'bg-white text-ink-700 ring-1 ring-teal-200 hover:bg-teal-50'
                      }`}
                    >
                      <ClipboardList className="size-3.5" aria-hidden />
                      {filter.label}
                      <span className={`rounded-full px-1.5 text-[11px] font-semibold ${active ? 'bg-white/25 text-white' : 'bg-teal-50 text-teal-700'}`}>
                        {formatNumber(filter.count)}
                      </span>
                    </button>
                  )
                })}
              </div>
            ) : null}
            <div className="overflow-x-auto rounded-2xl border border-line">
              <table className="w-full text-sm">
                <thead className="bg-cream-50 text-ink-700">
                  <tr>
                    <th className="px-4 py-3 text-start font-medium">{t('finance.receiptNumber')}</th>
                    {items.length > 1 ? <th className="px-4 py-3 text-start font-medium">{t('finance.caseRequest')}</th> : null}
                    <th className="px-4 py-3 text-start font-medium">{t('finance.paidAt')}</th>
                    <th className="px-4 py-3 text-start font-medium">{t('finance.method')}</th>
                    <th className="px-4 py-3 text-start font-medium">{t('finance.status')}</th>
                    <th className="px-4 py-3 text-start font-medium">{t('finance.totalAmount')}</th>
                    <th className="px-4 py-3 text-start font-medium">{t('finance.discountAmount')}</th>
                    <th className="px-4 py-3 text-start font-medium">{t('finance.finalAmount')}</th>
                    <th className="px-4 py-3 text-start font-medium">{t('finance.recordedBy')}</th>
                    <th className={`${actionsColClassName} text-start font-medium`}>{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={items.length > 1 ? 10 : 9} className="px-4 py-10 text-center text-ink-500">
                        {t('finance.noPayments')}
                      </td>
                    </tr>
                  ) : (
                    payments.map((item) => (
                      <tr key={item.id} className={`border-t border-line ${item.deletedAt ? 'opacity-60' : ''}`}>
                        <td className="px-4 py-3 font-medium" dir="ltr">
                          {localizeDigits(item.receiptNumber)}
                        </td>
                        {items.length > 1 ? (
                          <td className="px-4 py-3">{item.request ? financeRequestLabel(item.request, t) : '—'}</td>
                        ) : null}
                        <td className="px-4 py-3">
                          <FinanceDateTime value={item.paidAt} />
                        </td>
                        <td className="px-4 py-3">
                          <PaymentMethodBadge method={item.method} />
                        </td>
                        <td className="px-4 py-3">
                          <PaymentStatusBadge status={item.status} deleted={Boolean(item.deletedAt)} />
                        </td>
                        <td className="px-4 py-3">{formatNumber(item.subtotal)}</td>
                        <td className="px-4 py-3">{formatNumber(item.discountAmount)}</td>
                        <td className="px-4 py-3 font-medium">{formatNumber(item.finalAmount)}</td>
                        <td className="px-4 py-3">{item.recordedBy}</td>
                        <td className={actionsColClassName}>
                          <Button type="button" variant="ghost" onClick={() => setViewingId(item.id)}>
                            <Eye className="size-4" aria-hidden />
                            {t('common.view')}
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </FormCard>
      </div>
      {viewing ? <FinancePaymentDetail payment={viewing} onClose={() => setViewingId(null)} /> : null}
    </div>
  )
}

type AccountGeo = { id: string; nameFa: string }

type Account = {
  id: string
  username: string
  firstName: string
  lastName: string
  fullName: string
  nationalId: string | null
  phone: string | null
  email: string | null
  address: string | null
  postalCode: string | null
  homePhone: string | null
  gender: string | null
  birthDate: string | null
  birthPlace: string | null
  personType: string | null
  notes: string | null
  telegram: string | null
  bale: string | null
  eitaa: string | null
  whatsapp: string | null
  otherSocial: string | null
  vehiclePlates: string[]
  countryId: string | null
  provinceId: string | null
  cityId: string | null
  country: AccountGeo | null
  province: AccountGeo | null
  city: AccountGeo | null
  hasPhoto: boolean
}

type AccountTab = 'personal' | 'account' | 'location' | 'documents' | 'social' | 'other'

function AccountPage() {
  const { t } = useTranslation()
  const query = useQuery({
    queryKey: ['account'],
    queryFn: () => portalApi.get<Account>('/account').then(({ data }) => data),
  })
  if (query.isLoading) return <LoadingState />
  if (query.isError || !query.data) return <ErrorState error={query.error} />
  return (
    <div className={shellClassName}>
      <PageHeader icon={CircleUserRound} title={t('account.title')} subtitle={t('account.subtitle')} />
      <AccountEditor initial={query.data} />
    </div>
  )
}

function withCurrentOption(options: SelectOption[], selectedId: string, current: AccountGeo | null) {
  if (!current || selectedId !== current.id || options.some((option) => option.value === current.id)) return options
  return [...options, { value: current.id, label: current.nameFa }]
}

function AccountEditor({ initial }: { initial: Account }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const photoUrl = useAccountPhoto(initial.id, initial.hasPhoto)
  const [tab, setTab] = useState<AccountTab>('personal')
  const [phone, setPhone] = useState(initial.phone ?? '')
  const [email, setEmail] = useState(initial.email ?? '')
  const [address, setAddress] = useState(initial.address ?? '')
  const [birthPlace, setBirthPlace] = useState(initial.birthPlace ?? '')
  const [postalCode, setPostalCode] = useState(initial.postalCode ?? '')
  const [homePhone, setHomePhone] = useState(initial.homePhone ?? '')
  const [countryId, setCountryId] = useState(initial.countryId ?? '')
  const [provinceId, setProvinceId] = useState(initial.provinceId ?? '')
  const [cityId, setCityId] = useState(initial.cityId ?? '')
  const [telegram, setTelegram] = useState(initial.telegram ?? '')
  const [bale, setBale] = useState(initial.bale ?? '')
  const [eitaa, setEitaa] = useState(initial.eitaa ?? '')
  const [whatsapp, setWhatsapp] = useState(initial.whatsapp ?? '')
  const [otherSocial, setOtherSocial] = useState(initial.otherSocial ?? '')
  const [notes, setNotes] = useState(initial.notes ?? '')
  const [vehiclePlates, setVehiclePlates] = useState<string[]>(
    initial.vehiclePlates?.length ? initial.vehiclePlates : [''],
  )
  const countries = useQuery({
    queryKey: ['lookups', 'countries'],
    queryFn: () => portalApi.get<Lookup[]>('/lookups/countries').then(({ data }) => data),
    staleTime: 300_000,
  })
  const provinces = useQuery({
    queryKey: ['lookups', 'provinces', countryId],
    enabled: Boolean(countryId),
    queryFn: () => portalApi.get<Lookup[]>(`/lookups/provinces?countryId=${countryId}`).then(({ data }) => data),
    staleTime: 300_000,
  })
  const cities = useQuery({
    queryKey: ['lookups', 'cities', provinceId],
    enabled: Boolean(provinceId),
    queryFn: () => portalApi.get<Lookup[]>(`/lookups/cities?provinceId=${provinceId}`).then(({ data }) => data),
    staleTime: 300_000,
  })
  const tabs: FormTabItem[] = [
    { id: 'personal', label: t('account.tabs.personal'), icon: UserRound },
    { id: 'account', label: t('account.tabs.account'), icon: CircleUserRound },
    { id: 'location', label: t('account.tabs.location'), icon: MapPinned },
    { id: 'documents', label: t('account.tabs.documents'), icon: FileText },
    { id: 'social', label: t('account.tabs.social'), icon: ContactRound },
    { id: 'other', label: t('account.tabs.other'), icon: Mail },
  ]
  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) => portalApi.patch('/account', body),
    onSuccess: () => {
      toast.success(t('account.saved'))
      void queryClient.invalidateQueries({ queryKey: ['account'] })
    },
    onError: (error) => toast.error(getApiErrorMessage(error, t('app.error'))),
  })

  function fail(nextTab: AccountTab, fieldId: string, message: string) {
    toast.error(message)
    setTab(nextTab)
    requestAnimationFrame(() => document.getElementById(fieldId)?.focus())
  }

  function submit() {
    const normalizedPhone = phone.replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    const nextEmail = email.trim()
    const nextAddress = address.trim()
    if (!/^09\d{9}$/.test(normalizedPhone)) {
      fail('personal', 'account-phone', t('account.phoneInvalid'))
      return
    }
    if (nextEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
      fail('other', 'account-email', t('account.emailInvalid'))
      return
    }
    if (nextAddress && nextAddress.length < 5) {
      fail('location', 'account-address', t('account.addressInvalid'))
      return
    }
    save.mutate({
      phone: normalizedPhone,
      email: nextEmail || null,
      address: nextAddress || null,
      birthPlace: birthPlace.trim() || null,
      postalCode: postalCode.trim() || null,
      homePhone: homePhone.trim() || null,
      countryId: countryId || null,
      provinceId: provinceId || null,
      cityId: cityId || null,
      telegram: telegram.trim() || null,
      bale: bale.trim() || null,
      eitaa: eitaa.trim() || null,
      whatsapp: whatsapp.trim() || null,
      otherSocial: otherSocial.trim() || null,
      notes: notes.trim() || null,
      vehiclePlates: vehiclePlates.map((plate) => plate.trim()).filter(Boolean),
    })
  }

  const countryOptions = withCurrentOption(
    [
      { value: '', label: t('account.selectCountry') },
      ...(countries.data ?? []).map((country) => ({ value: country.id, label: country.nameFa ?? country.name ?? '' })),
    ],
    countryId,
    initial.country,
  )
  const provinceOptions = withCurrentOption(
    [
      { value: '', label: t('account.selectProvince') },
      ...(provinces.data ?? []).map((province) => ({ value: province.id, label: province.nameFa ?? province.name ?? '' })),
    ],
    provinceId,
    initial.province,
  )
  const cityOptions = withCurrentOption(
    [
      { value: '', label: t('account.selectCity') },
      ...(cities.data ?? []).map((city) => ({ value: city.id, label: city.nameFa ?? city.name ?? '' })),
    ],
    cityId,
    initial.city,
  )

  return (
    <FormCard
      icon={CircleUserRound}
      avatar={{ photoUrl, fullName: initial.fullName }}
      title={initial.fullName}
      subtitle={t('account.profileSubtitle')}
    >
      <FormTabs tabs={tabs} value={tab} onChange={(next) => setTab(next as AccountTab)} />
      <AppForm noValidate className={formBodyClassName} onSubmit={submit}>
        <div id="form-panel-personal" role="tabpanel" aria-labelledby="form-tab-personal" className={tab === 'personal' ? 'space-y-4' : 'hidden'}>
          <FormSectionTitle icon={IdCard}>{t('account.identitySection')}</FormSectionTitle>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <FormFactTile icon={UserRound} label={t('account.fullName')} value={initial.fullName} />
            <FormFactTile icon={FileBadge2} label={t('account.nationalId')} value={localizeDigits(initial.nationalId ?? '')} tone="mint" />
            <FormFactTile icon={UserRound} label={t('account.personType')} value={initial.personType ? t(`account.personTypes.${initial.personType}`) : undefined} tone="ink" />
            <FormFactTile icon={UserRound} label={t('account.gender')} value={initial.gender ? t(`account.genders.${initial.gender}`) : undefined} />
            <FormFactTile icon={CalendarDays} label={t('account.birthDate')} value={formatDate(initial.birthDate)} tone="mint" />
          </div>
          <FormSectionTitle icon={Phone}>{t('account.mobileSection')}</FormSectionTitle>
          <FormField icon={Phone} label={t('account.phone')} htmlFor="account-phone">
            <input
              id="account-phone"
              className={`${fieldClassName} digit-field`}
              value={phone}
              inputMode="numeric"
              maxLength={11}
              required
              onChange={(event) => setPhone(event.target.value)}
            />
          </FormField>
        </div>

        <div id="form-panel-account" role="tabpanel" aria-labelledby="form-tab-account" className={tab === 'account' ? 'space-y-4' : 'hidden'}>
          <FormSectionTitle icon={CircleUserRound}>{t('account.accountSection')}</FormSectionTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormFactTile icon={UserRound} label={t('account.username')} value={initial.username} tone="ink" />
            <div className="flex items-center justify-center rounded-2xl border border-teal-100 bg-gradient-to-b from-teal-50 to-white p-4">
              <Link to="/account/password">
                <Button type="button" variant="ghost"><KeyRound className="size-4" />{t('account.changePassword')}</Button>
              </Link>
            </div>
          </div>
        </div>

        <div id="form-panel-location" role="tabpanel" aria-labelledby="form-tab-location" className={tab === 'location' ? 'space-y-4' : 'hidden'}>
          <FormSectionTitle icon={MapPinned}>{t('account.locationSection')}</FormSectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField icon={Flag} label={t('account.country')} htmlFor="account-country">
              <SearchSelect
                id="account-country"
                value={countryId}
                placeholder={t('account.selectCountry')}
                options={countryOptions}
                onChange={(next) => {
                  setCountryId(next)
                  setProvinceId('')
                  setCityId('')
                }}
              />
            </FormField>
            <FormField icon={MapPinned} label={t('account.province')} htmlFor="account-province">
              <SearchSelect
                id="account-province"
                value={provinceId}
                disabled={!countryId}
                placeholder={t('account.selectProvince')}
                options={provinceOptions}
                onChange={(next) => {
                  setProvinceId(next)
                  setCityId('')
                }}
              />
            </FormField>
            <FormField icon={MapPin} label={t('account.city')} htmlFor="account-city">
              <SearchSelect
                id="account-city"
                value={cityId}
                disabled={!provinceId}
                placeholder={t('account.selectCity')}
                options={cityOptions}
                onChange={setCityId}
              />
            </FormField>
            <FormField icon={MapPin} label={t('account.birthPlace')} htmlFor="account-birth-place">
              <input id="account-birth-place" className={fieldClassName} value={birthPlace} onChange={(event) => setBirthPlace(event.target.value)} />
            </FormField>
            <FormField icon={Hash} label={t('account.postalCode')} htmlFor="account-postal">
              <input id="account-postal" className={`${fieldClassName} digit-field`} inputMode="numeric" value={postalCode} onChange={(event) => setPostalCode(event.target.value)} />
            </FormField>
            <FormField icon={Phone} label={t('account.homePhone')} htmlFor="account-home-phone">
              <input id="account-home-phone" className={`${fieldClassName} digit-field`} inputMode="tel" value={homePhone} onChange={(event) => setHomePhone(event.target.value)} />
            </FormField>
            <div className="sm:col-span-2">
              <FormField icon={MapPin} label={t('account.address')} htmlFor="account-address">
                <textarea id="account-address" className={`${fieldClassName} min-h-24 resize-y`} value={address} onChange={(event) => setAddress(event.target.value)} />
              </FormField>
            </div>
          </div>
        </div>

        <div id="form-panel-documents" role="tabpanel" aria-labelledby="form-tab-documents" className={tab === 'documents' ? 'space-y-4' : 'hidden'}>
          <FormSectionTitle icon={FileText}>{t('account.documentsSection')}</FormSectionTitle>
          <div className="grid gap-4 sm:grid-cols-[12rem_minmax(0,1fr)]">
            <div className="flex items-center justify-center rounded-2xl border border-teal-100 bg-teal-50/70 p-5">
              <PersonAvatar photoUrl={photoUrl} fullName={initial.fullName} size="profile" />
            </div>
            <EmptyState icon={FileText} text={t('account.documentsReadOnly')} />
          </div>
        </div>

        <div id="form-panel-social" role="tabpanel" aria-labelledby="form-tab-social" className={tab === 'social' ? 'space-y-4' : 'hidden'}>
          <FormSectionTitle icon={ContactRound}>{t('account.socialSection')}</FormSectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField icon={MessageCircle} label={t('account.telegram')} htmlFor="account-telegram">
              <input id="account-telegram" className={`${fieldClassName} latin-field`} dir="ltr" value={telegram} onChange={(event) => setTelegram(event.target.value)} />
            </FormField>
            <FormField icon={MessageCircle} label={t('account.bale')} htmlFor="account-bale">
              <input id="account-bale" className={`${fieldClassName} latin-field`} dir="ltr" value={bale} onChange={(event) => setBale(event.target.value)} />
            </FormField>
            <FormField icon={MessageCircle} label={t('account.eitaa')} htmlFor="account-eitaa">
              <input id="account-eitaa" className={`${fieldClassName} latin-field`} dir="ltr" value={eitaa} onChange={(event) => setEitaa(event.target.value)} />
            </FormField>
            <FormField icon={Phone} label={t('account.whatsapp')} htmlFor="account-whatsapp">
              <input id="account-whatsapp" className={`${fieldClassName} latin-field`} dir="ltr" value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} />
            </FormField>
            <FormField icon={Share2} label={t('account.otherSocial')} htmlFor="account-other-social">
              <input id="account-other-social" className={`${fieldClassName} latin-field`} dir="ltr" value={otherSocial} onChange={(event) => setOtherSocial(event.target.value)} />
            </FormField>
          </div>
        </div>

        <div id="form-panel-other" role="tabpanel" aria-labelledby="form-tab-other" className={tab === 'other' ? 'space-y-4' : 'hidden'}>
          <FormSectionTitle icon={Mail}>{t('account.otherSection')}</FormSectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField icon={Mail} label={t('account.email')} htmlFor="account-email">
              <input id="account-email" type="email" className={`${fieldClassName} latin-field`} dir="ltr" value={email} onChange={(event) => setEmail(event.target.value)} />
            </FormField>
          </div>
          <FormField icon={Car} label={t('account.vehiclePlates')}>
            <div className="space-y-2">
              {vehiclePlates.map((plate, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    className={fieldClassName}
                    value={plate}
                    onChange={(event) => {
                      const next = [...vehiclePlates]
                      next[index] = event.target.value
                      setVehiclePlates(next)
                    }}
                  />
                  {vehiclePlates.length > 1 ? (
                    <Button type="button" variant="ghost" onClick={() => setVehiclePlates(vehiclePlates.filter((_, item) => item !== index))}>
                      {t('account.removePlate')}
                    </Button>
                  ) : null}
                </div>
              ))}
              <Button type="button" variant="ghost" onClick={() => setVehiclePlates([...vehiclePlates, ''])}>
                {t('account.addPlate')}
              </Button>
            </div>
          </FormField>
          <FormField icon={FileText} label={t('account.notes')} htmlFor="account-notes">
            <textarea id="account-notes" className={`${fieldClassName} min-h-28 resize-y`} rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} />
          </FormField>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
          <Button type="submit" disabled={save.isPending}>
            <Check className="size-4" />
            {t('account.save')}
          </Button>
          <Button type="button" variant="ghost" onClick={() => history.back()}><X className="size-4" />{t('common.cancel')}</Button>
        </div>
      </AppForm>
    </FormCard>
  )
}

function PasswordPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const mutation = useMutation({
    mutationFn: () => portalApi.post('/account/password', { currentPassword, newPassword }),
    onSuccess: () => {
      toast.success(t('account.passwordChanged'))
      navigate('/account')
    },
    onError: (error) => toast.error(getApiErrorMessage(error, t('app.error'))),
  })
  return (
    <div className={shellClassName}>
      <PageHeader icon={KeyRound} title={t('account.changePassword')} backTo="/account" />
      <FormCard icon={KeyRound} title={t('account.changePassword')}>
        <AppForm className={formBodyClassName} autoFocusFirst onSubmit={() => mutation.mutate()}>
          <FormField icon={KeyRound} label={t('account.currentPassword')} htmlFor="current-password">
            <input id="current-password" type="password" className={fieldClassName} value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required />
          </FormField>
          <FormField icon={ShieldCheck} label={t('account.newPassword')} htmlFor="new-password">
            <input id="new-password" type="password" minLength={8} className={fieldClassName} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required />
          </FormField>
          <div className="flex flex-wrap gap-3 pt-4">
            <Button type="submit" disabled={mutation.isPending}>
              <Check className="size-4" />
              {t('common.save')}
            </Button>
            <Button type="button" variant="ghost" onClick={() => navigate('/account')}>
              <X className="size-4" />
              {t('common.cancel')}
            </Button>
          </div>
        </AppForm>
      </FormCard>
    </div>
  )
}

type SelectOption = { value: string; label: string }

function SearchSelect({
  id,
  value,
  onChange,
  options,
  placeholder,
  required,
  disabled,
}: {
  id?: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder: string
  required?: boolean
  disabled?: boolean
}) {
  const { t } = useTranslation()
  const trigger = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [rect, setRect] = useState<DOMRect | null>(null)
  const selected = options.find((option) => option.value === value)
  const filtered = options.filter((option) => option.label.toLocaleLowerCase('fa').includes(query.trim().toLocaleLowerCase('fa')))
  useEffect(() => {
    if (!open) return
    const close = (event: PointerEvent) => {
      if (trigger.current?.contains(event.target as Node) || panel.current?.contains(event.target as Node)) return
      setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [open])
  useLayoutEffect(() => {
    if (open) setRect(trigger.current?.getBoundingClientRect() ?? null)
  }, [open])
  return (
    <div className="relative">
      <button
        ref={trigger}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`${fieldClassName} flex items-center justify-between gap-2 text-start`}
        onClick={() => setOpen((current) => !current)}
      >
        <span className={selected ? 'text-ink-900' : 'text-ink-400'}>{selected?.label ?? placeholder}</span>
        <ChevronDown className={`size-4 text-teal-600 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      <input value={value} readOnly required={required} tabIndex={-1} className="pointer-events-none absolute size-px opacity-0" />
      {open && rect
        ? createPortal(
            <div
              ref={panel}
              data-enter-ignore
              className="fixed z-[80] flex max-h-72 flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-[0_16px_40px_rgba(20,40,40,0.12)]"
              style={{ top: rect.bottom + 4, left: rect.left, width: rect.width }}
            >
              <div className="border-b border-line p-2">
                <label className="flex items-center gap-2 rounded-xl bg-cream-50 px-3 py-2">
                  <Search className="size-4 text-teal-600" />
                  <input
                    autoFocus
                    className="w-full bg-transparent text-sm outline-none"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={t('common.searchList')}
                  />
                </label>
              </div>
              <div className="overflow-auto py-1">
                {filtered.length ? filtered.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    className={`flex w-full items-center justify-between px-3 py-2 text-start text-sm hover:bg-cream-50 ${option.value === value ? 'bg-teal-50 text-teal-800' : 'text-ink-800'}`}
                    onClick={() => {
                      onChange(option.value)
                      setOpen(false)
                      setQuery('')
                    }}
                  >
                    {option.label}
                    {option.value === value ? <Check className="size-4 text-teal-600" /> : null}
                  </button>
                )) : <p className="px-3 py-3 text-sm text-ink-500">{t('common.noResults')}</p>}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}

const documentFileAccept = 'image/jpeg,image/png,image/webp,application/pdf'
const documentFileMaxBytes = 8 * 1024 * 1024
const documentPreviewClassName = 'mx-auto mb-4 max-h-[28rem] w-full max-w-3xl rounded-2xl object-contain'

function fileMatchesAccept(file: File, accept: string) {
  const tokens = accept
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
  if (!tokens.length) return true
  const mime = (file.type || '').toLowerCase()
  const name = file.name.toLowerCase()
  const ext = name.includes('.') ? `.${name.split('.').pop()}` : ''
  return tokens.some((token) => {
    if (token.endsWith('/*')) return mime.startsWith(token.slice(0, -1))
    if (token.startsWith('.')) return ext === token
    return mime === token
  })
}

function FileDropField({
  id,
  onFile,
  previewUrl,
  previewKind = 'image',
  uploading,
  disabled,
}: {
  id?: string
  onFile: (file: File) => void
  previewUrl?: string
  previewKind?: 'image' | 'pdf'
  uploading?: boolean
  disabled?: boolean
}) {
  const { t } = useTranslation()
  const generatedId = useId()
  const inputId = id ?? generatedId
  const input = useRef<HTMLInputElement>(null)
  const camera = useRef<HTMLInputElement>(null)
  const dragCount = useRef(0)
  const [dragging, setDragging] = useState(false)
  const [localPreview, setLocalPreview] = useState<string>()
  const [selectedName, setSelectedName] = useState<string>()

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview)
    }
  }, [localPreview])

  function take(file?: File) {
    if (!file || disabled || uploading) return
    if (file.size > documentFileMaxBytes) {
      toast.error(t('common.fileTooLarge'))
      return
    }
    if (!fileMatchesAccept(file, documentFileAccept)) {
      toast.error(t('common.fileInvalidType'))
      return
    }
    if (file.type.startsWith('image/')) {
      if (localPreview) URL.revokeObjectURL(localPreview)
      setLocalPreview(URL.createObjectURL(file))
    } else if (localPreview) {
      URL.revokeObjectURL(localPreview)
      setLocalPreview(undefined)
    }
    setSelectedName(file.name)
    onFile(file)
  }

  const preview = localPreview || previewUrl
  const kind = localPreview ? 'image' : previewKind

  return (
    <div
      className={`rounded-2xl border-2 border-dashed px-4 py-5 text-center transition ${
        dragging ? 'border-teal-500 bg-teal-50' : 'border-line bg-cream-50'
      }`}
      onDragEnter={(event) => {
        if (disabled) return
        event.preventDefault()
        dragCount.current += 1
        setDragging(true)
      }}
      onDragOver={(event) => {
        if (!disabled) event.preventDefault()
      }}
      onDragLeave={(event) => {
        if (disabled) return
        event.preventDefault()
        dragCount.current -= 1
        if (dragCount.current <= 0) {
          dragCount.current = 0
          setDragging(false)
        }
      }}
      onDrop={(event) => {
        event.preventDefault()
        dragCount.current = 0
        setDragging(false)
        take(event.dataTransfer.files[0])
      }}
    >
      <input
        ref={input}
        id={inputId}
        type="file"
        accept={documentFileAccept}
        className="sr-only"
        disabled={disabled || uploading}
        onChange={(event) => {
          take(event.target.files?.[0])
          event.target.value = ''
        }}
      />
      <input
        ref={camera}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only lg:hidden"
        disabled={disabled || uploading}
        onChange={(event) => {
          take(event.target.files?.[0])
          event.target.value = ''
        }}
      />
      {preview && kind === 'pdf' ? (
        <iframe
          src={preview}
          title={selectedName || t('issuance.documents')}
          className="mx-auto mb-4 h-[28rem] w-full max-w-3xl rounded-2xl border border-teal-100 bg-white"
        />
      ) : preview ? (
        <img src={preview} alt="" className={documentPreviewClassName} />
      ) : (
        <span className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-white text-teal-600 shadow-sm">
          <ImagePlus className="size-6" aria-hidden />
        </span>
      )}
      {selectedName && !preview ? <p className="mb-2 text-sm font-medium text-ink-800">{selectedName}</p> : null}
      {disabled ? null : (
        <>
          <p className="text-sm text-ink-700">{t('common.dropFileHint')}</p>
          <p className="mt-1 text-xs text-ink-400">{t('common.orSelect')}</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <Button type="button" variant="ghost" disabled={uploading} onClick={() => input.current?.click()}>
              <FolderOpen className="size-4" aria-hidden />
              {t('common.selectFile')}
            </Button>
            <Button type="button" variant="ghost" className="lg:hidden" disabled={uploading} onClick={() => camera.current?.click()}>
              <Camera className="size-4" aria-hidden />
              {t('common.takePhoto')}
            </Button>
          </div>
        </>
      )}
      {uploading ? (
        <div className="mt-3 flex flex-col items-center gap-2">
          <span className="relative size-8" aria-hidden>
            <span className="absolute inset-0 rounded-full border-2 border-teal-100" />
            <span className="absolute inset-0 animate-loading-spin rounded-full border-2 border-transparent border-r-teal-400 border-t-teal-500" />
          </span>
          <p className="text-xs text-teal-700">{t('common.uploading')}</p>
        </div>
      ) : null}
    </div>
  )
}

function useLookup(url: string) {
  const query = useQuery({
    queryKey: ['lookup', url],
    queryFn: () => portalApi.get<Lookup[]>(url).then(({ data }) => data),
    staleTime: 300_000,
  })
  return query.data ?? []
}

function issuanceUrl(caseId: string, path = '') {
  return caseId ? `/issuance/${caseId}${path}` : `/issuance/draft${path}`
}

function FormationPage() {
  return <IssuanceWizard caseId="" backTo="/cases" />
}

function IssuancePage() {
  const { caseId = '' } = useParams()
  const navigate = useNavigate()
  const query = useQuery({
    queryKey: ['case', caseId],
    queryFn: () => portalApi.get<CaseDetail>(`/cases/${caseId}`).then(({ data }) => data),
  })
  useEffect(() => {
    if (query.data?.kind === 'STEWARDSHIP') navigate(`/cases/${caseId}`, { replace: true })
  }, [caseId, navigate, query.data?.kind])
  if (query.isLoading) return <LoadingState />
  if (query.isError) return <ErrorState error={query.error} />
  if (query.data?.kind === 'STEWARDSHIP') return <LoadingState />
  return <IssuanceWizard caseId={caseId} backTo={`/cases/${caseId}`} />
}

function IssuanceWizard({ caseId, backTo }: { caseId: string; backTo: string }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [openedId, setOpenedId] = useState(caseId)
  const state = useQuery({
    queryKey: ['issuance', openedId || 'draft'],
    queryFn: () => portalApi.get<IssuanceState>(issuanceUrl(openedId)).then(({ data }) => data),
  })
  const resolvedId = openedId || state.data?.case.id || ''
  const requirements = useQuery({
    queryKey: ['issuance-requirements', resolvedId || 'draft'],
    queryFn: () =>
      portalApi
        .get<{ identity: Array<{ isRequired: boolean; document: Lookup }>; activity: Array<{ isRequired: boolean; document: Lookup }> }>(
          issuanceUrl(resolvedId, '/requirements'),
        )
        .then(({ data }) => data),
  })
  const jobs = useLookup('/lookups/jobs')
  const cities = useLookup('/lookups/cities')
  const complexes = useLookup('/lookups/commercial-complexes')
  const places = useLookup('/lookups/registration-places')
  const [active, setActive] = useState<number | null>(null)
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['issuance', resolvedId || 'draft'] })
    void queryClient.invalidateQueries({ queryKey: ['issuance-requirements', resolvedId || 'draft'] })
  }
  if (state.isLoading) return <LoadingState />
  if (state.isError || !state.data) return <ErrorState error={state.error} />
  const data = state.data
  const reached = Math.min(Math.max(data.case.formationStep, 0), FORMATION_STEPS.length - 1)
  const current = active ?? reached
  const stepTotal = FORMATION_STEPS.length
  const stepCurrent = Math.min(reached + 1, stepTotal)
  const fullName = `${data.identity.firstName} ${data.identity.lastName}`.replace(/\s+/g, ' ').trim()
  const activityJobId = String((data.case as Record<string, unknown>).activityJobId ?? '')
  const activityJobTitle = jobs.find((item) => item.id === activityJobId)?.title ?? data.case.activityJob?.title ?? ''
  const pastIdentity = reached >= 1
  const requiredActivityIds = (requirements.data?.activity ?? [])
    .filter((item) => item.isRequired)
    .map((item) => item.document.id)
  const uploadedActivityIds = new Set(
    data.documents.activity.filter((row) => row.versions[0]).map((row) => row.documentId),
  )
  const activityDocsBlocked =
    data.editable &&
    Boolean(requirements.data) &&
    requiredActivityIds.some((id) => !uploadedActivityIds.has(id))
  return (
    <div className={shellClassName}>
      <PageHeader
        icon={FilePlus}
        title={t('cases.formationTitle')}
        backTo={backTo}
        titleExtra={
          <FormationStepRing
            currentLabel={formatNumber(stepCurrent)}
            totalLabel={formatNumber(stepTotal)}
            ratio={stepCurrent / stepTotal}
            label={t('cases.stepOf', { current: formatNumber(stepCurrent), total: formatNumber(stepTotal) })}
          />
        }
        subtitle={
          pastIdentity ? (
            <span className="flex flex-wrap gap-1.5">
              {fullName ? (
                <span className="inline-flex max-w-full items-center gap-1.5 rounded-2xl bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-800">
                  <UserRound className="size-4 shrink-0" aria-hidden />
                  <span>{fullName}</span>
                </span>
              ) : null}
              {data.identity.nationalId ? (
                <span className="inline-flex max-w-full flex-wrap items-center gap-x-1.5 gap-y-0.5 rounded-2xl bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-800">
                  <Fingerprint className="size-4 shrink-0" aria-hidden />
                  <span className="text-teal-700">{t('account.nationalId')}</span>
                  <span>{localizeDigits(data.identity.nationalId)}</span>
                </span>
              ) : null}
              {activityJobTitle ? (
                <span className="inline-flex max-w-full flex-wrap items-center gap-x-1.5 gap-y-0.5 rounded-2xl bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-800">
                  <Briefcase className="size-4 shrink-0" aria-hidden />
                  <span className="text-teal-700">{t('cases.job')}</span>
                  <span>{activityJobTitle}</span>
                </span>
              ) : null}
              {data.case.licenseIssuedAt ? (
                <span className="inline-flex max-w-full flex-wrap items-center gap-x-1.5 gap-y-0.5 rounded-2xl bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-800">
                  <CalendarDays className="size-4 shrink-0" aria-hidden />
                  <span className="text-teal-700">{t('cases.listIssued')}</span>
                  <span>{formatDate(data.case.licenseIssuedAt)}</span>
                </span>
              ) : null}
            </span>
          ) : (
            t('cases.formationSubtitle')
          )
        }
        action={
          resolvedId ? (
            <Link to={`/cases/${resolvedId}/finance`}>
              <Button type="button" variant="ghost">
                <Wallet className="size-4" aria-hidden />
                {t('cases.finance')}
              </Button>
            </Link>
          ) : undefined
        }
      />
      <ol className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
        {FORMATION_STEPS.map((item, index) => {
          const done = index < reached
          const viewing = index === reached
          return (
            <li key={item}>
              <button
                type="button"
                disabled={index > reached || (index >= 2 && activityDocsBlocked)}
                onClick={() => setActive(index)}
                className={`relative flex h-full min-h-[4.75rem] w-full flex-col items-center justify-center gap-1.5 rounded-2xl border-2 px-3 py-3 text-center text-sm ${
                  done
                    ? 'cursor-pointer border-emerald-400 bg-white text-ink-800'
                    : viewing
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
                    viewing
                      ? 'case-step-num-pulse border-emerald-500 bg-emerald-500 text-white'
                      : done
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-transparent bg-cream-100 text-ink-700'
                  }`}
                >
                  {formatNumber(index + 1)}
                </span>
                <span className="text-center leading-5">{t(`cases.steps.${item}`)}</span>
              </button>
            </li>
          )
        })}
      </ol>
      {current === 0 ? (
        <IdentityStep
          data={data}
          caseId={resolvedId}
          requirements={requirements.data}
          onSaved={(nextId) => {
            const id = nextId || resolvedId
            if (id && id !== openedId) setOpenedId(id)
            void queryClient.invalidateQueries({ queryKey: ['issuance', id || 'draft'] })
            void queryClient.invalidateQueries({ queryKey: ['issuance-requirements', id || 'draft'] })
            setActive(1)
          }}
        />
      ) : null}
      {current === 1 ? <ActivityStep data={data} caseId={resolvedId} onSaved={() => { refresh(); setActive(2) }} /> : null}
      {current === 2 ? <LocationStep data={data} cities={cities} complexes={complexes} places={places} caseId={resolvedId} onSaved={refresh} /> : null}
      {current >= 3 ? <OrganizationStep caseId={resolvedId} active={current} /> : null}
    </div>
  )
}

function FormationStepRing({
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

function identityLabel(value: string | null | undefined, key: string, translate: (path: string) => string) {
  if (!value) return undefined
  const translated = translate(`${key}.${value}`)
  return translated === `${key}.${value}` ? value : translated
}

function IdentityFacts({
  icon,
  title,
  children,
}: {
  icon: LucideIcon
  title: string
  children: ReactNode
}) {
  return (
    <section className="rounded-2xl border border-teal-100 bg-cream-50/60 p-4">
      <FormSectionTitle icon={icon}>{title}</FormSectionTitle>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  )
}

function IdentityStep({
  data,
  caseId,
  requirements,
  onSaved,
}: {
  data: IssuanceState
  caseId: string
  requirements?: { identity: Array<{ isRequired: boolean; document: Lookup }>; activity: Array<{ isRequired: boolean; document: Lookup }> }
  onSaved: (caseId?: string) => void
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<'identity' | 'documents'>('identity')
  const person = data.identity
  const confirm = useMutation({
    mutationFn: () =>
      portalApi.post<IssuanceState>(issuanceUrl(caseId, '/identity/confirm')).then(({ data: body }) => body),
    onSuccess: (body) => {
      toast.success(t('cases.identitySaved'))
      onSaved(body.case.id || undefined)
    },
    onError: (error) => toast.error(getApiErrorMessage(error, t('app.error'))),
  })
  const religion =
    person.religion === 'OTHER' && person.religionOther
      ? person.religionOther
      : identityLabel(person.religion, 'cases.identityValues.religions', t)
  return (
    <FormCard
      icon={UserRound}
      title={t('cases.steps.identity')}
      action={
        data.editable ? (
          <Button type="button" disabled={confirm.isPending} onClick={() => confirm.mutate()}>
            <Check className="size-4" aria-hidden />
            {t('cases.saveIdentity')}
          </Button>
        ) : null
      }
    >
      <div className={formBodyClassName}>
        <p className="rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm leading-7 text-ink-700">
          {t('cases.identityAutoHint')}
        </p>
        <div className="flex flex-wrap gap-2">
          {(['identity', 'documents'] as const).map((item) => (
            <button
              key={item}
              type="button"
              className={`cursor-pointer rounded-2xl px-4 py-2 text-sm ${
                tab === item ? 'bg-teal-500 text-white' : 'border border-teal-400 bg-white text-ink-700'
              }`}
              onClick={() => setTab(item)}
            >
              {t(item === 'identity' ? 'cases.identityTab' : 'cases.documentsTab')}
            </button>
          ))}
        </div>
        {tab === 'identity' ? (
          <div className="space-y-4">
            <IdentityFacts icon={UserRound} title={t('cases.identitySections.personal')}>
              <FormFactTile icon={UserRound} label={t('issuance.firstName')} value={person.firstName} />
              <FormFactTile icon={UserRound} label={t('issuance.lastName')} value={person.lastName} tone="mint" />
              <FormFactTile icon={Users} label={t('issuance.fatherName')} value={person.fatherName ?? undefined} />
              <FormFactTile icon={UserRound} label={t('cases.lastNameEn')} value={person.lastNameEn ?? undefined} tone="ink" />
              <FormFactTile icon={Fingerprint} label={t('account.nationalId')} value={person.nationalId ? localizeDigits(person.nationalId) : undefined} tone="mint" />
              <FormFactTile icon={UserRound} label={t('account.gender')} value={identityLabel(person.gender, 'account.genders', t)} />
              <FormFactTile icon={Landmark} label={t('cases.religion')} value={religion} tone="ink" />
            </IdentityFacts>
            <IdentityFacts icon={BookOpen} title={t('cases.identitySections.birth')}>
              <FormFactTile icon={CalendarDays} label={t('account.birthDate')} value={person.birthDate ? formatDate(person.birthDate) : undefined} />
              <FormFactTile icon={MapPin} label={t('cases.birthPlace')} value={person.birthPlace ?? undefined} tone="mint" />
              <FormFactTile icon={IdCard} label={t('cases.identityCertificateNo')} value={person.identityCertificateNo ? localizeDigits(person.identityCertificateNo) : undefined} />
              <FormFactTile icon={MapPin} label={t('cases.identityIssuedIn')} value={person.identityIssuedIn ?? undefined} tone="ink" />
              <FormFactTile icon={Building2} label={t('issuance.nationality')} value={person.countryName ?? undefined} tone="mint" />
            </IdentityFacts>
            <IdentityFacts icon={IdCard} title={t('cases.identitySections.travel')}>
              <FormFactTile icon={IdCard} label={t('cases.residency')} value={identityLabel(person.residencyStatus, 'cases.identityValues.residency', t)} />
              <FormFactTile icon={IdCard} label={t('cases.passportNumber')} value={person.passportNumber ? localizeDigits(person.passportNumber) : undefined} tone="mint" />
              <FormFactTile icon={CalendarDays} label={t('cases.nationalCardExpiresAt')} value={person.nationalCardExpiresAt ? formatDate(person.nationalCardExpiresAt) : undefined} />
              <FormFactTile icon={CalendarDays} label={t('cases.passportExpiresAt')} value={person.passportExpiresAt ? formatDate(person.passportExpiresAt) : undefined} tone="ink" />
            </IdentityFacts>
            <IdentityFacts icon={Phone} title={t('cases.identitySections.contact')}>
              <FormFactTile icon={Phone} label={t('account.phone')} value={person.phone ? localizeDigits(person.phone) : undefined} />
              <FormFactTile icon={Phone} label={t('account.homePhone')} value={person.homePhone ? localizeDigits(person.homePhone) : undefined} tone="mint" />
              <FormFactTile icon={MapPin} label={t('account.postalCode')} value={person.postalCode ? localizeDigits(person.postalCode) : undefined} />
              <FormFactTile icon={Mail} label={t('account.email')} value={person.email ?? undefined} tone="ink" />
              <div className="sm:col-span-2">
                <FormFactTile icon={MapPin} label={t('account.address')} value={person.address ?? undefined} />
              </div>
            </IdentityFacts>
            <IdentityFacts icon={GraduationCap} title={t('cases.identitySections.work')}>
              <FormFactTile icon={GraduationCap} label={t('cases.education')} value={identityLabel(person.educationLevel, 'cases.identityValues.education', t)} />
              <FormFactTile icon={Layers} label={t('cases.citizenGroup')} value={person.citizenGroup ?? undefined} tone="mint" />
              <FormFactTile icon={Briefcase} label={t('cases.personJob')} value={person.jobTitle ?? undefined} />
            </IdentityFacts>
          </div>
        ) : (
          <DocumentRequirements
            data={data}
            caseId={caseId}
            requirements={requirements}
            scope="identity"
            onUploaded={() => {
              void queryClient.invalidateQueries({ queryKey: ['issuance', caseId || 'draft'] })
              void queryClient.invalidateQueries({ queryKey: ['issuance-requirements', caseId || 'draft'] })
            }}
          />
        )}
        {data.editable ? (
          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => navigate(caseId ? `/cases/${caseId}` : '/cases')}>
              <X className="size-4" />
              {t('common.cancel')}
            </Button>
          </div>
        ) : null}
      </div>
    </FormCard>
  )
}

function focusField(id: string) {
  document.getElementById(id)?.focus()
}

function caseValue(file: IssuanceState['case'], key: string) {
  const value = (file as unknown as Record<string, unknown>)[key]
  return value == null ? '' : String(value)
}

function isoDateOnly(value: unknown) {
  if (value == null || value === '') return ''
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(String(value))
  return match?.[1] ?? ''
}

function ChoicePills({
  id,
  value,
  options,
  onChange,
}: {
  id?: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}) {
  return (
    <div
      id={id}
      tabIndex={-1}
      role="radiogroup"
      className="flex min-h-10 w-full flex-wrap gap-1 rounded-2xl border border-line bg-cream-50 p-1"
    >
      {options.map((option) => {
        const active = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            className={`cursor-pointer rounded-xl px-3 py-1.5 text-sm font-medium transition ${
              active ? 'bg-teal-500 text-white shadow-sm' : 'text-ink-700 hover:bg-white'
            }`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

function LocationSection({
  icon,
  title,
  children,
  className = 'mt-3 grid gap-4 sm:grid-cols-2',
}: {
  icon: LucideIcon
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className="rounded-2xl border border-teal-100 bg-cream-50/60 p-4">
      <FormSectionTitle icon={icon}>{title}</FormSectionTitle>
      <div className={className}>{children}</div>
    </section>
  )
}

function ActivityStep({ data, caseId, onSaved }: { data: IssuanceState; caseId: string; onSaved: () => void }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const formId = useId()
  const jobs = useLookup('/lookups/jobs')
  const groups = useLookup('/lookups/job-groups')
  const savedJob = data.case.activityJob
  const [title, setTitle] = useState(caseValue(data.case, 'businessUnitTitle'))
  const [groupId, setGroupId] = useState(savedJob?.group?.id ?? '')
  const [jobId, setJobId] = useState(savedJob?.id ?? caseValue(data.case, 'activityJobId'))
  const [previousOccupation, setPreviousOccupation] = useState(caseValue(data.case, 'previousOccupation'))
  const [posCount, setPosCount] = useState(() => {
    const value = (data.case as unknown as Record<string, unknown>).posDeviceCount
    return value == null || value === '' ? '' : String(value)
  })
  useEffect(() => {
    if (groupId || !jobId) return
    const match = jobs.find((item) => item.id === jobId)
    if (match?.groupId) setGroupId(match.groupId)
  }, [groupId, jobId, jobs])
  const activityRequirements = useQuery({
    queryKey: ['issuance-requirements', caseId, jobId],
    enabled: Boolean(jobId),
    queryFn: () =>
      portalApi
        .get<{ identity: Array<{ isRequired: boolean; document: Lookup }>; activity: Array<{ isRequired: boolean; document: Lookup }> }>(
          `/issuance/${caseId}/requirements`,
          { params: { jobId } },
        )
        .then(({ data: body }) => body),
  })
  const activityDocuments = activityRequirements.data?.activity ?? []
  const requiredCount = activityDocuments.filter((item) => item.isRequired).length
  const optionalCount = activityDocuments.length - requiredCount
  const documentsCountLabel =
    requiredCount > 0 && optionalCount > 0
      ? t('cases.activityDocumentsCount', { required: formatNumber(requiredCount), optional: formatNumber(optionalCount) })
      : requiredCount > 0
        ? t('cases.activityDocumentsRequiredOnly', { required: formatNumber(requiredCount) })
        : optionalCount > 0
          ? t('cases.activityDocumentsOptionalOnly', { optional: formatNumber(optionalCount) })
          : ''
  const jobOptions = groupId ? jobs.filter((item) => item.groupId === groupId) : jobs
  const selected = jobs.find((item) => item.id === jobId)
  const activityType = selected?.jobType?.title ?? savedJob?.jobType?.title ?? ''
  const mutation = useMutation({
    mutationFn: () =>
      portalApi.patch(`/issuance/${caseId}/activity`, {
        businessUnitTitle: title.trim(),
        jobId,
        ...(previousOccupation ? { previousOccupation } : {}),
        ...(posCount.trim() === '' ? {} : { posDeviceCount: Number(posCount) }),
      }),
    onSuccess: () => {
      toast.success(t('cases.activitySaved'))
      onSaved()
    },
    onError: (error) => toast.error(getApiErrorMessage(error, t('app.error'))),
  })
  function saveActivity() {
    if (!title.trim()) {
      toast.error(t('cases.unitTitleRequired'))
      focusField('case-unit-title')
      return
    }
    if (!jobId) {
      toast.error(t('cases.activityJobRequired'))
      focusField('case-activity-job')
      return
    }
    if (activityRequirements.isLoading) return
    if (activityRequirements.isError || !activityRequirements.data) {
      toast.error(getApiErrorMessage(activityRequirements.error, t('app.error')))
      return
    }
    const uploaded = new Set(
      data.documents.activity.filter((row) => row.versions.length > 0).map((row) => row.documentId),
    )
    const missingDocument = activityRequirements.data.activity.some(
      (item) => item.isRequired && !uploaded.has(item.document.id),
    )
    if (missingDocument) {
      toast.error(t('cases.activityDocumentsRequired'))
      return
    }
    mutation.mutate()
  }
  return (
    <FormCard
      icon={Briefcase}
      title={t('cases.steps.activity')}
      action={
        data.editable ? (
          <Button type="submit" form={formId} disabled={mutation.isPending}>
            <Check className="size-4" aria-hidden />
            {t('cases.saveActivity')}
          </Button>
        ) : null
      }
    >
      <div className={formBodyClassName}>
        <AppForm id={formId} onSubmit={saveActivity} autoFocusFirst={data.editable} className="space-y-4">
          <fieldset disabled={!data.editable} className="min-w-0 space-y-4 border-0 p-0">
            <div className="grid gap-4 lg:grid-cols-2">
              <FormField icon={Building2} label={t('cases.unitTitle')} htmlFor="case-unit-title">
                <input
                  id="case-unit-title"
                  className={fieldClassName}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </FormField>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField icon={FolderKanban} label={t('cases.activityGroup')} htmlFor="case-activity-group">
                  <SearchSelect
                    id="case-activity-group"
                    value={groupId}
                    onChange={(value) => {
                      setGroupId(value)
                      const current = jobs.find((item) => item.id === jobId)
                      if (current?.groupId && current.groupId !== value) setJobId('')
                    }}
                    placeholder={t('issuance.select')}
                    options={[
                      { value: '', label: t('issuance.select') },
                      ...groups.map((group) => ({ value: group.id, label: group.title ?? '' })),
                    ]}
                    disabled={!data.editable}
                  />
                </FormField>
                <FormField icon={Briefcase} label={t('cases.activityJob')} htmlFor="case-activity-job">
                  <SearchSelect
                    id="case-activity-job"
                    value={jobId}
                    onChange={(value) => {
                      setJobId(value)
                      const next = jobs.find((item) => item.id === value)
                      if (next?.groupId) setGroupId(next.groupId)
                    }}
                    placeholder={t('issuance.select')}
                    options={[
                      { value: '', label: t('issuance.select') },
                      ...jobOptions.map((job) => ({ value: job.id, label: job.title ?? '' })),
                    ]}
                    disabled={!data.editable}
                  />
                </FormField>
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              <FormField icon={Layers} label={t('cases.activityType')} htmlFor="case-activity-type">
                <input id="case-activity-type" readOnly tabIndex={-1} className={fieldClassName} value={activityType} />
              </FormField>
              <FormField icon={History} label={t('cases.previousJob')} htmlFor="case-previous-job">
                <SearchSelect
                  id="case-previous-job"
                  value={previousOccupation}
                  onChange={setPreviousOccupation}
                  placeholder={t('issuance.select')}
                  options={[
                    { value: '', label: t('issuance.select') },
                    ...PREVIOUS_OCCUPATIONS.map((item) => ({
                      value: item,
                      label: t(`cases.previousOccupations.${item}`),
                    })),
                  ]}
                  disabled={!data.editable}
                />
              </FormField>
              <FormField icon={CreditCard} label={t('cases.posCount')} htmlFor="case-pos-count">
                <input
                  id="case-pos-count"
                  type="number"
                  min={0}
                  max={999}
                  inputMode="numeric"
                  className={`${fieldClassName} digit-field`}
                  value={posCount}
                  onChange={(event) => setPosCount(event.target.value)}
                />
              </FormField>
            </div>
          </fieldset>
          {data.editable ? (
            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => navigate(`/cases/${caseId}`)}>
                <X className="size-4" aria-hidden />
                {t('common.cancel')}
              </Button>
            </div>
          ) : (
            <EmptyState icon={ShieldCheck} text={t('issuance.locked')} />
          )}
        </AppForm>
        {jobId ? (
          <section className="space-y-3 border-t border-teal-100 pt-4">
            <FormSectionTitle icon={Files}>
              <span>{t('cases.activityDocumentsTitle')}</span>
              {documentsCountLabel ? <span className="ms-2 font-medium text-ink-500">{documentsCountLabel}</span> : null}
            </FormSectionTitle>
            {activityDocuments.some((item) => item.isRequired) ? (
              <div
                role="status"
                className="flex items-start gap-3 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm leading-7 text-ink-700"
              >
                <Info className="mt-0.5 size-5 shrink-0 text-teal-600" aria-hidden />
                <p>{t('cases.activityDocumentsHint')}</p>
              </div>
            ) : null}
            {activityRequirements.isLoading ? null : activityDocuments.length ? (
              <DocumentRequirements
                data={data}
                caseId={caseId}
                requirements={activityRequirements.data}
                scope="activity"
                onUploaded={() => {
                  void queryClient.invalidateQueries({ queryKey: ['issuance', caseId] })
                  void queryClient.invalidateQueries({ queryKey: ['issuance-requirements', caseId] })
                }}
              />
            ) : (
              <p className="text-sm text-ink-500">{t('cases.activityDocumentsEmpty')}</p>
            )}
          </section>
        ) : null}
      </div>
    </FormCard>
  )
}

type IntakeReceipt = {
  jobTitle: string
  jobGroup: string
  unitTitle: string
  requestNumber: string
  submittedAt: string
}

function LocationStep({
  data,
  cities,
  complexes,
  places,
  caseId,
  onSaved,
}: {
  data: IssuanceState
  cities: Lookup[]
  complexes: Lookup[]
  places: Lookup[]
  caseId: string
  onSaved: () => void
}) {
  const { t } = useTranslation()
  const [receipt, setReceipt] = useState<IntakeReceipt | null>(null)
  const formId = useId()
  const [form, setForm] = useState(() => ({
    cityId: caseValue(data.case, 'premiseCityId'),
    establishment: caseValue(data.case, 'premiseEstablishment') || 'INDEPENDENT',
    complexId: caseValue(data.case, 'premiseComplexId'),
    address: caseValue(data.case, 'premiseAddress'),
    addressEn: caseValue(data.case, 'premiseAddressEn'),
    floor: caseValue(data.case, 'premiseFloor'),
    plaqueSeries: caseValue(data.case, 'premisePlaqueSeries'),
    plaque: caseValue(data.case, 'premisePlaque'),
    unitNo: caseValue(data.case, 'premiseUnitNo'),
    ownership: caseValue(data.case, 'premiseOwnership') || 'RENTED',
    area: caseValue(data.case, 'premiseArea'),
    deedNo: caseValue(data.case, 'premiseDeedNo'),
    leaseIssuedAt: isoDateOnly((data.case as unknown as Record<string, unknown>).leaseIssuedAt),
    leaseExpiresAt: isoDateOnly((data.case as unknown as Record<string, unknown>).leaseExpiresAt),
    leaseAgency: caseValue(data.case, 'leaseAgency'),
    ownerName: caseValue(data.case, 'premiseOwnerName'),
    phone: caseValue(data.case, 'premisePhone'),
    fax: caseValue(data.case, 'premiseFax'),
    postalCode: caseValue(data.case, 'premisePostalCode'),
    registrationPlaceId: caseValue(data.case, 'registrationPlaceId'),
    geoPosition: caseValue(data.case, 'premiseGeoPosition') || 'MAIN_FRONTAGE',
    publicAccess: caseValue(data.case, 'premisePublicAccess') || 'PUBLIC',
  }))
  useEffect(() => {
    if (form.cityId) return
    const qeshm = cities.find((city) => city.nameFa?.trim() === 'قشم')
    if (!qeshm) return
    setForm((current) => (current.cityId ? current : { ...current, cityId: qeshm.id }))
  }, [cities, form.cityId])
  useEffect(() => {
    if (form.registrationPlaceId) return
    const place = places.find((item) => item.isDefault) ?? places.find((item) => item.title?.trim() === 'قشم')
    if (!place) return
    setForm((current) => (current.registrationPlaceId ? current : { ...current, registrationPlaceId: place.id }))
  }, [form.registrationPlaceId, places])
  const registrationPlaceTitle =
    places.find((item) => item.id === form.registrationPlaceId)?.title ??
    places.find((item) => item.isDefault)?.title ??
    ''
  const commercialComplex = form.establishment === 'COMMERCIAL_COMPLEX'
  const rented = form.ownership === 'RENTED'
  const submit = useMutation({
    mutationFn: async () => {
      const text = (value: string) => value.trim() || undefined
      await portalApi.patch(`/issuance/${caseId}/location`, {
        cityId: form.cityId,
        establishment: form.establishment,
        complexId: commercialComplex ? form.complexId : undefined,
        address: form.address.trim(),
        addressEn: text(form.addressEn),
        plaque: text(form.plaque),
        plaqueSeries: text(form.plaqueSeries),
        floor: text(form.floor),
        unitNo: text(form.unitNo),
        postalCode: text(form.postalCode),
        phone: text(form.phone),
        fax: text(form.fax),
        geoPosition: form.geoPosition || undefined,
        publicAccess: form.publicAccess || undefined,
        registrationPlaceId: form.registrationPlaceId || undefined,
        ownership: form.ownership,
        deedNo: text(form.deedNo),
        area: Number(form.area),
        leaseIssuedAt: rented ? text(form.leaseIssuedAt) : undefined,
        leaseExpiresAt: rented ? text(form.leaseExpiresAt) : undefined,
        leaseAgency: rented ? text(form.leaseAgency) : undefined,
        ownerName: rented ? text(form.ownerName) : undefined,
      })
      const { data: body } = await portalApi.post<{ receipt: IntakeReceipt }>(`/issuance/${caseId}/submit`)
      return body.receipt
    },
    onSuccess: (next) => {
      setReceipt(next)
      onSaved()
    },
    onError: (error) => toast.error(getApiErrorMessage(error, t('app.error'))),
  })
  function saveLocation() {
    if (!form.cityId) {
      toast.error(t('cases.locationCityRequired'))
      focusField('case-premise-city')
      return
    }
    if (!form.establishment) {
      toast.error(t('cases.locationEstablishmentRequired'))
      focusField('case-establishment')
      return
    }
    if (commercialComplex && !form.complexId) {
      toast.error(t('cases.locationComplexRequired'))
      focusField('case-complex')
      return
    }
    if (!form.address.trim()) {
      toast.error(t('cases.locationAddressRequired'))
      focusField('case-premise-address')
      return
    }
    if (form.area.trim() === '' || Number.isNaN(Number(form.area))) {
      toast.error(t('cases.locationAreaRequired'))
      focusField('case-area')
      return
    }
    if (!form.ownership) {
      toast.error(t('cases.locationOwnershipRequired'))
      focusField('case-ownership')
      return
    }
    submit.mutate()
  }
  return (
    <div className="space-y-6">
      <FormCard
        icon={MapPin}
        title={t('cases.steps.location')}
        subtitle={t('cases.locationCardSubtitle')}
        action={
          data.editable ? (
            <Button type="submit" form={formId} disabled={submit.isPending} className="h-auto max-w-xl whitespace-normal text-start leading-6">
              <Check className="size-4 shrink-0" aria-hidden />
              {t('issuance.intakeSubmit')}
            </Button>
          ) : null
        }
      >
        <AppForm id={formId} className={formBodyClassName} onSubmit={saveLocation}>
          <fieldset disabled={!data.editable} className="min-w-0 space-y-4 border-0 p-0">
            <LocationSection icon={MapPin} title={t('cases.locationSections.place')} className="mt-3 grid gap-4">
              <div className="grid items-end gap-4 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
                <FormField icon={MapPin} label={t('cases.premiseCity')} htmlFor="case-premise-city">
                  <SearchSelect
                    id="case-premise-city"
                    value={form.cityId}
                    onChange={(cityId) => setForm({ ...form, cityId })}
                    placeholder={t('issuance.select')}
                    options={cities.map((city) => ({
                      value: city.id,
                      label: city.province?.nameFa ? `${city.nameFa}، ${city.province.nameFa}` : (city.nameFa ?? ''),
                    }))}
                    disabled={!data.editable}
                  />
                </FormField>
                <div className={`grid min-w-0 items-end gap-4 ${commercialComplex ? 'sm:grid-cols-2' : ''}`}>
                  <FormField icon={Store} label={t('cases.establishment')} htmlFor="case-establishment">
                    <ChoicePills
                      id="case-establishment"
                      value={form.establishment}
                      onChange={(establishment) =>
                        setForm({
                          ...form,
                          establishment,
                          complexId: establishment === 'COMMERCIAL_COMPLEX' ? form.complexId : '',
                        })
                      }
                      options={PREMISE_ESTABLISHMENTS.map((item) => ({
                        value: item,
                        label: t(`cases.establishments.${item}`),
                      }))}
                    />
                  </FormField>
                  {commercialComplex ? (
                    <FormField icon={Building2} label={t('cases.complex')} htmlFor="case-complex">
                      <SearchSelect
                        id="case-complex"
                        value={form.complexId}
                        onChange={(complexId) => setForm({ ...form, complexId })}
                        placeholder={t('issuance.select')}
                        options={[
                          { value: '', label: t('issuance.select') },
                          ...complexes.map((item) => ({ value: item.id, label: item.name ?? '' })),
                        ]}
                        disabled={!data.editable}
                      />
                    </FormField>
                  ) : null}
                </div>
              </div>
              <FormField icon={MapPin} label={t('cases.premiseAddress')} htmlFor="case-premise-address">
                <textarea
                  id="case-premise-address"
                  rows={2}
                  className={fieldClassName}
                  value={form.address}
                  onChange={(event) => setForm({ ...form, address: event.target.value })}
                />
              </FormField>
              <FormField icon={Languages} label={t('cases.premiseAddressEn')} htmlFor="case-premise-address-en">
                <textarea
                  id="case-premise-address-en"
                  rows={2}
                  dir="ltr"
                  className={`${fieldClassName} latin-field`}
                  value={form.addressEn}
                  onChange={(event) => setForm({ ...form, addressEn: event.target.value })}
                />
              </FormField>
              <div className="grid gap-4 sm:grid-cols-4">
                <FormField icon={Building2} label={t('cases.floor')} htmlFor="case-floor">
                  <input id="case-floor" className={fieldClassName} value={form.floor} onChange={(event) => setForm({ ...form, floor: event.target.value })} />
                </FormField>
                <FormField icon={Hash} label={t('cases.plaqueSeries')} htmlFor="case-plaque-series">
                  <input
                    id="case-plaque-series"
                    className={fieldClassName}
                    value={form.plaqueSeries}
                    onChange={(event) => setForm({ ...form, plaqueSeries: event.target.value })}
                  />
                </FormField>
                <FormField icon={Hash} label={t('cases.plaque')} htmlFor="case-plaque">
                  <input id="case-plaque" className={fieldClassName} value={form.plaque} onChange={(event) => setForm({ ...form, plaque: event.target.value })} />
                </FormField>
                <FormField icon={Hash} label={t('cases.unitNo')} htmlFor="case-unit-no">
                  <input
                    id="case-unit-no"
                    className={`${fieldClassName} digit-field`}
                    value={form.unitNo}
                    onChange={(event) => setForm({ ...form, unitNo: event.target.value })}
                  />
                </FormField>
              </div>
            </LocationSection>

            <LocationSection icon={KeyRound} title={t('cases.locationSections.ownership')} className="mt-3 grid items-end gap-4 sm:grid-cols-3">
              <FormField icon={KeyRound} label={t('cases.ownership')} htmlFor="case-ownership">
                <ChoicePills
                  id="case-ownership"
                  value={form.ownership}
                  onChange={(ownership) => setForm({ ...form, ownership })}
                  options={PREMISE_OWNERSHIPS.map((item) => ({
                    value: item,
                    label: t(`cases.ownerships.${item}`),
                  }))}
                />
              </FormField>
              <FormField icon={Ruler} label={t('cases.buildingArea')} htmlFor="case-area">
                <input
                  id="case-area"
                  type="number"
                  min={0}
                  className={`${fieldClassName} digit-field`}
                  value={form.area}
                  onChange={(event) => setForm({ ...form, area: event.target.value })}
                />
              </FormField>
              <FormField icon={FileText} label={t('cases.deedNo')} htmlFor="case-deed-no">
                <input
                  id="case-deed-no"
                  className={`${fieldClassName} digit-field`}
                  value={form.deedNo}
                  onChange={(event) => setForm({ ...form, deedNo: event.target.value })}
                />
              </FormField>
            </LocationSection>

            {rented ? (
              <LocationSection icon={FileText} title={t('cases.locationSections.lease')}>
                <FormField icon={CalendarDays} label={t('cases.leaseIssuedAt')} htmlFor="case-lease-issued">
                  <PersianDateField
                    id="case-lease-issued"
                    value={form.leaseIssuedAt || undefined}
                    onChange={(next) => setForm({ ...form, leaseIssuedAt: next ?? '' })}
                  />
                </FormField>
                <FormField icon={CalendarDays} label={t('cases.leaseExpiresAt')} htmlFor="case-lease-expires">
                  <PersianDateField
                    id="case-lease-expires"
                    value={form.leaseExpiresAt || undefined}
                    onChange={(next) => setForm({ ...form, leaseExpiresAt: next ?? '' })}
                  />
                </FormField>
                <FormField icon={Store} label={t('cases.leaseAgency')} htmlFor="case-lease-agency">
                  <input
                    id="case-lease-agency"
                    className={fieldClassName}
                    value={form.leaseAgency}
                    onChange={(event) => setForm({ ...form, leaseAgency: event.target.value })}
                  />
                </FormField>
                <FormField icon={Users} label={t('cases.ownerName')} htmlFor="case-owner-name">
                  <input
                    id="case-owner-name"
                    className={fieldClassName}
                    value={form.ownerName}
                    onChange={(event) => setForm({ ...form, ownerName: event.target.value })}
                  />
                </FormField>
              </LocationSection>
            ) : null}

            <LocationSection icon={Phone} title={t('cases.locationSections.contact')} className="mt-3 grid gap-4 sm:grid-cols-3">
              <FormField icon={Phone} label={t('cases.premisePhone')} htmlFor="case-premise-phone">
                <input
                  id="case-premise-phone"
                  inputMode="tel"
                  className={`${fieldClassName} digit-field`}
                  value={form.phone}
                  onChange={(event) => setForm({ ...form, phone: event.target.value })}
                />
              </FormField>
              <FormField icon={Phone} label={t('cases.premiseFax')} htmlFor="case-premise-fax">
                <input
                  id="case-premise-fax"
                  inputMode="tel"
                  className={`${fieldClassName} digit-field`}
                  value={form.fax}
                  onChange={(event) => setForm({ ...form, fax: event.target.value })}
                />
              </FormField>
              <FormField icon={Hash} label={t('cases.premisePostalCode')} htmlFor="case-premise-postal">
                <input
                  id="case-premise-postal"
                  inputMode="numeric"
                  className={`${fieldClassName} digit-field`}
                  value={form.postalCode}
                  onChange={(event) => setForm({ ...form, postalCode: event.target.value })}
                />
              </FormField>
            </LocationSection>

            <LocationSection icon={Signpost} title={t('cases.locationSections.position')} className="mt-3 grid items-end gap-4 lg:grid-cols-3">
              <FormFactTile
                icon={Landmark}
                label={t('cases.registrationPlace')}
                tone="ink"
                value={
                  <span className="block">
                    {registrationPlaceTitle ? <span className="block">{registrationPlaceTitle}</span> : null}
                    <span className={`block font-medium text-ink-500 ${registrationPlaceTitle ? 'mt-1 text-xs' : 'text-sm'}`}>
                      {t('cases.registrationPlaceByManagement')}
                    </span>
                  </span>
                }
              />
              <FormField icon={Signpost} label={t('cases.geoPosition')} htmlFor="case-geo-position">
                <ChoicePills
                  id="case-geo-position"
                  value={form.geoPosition}
                  onChange={(geoPosition) => setForm({ ...form, geoPosition })}
                  options={PREMISE_GEO_POSITIONS.map((item) => ({
                    value: item,
                    label: t(`cases.geoPositions.${item}`),
                  }))}
                />
              </FormField>
              <FormField icon={Users} label={t('cases.publicAccess')} htmlFor="case-public-access">
                <ChoicePills
                  id="case-public-access"
                  value={form.publicAccess}
                  onChange={(publicAccess) => setForm({ ...form, publicAccess })}
                  options={PREMISE_PUBLIC_ACCESSES.map((item) => ({
                    value: item,
                    label: t(`cases.publicAccesses.${item}`),
                  }))}
                />
              </FormField>
            </LocationSection>
          </fieldset>
          {data.editable ? null : <EmptyState icon={ShieldCheck} text={t('issuance.locked')} />}
        </AppForm>
      </FormCard>
      {receipt ? <IntakeReceiptDialog receipt={receipt} onClose={() => setReceipt(null)} /> : null}
    </div>
  )
}

function IntakeReceiptDialog({ receipt, onClose }: { receipt: IntakeReceipt; onClose: () => void }) {
  const { t } = useTranslation()
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.repeat) return
      event.preventDefault()
      onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose])
  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-ink-900/30 p-4 pt-[10vh]"
      data-nested-dialog
      role="dialog"
      aria-modal="true"
      aria-labelledby="intake-receipt-title"
    >
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-teal-100 bg-white shadow-[0_24px_60px_rgba(15,118,110,0.18)]">
        <div className="bg-teal-500 bg-[linear-gradient(to_inline-end,var(--color-teal-500),var(--color-mint-500))] px-6 py-5 text-white">
          <div className="flex items-start gap-3">
            <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/20">
              <CircleCheck className="size-6" aria-hidden />
            </span>
            <div>
              <h2 id="intake-receipt-title" className="text-lg font-semibold">
                {t('issuance.intakeSubmittedTitle')}
              </h2>
              <p className="mt-2 text-sm leading-7 text-white/95">{t('issuance.intakeSubmittedBody')}</p>
            </div>
          </div>
        </div>
        <div className="space-y-3 p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <FormFactTile icon={FolderKanban} label={t('cases.jobGroup')} value={receipt.jobGroup || undefined} />
            <FormFactTile icon={Briefcase} label={t('issuance.jobTitle')} value={receipt.jobTitle || undefined} tone="mint" />
            <FormFactTile icon={Building2} label={t('cases.unitTitle')} value={receipt.unitTitle || undefined} />
            <FormFactTile icon={Hash} label={t('cases.requestNumber')} value={receipt.requestNumber ? localizeDigits(receipt.requestNumber) : undefined} tone="mint" />
          </div>
          <FormFactTile
            icon={CalendarDays}
            label={t('issuance.submittedAt')}
            value={
              <span dir="ltr">
                {formatDate(receipt.submittedAt)} {formatClock(receipt.submittedAt)}
              </span>
            }
          />
          <div className="flex justify-end pt-1">
            <Button type="button" onClick={onClose}>
              <Check className="size-4" aria-hidden />
              {t('common.close')}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

function DocumentRequirements({ data, caseId, requirements, onUploaded, scope }: {
  data: IssuanceState
  caseId: string
  requirements?: { identity: Array<{ isRequired: boolean; document: Lookup }>; activity: Array<{ isRequired: boolean; document: Lookup }> }
  onUploaded: () => void
  scope?: 'identity' | 'activity'
}) {
  const { t } = useTranslation()
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const rows = [
    ...(scope === 'activity' ? [] : requirements?.identity.map((item) => ({ ...item, scope: 'identity' as const })) ?? []),
    ...(scope === 'identity' ? [] : requirements?.activity.map((item) => ({ ...item, scope: 'activity' as const })) ?? []),
  ]
  const rowKey = rows.map((item) => `${item.scope}:${item.document.id}`).join('\0')
  const [activeKey, setActiveKey] = useState(() => (rows[0] ? `${rows[0].scope}:${rows[0].document.id}` : ''))
  useEffect(() => {
    const keys = rowKey ? rowKey.split('\0') : []
    if (keys.includes(activeKey)) return
    setActiveKey(keys[0] ?? '')
  }, [activeKey, rowKey])
  const upload = async (itemScope: 'identity' | 'activity', documentId: string, file: File) => {
    const key = `${itemScope}:${documentId}`
    const body = new FormData()
    body.set('scope', itemScope)
    body.set('documentId', documentId)
    body.set('file', file)
    setUploadingId(key)
    try {
      await portalApi.post(issuanceUrl(caseId, '/documents'), body, { timeout: 60_000 })
      toast.success(t('common.saved'))
      onUploaded()
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('app.error')))
    } finally {
      setUploadingId((current) => (current === key ? null : current))
    }
  }
  if (!rows.length) return <EmptyState icon={FileText} text={t('app.empty')} />
  const active = rows.find((item) => `${item.scope}:${item.document.id}` === activeKey) ?? rows[0]
  const activeStored = data.documents[active.scope].find((document) => document.documentId === active.document.id)
  return (
    <div className="space-y-4">
      <div role="tablist" className="flex flex-wrap gap-2">
        {rows.map((item) => {
          const key = `${item.scope}:${item.document.id}`
          const stored = data.documents[item.scope].find((document) => document.documentId === item.document.id)
          const uploaded = Boolean(stored?.versions[0])
          const selected = key === `${active.scope}:${active.document.id}`
          const tabTone = item.isRequired
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
              key={key}
              type="button"
              role="tab"
              aria-selected={selected}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-2xl px-4 py-2 text-sm ${tabTone}`}
              onClick={() => setActiveKey(key)}
            >
              <span>{item.document.title}</span>
              {item.isRequired ? (
                <span className={uploaded ? 'text-emerald-600' : 'text-red-500'} aria-hidden>
                  *
                </span>
              ) : null}
              {uploaded ? <Check className="size-3.5 shrink-0" aria-hidden /> : null}
            </button>
          )
        })}
      </div>
      <div role="tabpanel" className="rounded-2xl border border-teal-100 bg-cream-50/60 p-4">
        <DocumentSlot
          key={`${active.scope}:${active.document.id}`}
          title={active.document.title ?? ''}
          required={active.isRequired}
          version={activeStored?.versions[0] ?? null}
          editable={data.editable}
          uploading={uploadingId === `${active.scope}:${active.document.id}`}
          onFile={(file) => void upload(active.scope, active.document.id, file)}
        />
      </div>
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
  version: IssuanceDocument['versions'][number] | null
  editable: boolean
  uploading: boolean
  onFile: (file: File) => void
}) {
  const { t } = useTranslation()
  const fieldId = useId()
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
    <FormField icon={IdCard} label={required ? `${title} *` : title} htmlFor={fieldId}>
      <p className="text-xs text-ink-400">
        {required ? t('issuance.required') : t('cases.documentOptional')}
        {version?.originalName ? ` · ${version.originalName}` : ''}
      </p>
      <FileDropField
        id={fieldId}
        previewUrl={previewUrl}
        previewKind={previewKind}
        uploading={uploading}
        disabled={!editable}
        onFile={onFile}
      />
    </FormField>
  )
}

type PortalInquiryFile = {
  id: string
  originalName: string | null
  mimeType: string
  byteSize: number
}

type PortalReview = {
  id: string
  status: string
  referredAt: string | null
  decidedAt: string | null
  decidedBy: { fullName: string } | null
  files: PortalInquiryFile[]
}

type PortalInquiry = PortalReview & {
  inquiryCenter: { name: string }
}

type PortalManagementReview = PortalReview & {
  title: string
}

function inquiryStatusMeta(status: string): { icon: LucideIcon; badge: string } {
  if (status === 'APPROVED') return { icon: CircleCheck, badge: 'bg-teal-50 text-teal-800 ring-teal-200' }
  if (status === 'REJECTED') return { icon: CircleX, badge: 'bg-red-50 text-red-700 ring-red-200' }
  return { icon: Clock3, badge: 'bg-amber-50 text-amber-800 ring-amber-200' }
}

function DateTimeValue({ value }: { value: string }) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap" dir="ltr">
      <span>{formatDate(value)}</span>
      <span className="font-medium text-ink-500">{formatClock(value)}</span>
    </span>
  )
}

function reviewElapsedLabel(
  fromIso: string | null,
  toIso: string | null,
  translate: (key: string, options?: Record<string, string>) => string,
) {
  if (!fromIso || !toIso) return null
  const elapsed = Math.max(0, new Date(toIso).getTime() - new Date(fromIso).getTime())
  if (!Number.isFinite(elapsed)) return null
  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day
  const month = 30 * day
  const n = (value: number) => formatNumber(value)
  if (elapsed < minute) return translate('cases.inquiryElapsedUnderMinute')
  if (elapsed < day) {
    const hours = Math.floor(elapsed / hour)
    const minutes = Math.floor((elapsed % hour) / minute)
    if (hours === 0) return translate('cases.inquiryElapsedMinute', { count: n(minutes) })
    if (minutes === 0) return translate('cases.inquiryElapsedHour', { count: n(hours) })
    return translate('cases.inquiryElapsedHourMinute', { hours: n(hours), minutes: n(minutes) })
  }
  if (elapsed < week) {
    const days = Math.floor(elapsed / day)
    const hours = Math.floor((elapsed % day) / hour)
    if (hours === 0) return translate('cases.inquiryElapsedDay', { count: n(days) })
    return translate('cases.inquiryElapsedDayHour', { days: n(days), hours: n(hours) })
  }
  if (elapsed < month) return translate('cases.inquiryElapsedDay', { count: n(Math.floor(elapsed / day)) })
  const weeks = Math.floor(elapsed / week)
  const days = Math.floor((elapsed % week) / day)
  if (days === 0) return translate('cases.inquiryElapsedWeek', { count: n(weeks) })
  return translate('cases.inquiryElapsedWeekDay', { weeks: n(weeks), days: n(days) })
}

function ReviewSummaryCard({
  title,
  icon: Icon,
  status: statusValue,
  referredAt,
  decidedAt,
  reviewer,
  files,
  hrefOf,
  letterUrl,
}: {
  title: string
  icon: LucideIcon
  status: string
  referredAt: string | null
  decidedAt: string | null
  reviewer: string | null
  files: PortalInquiryFile[]
  hrefOf: (fileId: string) => string
  letterUrl?: string
}) {
  const { t } = useTranslation()
  const status = inquiryStatusMeta(statusValue)
  const StatusIcon = status.icon
  const elapsed = reviewElapsedLabel(referredAt, decidedAt, t)
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
            value={referredAt ? <DateTimeValue value={referredAt} /> : undefined}
          />
          <FormFactTile
            icon={CalendarCheck}
            label={t('issuance.decidedAt')}
            tone="mint"
            value={
              decidedAt ? (
                <span className="flex flex-col items-start gap-1.5">
                  <DateTimeValue value={decidedAt} />
                  {elapsed ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800 ring-1 ring-emerald-200">
                      <Clock3 className="size-3" aria-hidden />
                      {elapsed}
                    </span>
                  ) : null}
                </span>
              ) : undefined
            }
          />
          <FormFactTile icon={UserRound} label={t('issuance.decidedBy')} value={reviewer || undefined} />
          <FormFactTile
            icon={StatusIcon}
            label={t('issuance.status')}
            tone="mint"
            value={
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${status.badge}`}>
                <StatusIcon className="size-3.5" aria-hidden />
                {statusLabel(statusValue, t)}
              </span>
            }
          />
        </div>
        <InquiryAttachments files={files} hrefOf={hrefOf} />
      </div>
    </article>
  )
}

function attachmentKind(file: PortalInquiryFile, mime: string | null): 'image' | 'pdf' | 'audio' | 'other' {
  const type = (mime || file.mimeType || '').toLowerCase()
  const name = file.originalName ?? ''
  if (type.startsWith('image/') || RECORD_IMAGE_NAME.test(name)) return 'image'
  if (type === 'application/pdf' || /\.pdf$/i.test(name)) return 'pdf'
  if (type.startsWith('audio/') || RECORD_AUDIO_NAME.test(name)) return 'audio'
  return 'other'
}

function useAttachmentSrc(href: string) {
  const [src, setSrc] = useState<string>()
  const [mime, setMime] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    let objectUrl = ''
    let cancelled = false
    setFailed(false)
    setSrc(undefined)
    setMime(null)
    void portalApi
      .get<Blob>(href, { responseType: 'blob', timeout: 60_000 })
      .then((response) => {
        if (cancelled) return
        const header = String(response.headers['content-type'] ?? '')
        const type = (header.split(';')[0].trim() || response.data.type || '').toLowerCase()
        if (!type || type.includes('json') || type.startsWith('text/')) {
          setFailed(true)
          return
        }
        const blob = response.data.type ? response.data : new Blob([response.data], { type })
        objectUrl = URL.createObjectURL(blob)
        setMime(type)
        setSrc(objectUrl)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [href])
  return { src, mime, failed }
}

function InquiryAttachments({
  files,
  hrefOf,
}: {
  files: PortalInquiryFile[]
  hrefOf: (fileId: string) => string
}) {
  const { t } = useTranslation()
  if (!files.length) return null
  return (
    <div className="space-y-3">
      <FormSectionTitle icon={Paperclip} className="mb-0">
        {t('issuance.attachments')}
      </FormSectionTitle>
      <div className="flex flex-wrap gap-3">
        {files.map((file) => (
          <AttachmentPreview key={file.id} file={file} href={hrefOf(file.id)} />
        ))}
      </div>
    </div>
  )
}

function AttachmentPreview({ file, href }: { file: PortalInquiryFile; href: string }) {
  const { t } = useTranslation()
  const media = useAttachmentSrc(href)
  const kind = attachmentKind(file, media.mime)
  const name = file.originalName || t('cases.inquiryAttachment')
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (!open) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <button
        type="button"
        disabled={!media.src}
        title={name}
        aria-label={t('cases.inquiryDocEnlarge')}
        onClick={() => setOpen(true)}
        className="flex w-36 cursor-zoom-in flex-col overflow-hidden rounded-2xl bg-white text-start shadow-[0_6px_16px_rgba(46,189,182,0.12)] ring-1 ring-teal-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 disabled:cursor-default"
      >
        <span className="flex h-28 items-center justify-center overflow-hidden bg-teal-50/70">
          {media.failed ? (
            <span className="px-2 text-center text-[11px] leading-5 text-red-600">{t('cases.attachmentFailed')}</span>
          ) : kind === 'image' && media.src ? (
            <img src={media.src} alt="" className="size-full object-contain" />
          ) : !media.src ? (
            <span className="size-full animate-pulse bg-teal-50" />
          ) : kind === 'audio' ? (
            <Mic className="size-6 text-teal-600" aria-hidden />
          ) : (
            <FileText className="size-6 text-teal-600" aria-hidden />
          )}
        </span>
        <span className="flex items-center gap-1.5 px-2 py-1.5 text-[11px] font-medium text-ink-700">
          <Paperclip className="size-3.5 shrink-0 text-teal-600" aria-hidden />
          <span className="min-w-0 truncate">{name}</span>
        </span>
      </button>
      {open && media.src ? (
        <AttachmentViewer
          src={media.src}
          name={name}
          kind={kind}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  )
}

function AttachmentViewer({
  src,
  name,
  kind,
  onClose,
}: {
  src: string
  name: string
  kind: 'image' | 'pdf' | 'audio' | 'other'
  onClose: () => void
}) {
  const { t } = useTranslation()
  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink-900/50 p-4">
      <button type="button" className="absolute inset-0 cursor-zoom-out" aria-label={t('common.close')} onClick={onClose} />
      <section className="relative z-10 flex max-h-[92dvh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-xl">
        <header className="flex items-center justify-between gap-3 border-b border-teal-100 px-4 py-3">
          <p className="min-w-0 truncate text-sm font-medium text-ink-800">{name}</p>
          <button type="button" className="cursor-pointer rounded-xl p-2 text-ink-500 hover:bg-teal-50" aria-label={t('common.close')} onClick={onClose}>
            <X className="size-4" aria-hidden />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-auto bg-cream-50 p-4">
          {kind === 'image' ? <img src={src} alt={name} className="mx-auto max-h-[80dvh] w-full object-contain" /> : null}
          {kind === 'pdf' ? <iframe title={name} src={src} className="h-[80dvh] w-full rounded-2xl bg-white" /> : null}
          {kind === 'audio' ? <audio src={src} controls autoPlay className="w-full" dir="ltr" /> : null}
          {kind === 'other' ? (
            <a href={src} download={name} className="inline-flex items-center gap-2 text-sm font-medium text-teal-700">
              <FileText className="size-4" aria-hidden />
              {name}
            </a>
          ) : null}
        </div>
      </section>
    </div>,
    document.body,
  )
}

function OrganizationStep({ caseId, active }: { caseId: string; active: number }) {
  const { t } = useTranslation()
  const query = useQuery({
    queryKey: ['organization-steps', caseId],
    queryFn: () =>
      portalApi
        .get<{
          inquiries: PortalInquiry[]
          placesReview: PortalReview | null
          managementReviews: PortalManagementReview[]
          caseFile: { licenseNumber: string | null }
        }>(`/issuance/${caseId}/organization-steps`)
        .then(({ data }) => data),
  })
  if (query.isLoading) return <LoadingState />
  if (query.isError || !query.data) return <ErrorState error={query.error} />
  const titles = FORMATION_STEPS.map((item) => `cases.steps.${item}`)
  if (active === 6) {
    return <IssuedLicenseView caseId={caseId} emptyText={t('issuance.awaitingIssuance')} />
  }
  let content: ReactNode = <EmptyState icon={ShieldCheck} text={t('issuance.locked')} />
  if (active === 3) {
    content = query.data.inquiries.length ? (
      <div className="space-y-4">
        <PortalLettersToolbar
          letterUrls={[
            ...query.data.inquiries.map((row) => `/issuance/${caseId}/inquiries/${row.id}/letter`),
            ...(query.data.placesReview ? [`/issuance/${caseId}/places/letter`] : []),
          ]}
        />
        {query.data.inquiries.map((row) => (
          <ReviewSummaryCard
            key={row.id}
            title={row.inquiryCenter.name}
            icon={Landmark}
            status={row.status}
            referredAt={row.referredAt}
            decidedAt={row.decidedAt}
            reviewer={row.decidedBy?.fullName ?? null}
            files={row.files}
            hrefOf={(fileId) => `/issuance/${caseId}/inquiries/${row.id}/files/${fileId}`}
            letterUrl={`/issuance/${caseId}/inquiries/${row.id}/letter`}
          />
        ))}
      </div>
    ) : <EmptyState icon={ShieldCheck} text={t('app.empty')} />
  }
  if (active === 4) {
    const places = query.data.placesReview
    content = places ? (
      <ReviewSummaryCard
        title={t('cases.steps.places')}
        icon={Building2}
        status={places.status}
        referredAt={places.referredAt}
        decidedAt={places.decidedAt}
        reviewer={places.decidedBy?.fullName ?? null}
        files={places.files}
        hrefOf={(fileId) => `/issuance/${caseId}/places/files/${fileId}`}
        letterUrl={`/issuance/${caseId}/places/letter`}
      />
    ) : (
      <EmptyState icon={Building2} text={t('issuance.awaitingReferral')} />
    )
  }
  if (active === 5) {
    content = query.data.managementReviews.length ? (
      <div className="space-y-4">
        {query.data.managementReviews.map((row) => (
          <ReviewSummaryCard
            key={row.id}
            title={row.title}
            icon={CircleUserRound}
            status={row.status}
            referredAt={row.referredAt}
            decidedAt={row.decidedAt}
            reviewer={row.decidedBy?.fullName ?? null}
            files={row.files}
            hrefOf={(fileId) => `/issuance/${caseId}/management-reviews/${row.id}/files/${fileId}`}
          />
        ))}
      </div>
    ) : <EmptyState icon={CircleUserRound} text={t('app.empty')} />
  }
  const icons = [UserRound, Briefcase, MapPin, ShieldCheck, Building2, CircleUserRound, FileBadge2]
  return (
    <FormCard icon={icons[active] ?? ShieldCheck} title={t(titles[active])}>
      <div className={formBodyClassName}>{content}</div>
    </FormCard>
  )
}

function formatFee(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return '—'
  return formatNumber(value)
}

function dailyFee(annualFee: number | null | undefined) {
  if (annualFee == null || !Number.isFinite(annualFee)) return null
  return Math.round(annualFee / 365)
}

function StatusBadge({ active }: { active: boolean }) {
  const { t } = useTranslation()
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
        active ? 'bg-teal-50 text-teal-700' : 'bg-cream-100 text-ink-500'
      }`}
    >
      {active ? t('geo.active') : t('geo.inactive')}
    </span>
  )
}

function EntityNameSubtitle({ name, icon: Icon }: { name: string; icon: LucideIcon }) {
  return (
    <span className="mt-1 inline-flex items-center gap-1.5 text-sm text-ink-500">
      <Icon className="size-3.5 text-teal-600" aria-hidden />
      {name}
    </span>
  )
}

function CatalogPager({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}) {
  const { t } = useTranslation()
  if (!total) return null
  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)
  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-ink-500">
        {t('common.showingRange', {
          from: formatNumber(from),
          to: formatNumber(to),
          total: formatNumber(total),
        })}
      </p>
      <div className="flex items-center gap-2">
        <Button variant="ghost" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronRight className="size-4" />
          {t('common.previous')}
        </Button>
        <span className="min-w-16 text-center text-sm text-ink-700">
          {t('common.page')} {formatNumber(page)}
        </span>
        <Button variant="ghost" disabled={page * pageSize >= total} onClick={() => onPageChange(page + 1)}>
          {t('common.next')}
          <ChevronLeft className="size-4" />
        </Button>
      </div>
    </div>
  )
}

function CatalogTable({
  loading,
  error,
  empty,
  emptyIcon: EmptyIcon,
  hasRows,
  children,
}: {
  loading: boolean
  error?: unknown
  empty: string
  emptyIcon: LucideIcon
  hasRows: boolean
  children: ReactNode
}) {
  return (
    <section data-list-table className={`min-w-0 overflow-hidden border border-line ${cardClassName}`}>
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} />
      ) : hasRows ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">{children}</table>
        </div>
      ) : (
        <EmptyState icon={EmptyIcon} text={empty} />
      )}
    </section>
  )
}

function ViewAction({ to }: { to: string }) {
  const { t } = useTranslation()
  return (
    <Link to={to} data-row-view onClick={(event) => event.stopPropagation()}>
      <Button type="button" variant="ghost">
        <Eye className="size-4" aria-hidden />
        {t('common.view')}
      </Button>
    </Link>
  )
}

function onCatalogRowKeyDown(
  event: React.KeyboardEvent<HTMLTableRowElement>,
  to: string,
  navigate: ReturnType<typeof useNavigate>,
) {
  if (event.target !== event.currentTarget) return
  if (event.key === 'Enter') {
    navigate(to)
    return
  }
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
  event.preventDefault()
  const rows = Array.from(
    event.currentTarget.closest('[data-list-table]')?.querySelectorAll<HTMLTableRowElement>('[data-list-row]') ?? [],
  )
  const index = rows.indexOf(event.currentTarget)
  if (event.key === 'ArrowUp' && index === 0) {
    document.querySelector<HTMLInputElement>('[data-list-search]')?.focus()
    return
  }
  rows[Math.max(0, Math.min(rows.length - 1, index + (event.key === 'ArrowDown' ? 1 : -1)))]?.focus()
}

function useCatalogListParams() {
  const [params, setParams] = useSearchParams()
  const [term, setTerm] = useState(params.get('q') ?? '')
  const page = Math.max(1, Number(params.get('page') ?? 1))
  const sortBy = params.get('sortBy') ?? ''
  const sortDir = params.get('sortDir') ?? ''
  useEffect(() => {
    setTerm(params.get('q') ?? '')
  }, [params])
  const setPage = (nextPage: number) => {
    const next = new URLSearchParams(params)
    next.set('page', String(nextPage))
    setParams(next)
  }
  const setFilter = (updates: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(updates)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    next.set('page', '1')
    setParams(next)
  }
  const sort = (column: string) => {
    const state = nextSort(column, sortBy, sortDir)
    const next = new URLSearchParams(params)
    if (state.sortBy) {
      next.set('sortBy', state.sortBy)
      next.set('sortDir', state.sortDir)
    } else {
      next.delete('sortBy')
      next.delete('sortDir')
    }
    next.set('page', '1')
    setParams(next)
  }
  const search = () => {
    const input = document.querySelector<HTMLInputElement>('[data-list-search]')
    const text = (input?.value ?? term).trim()
    const next = new URLSearchParams(params)
    if (text) next.set('q', text)
    else next.delete('q')
    next.set('page', '1')
    setParams(next)
  }
  return { params, term, setTerm, page, sortBy, sortDir, setPage, setFilter, sort, search }
}

function JobTypesCatalogPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { term, setTerm, page, sortBy, sortDir, setPage, sort, search, params } = useCatalogListParams()
  const query = useQuery({
    queryKey: ['base-info', 'job-types', params.toString()],
    queryFn: () =>
      portalApi
        .get<Paginated<CatalogJobType>>('/base-info/job-types', {
          params: { q: params.get('q') || undefined, page, sortBy: sortBy || undefined, sortDir: sortDir || undefined },
        })
        .then(({ data }) => data),
  })
  const rows = query.data?.items ?? []
  return (
    <div className={catalogShellClassName}>
      <PageHeader icon={Briefcase} title={t('nav.jobTypes')} subtitle={t('jobTypes.subtitle')} />
      <SearchBar
        term={term}
        onTermChange={setTerm}
        onSubmit={search}
        placeholder={t('jobTypes.searchPlaceholder')}
      />
      <CatalogTable
        loading={query.isLoading}
        error={query.error}
        empty={params.get('q') ? t('jobTypes.noResults') : t('jobTypes.empty')}
        emptyIcon={Briefcase}
        hasRows={rows.length > 0}
      >
        <thead className="bg-cream-50 text-ink-700">
          <tr>
            <SortableTh column="title" label={t('jobTypes.title')} sortBy={sortBy} sortDir={sortDir} onSort={sort} />
            <SortableTh column="annualFee" label={t('jobTypes.annualFee')} sortBy={sortBy} sortDir={sortDir} onSort={sort} />
            <SortableTh column="dailyFee" label={t('jobTypes.dailyFee')} sortBy={sortBy} sortDir={sortDir} onSort={sort} />
            <th className={`${actionsColClassName} text-start font-medium`}>{t('common.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => {
            const to = `/base-info/job-types/${item.id}`
            return (
              <tr
                key={item.id}
                data-list-row
                tabIndex={0}
                className="cursor-pointer border-t border-line hover:bg-cream-50 focus:outline-none focus-visible:shadow-[inset_0_0_0_2px_#5ed4ce]"
                onClick={() => navigate(to)}
                onKeyDown={(event) => onCatalogRowKeyDown(event, to, navigate)}
              >
                <td className="px-4 py-3">{item.title}</td>
                <td className="px-4 py-3">{formatFee(item.annualFee)}</td>
                <td className="px-4 py-3">{formatFee(dailyFee(item.annualFee))}</td>
                <td className={actionsColClassName}>
                  <ViewAction to={to} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </CatalogTable>
      {query.data ? (
        <CatalogPager page={query.data.page} pageSize={query.data.pageSize} total={query.data.total} onPageChange={setPage} />
      ) : null}
    </div>
  )
}

function JobTypeCatalogDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const query = useQuery({
    queryKey: ['base-info', 'job-type', id],
    enabled: Boolean(id),
    queryFn: () => portalApi.get<CatalogJobType>(`/base-info/job-types/${id}`).then(({ data }) => data),
  })
  const item = query.data
  if (query.isLoading || !item) {
    return query.isError ? <ErrorState error={query.error} /> : <LoadingState />
  }
  return (
    <div className={catalogShellClassName}>
      <PageHeader
        icon={Briefcase}
        title={t('jobTypes.details')}
        subtitle={<EntityNameSubtitle name={item.title} icon={Briefcase} />}
        backTo="/base-info/job-types"
      />
      <FormCard icon={Briefcase} title={item.title}>
        <div className="space-y-6 p-5 sm:p-6">
          <FormSectionTitle icon={Briefcase}>{t('jobTypes.details')}</FormSectionTitle>
          <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
            <FormFactTile icon={Type} label={t('jobTypes.title')} value={item.title} tone="teal" />
            <FormFactTile icon={Banknote} label={t('jobTypes.annualFee')} value={formatFee(item.annualFee)} tone="mint" />
            <FormFactTile icon={CalendarDays} label={t('jobTypes.dailyFee')} value={formatFee(dailyFee(item.annualFee))} tone="teal" />
            <FormFactTile
              icon={FileText}
              label={t('jobTypes.description')}
              value={item.description || '—'}
              className="sm:col-span-2"
            />
          </div>
        </div>
      </FormCard>
    </div>
  )
}

function JobGroupsCatalogPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { term, setTerm, page, sortBy, sortDir, setPage, sort, search, params } = useCatalogListParams()
  const query = useQuery({
    queryKey: ['base-info', 'job-groups', params.toString()],
    queryFn: () =>
      portalApi
        .get<Paginated<CatalogJobGroup>>('/base-info/job-groups', {
          params: { q: params.get('q') || undefined, page, sortBy: sortBy || undefined, sortDir: sortDir || undefined },
        })
        .then(({ data }) => data),
  })
  const rows = query.data?.items ?? []
  return (
    <div className={catalogShellClassName}>
      <PageHeader icon={FolderKanban} title={t('nav.jobGroups')} subtitle={t('jobGroups.subtitle')} />
      <SearchBar
        term={term}
        onTermChange={setTerm}
        onSubmit={search}
        placeholder={t('jobGroups.searchPlaceholder')}
      />
      <CatalogTable
        loading={query.isLoading}
        error={query.error}
        empty={params.get('q') ? t('jobGroups.noResults') : t('jobGroups.empty')}
        emptyIcon={FolderKanban}
        hasRows={rows.length > 0}
      >
        <thead className="bg-cream-50 text-ink-700">
          <tr>
            <SortableTh column="title" label={t('jobGroups.title')} sortBy={sortBy} sortDir={sortDir} onSort={sort} />
            <SortableTh column="code" label={t('jobGroups.code')} sortBy={sortBy} sortDir={sortDir} onSort={sort} />
            <SortableTh column="jobCount" label={t('jobGroups.jobCount')} sortBy={sortBy} sortDir={sortDir} onSort={sort} />
            <th className={`${actionsColClassName} text-start font-medium`}>{t('common.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => {
            const to = `/base-info/job-groups/${item.id}`
            return (
              <tr
                key={item.id}
                data-list-row
                tabIndex={0}
                className="cursor-pointer border-t border-line hover:bg-cream-50 focus:outline-none focus-visible:shadow-[inset_0_0_0_2px_#5ed4ce]"
                onClick={() => navigate(to)}
                onKeyDown={(event) => onCatalogRowKeyDown(event, to, navigate)}
              >
                <td className="px-4 py-3">{item.title}</td>
                <td className="px-4 py-3" dir="ltr">
                  {item.code ? localizeDigits(item.code) : '—'}
                </td>
                <td className="px-4 py-3">{formatNumber(item._count?.jobs ?? 0)}</td>
                <td className={actionsColClassName}>
                  <ViewAction to={to} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </CatalogTable>
      {query.data ? (
        <CatalogPager page={query.data.page} pageSize={query.data.pageSize} total={query.data.total} onPageChange={setPage} />
      ) : null}
    </div>
  )
}

function JobGroupCatalogDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const query = useQuery({
    queryKey: ['base-info', 'job-group', id],
    enabled: Boolean(id),
    queryFn: () => portalApi.get<CatalogJobGroup>(`/base-info/job-groups/${id}`).then(({ data }) => data),
  })
  const item = query.data
  if (query.isLoading || !item) {
    return query.isError ? <ErrorState error={query.error} /> : <LoadingState />
  }
  return (
    <div className={catalogShellClassName}>
      <PageHeader
        icon={FolderKanban}
        title={t('jobGroups.details')}
        subtitle={<EntityNameSubtitle name={item.title} icon={FolderKanban} />}
        backTo="/base-info/job-groups"
      />
      <FormCard icon={FolderKanban} title={item.title}>
        <div className="space-y-6 p-5 sm:p-6">
          <FormSectionTitle icon={FolderKanban}>{t('jobGroups.details')}</FormSectionTitle>
          <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
            <FormFactTile icon={FolderKanban} label={t('jobGroups.title')} value={item.title} tone="teal" />
            <FormFactTile
              icon={Languages}
              label={t('jobGroups.titleEn')}
              value={item.titleEn ? <span dir="ltr">{item.titleEn}</span> : '—'}
              tone="mint"
            />
            <FormFactTile
              icon={Hash}
              label={t('jobGroups.code')}
              value={item.code ? localizeDigits(item.code) : '—'}
              tone="mint"
            />
            <FormFactTile icon={Briefcase} label={t('jobGroups.jobCount')} value={formatNumber(item._count?.jobs ?? 0)} />
            <FormFactTile icon={FolderKanban} label={t('jobGroups.isActive')} value={<StatusBadge active={item.isActive} />} />
            <FormFactTile
              icon={FileText}
              label={t('jobGroups.description')}
              value={item.description || '—'}
              className="sm:col-span-2"
            />
          </div>
        </div>
      </FormCard>
    </div>
  )
}

function JobsCatalogPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { term, setTerm, page, sortBy, sortDir, setPage, setFilter, sort, search, params } = useCatalogListParams()
  const groupId = params.get('groupId') ?? ''
  const jobTypeId = params.get('jobTypeId') ?? ''
  const filtersActive = Boolean(groupId || jobTypeId)
  const groups = useQuery({
    queryKey: ['base-info', 'job-groups', 'lookup'],
    queryFn: () => portalApi.get<CatalogJobGroup[]>('/base-info/job-groups').then(({ data }) => data),
  })
  const types = useQuery({
    queryKey: ['base-info', 'job-types', 'lookup'],
    queryFn: () => portalApi.get<CatalogJobType[]>('/base-info/job-types').then(({ data }) => data),
  })
  const stats = useQuery({
    queryKey: ['base-info', 'jobs', 'stats'],
    queryFn: () => portalApi.get<CatalogJobStats>('/base-info/jobs/stats').then(({ data }) => data),
  })
  const query = useQuery({
    queryKey: ['base-info', 'jobs', params.toString()],
    queryFn: () =>
      portalApi
        .get<Paginated<CatalogJob>>('/base-info/jobs', {
          params: {
            q: params.get('q') || undefined,
            page,
            ...(groupId ? { groupId } : {}),
            ...(jobTypeId ? { jobTypeId } : {}),
            sortBy: sortBy || undefined,
            sortDir: sortDir || undefined,
          },
        })
        .then(({ data }) => data),
  })
  const rows = query.data?.items ?? []
  return (
    <div className={catalogShellClassName}>
      <PageHeader icon={HardHat} title={t('nav.jobs')} subtitle={t('jobCatalog.subtitle')} />
      <JobCatalogStatsCards stats={stats.data} loading={stats.isLoading} />
      <SearchBar
        term={term}
        onTermChange={setTerm}
        onSubmit={search}
        placeholder={t('jobCatalog.searchPlaceholder')}
        filtersActive={filtersActive}
        onClearFilters={() => setFilter({ groupId: undefined, jobTypeId: undefined })}
        extra={
          <>
            <FormField icon={FolderKanban} label={t('jobCatalog.jobGroup')} htmlFor="job-filter-group">
              <SearchSelect
                id="job-filter-group"
                value={groupId}
                onChange={(next) => setFilter({ groupId: next || undefined })}
                placeholder={t('jobCatalog.allGroups')}
                options={[
                  { value: '', label: t('jobCatalog.allGroups') },
                  ...(groups.data ?? []).map((item) => ({ value: item.id, label: item.title })),
                ]}
              />
            </FormField>
            <FormField icon={Briefcase} label={t('jobCatalog.jobType')} htmlFor="job-filter-type">
              <SearchSelect
                id="job-filter-type"
                value={jobTypeId}
                onChange={(next) => setFilter({ jobTypeId: next || undefined })}
                placeholder={t('jobCatalog.allJobTypes')}
                options={[
                  { value: '', label: t('jobCatalog.allJobTypes') },
                  ...(types.data ?? []).map((item) => ({ value: item.id, label: item.title })),
                ]}
              />
            </FormField>
          </>
        }
      />
      <CatalogTable
        loading={query.isLoading}
        error={query.error}
        empty={params.get('q') || filtersActive ? t('jobCatalog.noResults') : t('jobCatalog.empty')}
        emptyIcon={HardHat}
        hasRows={rows.length > 0}
      >
        <thead className="bg-cream-50 text-ink-700">
          <tr>
            <SortableTh column="title" label={t('jobCatalog.title')} sortBy={sortBy} sortDir={sortDir} onSort={sort} />
            <SortableTh column="jobType" label={t('jobCatalog.jobType')} sortBy={sortBy} sortDir={sortDir} onSort={sort} />
            <SortableTh column="annualFee" label={t('jobCatalog.listAnnualFee')} sortBy={sortBy} sortDir={sortDir} onSort={sort} />
            <SortableTh column="group" label={t('jobCatalog.jobGroup')} sortBy={sortBy} sortDir={sortDir} onSort={sort} />
            <th className={`${actionsColClassName} text-start font-medium`}>{t('common.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => {
            const to = `/base-info/jobs/${item.id}`
            return (
              <tr
                key={item.id}
                data-list-row
                tabIndex={0}
                className="cursor-pointer border-t border-line hover:bg-cream-50 focus:outline-none focus-visible:shadow-[inset_0_0_0_2px_#5ed4ce]"
                onClick={() => navigate(to)}
                onKeyDown={(event) => onCatalogRowKeyDown(event, to, navigate)}
              >
                <td className="px-4 py-3">{item.title || '—'}</td>
                <td className="px-4 py-3">{item.jobType.title}</td>
                <td className="px-4 py-3">
                  {item.annualFee == null ? (
                    '—'
                  ) : (
                    <span className="inline-flex flex-wrap items-center gap-2">
                      {formatFee(item.annualFee)}
                      <span className="inline-flex rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700">
                        {t('jobCatalog.dailyFee')} {formatFee(dailyFee(item.annualFee))}
                      </span>
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">{item.group?.title ?? '—'}</td>
                <td className={actionsColClassName}>
                  <ViewAction to={to} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </CatalogTable>
      {query.data ? (
        <CatalogPager page={query.data.page} pageSize={query.data.pageSize} total={query.data.total} onPageChange={setPage} />
      ) : null}
    </div>
  )
}

function JobCatalogStatsCards({ stats, loading }: { stats: CatalogJobStats | undefined; loading: boolean }) {
  const { t } = useTranslation()
  if (loading && !stats) {
    return (
      <div className="mb-4 grid gap-3 sm:grid-cols-2" aria-hidden>
        <div className="h-[4.75rem] animate-pulse rounded-2xl bg-teal-50" />
        <div className="h-[4.75rem] animate-pulse rounded-2xl bg-mint-50" />
      </div>
    )
  }
  if (!stats) return null
  return (
    <section className="mb-4 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard icon={HardHat} label={t('jobCatalog.statsJobs')} value={stats.jobCount} tone="teal" />
        <StatCard icon={FolderKanban} label={t('jobCatalog.statsGroups')} value={stats.jobGroupCount} tone="mint" />
      </div>
      {stats.byJobType.length > 0 ? (
        <div className="rounded-3xl border border-teal-100 bg-[linear-gradient(180deg,#ffffff_0%,#f4fbfa_100%)] p-4 shadow-[0_12px_32px_rgba(46,189,182,0.08)] sm:p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-teal-800">
            <span className="flex size-8 items-center justify-center rounded-xl bg-teal-500 text-white shadow-[0_8px_16px_rgba(46,189,182,0.28)]">
              <Layers className="size-4" aria-hidden />
            </span>
            {t('jobCatalog.statsByType')}
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {stats.byJobType.map((item, index) => (
              <StatCard
                key={item.id}
                icon={Briefcase}
                label={item.title}
                value={item.count}
                tone={index % 2 === 0 ? 'teal' : 'mint'}
                compact
              />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
  compact = false,
}: {
  icon: LucideIcon
  label: string
  value: number
  tone: 'teal' | 'mint'
  compact?: boolean
}) {
  const wrap = {
    teal: 'border-teal-100 bg-gradient-to-b from-teal-50 to-white',
    mint: 'border-mint-100 bg-gradient-to-b from-mint-50 to-white',
  }[tone]
  const iconClass = {
    teal: 'bg-teal-500 shadow-[0_10px_18px_rgba(46,189,182,0.28)]',
    mint: 'bg-mint-500 shadow-[0_10px_18px_rgba(63,214,190,0.28)]',
  }[tone]
  return (
    <article
      className={`flex min-w-0 items-center gap-3 rounded-2xl border shadow-[0_8px_22px_rgba(46,189,182,0.08)] ${compact ? 'px-3 py-2.5' : 'px-4 py-3.5'} ${wrap}`}
    >
      <span
        className={`flex shrink-0 items-center justify-center rounded-2xl text-white ${iconClass} ${compact ? 'size-9' : 'size-11'}`}
      >
        <Icon className={compact ? 'size-4' : 'size-5'} aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-ink-500">{label}</p>
        <p className={`font-semibold text-ink-900 ${compact ? 'mt-0.5 text-xl' : 'mt-0.5 text-2xl'}`}>
          {formatNumber(value)}
        </p>
      </div>
    </article>
  )
}

function JobCatalogDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const query = useQuery({
    queryKey: ['base-info', 'job', id],
    enabled: Boolean(id),
    queryFn: () => portalApi.get<CatalogJob>(`/base-info/jobs/${id}`).then(({ data }) => data),
  })
  const item = query.data
  if (query.isLoading || !item) {
    return query.isError ? <ErrorState error={query.error} /> : <LoadingState />
  }
  return (
    <div className={catalogShellClassName}>
      <PageHeader
        icon={HardHat}
        title={t('jobCatalog.details')}
        subtitle={<EntityNameSubtitle name={item.title || item.titleEn || ''} icon={HardHat} />}
        backTo="/base-info/jobs"
      />
      <FormCard icon={HardHat} title={item.title || item.titleEn || ''}>
        <div className="space-y-6 p-5 sm:p-6">
          <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
            <FormFactTile icon={Type} label={t('jobCatalog.title')} value={item.title || '—'} tone="teal" />
            <FormFactTile icon={Languages} label={t('jobCatalog.titleEn')} value={item.titleEn || '—'} tone="mint" />
            <FormFactTile
              icon={ReceiptText}
              label={t('jobCatalog.taxIntaCode')}
              value={item.taxIntaCode ? localizeDigits(item.taxIntaCode) : '—'}
            />
            <FormFactTile icon={Briefcase} label={t('jobCatalog.jobType')} value={item.jobType.title} />
            <FormFactTile
              icon={Banknote}
              label={t('jobCatalog.annualFee')}
              value={formatFee(item.annualFee)}
              tone="mint"
            />
            <FormFactTile icon={FolderKanban} label={t('jobCatalog.jobGroup')} value={item.group?.title ?? '—'} />
            <FormFactTile icon={HardHat} label={t('jobCatalog.isActive')} value={<StatusBadge active={item.isActive} />} />
          </div>
        </div>
      </FormCard>
    </div>
  )
}

const VIOLATION_STATUSES = [
  'REGISTERED',
  'UNDER_REVIEW',
  'NOTICE',
  'REFERRED',
  'VERDICT_ISSUED',
  'CLOSED',
  'DISMISSED',
] as const

const violationStatusClass: Record<string, string> = {
  REGISTERED: 'bg-teal-50 text-teal-800 ring-teal-200',
  UNDER_REVIEW: 'bg-mint-50 text-teal-900 ring-mint-200',
  NOTICE: 'bg-amber-50 text-amber-800 ring-amber-200',
  REFERRED: 'bg-cream-50 text-ink-700 ring-line',
  VERDICT_ISSUED: 'bg-teal-100 text-teal-900 ring-teal-300',
  CLOSED: 'bg-mint-100 text-teal-900 ring-mint-300',
  DISMISSED: 'bg-red-50 text-red-700 ring-red-200',
}

function ViolationStatusBadge({ status }: { status: string }) {
  const { t } = useTranslation()
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${violationStatusClass[status] ?? 'bg-cream-50 text-ink-700 ring-line'}`}>
      {violationStatusLabel(status, t)}
    </span>
  )
}

function focusViolationRow(current: HTMLTableRowElement, direction: 1 | -1) {
  const rows = Array.from(current.closest('[data-list-table]')?.querySelectorAll<HTMLTableRowElement>('[data-list-row]') ?? [])
  const index = rows.indexOf(current)
  if (direction < 0 && index === 0) {
    document.querySelector<HTMLInputElement>('[data-list-search]')?.focus()
    return
  }
  rows[Math.max(0, Math.min(rows.length - 1, index + direction))]?.focus()
}

function MyViolationsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [term, setTerm] = useState(params.get('q') ?? '')
  const page = Math.max(1, Number(params.get('page') ?? 1))
  const pageSize = 10
  const sortBy = params.get('sortBy') ?? ''
  const sortDir = params.get('sortDir') ?? ''
  const status = params.get('status') ?? ''
  const query = useQuery({
    queryKey: ['my-violations', params.toString()],
    queryFn: () =>
      portalApi
        .get<Paginated<PortalViolationSummary>>('/violations', { params: Object.fromEntries(params) })
        .then(({ data }) => data),
  })
  const setPage = (nextPage: number) => {
    const next = new URLSearchParams(params)
    next.set('page', String(nextPage))
    setParams(next)
  }
  const setFilter = (updates: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(updates)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    next.set('page', '1')
    setParams(next)
  }
  const sort = (column: string) => {
    const state = nextSort(column, sortBy, sortDir)
    const next = new URLSearchParams(params)
    if (state.sortBy) {
      next.set('sortBy', state.sortBy)
      next.set('sortDir', state.sortDir)
    } else {
      next.delete('sortBy')
      next.delete('sortDir')
    }
    next.set('page', '1')
    setParams(next)
  }
  const search = () => {
    const input = document.querySelector<HTMLInputElement>('[data-list-search]')
    const text = (input?.value ?? term).trim()
    const next = new URLSearchParams(params)
    if (text) next.set('q', text)
    else next.delete('q')
    next.set('page', '1')
    setParams(next)
  }
  const total = query.data?.total ?? 0
  const from = total ? (page - 1) * pageSize + 1 : 0
  const to = Math.min(page * pageSize, total)
  const filtered = Boolean(params.get('q') || status)
  return (
    <div className={shellClassName}>
      <PageHeader icon={Gavel} title={t('violations.title')} subtitle={t('violations.subtitle')} />
      <SearchBar
        term={term}
        onTermChange={setTerm}
        onSubmit={search}
        placeholder={t('violations.searchPlaceholder')}
        filtersActive={Boolean(status)}
        onClearFilters={() => setFilter({ status: undefined })}
        extra={
          <FormField icon={ShieldAlert} label={t('violations.filterStatus')} htmlFor="my-violation-status">
            <SearchSelect
              id="my-violation-status"
              value={status}
              onChange={(next) => setFilter({ status: next || undefined })}
              placeholder={t('violations.allStatuses')}
              options={[
                { value: '', label: t('violations.allStatuses') },
                ...VIOLATION_STATUSES.map((item) => ({ value: item, label: t(`violationStatuses.${item}`) })),
              ]}
            />
          </FormField>
        }
      />
      <section data-list-table className={`min-w-0 overflow-hidden border border-line ${cardClassName}`}>
        {query.isLoading ? (
          <LoadingState />
        ) : query.isError ? (
          <ErrorState error={query.error} />
        ) : query.data?.items.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-cream-50 text-ink-700">
                <tr>
                  <SortableTh column="violationType" label={t('violations.violationType')} sortBy={sortBy} sortDir={sortDir} onSort={sort} />
                  <SortableTh column="businessUnitTitle" label={t('cases.unitTitle')} sortBy={sortBy} sortDir={sortDir} onSort={sort} />
                  <SortableTh column="licenseNumber" label={t('cases.licenseNumber')} sortBy={sortBy} sortDir={sortDir} onSort={sort} />
                  <SortableTh column="occurredAt" label={t('violations.occurredAt')} sortBy={sortBy} sortDir={sortDir} onSort={sort} />
                  <SortableTh column="status" label={t('violations.status')} sortBy={sortBy} sortDir={sortDir} onSort={sort} align="center" />
                </tr>
              </thead>
              <tbody>
                {query.data.items.map((item) => (
                  <tr
                    key={item.id}
                    data-list-row
                    tabIndex={0}
                    className="cursor-pointer border-t border-line focus:outline-none focus-visible:shadow-[inset_0_0_0_2px_#5ed4ce]"
                    onClick={() => navigate(`/violations/${item.id}`)}
                    onKeyDown={(event) => {
                      if (event.target !== event.currentTarget) return
                      if (event.key === 'Enter') {
                        navigate(`/violations/${item.id}`)
                        return
                      }
                      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
                      event.preventDefault()
                      focusViolationRow(event.currentTarget, event.key === 'ArrowDown' ? 1 : -1)
                    }}
                  >
                    <td className="px-4 py-3 font-medium text-ink-900">{item.violationType.title}</td>
                    <td className="px-4 py-3">{item.caseFile?.businessUnitTitle || '—'}</td>
                    <td className="px-4 py-3">
                      {item.caseFile?.licenseNumber ? (
                        <span dir="ltr" className="inline-flex rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-900 ring-1 ring-teal-200">
                          {localizeDigits(item.caseFile.licenseNumber)}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3">{formatDate(item.occurredAt)}</td>
                    <td className="px-4 py-3 text-center">
                      <ViolationStatusBadge status={item.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={Gavel} text={filtered ? t('violations.noResults') : t('violations.empty')} />
        )}
      </section>
      {total ? (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink-500">
            {t('common.showingRange', { from: formatNumber(from), to: formatNumber(to), total: formatNumber(total) })}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronRight className="size-4" />
              {t('common.previous')}
            </Button>
            <span className="min-w-16 text-center text-sm text-ink-700">
              {t('common.page')} {formatNumber(page)}
            </span>
            <Button variant="ghost" disabled={page * pageSize >= total} onClick={() => setPage(page + 1)}>
              {t('common.next')}
              <ChevronLeft className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function MyViolationDetailPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { violationId = '' } = useParams()
  const query = useQuery({
    queryKey: ['my-violation', violationId],
    enabled: Boolean(violationId),
    queryFn: () => portalApi.get<PortalViolation>(`/violations/${violationId}`).then(({ data }) => data),
  })
  const item = query.data
  return (
    <div className={shellClassName}>
      <PageHeader icon={Gavel} title={t('violations.details')} subtitle={item?.violationType.title} backTo="/violations" />
      {query.isLoading ? <LoadingState /> : null}
      {query.isError ? <ErrorState error={query.error} /> : null}
      {item ? (
        <FormCard icon={ShieldAlert} title={item.violationType.title}>
          <div className="space-y-6 p-5 sm:p-6">
            <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
              <FormFactTile icon={Tag} label={t('violations.violationType')} value={item.violationType.title} tone="teal" />
              <FormFactTile icon={ShieldAlert} label={t('violations.status')} value={<ViolationStatusBadge status={item.status} />} tone="mint" />
              <FormFactTile icon={CalendarDays} label={t('violations.occurredAt')} value={formatDate(item.occurredAt)} tone="teal" />
              <FormFactTile icon={UserRound} label={t('violations.personName')} value={user?.fullName} tone="mint" />
              <FormFactTile icon={IdCard} label={t('violations.nationalId')} copyValue={item.nationalId} tone="teal" />
              <FormFactTile
                icon={Store}
                label={t('cases.unitTitle')}
                value={
                  item.caseFile ? (
                    <Link to={`/cases/${item.caseFile.id}`} className="text-teal-700 hover:underline">
                      {item.caseFile.businessUnitTitle || t('cases.details')}
                    </Link>
                  ) : undefined
                }
                tone="mint"
              />
              <FormFactTile
                icon={FileBadge2}
                label={t('cases.licenseNumber')}
                value={item.caseFile?.licenseNumber ? localizeDigits(item.caseFile.licenseNumber) : undefined}
              />
              <FormFactTile
                icon={FileText}
                label={t('violations.description')}
                value={item.description?.trim() || undefined}
                className="sm:col-span-2"
              />
            </div>
            <ViolationAttachmentMedia
              hrefFor={(attachmentId) => `/violations/${item.id}/attachments/${attachmentId}`}
              items={item.attachments}
            />
          </div>
        </FormCard>
      ) : null}
    </div>
  )
}

const SMS_STATUSES = ['SKIPPED', 'SENT', 'FAILED'] as const

const smsStatusClass: Record<string, string> = {
  SKIPPED: 'bg-amber-50 text-amber-800 ring-amber-200',
  SENT: 'bg-teal-50 text-teal-800 ring-teal-200',
  FAILED: 'bg-red-50 text-red-700 ring-red-200',
}

function SmsStatusBadge({ status }: { status: string }) {
  const { t } = useTranslation()
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${smsStatusClass[status] ?? 'bg-cream-50 text-ink-700 ring-line'}`}>
      {t(`accountSms.statuses.${status}`)}
    </span>
  )
}

function MySmsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [term, setTerm] = useState(params.get('q') ?? '')
  const sortBy = params.get('sortBy') ?? ''
  const sortDir = params.get('sortDir') ?? ''
  const status = params.get('status') ?? ''
  const query = useQuery({
    queryKey: ['my-sms-list', params.toString()],
    queryFn: () =>
      portalApi
        .get<Paginated<PortalSmsMessage>>('/account/sms', { params: Object.fromEntries(params) })
        .then(({ data }) => data),
  })
  const setPage = (nextPage: number) => {
    const next = new URLSearchParams(params)
    next.set('page', String(nextPage))
    setParams(next)
  }
  const setFilter = (updates: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(updates)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    next.set('page', '1')
    setParams(next)
  }
  const sort = (column: string) => {
    const state = nextSort(column, sortBy, sortDir)
    const next = new URLSearchParams(params)
    if (state.sortBy) {
      next.set('sortBy', state.sortBy)
      next.set('sortDir', state.sortDir)
    } else {
      next.delete('sortBy')
      next.delete('sortDir')
    }
    next.set('page', '1')
    setParams(next)
  }
  const search = () => {
    const input = document.querySelector<HTMLInputElement>('[data-list-search]')
    const text = (input?.value ?? term).trim()
    const next = new URLSearchParams(params)
    if (text) next.set('q', text)
    else next.delete('q')
    next.set('page', '1')
    setParams(next)
  }
  const rows = query.data?.items ?? []
  const filtered = Boolean(params.get('q') || status)
  return (
    <div className={shellClassName}>
      <PageHeader icon={MessageSquareText} title={t('accountSms.title')} subtitle={t('accountSms.subtitle')} />
      <SearchBar
        term={term}
        onTermChange={setTerm}
        onSubmit={search}
        placeholder={t('accountSms.searchPlaceholder')}
        filtersActive={Boolean(status)}
        onClearFilters={() => setFilter({ status: undefined })}
        extra={
          <FormField icon={Send} label={t('accountSms.filterStatus')} htmlFor="my-sms-status">
            <SearchSelect
              id="my-sms-status"
              value={status}
              onChange={(next) => setFilter({ status: next || undefined })}
              placeholder={t('accountSms.allStatuses')}
              options={[
                { value: '', label: t('accountSms.allStatuses') },
                ...SMS_STATUSES.map((item) => ({ value: item, label: t(`accountSms.statuses.${item}`) })),
              ]}
            />
          </FormField>
        }
      />
      <CatalogTable
        loading={query.isLoading}
        error={query.error}
        empty={filtered ? t('accountSms.noResults') : t('accountSms.empty')}
        emptyIcon={MessageSquareText}
        hasRows={rows.length > 0}
      >
        <thead className="bg-cream-50 text-ink-700">
          <tr>
            <SortableTh column="createdAt" label={t('accountSms.sentAt')} sortBy={sortBy} sortDir={sortDir} onSort={sort} />
            <th className="px-4 py-3 text-start font-medium">{t('accountSms.body')}</th>
            <SortableTh column="status" label={t('accountSms.status')} sortBy={sortBy} sortDir={sortDir} onSort={sort} />
            <SortableTh column="source" label={t('accountSms.source')} sortBy={sortBy} sortDir={sortDir} onSort={sort} />
            <th className={`${actionsColClassName} text-start font-medium`}>{t('common.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => {
            const to = `/account/sms/${item.id}`
            return (
              <tr
                key={item.id}
                data-list-row
                tabIndex={0}
                className="cursor-pointer border-t border-line hover:bg-cream-50 focus:outline-none focus-visible:shadow-[inset_0_0_0_2px_#5ed4ce]"
                onClick={() => navigate(to)}
                onKeyDown={(event) => onCatalogRowKeyDown(event, to, navigate)}
              >
                <td className="px-4 py-3">
                  <DateText value={item.createdAt} withTime />
                </td>
                <td className="max-w-md px-4 py-3">
                  <p className="line-clamp-2 whitespace-pre-wrap text-ink-900">{item.body}</p>
                </td>
                <td className="px-4 py-3">
                  <SmsStatusBadge status={item.status} />
                </td>
                <td className="px-4 py-3">{t(`accountSms.sources.${item.source}`)}</td>
                <td className={actionsColClassName}>
                  <ViewAction to={to} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </CatalogTable>
      {query.data ? (
        <CatalogPager page={query.data.page} pageSize={query.data.pageSize} total={query.data.total} onPageChange={setPage} />
      ) : null}
    </div>
  )
}

function MySmsDetailPage() {
  const { t } = useTranslation()
  const { smsId = '' } = useParams()
  const query = useQuery({
    queryKey: ['my-sms', smsId],
    enabled: Boolean(smsId),
    queryFn: () => portalApi.get<PortalSmsMessage>(`/account/sms/${smsId}`).then(({ data }) => data),
  })
  const item = query.data
  return (
    <div className={shellClassName}>
      <PageHeader
        icon={MessageSquareText}
        title={t('accountSms.details')}
        subtitle={item ? <EntityNameSubtitle name={formatDate(item.createdAt)} icon={CalendarDays} /> : undefined}
        backTo="/account/sms"
      />
      {query.isLoading ? <LoadingState /> : null}
      {query.isError ? <ErrorState error={query.error} /> : null}
      {item ? (
        <FormCard icon={MessageSquareText} title={t('accountSms.details')}>
          <div className="space-y-6 p-5 sm:p-6">
            <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
              <FormFactTile
                icon={CalendarDays}
                label={t('accountSms.sentAt')}
                value={<DateText value={item.createdAt} withTime />}
                tone="teal"
              />
              <FormFactTile icon={Phone} label={t('accountSms.phone')} copyValue={item.phone} tone="mint" />
              <FormFactTile icon={Send} label={t('accountSms.status')} value={<SmsStatusBadge status={item.status} />} tone="teal" />
              <FormFactTile
                icon={MessageSquareText}
                label={t('accountSms.source')}
                value={t(`accountSms.sources.${item.source}`)}
                tone="mint"
              />
              <FormFactTile
                icon={FileText}
                label={t('accountSms.body')}
                value={<p className="whitespace-pre-wrap font-normal leading-7">{item.body}</p>}
                className="sm:col-span-2"
              />
            </div>
          </div>
        </FormCard>
      ) : null}
    </div>
  )
}

function NotFoundPage() {
  return <Navigate to="/dashboard" replace />
}

export function PortalParityRoot() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<Protected />}>
            <Route element={<PortalLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/cases/formation" element={<FormationPage />} />
              <Route path="/cases" element={<CasesPage />} />
              <Route path="/cases/:caseId" element={<CaseDetailPage />} />
              <Route path="/cases/:caseId/finance" element={<FinancePage />} />
              <Route path="/cases/:caseId/dossier" element={<CaseDossierPage />} />
              <Route path="/cases/:caseId/stewardship/card" element={<CaseStewardCardPage />} />
              <Route path="/cases/:caseId/stewardship" element={<CaseStewardshipFormationPage />} />
              <Route path="/cases/:caseId/license" element={<CaseLicensePage />} />
              <Route path="/cases/:caseId/auction/new" element={<PortalAuctionNewPage />} />
              <Route path="/cases/:caseId/auction/:requestId" element={<PortalAuctionDetailPage />} />
              <Route path="/cases/:caseId/renewal/:requestId" element={<PortalRenewalPage />} />
              <Route path="/cases/:caseId/location-change/:requestId" element={<PortalLocationChangePage />} />
              <Route path="/violations" element={<MyViolationsPage />} />
              <Route path="/violations/:violationId" element={<MyViolationDetailPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/account/password" element={<PasswordPage />} />
              <Route path="/account/sms" element={<MySmsPage />} />
              <Route path="/account/sms/:smsId" element={<MySmsDetailPage />} />
              <Route path="/base-info" element={<Navigate to="/base-info/job-types" replace />} />
              <Route path="/base-info/job-types" element={<JobTypesCatalogPage />} />
              <Route path="/base-info/job-types/:id" element={<JobTypeCatalogDetailPage />} />
              <Route path="/base-info/job-groups" element={<JobGroupsCatalogPage />} />
              <Route path="/base-info/job-groups/:id" element={<JobGroupCatalogDetailPage />} />
              <Route path="/base-info/jobs" element={<JobsCatalogPage />} />
              <Route path="/base-info/jobs/:id" element={<JobCatalogDetailPage />} />
              <Route path="/issuance/:caseId" element={<IssuancePage />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Toaster position="bottom-center" className="app-toaster" richColors closeButton />
      </AuthProvider>
    </BrowserRouter>
  )
}
