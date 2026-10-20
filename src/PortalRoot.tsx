import {
  BadgeDollarSign,
  BriefcaseBusiness,
  Building2,
  Check,
  ChevronLeft,
  CircleUserRound,
  FileBadge2,
  FileText,
  FolderKanban,
  Gauge,
  KeyRound,
  LogOut,
  MapPin,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Phone,
  Plus,
  Save,
  Search,
  ShieldCheck,
  Upload,
  UserRound,
  X,
  type LucideIcon,
} from 'lucide-react'
import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
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
import { BrowserRouter } from 'react-router-dom'
import { Toaster, toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { clearPortalToken, getPortalToken, setPortalToken } from './lib/auth-token'
import { getApiErrorMessage, portalApi } from './lib/api'
import type {
  CaseDetail,
  CaseSummary,
  IssuanceDocument,
  IssuanceState,
  Lookup,
  PortalUser,
} from './types/portal'

type AuthValue = {
  user: PortalUser | null
  loading: boolean
  login: (identifier: string, password: string) => Promise<void>
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
        const { data } = await portalApi.post<{
          accessToken: string
          user: PortalUser
        }>('/auth/login', { identifier, password })
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

function Protected() {
  const { user, loading } = useAuth()
  const { t } = useTranslation()
  if (loading) return <div className="screen-center">{t('app.loading')}</div>
  return user ? <Outlet /> : <Navigate to="/login" replace />
}

const navItems: Array<{ to: string; label: string; icon: LucideIcon; end?: boolean }> = [
  { to: '/dashboard', label: 'nav.dashboard', icon: Gauge, end: true },
  { to: '/cases', label: 'nav.cases', icon: FolderKanban },
  { to: '/account', label: 'nav.account', icon: CircleUserRound },
]

function PortalLayout() {
  const { user, logout } = useAuth()
  const { t } = useTranslation()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [desktopOpen, setDesktopOpen] = useState(
    () => localStorage.getItem('asnaf.portal.sidebar-open') !== '0',
  )
  const [menuQuery, setMenuQuery] = useState('')
  const visibleNav = navItems.filter((item) =>
    t(item.label).includes(menuQuery.trim()),
  )
  const setOpen = (open: boolean) => {
    setDesktopOpen(open)
    localStorage.setItem('asnaf.portal.sidebar-open', open ? '1' : '0')
  }
  const pageName =
    navItems.find((item) => location.pathname.startsWith(item.to))?.label ??
    (location.pathname.startsWith('/issuance') ? 'issuance.title' : 'app.title')

  return (
    <div className="portal-shell">
      {mobileOpen ? (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label={t('nav.close')}
          onClick={() => setMobileOpen(false)}
        />
      ) : null}
      <aside className={`portal-sidebar ${mobileOpen ? 'mobile-open' : ''} ${desktopOpen ? '' : 'desktop-closed'}`}>
        <div className="sidebar-inner">
          <div className="sidebar-brand">
            <img src="/head3.png" alt={t('app.title')} />
            <div className="sidebar-controls">
              <button type="button" className="icon-button mobile-only" onClick={() => setMobileOpen(false)} aria-label={t('nav.close')}>
                <X />
              </button>
              <button type="button" className="icon-button desktop-only" onClick={() => setOpen(false)} aria-label={t('nav.close')}>
                <PanelLeftClose />
              </button>
            </div>
          </div>
          <label className="sidebar-search">
            <Search />
            <input value={menuQuery} onChange={(event) => setMenuQuery(event.target.value)} placeholder={t('nav.search')} />
          </label>
          <nav className="nav-card">
            <div className="nav-card-title">
              <span className="nav-icon"><Gauge /></span>
              <span>{t('app.title')}</span>
            </div>
            <div className="nav-card-items">
              {visibleNav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <span>{createElement(item.icon)}</span>
                  {t(item.label)}
                </NavLink>
              ))}
            </div>
          </nav>
          <button type="button" className="logout-button" onClick={logout}>
            <LogOut />
            {t('auth.logout')}
          </button>
        </div>
      </aside>
      <div className="portal-main">
        <header className="portal-topbar">
          <button type="button" className="icon-button mobile-only" onClick={() => setMobileOpen(true)} aria-label={t('nav.open')}>
            <Menu />
          </button>
          {!desktopOpen ? (
            <button type="button" className="icon-button desktop-only" onClick={() => setOpen(true)} aria-label={t('nav.open')}>
              <PanelLeftOpen />
            </button>
          ) : null}
          <div className="breadcrumb">
            <Link to="/dashboard">{t('nav.dashboard')}</Link>
            <ChevronLeft />
            <span>{t(pageName)}</span>
          </div>
          <Link to="/account" className="user-pill">
            <UserRound />
            <span>{user?.fullName}</span>
          </Link>
        </header>
        <main className="portal-content">
          <Outlet />
        </main>
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
    mutationFn: () => login(identifier, password),
    onSuccess: () => navigate('/dashboard', { replace: true }),
    onError: (error) => toast.error(getApiErrorMessage(error, t('auth.loginFailed'))),
  })
  if (user) return <Navigate to="/dashboard" replace />
  return (
    <div className="login-page">
      <form className="login-card" onSubmit={(event) => { event.preventDefault(); mutation.mutate() }}>
        <img src="/head3.png" alt={t('app.title')} className="login-logo" />
        <h1>{t('auth.login')}</h1>
        <FormField icon={UserRound} label={t('auth.identifier')}>
          <input value={identifier} onChange={(event) => setIdentifier(event.target.value)} required autoFocus />
        </FormField>
        <FormField icon={KeyRound} label={t('auth.password')}>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </FormField>
        <Button type="submit" disabled={mutation.isPending} icon={Check}>{t('auth.submit')}</Button>
      </form>
    </div>
  )
}

