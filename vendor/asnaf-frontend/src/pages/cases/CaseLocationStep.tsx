import type { LucideIcon } from 'lucide-react'
import {
  Building2,
  CalendarDays,
  Copy,
  FileText,
  Hash,
  KeyRound,
  Landmark,
  Languages,
  MapPin,
  Phone,
  Ruler,
  Signpost,
  Store,
  Users,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { AppForm, Button, FormField, inputClassName } from '../../components/ui/Form'
import { FormSectionTitle } from '../../components/ui/FormLayout'
import { PersianDateField } from '../../components/ui/PersianDateField'
import { SearchSelect } from '../../components/ui/SearchSelect'
import { geoName } from '../../lib/geo'
import type { City, RegistrationPlace } from '../../types/app'
import {
  PREMISE_ESTABLISHMENTS,
  PREMISE_GEO_POSITIONS,
  PREMISE_OWNERSHIPS,
  PREMISE_PUBLIC_ACCESSES,
  type LocationForm,
} from './formation-types'

export type LocationSectionKey = 'place' | 'ownership' | 'lease' | 'contact' | 'position'

function LocationSection({
  icon,
  title,
  children,
  className = 'grid gap-4 sm:grid-cols-2',
  action,
}: {
  icon: LucideIcon
  title: string
  children: ReactNode
  className?: string
  action?: ReactNode
}) {
  return (
    <section className="rounded-2xl border border-teal-100 bg-cream-50/60 p-4">
      <FormSectionTitle icon={icon}>
        <span className="min-w-0">{title}</span>
        {action ? <span className="ms-auto shrink-0">{action}</span> : null}
      </FormSectionTitle>
      <div className={className}>{children}</div>
    </section>
  )
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

export function CaseLocationStep({
  value,
  cities,
  complexes,
  places,
  locale,
  onChange,
  onSubmit,
  actions,
  hideRegistrationPlace = false,
  locked = false,
  onUseCurrentSection,
}: {
  value: LocationForm
  cities: City[]
  complexes: Array<{ id: string; name: string }>
  places: RegistrationPlace[]
  locale: string
  onChange: (patch: Partial<LocationForm>) => void
  onSubmit: () => void
  actions?: ReactNode
  /** در تغییر مکان، محل ثبت پرونده ثابت است و نشان داده نمی‌شود */
  hideRegistrationPlace?: boolean
  locked?: boolean
  onUseCurrentSection?: (section: LocationSectionKey) => void
}) {
  const { t } = useTranslation()
  const commercialComplex = value.establishment === 'COMMERCIAL_COMPLEX'
  const rented = value.ownership === 'RENTED'
  const useCurrent = (section: LocationSectionKey) =>
    onUseCurrentSection ? (
      <Button
        type="button"
        variant="ghost"
        className="px-3 py-1.5 text-xs whitespace-nowrap"
        onClick={() => onUseCurrentSection(section)}
      >
        <Copy className="size-3.5" aria-hidden />
        {t('cases.useCurrentSection')}
      </Button>
    ) : null

  return (
    <AppForm
      onSubmit={(event) => {
        event.preventDefault()
        if (!locked) onSubmit()
      }}
      className="space-y-4"
    >
      <fieldset disabled={locked} className="min-w-0 space-y-4 border-0 p-0">
      <LocationSection icon={MapPin} title={t('cases.locationSections.place')} className="grid gap-4" action={useCurrent('place')}>
        <div className="grid items-end gap-4 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
          <FormField icon={MapPin} label={t('cases.premiseCity')} htmlFor="case-premise-city">
            <SearchSelect
              id="case-premise-city"
              value={value.cityId}
              onChange={(next) => onChange({ cityId: next })}
              placeholder={t('users.selectOptional')}
              options={cities.map((city) => ({
                value: city.id,
                label: city.province
                  ? `${geoName(city, locale)}، ${geoName(city.province, locale)}`
                  : geoName(city, locale),
              }))}
            />
          </FormField>
          <div className={`grid min-w-0 items-end gap-4 ${commercialComplex ? 'sm:grid-cols-2' : ''}`}>
            <FormField icon={Store} label={t('cases.establishment')} htmlFor="case-establishment">
              <ChoicePills
                id="case-establishment"
                value={value.establishment}
                onChange={(next) =>
                  onChange({
                    establishment: next,
                    complexId: next === 'COMMERCIAL_COMPLEX' ? value.complexId : '',
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
                  value={value.complexId}
                  onChange={(next) => onChange({ complexId: next })}
                  placeholder={t('users.selectOptional')}
                  options={[
                    { value: '', label: t('users.selectOptional') },
                    ...complexes.map((item) => ({ value: item.id, label: item.name })),
                  ]}
                />
              </FormField>
            ) : null}
          </div>
        </div>
        <FormField icon={MapPin} label={t('cases.premiseAddress')} htmlFor="case-premise-address">
          <textarea
            id="case-premise-address"
            required
            rows={2}
            className={inputClassName()}
            value={value.address}
            onChange={(event) => onChange({ address: event.target.value })}
          />
        </FormField>
        <FormField icon={Languages} label={t('cases.premiseAddressEn')} htmlFor="case-premise-address-en">
          <textarea
            id="case-premise-address-en"
            rows={2}
            dir="ltr"
            className={`${inputClassName()} latin-field`}
            value={value.addressEn}
            onChange={(event) => onChange({ addressEn: event.target.value })}
          />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-4">
          <FormField icon={Building2} label={t('cases.floor')} htmlFor="case-floor">
            <input
              id="case-floor"
              className={inputClassName()}
              value={value.floor}
              onChange={(event) => onChange({ floor: event.target.value })}
            />
          </FormField>
          <FormField icon={Hash} label={t('cases.plaqueSeries')} htmlFor="case-plaque-series">
            <input
              id="case-plaque-series"
              className={inputClassName()}
              value={value.plaqueSeries}
              onChange={(event) => onChange({ plaqueSeries: event.target.value })}
            />
          </FormField>
          <FormField icon={Hash} label={t('cases.plaque')} htmlFor="case-plaque">
            <input
              id="case-plaque"
              className={inputClassName()}
              value={value.plaque}
              onChange={(event) => onChange({ plaque: event.target.value })}
            />
          </FormField>
          <FormField icon={Hash} label={t('cases.unitNo')} htmlFor="case-unit-no">
            <input
              id="case-unit-no"
              className={`${inputClassName()} digit-field`}
              value={value.unitNo}
              onChange={(event) => onChange({ unitNo: event.target.value })}
            />
          </FormField>
        </div>
      </LocationSection>

      <LocationSection icon={KeyRound} title={t('cases.locationSections.ownership')} className="grid items-end gap-4 sm:grid-cols-3" action={useCurrent('ownership')}>
        <FormField icon={KeyRound} label={t('cases.ownership')} htmlFor="case-ownership">
          <ChoicePills
            id="case-ownership"
            value={value.ownership}
            onChange={(next) => onChange({ ownership: next })}
            options={PREMISE_OWNERSHIPS.map((item) => ({
              value: item,
              label: t(`cases.ownerships.${item}`),
            }))}
          />
        </FormField>
        <FormField icon={Ruler} label={t('cases.buildingArea')} htmlFor="case-area">
          <input
            id="case-area"
            required
            type="number"
            min={0}
            className={`${inputClassName()} digit-field`}
            value={value.area}
            onChange={(event) => onChange({ area: event.target.value })}
          />
        </FormField>
        <FormField icon={FileText} label={t('cases.deedNo')} htmlFor="case-deed-no">
          <input
            id="case-deed-no"
            className={`${inputClassName()} digit-field`}
            value={value.deedNo}
            onChange={(event) => onChange({ deedNo: event.target.value })}
          />
        </FormField>
      </LocationSection>

      {rented ? (
        <LocationSection icon={FileText} title={t('cases.locationSections.lease')} action={useCurrent('lease')}>
          <FormField icon={CalendarDays} label={t('cases.leaseIssuedAt')} htmlFor="case-lease-issued">
            <PersianDateField
              id="case-lease-issued"
              value={value.leaseIssuedAt || undefined}
              onChange={(next) => onChange({ leaseIssuedAt: next ?? '' })}
            />
          </FormField>
          <FormField icon={CalendarDays} label={t('cases.leaseExpiresAt')} htmlFor="case-lease-expires">
            <PersianDateField
              id="case-lease-expires"
              value={value.leaseExpiresAt || undefined}
              onChange={(next) => onChange({ leaseExpiresAt: next ?? '' })}
            />
          </FormField>
          <FormField icon={Store} label={t('cases.leaseAgency')} htmlFor="case-lease-agency">
            <input
              id="case-lease-agency"
              className={inputClassName()}
              value={value.leaseAgency}
              onChange={(event) => onChange({ leaseAgency: event.target.value })}
            />
          </FormField>
          <FormField icon={Users} label={t('cases.ownerName')} htmlFor="case-owner-name">
            <input
              id="case-owner-name"
              className={inputClassName()}
              value={value.ownerName}
              onChange={(event) => onChange({ ownerName: event.target.value })}
            />
          </FormField>
        </LocationSection>
      ) : null}

      <LocationSection icon={Phone} title={t('cases.locationSections.contact')} className="grid gap-4 sm:grid-cols-3" action={useCurrent('contact')}>
        <FormField icon={Phone} label={t('cases.premisePhone')} htmlFor="case-premise-phone">
          <input
            id="case-premise-phone"
            inputMode="tel"
            className={`${inputClassName()} digit-field`}
            value={value.phone}
            onChange={(event) => onChange({ phone: event.target.value })}
          />
        </FormField>
        <FormField icon={Phone} label={t('cases.premiseFax')} htmlFor="case-premise-fax">
          <input
            id="case-premise-fax"
            inputMode="tel"
            className={`${inputClassName()} digit-field`}
            value={value.fax}
            onChange={(event) => onChange({ fax: event.target.value })}
          />
        </FormField>
        <FormField icon={Hash} label={t('cases.premisePostalCode')} htmlFor="case-premise-postal">
          <input
            id="case-premise-postal"
            inputMode="numeric"
            className={`${inputClassName()} digit-field`}
            value={value.postalCode}
            onChange={(event) => onChange({ postalCode: event.target.value })}
          />
        </FormField>
      </LocationSection>

      <LocationSection
        icon={Signpost}
        title={t('cases.locationSections.position')}
        className={hideRegistrationPlace ? 'grid items-end gap-4 lg:grid-cols-2' : 'grid items-end gap-4 lg:grid-cols-3'}
        action={useCurrent('position')}
      >
        {hideRegistrationPlace ? null : (
          <FormField icon={Landmark} label={t('cases.registrationPlace')} htmlFor="case-registration-place">
            <SearchSelect
              id="case-registration-place"
              value={value.registrationPlaceId}
              onChange={(next) => onChange({ registrationPlaceId: next })}
              placeholder={t('users.selectOptional')}
              options={[
                { value: '', label: t('users.selectOptional') },
                ...places.map((place) => ({ value: place.id, label: place.title })),
              ]}
            />
          </FormField>
        )}
        <FormField icon={Signpost} label={t('cases.geoPosition')} htmlFor="case-geo-position">
          <ChoicePills
            id="case-geo-position"
            value={value.geoPosition}
            onChange={(next) => onChange({ geoPosition: next })}
            options={PREMISE_GEO_POSITIONS.map((item) => ({
              value: item,
              label: t(`cases.geoPositions.${item}`),
            }))}
          />
        </FormField>
        <FormField icon={Users} label={t('cases.publicAccess')} htmlFor="case-public-access">
          <ChoicePills
            id="case-public-access"
            value={value.publicAccess}
            onChange={(next) => onChange({ publicAccess: next })}
            options={PREMISE_PUBLIC_ACCESSES.map((item) => ({
              value: item,
              label: t(`cases.publicAccesses.${item}`),
            }))}
          />
        </FormField>
      </LocationSection>
      </fieldset>
      {actions}
    </AppForm>
  )
}
