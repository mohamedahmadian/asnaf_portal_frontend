import type { LucideIcon } from 'lucide-react'
import {
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  GraduationCap,
  IdCard,
  Landmark,
  Layers,
  Mail,
  MapPin,
  Phone,
  UserRound,
  Users,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { AppForm, FormField, inputClassName } from '../../components/ui/Form'
import { FormSectionTitle } from '../../components/ui/FormLayout'
import { PersianDateField } from '../../components/ui/PersianDateField'
import { SearchSelect } from '../../components/ui/SearchSelect'
import { geoName } from '../../lib/geo'
import type { Religion, UserGender } from '../../types/app'
import { EDUCATION_LEVELS, type IdentityPerson } from './formation-types'

function IdentitySection({
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

export function CaseIdentityFields({
  person,
  countries,
  jobs,
  locale,
  onChange,
  onSubmit,
  actions,
  locked = false,
}: {
  person: IdentityPerson
  countries: Array<{ id: string; nameFa: string; nameEn?: string | null }>
  jobs: Array<{ id: string; title: string }>
  locale: string
  onChange: <K extends keyof IdentityPerson>(key: K, value: IdentityPerson[K]) => void
  onSubmit: () => void
  actions?: ReactNode
  locked?: boolean
}) {
  const { t } = useTranslation()

  return (
    <AppForm
      onSubmit={(event) => {
        event.preventDefault()
        if (!locked) onSubmit()
      }}
      className="space-y-4"
    >
      <fieldset disabled={locked} className="min-w-0 space-y-4 border-0 p-0">
      <IdentitySection icon={UserRound} title={t('cases.identitySections.personal')}>
        <FormField icon={UserRound} label={t('users.firstName')} htmlFor="case-first-name">
          <input
            id="case-first-name"
            required
            className={inputClassName()}
            value={person.firstName}
            onChange={(event) => onChange('firstName', event.target.value)}
          />
        </FormField>
        <FormField icon={UserRound} label={t('users.lastName')} htmlFor="case-last-name">
          <input
            id="case-last-name"
            required
            className={inputClassName()}
            value={person.lastName}
            onChange={(event) => onChange('lastName', event.target.value)}
          />
        </FormField>
        <FormField icon={Users} label={t('cases.fatherName')} htmlFor="case-father-name">
          <input
            id="case-father-name"
            className={inputClassName()}
            value={person.fatherName ?? ''}
            onChange={(event) => onChange('fatherName', event.target.value)}
          />
        </FormField>
        <FormField icon={UserRound} label={t('cases.lastNameEn')} htmlFor="case-last-name-en">
          <input
            id="case-last-name-en"
            className={`${inputClassName()} digit-field`}
            value={person.lastNameEn ?? ''}
            onChange={(event) => onChange('lastNameEn', event.target.value)}
          />
        </FormField>
        <FormField icon={UserRound} label={t('users.gender')} htmlFor="case-gender">
          <SearchSelect
            id="case-gender"
            value={person.gender ?? ''}
            onChange={(value) => onChange('gender', (value || null) as UserGender | null)}
            placeholder={t('users.selectOptional')}
            options={[
              { value: '', label: t('users.selectOptional') },
              { value: 'MALE', label: t('userGenders.MALE') },
              { value: 'FEMALE', label: t('userGenders.FEMALE') },
            ]}
          />
        </FormField>
        <FormField icon={Landmark} label={t('users.religion')} htmlFor="case-religion">
          <SearchSelect
            id="case-religion"
            value={person.religion ?? ''}
            onChange={(value) => onChange('religion', (value || null) as Religion | null)}
            placeholder={t('users.selectOptional')}
            options={[
              { value: '', label: t('users.selectOptional') },
              ...(['ISLAM', 'CHRISTIANITY', 'JUDAISM', 'ZOROASTRIANISM', 'OTHER'] as const).map((item) => ({
                value: item,
                label: t(`religions.${item}`),
              })),
            ]}
          />
        </FormField>
        {person.religion === 'OTHER' ? (
          <FormField icon={Landmark} label={t('users.religionOther')} htmlFor="case-religion-other">
            <input
              id="case-religion-other"
              className={inputClassName()}
              value={person.religionOther ?? ''}
              onChange={(event) => onChange('religionOther', event.target.value)}
            />
          </FormField>
        ) : null}
      </IdentitySection>

      <IdentitySection icon={BookOpen} title={t('cases.identitySections.birth')}>
        <FormField icon={CalendarDays} label={t('cases.birthDate')} htmlFor="case-birth-date">
          <PersianDateField
            id="case-birth-date"
            value={person.birthDate || undefined}
            onChange={(value) => onChange('birthDate', value ?? '')}
          />
        </FormField>
        <FormField icon={MapPin} label={t('cases.birthPlace')} htmlFor="case-birth-place">
          <input
            id="case-birth-place"
            className={inputClassName()}
            value={person.birthPlace ?? ''}
            onChange={(event) => onChange('birthPlace', event.target.value)}
          />
        </FormField>
        <FormField icon={IdCard} label={t('cases.identityCertificateNo')} htmlFor="case-certificate">
          <input
            id="case-certificate"
            className={`${inputClassName()} digit-field`}
            value={person.identityCertificateNo ?? ''}
            onChange={(event) => onChange('identityCertificateNo', event.target.value)}
          />
        </FormField>
        <FormField icon={MapPin} label={t('cases.identityIssuedIn')} htmlFor="case-issued-in">
          <input
            id="case-issued-in"
            className={inputClassName()}
            value={person.identityIssuedIn ?? ''}
            onChange={(event) => onChange('identityIssuedIn', event.target.value)}
          />
        </FormField>
        <FormField icon={Building2} label={t('cases.nationality')} htmlFor="case-country">
          <SearchSelect
            id="case-country"
            value={person.countryId ?? ''}
            onChange={(value) => onChange('countryId', value)}
            placeholder={t('geo.selectCountry')}
            options={[
              { value: '', label: t('geo.selectCountry') },
              ...countries.map((country) => ({
                value: country.id,
                label: geoName({ nameFa: country.nameFa, nameEn: country.nameEn ?? '' }, locale),
              })),
            ]}
          />
        </FormField>
      </IdentitySection>

      <IdentitySection icon={IdCard} title={t('cases.identitySections.travel')}>
        <FormField icon={IdCard} label={t('cases.residency')} htmlFor="case-residency">
          <SearchSelect
            id="case-residency"
            value={person.residencyStatus ?? ''}
            onChange={(value) =>
              onChange('residencyStatus', (value || null) as IdentityPerson['residencyStatus'])
            }
            placeholder={t('users.selectOptional')}
            options={[
              { value: '', label: t('users.selectOptional') },
              { value: 'RESIDENT', label: t('cases.resident') },
              { value: 'NON_RESIDENT', label: t('cases.nonResident') },
            ]}
          />
        </FormField>
        <FormField icon={IdCard} label={t('cases.passportNumber')} htmlFor="case-passport">
          <input
            id="case-passport"
            className={`${inputClassName()} digit-field`}
            value={person.passportNumber ?? ''}
            onChange={(event) => onChange('passportNumber', event.target.value)}
          />
        </FormField>
        <FormField icon={CalendarDays} label={t('cases.nationalCardExpiresAt')} htmlFor="case-card-expiry">
          <PersianDateField
            id="case-card-expiry"
            value={person.nationalCardExpiresAt || undefined}
            onChange={(value) => onChange('nationalCardExpiresAt', value ?? '')}
          />
        </FormField>
        <FormField icon={CalendarDays} label={t('cases.passportExpiresAt')} htmlFor="case-passport-expiry">
          <PersianDateField
            id="case-passport-expiry"
            value={person.passportExpiresAt || undefined}
            onChange={(value) => onChange('passportExpiresAt', value ?? '')}
          />
        </FormField>
      </IdentitySection>

      <IdentitySection icon={Phone} title={t('cases.identitySections.contact')}>
        <FormField icon={Phone} label={t('users.phone')} htmlFor="case-phone">
          <input
            id="case-phone"
            className={`${inputClassName()} digit-field`}
            inputMode="tel"
            value={person.phone ?? ''}
            onChange={(event) => onChange('phone', event.target.value)}
          />
        </FormField>
        <FormField icon={Phone} label={t('cases.homePhone')} htmlFor="case-home-phone">
          <input
            id="case-home-phone"
            className={`${inputClassName()} digit-field`}
            inputMode="tel"
            value={person.homePhone ?? ''}
            onChange={(event) => onChange('homePhone', event.target.value)}
          />
        </FormField>
        <FormField icon={MapPin} label={t('cases.postalCode')} htmlFor="case-postal">
          <input
            id="case-postal"
            className={`${inputClassName()} digit-field`}
            inputMode="numeric"
            value={person.postalCode ?? ''}
            onChange={(event) => onChange('postalCode', event.target.value)}
          />
        </FormField>
        <FormField icon={Mail} label={t('users.email')} htmlFor="case-email">
          <input
            id="case-email"
            type="email"
            className={`${inputClassName()} digit-field`}
            value={person.email ?? ''}
            onChange={(event) => onChange('email', event.target.value)}
          />
        </FormField>
        <div className="sm:col-span-2">
          <FormField icon={MapPin} label={t('users.address')} htmlFor="case-address">
            <textarea
              id="case-address"
              rows={3}
              className={inputClassName()}
              value={person.address ?? ''}
              onChange={(event) => onChange('address', event.target.value)}
            />
          </FormField>
        </div>
      </IdentitySection>

      <IdentitySection icon={GraduationCap} title={t('cases.identitySections.work')}>
        <FormField icon={GraduationCap} label={t('cases.education')} htmlFor="case-education">
          <SearchSelect
            id="case-education"
            value={person.educationLevel ?? ''}
            onChange={(value) => onChange('educationLevel', (value || null) as IdentityPerson['educationLevel'])}
            placeholder={t('users.selectOptional')}
            options={[
              { value: '', label: t('users.selectOptional') },
              ...EDUCATION_LEVELS.map((item) => ({
                value: item,
                label: t(`cases.educationLevels.${item}`),
              })),
            ]}
          />
        </FormField>
        <FormField icon={Layers} label={t('cases.jobGroup')} htmlFor="case-citizen-group">
          <input
            id="case-citizen-group"
            className={inputClassName()}
            value={person.citizenGroup ?? ''}
            onChange={(event) => onChange('citizenGroup', event.target.value)}
          />
        </FormField>
        <FormField icon={Briefcase} label={t('cases.job')} htmlFor="case-job">
          <SearchSelect
            id="case-job"
            value={person.jobId ?? ''}
            onChange={(value) => onChange('jobId', value)}
            placeholder={t('users.selectOptional')}
            options={[
              { value: '', label: t('users.selectOptional') },
              ...jobs.map((job) => ({ value: job.id, label: job.title })),
            ]}
          />
        </FormField>
      </IdentitySection>
      </fieldset>
      {actions}
    </AppForm>
  )
}