function PageHeader({ icon, title, subtitle, action, backTo }: {
  icon: LucideIcon
  title: string
  subtitle?: string
  action?: ReactNode
  backTo?: string
}) {
  const { t } = useTranslation()
  return (
    <header className="page-header">
      <div className="header-leading">
        {backTo ? <Link className="back-icon" to={backTo} aria-label={t('common.back')}><ChevronLeft /></Link> : null}
        <span className="entity-icon">{createElement(icon)}</span>
        <div><h1>{title}</h1>{subtitle ? <p>{subtitle}</p> : null}</div>
      </div>
      {action ? <div>{action}</div> : null}
    </header>
  )
}

function FormCard({ icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) {
  return (
    <section className="form-card">
      <div className="form-card-header"><span>{createElement(icon)}</span><h2>{title}</h2></div>
      <div className="form-card-body">{children}</div>
    </section>
  )
}

function FormField({ icon, label, children }: { icon: LucideIcon; label: string; children: ReactNode }) {
  return <label className="form-field"><span className="field-label">{createElement(icon)}{label}</span>{children}</label>
}

function Button({ children, icon, variant = 'primary', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: LucideIcon
  variant?: 'primary' | 'ghost' | 'soft'
}) {
  return <button className={`button ${variant}`} {...props}>{icon ? createElement(icon) : null}{children}</button>
}

function Loading() {
  const { t } = useTranslation()
  return <div className="state-card">{t('app.loading')}</div>
}

function ErrorState({ error }: { error: unknown }) {
  const { t } = useTranslation()
  return <div className="state-card error">{getApiErrorMessage(error, t('app.error'))}</div>
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('fa-IR-u-ca-persian', { year: 'numeric', month: 'numeric', day: 'numeric' }).format(new Date(value))
}

function formatNumber(value: number | string | null | undefined) {
  if (value == null) return '—'
  return new Intl.NumberFormat('fa-IR').format(Number(value))
}

function statusLabel(value: string, translate: (key: string) => string) {
  const translated = translate(`status.${value}`)
  return translated === `status.${value}` ? value : translated
}

function DashboardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const cases = useQuery({
    queryKey: ['cases', 'dashboard'],
    queryFn: () => portalApi.get<{ items: CaseSummary[]; total: number }>('/cases?page=1&pageSize=5').then(({ data }) => data),
  })
  const start = useMutation({
    mutationFn: () => portalApi.post<IssuanceState>('/issuance').then(({ data }) => data),
    onSuccess: (data) => navigate(`/issuance/${data.case.id}`),
    onError: (error) => toast.error(getApiErrorMessage(error, t('app.error'))),
  })
  return (
    <div className="page-stack">
      <PageHeader icon={Gauge} title={t('dashboard.title')} subtitle={t('dashboard.subtitle')} action={
        <Button icon={Plus} variant="soft" onClick={() => start.mutate()}>{t('dashboard.newIssuance')}</Button>
      } />
      <div className="stat-grid">
        <div className="stat-card"><FolderKanban /><div><strong>{formatNumber(cases.data?.total ?? 0)}</strong><span>{t('dashboard.cases')}</span></div></div>
        <div className="stat-card mint"><ShieldCheck /><div><strong>{formatNumber(cases.data?.items.filter((item) => item.status === 'ACTIVE').length ?? 0)}</strong><span>{t('dashboard.active')}</span></div></div>
      </div>
      <FormCard icon={FolderKanban} title={t('cases.title')}>
        {cases.isLoading ? <Loading /> : cases.isError ? <ErrorState error={cases.error} /> : (
          <div className="compact-list">
            {cases.data?.items.map((item) => <Link key={item.id} to={`/cases/${item.id}`}><span>{item.businessUnitTitle ?? item.trackingCode}</span><ChevronLeft /></Link>)}
          </div>
        )}
      </FormCard>
    </div>
  )
}

function CasesPage() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const [term, setTerm] = useState(params.get('q') ?? '')
  const page = Math.max(1, Number(params.get('page') ?? 1))
  const sortBy = params.get('sortBy') ?? ''
  const sortDir = params.get('sortDir') ?? ''
  const query = useQuery({
    queryKey: ['cases', params.toString()],
    queryFn: () => portalApi.get<{ items: CaseSummary[]; total: number; page: number; pageSize: number }>('/cases', { params: Object.fromEntries(params) }).then(({ data }) => data),
  })
  const search = (event: FormEvent) => {
    event.preventDefault()
    const next = new URLSearchParams(params)
    if (term.trim()) next.set('q', term.trim())
    else next.delete('q')
    next.set('page', '1')
    setParams(next)
  }
  const sort = (column: string) => {
    const next = new URLSearchParams(params)
    if (sortBy !== column) { next.set('sortBy', column); next.set('sortDir', 'asc') }
    else if (sortDir === 'asc') next.set('sortDir', 'desc')
    else { next.delete('sortBy'); next.delete('sortDir') }
    next.set('page', '1')
    setParams(next)
  }
  return (
    <div className="page-stack">
      <PageHeader icon={FolderKanban} title={t('cases.title')} subtitle={t('cases.subtitle')} />
      <form className="search-bar" onSubmit={search}>
        <div><Search /><input data-list-search value={term} onChange={(event) => setTerm(event.target.value)} placeholder={t('cases.search')} autoFocus /></div>
        <Button type="submit" icon={Search}>{t('cases.searchButton')}</Button>
      </form>
      <section className="table-card">
        {query.isLoading ? <Loading /> : query.isError ? <ErrorState error={query.error} /> : (
          <>
            <div className="table-scroll">
              <table><thead><tr>
                <SortableTh label={t('cases.trackingCode')} active={sortBy === 'createdAt'} dir={sortDir} onClick={() => sort('createdAt')} />
                <SortableTh label={t('cases.licenseNumber')} active={sortBy === 'licenseNumber'} dir={sortDir} onClick={() => sort('licenseNumber')} />
                <th>{t('cases.activity')}</th><SortableTh label={t('cases.status')} active={sortBy === 'status'} dir={sortDir} onClick={() => sort('status')} />
                <th className="actions-th" />
              </tr></thead><tbody>
                {query.data?.items.map((item) => <tr key={item.id}>
                  <td>{item.trackingCode ?? '—'}</td><td>{item.licenseNumber ?? t('cases.noLicense')}</td><td>{item.activityJob?.title ?? '—'}</td>
                  <td><span className="status-chip">{statusLabel(item.status, t)}</span></td>
                  <td className="actions-cell"><Link className="button ghost small" to={`/cases/${item.id}`}><FileText />{t('common.view')}</Link></td>
                </tr>)}
              </tbody></table>
            </div>
            <div className="pagination">
              <span>{t('common.page')} {formatNumber(page)}</span>
              <div>
                <Button variant="ghost" disabled={page <= 1} onClick={() => { const next = new URLSearchParams(params); next.set('page', String(page - 1)); setParams(next) }}>{t('common.previous')}</Button>
                <Button variant="ghost" disabled={page * 10 >= (query.data?.total ?? 0)} onClick={() => { const next = new URLSearchParams(params); next.set('page', String(page + 1)); setParams(next) }}>{t('common.next')}</Button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  )
}

function SortableTh({ label, active, dir, onClick }: { label: string; active: boolean; dir: string; onClick: () => void }) {
  return <th aria-sort={active ? (dir === 'desc' ? 'descending' : 'ascending') : 'none'}><button type="button" className="sort-button" onClick={onClick}>{label}<span>{active ? (dir === 'desc' ? '↓' : '↑') : '↕'}</span></button></th>
}

function CaseDetailPage() {
  const { caseId = '' } = useParams()
  const { t } = useTranslation()
  const query = useQuery({ queryKey: ['case', caseId], queryFn: () => portalApi.get<CaseDetail>(`/cases/${caseId}`).then(({ data }) => data) })
  if (query.isLoading) return <Loading />
  if (query.isError || !query.data) return <ErrorState error={query.error} />
  const item = query.data
  return (
    <div className="page-stack">
      <PageHeader icon={FileBadge2} title={t('cases.details')} subtitle={item.businessUnitTitle ?? item.trackingCode ?? undefined} backTo="/cases" />
      <FormCard icon={BriefcaseBusiness} title={item.businessUnitTitle ?? t('cases.details')}>
        <div className="fact-grid">
          <Fact icon={FileText} label={t('cases.trackingCode')} value={item.trackingCode} />
          <Fact icon={FileBadge2} label={t('cases.licenseNumber')} value={item.licenseNumber ?? t('cases.noLicense')} />
          <Fact icon={BriefcaseBusiness} label={t('cases.activity')} value={item.activityJob?.title} />
          <Fact icon={MapPin} label={t('issuance.address')} value={item.premiseAddress} />
        </div>
      </FormCard>
      <FormCard icon={FileText} title={t('cases.requests')}>
        <div className="compact-list">{item.requests.map((request) => <div key={request.id}><span>{request.number} — {statusLabel(request.status, t)}</span><span>{formatDate(request.createdAt)}</span></div>)}</div>
      </FormCard>
      <div className="action-row">
        <Link className="button ghost" to={`/cases/${caseId}/finance`}><BadgeDollarSign />{t('cases.finance')}</Link>
        <Button variant="soft" disabled title={t('cases.future')}>{t('cases.renewal')}</Button>
        <Button variant="soft" disabled title={t('cases.future')}>{t('cases.auction.title')}</Button>
        <Button variant="soft" disabled title={t('cases.future')}>{t('cases.requestTypes.STEWARDSHIP')}</Button>
        {item.licenseNumber ? null : <Link className="button primary" to={`/issuance/${caseId}`}><FileBadge2 />{t('issuance.title')}</Link>}
      </div>
    </div>
  )
}

function Fact({ icon, label, value }: { icon: LucideIcon; label: string; value?: ReactNode }) {
  return <div className="fact-tile"><span>{createElement(icon)}</span><div><small>{label}</small><strong>{value || '—'}</strong></div></div>
}

type FinanceData = {
  requests: Array<{ id: string; number: string; type: string; finance: null | { bankAccount: { bankName: string; accountNumber: string }; fees: Array<{ id: string; title: string; amount: string }> } }>
  payments: Array<{ id: string; receiptNumber: string; finalAmount: string; status: string; paidAt: string }>
}

function FinancePage() {
  const { caseId = '' } = useParams()
  const { t } = useTranslation()
  const query = useQuery({ queryKey: ['finance', caseId], queryFn: () => portalApi.get<FinanceData>(`/cases/${caseId}/finance`).then(({ data }) => data) })
  if (query.isLoading) return <Loading />
  if (query.isError || !query.data) return <ErrorState error={query.error} />
  return <div className="page-stack">
    <PageHeader icon={BadgeDollarSign} title={t('finance.title')} subtitle={t('finance.subtitle')} backTo={`/cases/${caseId}`} />
    <FormCard icon={BadgeDollarSign} title={t('finance.fees')}><div className="compact-list">
      {query.data.requests.flatMap((request) => request.finance?.fees ?? []).map((fee) => <div key={fee.id}><span>{fee.title}</span><strong>{formatNumber(fee.amount)} {t('common.toman')}</strong></div>)}
      {!query.data.requests.some((request) => request.finance?.fees.length) ? <p>{t('app.empty')}</p> : null}
    </div></FormCard>
    <FormCard icon={FileText} title={t('finance.payments')}><div className="compact-list">
      {query.data.payments.map((payment) => <div key={payment.id}><span>{payment.receiptNumber}</span><strong>{formatNumber(payment.finalAmount)} — {formatDate(payment.paidAt)}</strong></div>)}
      {!query.data.payments.length ? <p>{t('app.empty')}</p> : null}
    </div></FormCard>
  </div>
}

type Account = {
  fullName: string; nationalId: string | null; phone: string | null; email: string | null; address: string | null
}

function AccountPage() {
  const { t } = useTranslation()
  const account = useQuery({ queryKey: ['account'], queryFn: () => portalApi.get<Account>('/account').then(({ data }) => data) })
  if (account.isLoading) return <Loading />
  if (account.isError || !account.data) return <ErrorState error={account.error} />
  return <div className="page-stack">
    <PageHeader icon={CircleUserRound} title={t('account.title')} subtitle={t('account.subtitle')} />
    <AccountEditor initial={account.data} />
  </div>
}

function AccountEditor({ initial }: { initial: Account }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [phone, setPhone] = useState(initial.phone ?? '')
  const [email, setEmail] = useState(initial.email ?? '')
  const [address, setAddress] = useState(initial.address ?? '')
  const save = useMutation({
    mutationFn: () => portalApi.patch('/account', { phone, email, address }),
    onSuccess: () => { toast.success(t('account.saved')); void queryClient.invalidateQueries({ queryKey: ['account'] }) },
    onError: (error) => toast.error(getApiErrorMessage(error, t('app.error'))),
  })
  return <FormCard icon={CircleUserRound} title={initial.fullName}><form className="form-grid" onSubmit={(event) => { event.preventDefault(); save.mutate() }}>
    <Fact icon={UserRound} label={t('account.fullName')} value={initial.fullName} />
    <Fact icon={FileBadge2} label={t('account.nationalId')} value={initial.nationalId} />
    <FormField icon={Phone} label={t('account.phone')}><input className="digit-field" value={phone} onChange={(event) => setPhone(event.target.value)} /></FormField>
    <FormField icon={FileText} label={t('account.email')}><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></FormField>
    <FormField icon={MapPin} label={t('account.address')}><textarea value={address} onChange={(event) => setAddress(event.target.value)} /></FormField>
    <div className="form-actions"><Button type="submit" icon={Check}>{t('account.save')}</Button><Link className="button ghost" to="/account/password"><KeyRound />{t('account.changePassword')}</Link></div>
  </form></FormCard>
}

function PasswordPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const mutation = useMutation({
    mutationFn: () => portalApi.post('/account/password', { currentPassword, newPassword }),
    onSuccess: () => { toast.success(t('account.passwordChanged')); navigate('/account') },
    onError: (error) => toast.error(getApiErrorMessage(error, t('app.error'))),
  })
  return <div className="page-stack">
    <PageHeader icon={KeyRound} title={t('account.changePassword')} backTo="/account" />
    <FormCard icon={KeyRound} title={t('account.changePassword')}><form className="form-grid single" onSubmit={(event) => { event.preventDefault(); mutation.mutate() }}>
      <FormField icon={KeyRound} label={t('account.currentPassword')}><input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required /></FormField>
      <FormField icon={ShieldCheck} label={t('account.newPassword')}><input type="password" minLength={8} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required /></FormField>
      <div className="form-actions"><Button type="submit" icon={Check}>{t('common.save')}</Button><Button type="button" variant="ghost" icon={X} onClick={() => navigate('/account')}>{t('common.cancel')}</Button></div>
    </form></FormCard>
  </div>
}

function SearchSelect({ icon, label, value, onChange, options, required }: {
  icon: LucideIcon; label: string; value: string; onChange: (value: string) => void; options: Lookup[]; required?: boolean
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const anchor = useRef<HTMLButtonElement>(null)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const selected = options.find((option) => option.id === value)
  const filtered = options.filter((option) => (option.title ?? option.name ?? option.nameFa ?? '').includes(query))
  const show = () => { setRect(anchor.current?.getBoundingClientRect() ?? null); setOpen(true) }
  return <div className="form-field"><span className="field-label">{createElement(icon)}{label}</span>
    <button ref={anchor} type="button" className="select-trigger" onClick={show}>{selected?.title ?? selected?.name ?? selected?.nameFa ?? t('issuance.select')}</button>
    {required ? <input className="hidden-validation" value={value} required readOnly tabIndex={-1} /> : null}
    {open && rect ? createPortal(<div className="select-overlay" onMouseDown={() => setOpen(false)}>
      <div className="select-panel" style={{ top: rect.bottom + 6, left: rect.left, width: rect.width }} onMouseDown={(event) => event.stopPropagation()}>
        <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('cases.searchButton')} />
        <div>{filtered.map((option) => <button type="button" key={option.id} onClick={() => { onChange(option.id); setOpen(false); setQuery('') }}>{option.title ?? option.name ?? option.nameFa}</button>)}</div>
      </div>
    </div>, document.body) : null}
  </div>
}

function FileDropField({ label, onFile }: { label: string; onFile: (file: File) => void }) {
  const { t } = useTranslation()
  const input = useRef<HTMLInputElement>(null)
  return <div className="file-drop" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const file = event.dataTransfer.files[0]; if (file) onFile(file) }}>
    <Upload /><span>{label}</span><Button type="button" variant="ghost" onClick={() => input.current?.click()}>{t('issuance.selectFile')}</Button>
    <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" hidden onChange={(event) => { const file = event.target.files?.[0]; if (file) onFile(file) }} />
  </div>
}

function IssuancePage() {
  const { caseId = '' } = useParams()
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const state = useQuery({ queryKey: ['issuance', caseId], queryFn: () => portalApi.get<IssuanceState>(`/issuance/${caseId}`).then(({ data }) => data) })
  const requirements = useQuery({ queryKey: ['issuance-requirements', caseId], queryFn: () => portalApi.get<{ identity: Array<{ isRequired: boolean; document: Lookup }>; activity: Array<{ isRequired: boolean; document: Lookup }> }>(`/issuance/${caseId}/requirements`).then(({ data }) => data) })
  const countries = useLookup('/lookups/countries')
  const jobs = useLookup('/lookups/jobs')
  const cities = useLookup('/lookups/cities')
  const complexes = useLookup('/lookups/commercial-complexes')
  const places = useLookup('/lookups/registration-places')
  const [active, setActive] = useState<number | null>(null)
  const refresh = () => { void queryClient.invalidateQueries({ queryKey: ['issuance', caseId] }); void queryClient.invalidateQueries({ queryKey: ['issuance-requirements', caseId] }) }
  if (state.isLoading) return <Loading />
  if (state.isError || !state.data) return <ErrorState error={state.error} />
  const data = state.data
  const currentActive = active ?? Math.min(data.case.formationStep, 3)
  const steps = [
    ['issuance.identity', UserRound], ['issuance.activity', BriefcaseBusiness], ['issuance.location', MapPin],
    ['issuance.inquiries', ShieldCheck], ['issuance.places', Building2], ['issuance.management', CircleUserRound], ['issuance.issue', FileBadge2],
  ] as const
  return <div className="page-stack">
    <PageHeader icon={FileBadge2} title={t('issuance.title')} subtitle={t('issuance.subtitle')} backTo={`/cases/${caseId}`} />
    <div className="wizard-steps">{steps.map(([label, Icon], index) => <button key={label} type="button" disabled={index > Math.max(3, data.case.formationStep)} className={`${currentActive === index ? 'active' : ''} ${index < data.case.formationStep ? 'done' : ''}`} onClick={() => setActive(index)}><span>{index < data.case.formationStep ? <Check /> : <Icon />}</span><small>{t(label)}</small></button>)}</div>
    {currentActive === 0 ? <IdentityStep data={data} countries={countries} caseId={caseId} onSaved={() => { refresh(); setActive(1) }} /> : null}
    {currentActive === 1 ? <ActivityStep data={data} jobs={jobs} caseId={caseId} onSaved={() => { refresh(); setActive(2) }} /> : null}
    {currentActive === 2 ? <LocationStep data={data} cities={cities} complexes={complexes} places={places} caseId={caseId} onSaved={refresh} requirements={requirements.data} /> : null}
    {currentActive >= 3 ? <OrganizationStep caseId={caseId} active={currentActive} /> : null}
  </div>
}

function useLookup(url: string) {
  const query = useQuery({ queryKey: ['lookup', url], queryFn: () => portalApi.get<Lookup[]>(url).then(({ data }) => data), staleTime: 300_000 })
  return query.data ?? []
}

function IdentityStep({ data, countries, caseId, onSaved }: { data: IssuanceState; countries: Lookup[]; caseId: string; onSaved: () => void }) {
  const { t } = useTranslation()
  const [form, setForm] = useState(() => ({ firstName: data.identity.firstName, lastName: data.identity.lastName, fatherName: data.identity.fatherName ?? '', phone: data.identity.phone ?? '', email: data.identity.email ?? '', address: data.identity.address ?? '', postalCode: data.identity.postalCode ?? '', countryId: data.identity.countryId ?? '' }))
  const mutation = useMutation({ mutationFn: () => portalApi.patch(`/issuance/${caseId}/identity`, form), onSuccess: onSaved, onError: (error) => toast.error(getApiErrorMessage(error, t('app.error'))) })
  return <FormCard icon={UserRound} title={t('issuance.identity')}><form className="form-grid" onSubmit={(event) => { event.preventDefault(); mutation.mutate() }}>
    <FormField icon={UserRound} label={t('issuance.firstName')}><input value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} required disabled={!data.editable} /></FormField>
    <FormField icon={UserRound} label={t('issuance.lastName')}><input value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} required disabled={!data.editable} /></FormField>
    <FormField icon={UserRound} label={t('issuance.fatherName')}><input value={form.fatherName} onChange={(event) => setForm({ ...form, fatherName: event.target.value })} disabled={!data.editable} /></FormField>
    <SearchSelect icon={MapPin} label={t('issuance.nationality')} value={form.countryId} onChange={(countryId) => setForm({ ...form, countryId })} options={countries} />
    <FormField icon={Phone} label={t('account.phone')}><input className="digit-field" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} disabled={!data.editable} /></FormField>
    <FormField icon={MapPin} label={t('account.address')}><textarea value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} disabled={!data.editable} /></FormField>
    {data.editable ? <div className="form-actions"><Button type="submit" icon={Check}>{t('issuance.saveContinue')}</Button><Link className="button ghost" to={`/cases/${caseId}`}><X />{t('common.cancel')}</Link></div> : <p>{t('issuance.locked')}</p>}
  </form></FormCard>
}

function ActivityStep({ data, jobs, caseId, onSaved }: { data: IssuanceState; jobs: Lookup[]; caseId: string; onSaved: () => void }) {
  const { t } = useTranslation()
  const file = data.case as Record<string, unknown>
  const [title, setTitle] = useState(String(file.businessUnitTitle ?? ''))
  const [jobId, setJobId] = useState(String(file.activityJobId ?? ''))
  const mutation = useMutation({ mutationFn: () => portalApi.patch(`/issuance/${caseId}/activity`, { businessUnitTitle: title, jobId }), onSuccess: onSaved, onError: (error) => toast.error(getApiErrorMessage(error, t('app.error'))) })
  return <FormCard icon={BriefcaseBusiness} title={t('issuance.activity')}><form className="form-grid" onSubmit={(event) => { event.preventDefault(); mutation.mutate() }}>
    <FormField icon={Building2} label={t('issuance.businessUnitTitle')}><input value={title} onChange={(event) => setTitle(event.target.value)} required disabled={!data.editable} /></FormField>
    <SearchSelect icon={BriefcaseBusiness} label={t('issuance.job')} value={jobId} onChange={setJobId} options={jobs} required />
    {data.editable ? <div className="form-actions"><Button type="submit" icon={Check}>{t('issuance.saveContinue')}</Button><Button type="button" variant="ghost" icon={X} onClick={() => history.back()}>{t('common.cancel')}</Button></div> : <p>{t('issuance.locked')}</p>}
  </form></FormCard>
}

function LocationStep({ data, cities, complexes, places, caseId, onSaved, requirements }: {
  data: IssuanceState; cities: Lookup[]; complexes: Lookup[]; places: Lookup[]; caseId: string; onSaved: () => void
  requirements?: { identity: Array<{ isRequired: boolean; document: Lookup }>; activity: Array<{ isRequired: boolean; document: Lookup }> }
}) {
  const { t } = useTranslation()
  const file = data.case as Record<string, unknown>
  const [form, setForm] = useState(() => ({
    cityId: String(file.premiseCityId ?? ''), establishment: String(file.premiseEstablishment ?? 'INDEPENDENT'),
    complexId: String(file.premiseComplexId ?? ''), address: String(file.premiseAddress ?? ''), ownership: String(file.premiseOwnership ?? 'OWNED'),
    registrationPlaceId: String(file.registrationPlaceId ?? ''), area: Number(file.premiseArea ?? 0),
  }))
  const mutation = useMutation({ mutationFn: () => portalApi.patch(`/issuance/${caseId}/location`, form), onSuccess: onSaved, onError: (error) => toast.error(getApiErrorMessage(error, t('app.error'))) })
  const submit = useMutation({ mutationFn: () => portalApi.post(`/issuance/${caseId}/submit`), onSuccess: () => { toast.success(t('issuance.submitted')); onSaved() }, onError: (error) => toast.error(getApiErrorMessage(error, t('app.error'))) })
  return <div className="page-stack"><FormCard icon={MapPin} title={t('issuance.location')}><form className="form-grid" onSubmit={(event) => { event.preventDefault(); mutation.mutate() }}>
    <SearchSelect icon={MapPin} label={t('issuance.city')} value={form.cityId} onChange={(cityId) => setForm({ ...form, cityId })} options={cities} required />
    <SearchSelect icon={Building2} label={t('issuance.establishment')} value={form.establishment} onChange={(establishment) => setForm({ ...form, establishment })} options={[{ id: 'INDEPENDENT', title: t('issuance.independent') }, { id: 'COMMERCIAL_COMPLEX', title: t('issuance.commercialEstablishment') }, { id: 'RESIDENTIAL_COMPLEX', title: t('issuance.residentialEstablishment') }]} required />
    {form.establishment === 'COMMERCIAL_COMPLEX' ? <SearchSelect icon={Building2} label={t('issuance.complex')} value={form.complexId} onChange={(complexId) => setForm({ ...form, complexId })} options={complexes} required /> : null}
    <SearchSelect icon={FileText} label={t('issuance.registrationPlace')} value={form.registrationPlaceId} onChange={(registrationPlaceId) => setForm({ ...form, registrationPlaceId })} options={places} />
    <FormField icon={MapPin} label={t('issuance.address')}><textarea value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} required disabled={!data.editable} /></FormField>
    <SearchSelect icon={FileBadge2} label={t('issuance.ownership')} value={form.ownership} onChange={(ownership) => setForm({ ...form, ownership })} options={[{ id: 'OWNED', title: t('issuance.owned') }, { id: 'RENTED', title: t('issuance.rented') }]} required />
    <FormField icon={Building2} label={t('issuance.area')}><input type="number" min={0} value={form.area} onChange={(event) => setForm({ ...form, area: Number(event.target.value) })} required disabled={!data.editable} /></FormField>
    {data.editable ? <div className="form-actions"><Button type="submit" icon={Save}>{t('common.save')}</Button></div> : null}
  </form></FormCard>
  <FormCard icon={FileText} title={t('issuance.documents')}><DocumentRequirements data={data} caseId={caseId} requirements={requirements} onUploaded={onSaved} /></FormCard>
  {data.editable ? <div className="form-actions"><Button icon={Check} onClick={() => submit.mutate()}>{t('issuance.submit')}</Button><Link className="button ghost" to={`/cases/${caseId}`}><X />{t('common.cancel')}</Link></div> : <p className="state-card">{t('issuance.locked')}</p>}
  </div>
}

function DocumentRequirements({ data, caseId, requirements, onUploaded }: {
  data: IssuanceState; caseId: string
  requirements?: { identity: Array<{ isRequired: boolean; document: Lookup }>; activity: Array<{ isRequired: boolean; document: Lookup }> }
  onUploaded: () => void
}) {
  const { t } = useTranslation()
  const uploadFile = async (scope: 'identity' | 'activity', documentId: string, file: File) => {
    const body = new FormData(); body.set('scope', scope); body.set('documentId', documentId); body.set('file', file)
    try { await portalApi.post(`/issuance/${caseId}/documents`, body); toast.success(t('common.save')); onUploaded() }
    catch (error) { toast.error(getApiErrorMessage(error, t('app.error'))) }
  }
  const openDocument = async (versionId: string) => {
    try {
      const { data: blob } = await portalApi.get<Blob>(`/cases/documents/${versionId}/file`, { responseType: 'blob' })
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank', 'noopener,noreferrer')
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('app.error')))
    }
  }
  const render = (scope: 'identity' | 'activity', item: { isRequired: boolean; document: Lookup }) => {
    const stored = data.documents[scope].find((document: IssuanceDocument) => document.documentId === item.document.id)
    return <div className="document-row" key={`${scope}-${item.document.id}`}><div><strong>{item.document.title}</strong>{item.isRequired ? <small>{t('issuance.required')}</small> : null}{stored?.versions[0] ? <button type="button" className="document-link" onClick={() => void openDocument(stored.versions[0].id)}>{stored.versions[0].originalName}</button> : null}</div>
      {data.editable ? <FileDropField label={String(item.document.title ?? '')} onFile={(file) => void uploadFile(scope, item.document.id, file)} /> : null}
    </div>
  }
  return <div className="documents-list">{requirements?.identity.map((item) => render('identity', item))}{requirements?.activity.map((item) => render('activity', item))}</div>
}

function OrganizationStep({ caseId, active }: { caseId: string; active: number }) {
  const { t } = useTranslation()
  const query = useQuery({ queryKey: ['organization-steps', caseId], queryFn: () => portalApi.get<{ inquiries: Array<{ id: string; status: string; inquiryCenter: { name: string } }>; placesReview: { status: string } | null; managementReviews: Array<{ id: string; status: string; role: { name: string } }>; caseFile: { licenseNumber: string | null } }>(`/issuance/${caseId}/organization-steps`).then(({ data }) => data) })
  if (query.isLoading) return <Loading />
  if (query.isError || !query.data) return <ErrorState error={query.error} />
  const titles = ['issuance.identity', 'issuance.activity', 'issuance.location', 'issuance.inquiries', 'issuance.places', 'issuance.management', 'issuance.issue']
  let content: ReactNode = <p>{t('issuance.locked')}</p>
  if (active === 3) content = <div className="compact-list">{query.data.inquiries.map((row) => <div key={row.id}><span>{row.inquiryCenter.name}</span><strong>{statusLabel(row.status, t)}</strong></div>)}</div>
  if (active === 4) content = <Fact icon={ShieldCheck} label={t('issuance.places')} value={query.data.placesReview ? statusLabel(query.data.placesReview.status, t) : t('issuance.awaitingReferral')} />
  if (active === 5) content = <div className="compact-list">{query.data.managementReviews.map((row) => <div key={row.id}><span>{row.role.name}</span><strong>{statusLabel(row.status, t)}</strong></div>)}</div>
  if (active === 6) content = <Fact icon={FileBadge2} label={t('cases.licenseNumber')} value={query.data.caseFile.licenseNumber ?? t('issuance.awaitingIssuance')} />
  return <FormCard icon={ShieldCheck} title={t(titles[active])}>{content}</FormCard>
}

function NotFoundPage() {
  return <Navigate to="/dashboard" replace />
}

export function PortalRoot() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<Protected />}>
            <Route element={<PortalLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/cases" element={<CasesPage />} />
              <Route path="/cases/:caseId" element={<CaseDetailPage />} />
              <Route path="/cases/:caseId/finance" element={<FinancePage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/account/password" element={<PasswordPage />} />
              <Route path="/issuance/:caseId" element={<IssuancePage />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Toaster position="bottom-center" className="app-toaster" richColors />
      </AuthProvider>
    </BrowserRouter>
  )
}
