export type PortalUser = {
  id: string
  username: string
  fullName: string
  nationalId: string | null
  phone: string | null
  hasPhoto: boolean
}

export type CaseListKind =
  | 'ISSUANCE'
  | 'RENEWAL'
  | 'LOCATION_CHANGE'
  | 'AUCTION'
  | 'STEWARD_REQUEST'
  | 'STEWARD_CARD'

export type CaseRequestBadge = {
  type: 'ISSUANCE' | 'RENEWAL' | 'LOCATION_CHANGE' | 'STEWARDSHIP' | 'AUCTION'
  status: 'OPEN' | 'ISSUED' | 'COMPLETED' | 'REJECTED' | 'CANCELLED'
}

export type CaseSummary = {
  id: string
  kind: 'LICENSE' | 'STEWARDSHIP'
  caseKind?: CaseListKind
  requests?: CaseRequestBadge[]
  status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'REVOKED'
  formationStep: number
  trackingCode: string | null
  licenseNumber: string | null
  licenseIssuedAt: string | null
  licenseExpiresAt: string | null
  businessUnitTitle: string | null
  job?: {
    id: string
    title: string
    group?: { id: string; title: string } | null
    jobType?: { id: string; title: string } | null
  } | null
  jobTitle?: string | null
  fullName?: string
  nationalId?: string | null
  hasPhoto?: boolean
  createdAt: string
  updatedAt: string
  activityJob: {
    id: string
    title: string
    group?: { id: string; title: string } | null
    jobType?: { id: string; title: string } | null
  } | null
  _count: { requests: number }
}

export type CaseRequest = {
  id: string
  number: string
  type: string
  status: string
  formationStep: number
  completedAt: string | null
  createdAt: string
}

export type CaseDetail = Omit<CaseSummary, 'requests'> & {
  violationCount: number
  suspensionCount: number
  previousOccupation: string | null
  posDeviceCount: number | null
  premiseAddress: string | null
  premisePostalCode: string | null
  premisePhone: string | null
  premiseOwnership: string | null
  premiseArea: string | null
  premiseCity: { id: string; nameFa: string; province: { id: string; nameFa: string } } | null
  premiseComplex: { id: string; name: string } | null
  registrationPlace: { id: string; title: string } | null
  requests: CaseRequest[]
  futureActions: Record<'renewal' | 'auction' | 'stewardship' | 'locationChange', { enabled: boolean }>
}

export type PortalDossierFile = {
  id: string
  originalName: string | null
  mimeType: string
  byteSize: number
  createdAt: string
}

export type PortalDossierDocument = {
  documentId: string
  title: string
  isRequired: boolean
  file: PortalDossierFile
}

export type PortalDossierPlace = {
  cityId: string | null
  establishment: string | null
  complexId: string | null
  address: string | null
  addressEn: string | null
  plaque: string | null
  plaqueSeries: string | null
  floor: string | null
  unitNo: string | null
  postalCode: string | null
  phone: string | null
  fax: string | null
  geoPosition: string | null
  publicAccess: string | null
  registrationPlaceId: string | null
  ownership: string | null
  deedNo: string | null
  area: string | null
  leaseIssuedAt: string | null
  leaseExpiresAt: string | null
  leaseAgency: string | null
  ownerName: string | null
  city: { nameFa: string; nameEn: string } | null
  complex: { name: string; nameEn: string } | null
  registrationPlaceTitle: string | null
}

export type PortalDossier = {
  id: string
  kind: 'LICENSE' | 'STEWARDSHIP'
  status: CaseSummary['status']
  formationStep: number
  trackingCode: string | null
  licenseNumber: string | null
  licenseIssuedAt: string | null
  licenseExpiresAt: string | null
  cardNumber: string | null
  cardIssuedAt: string | null
  cardExpiresAt: string | null
  businessUnitTitle: string | null
  person: {
    id: string
    fullName: string
    firstName: string
    lastName: string
    fatherName: string | null
    lastNameEn: string | null
    gender: 'MALE' | 'FEMALE' | null
    religion: string | null
    religionOther: string | null
    nationalId: string | null
    birthDate: string | null
    residencyStatus: string | null
    passportNumber: string | null
    nationalCardExpiresAt: string | null
    passportExpiresAt: string | null
    identityCertificateNo: string | null
    birthPlace: string | null
    identityIssuedIn: string | null
    countryId: string | null
    phone: string | null
    homePhone: string | null
    postalCode: string | null
    address: string | null
    email: string | null
    educationLevel: string | null
    citizenGroup: string | null
    jobId: string | null
    country: { nameFa: string; nameEn: string } | null
    economicJob: { id: string; title: string } | null
  }
  activity: {
    businessUnitTitle: string | null
    jobGroupTitle: string | null
    jobTitle: string | null
    jobTypeTitle: string | null
    previousOccupation: string | null
    posDeviceCount: number | null
  }
  location: PortalDossierPlace
  locationHistory: Array<PortalDossierPlace & { id: string; startedAt: string; endedAt: string }>
  identityDocuments: PortalDossierDocument[]
  requestDocuments: Array<{
    id: string
    type: string
    number: string
    status: string
    createdAt: string
    documents: PortalDossierDocument[]
  }>
  host: {
    id: string
    licenseNumber: string | null
    businessUnitTitle: string | null
    fullName: string
    firstName: string
    lastName: string
  } | null
  stewards: Array<{
    id: string
    status: CaseSummary['status']
    fullName: string
    nationalId: string | null
    requestNumber: string | null
    requestStatus: string | null
    cardNumber: string | null
    cardIssuedAt: string | null
    cardExpiresAt: string | null
  }>
}

export type PortalLicense = {
  licenseNumber: string | null
  issuedAt: string | null
  expiresAt: string | null
  requestNumber: string | null
  trackingCode: string | null
  firstName: string
  lastName: string
  lastNameEn: string | null
  gender: 'MALE' | 'FEMALE' | null
  birthDate: string | null
  nationalityFa: string | null
  nationalityEn: string | null
  passportNumber: string | null
  phone: string | null
  tradeName: string | null
  activityTitle: string | null
  activityTitleEn: string | null
  hasPhoto: boolean
  address: string | null
  addressEn: string | null
  plaque: string | null
  floor: string | null
  unitNo: string | null
  postalCode: string | null
  cityNameFa: string | null
  cityNameEn: string | null
  complexName: string | null
  complexNameEn: string | null
}

export type IssuanceDocument = {
  id: string
  documentId: string
  document: { title: string; code: string | null }
  versions: Array<{
    id: string
    originalName: string | null
    mimeType: string
    byteSize: number
    version: number
  }>
}

export type IssuanceState = {
  case: CaseSummary & Record<string, unknown>
  identity: {
    firstName: string
    lastName: string
    fullName: string
    fatherName: string | null
    lastNameEn: string | null
    nationalId: string | null
    gender: string | null
    religion: string | null
    religionOther: string | null
    birthDate: string | null
    birthPlace: string | null
    identityCertificateNo: string | null
    identityIssuedIn: string | null
    countryId: string | null
    countryName: string | null
    residencyStatus: string | null
    passportNumber: string | null
    nationalCardExpiresAt: string | null
    passportExpiresAt: string | null
    phone: string | null
    homePhone: string | null
    email: string | null
    address: string | null
    postalCode: string | null
    educationLevel: string | null
    citizenGroup: string | null
    jobTitle: string | null
  }
  request: CaseRequest
  documents: {
    identity: IssuanceDocument[]
    activity: IssuanceDocument[]
  }
  editable: boolean
  steps: Array<{ step: number; mode: 'EDIT' | 'VIEW' | 'LOCKED' }>
}

export type Lookup = {
  id: string
  title?: string
  name?: string
  nameFa?: string
  groupId?: string | null
  isDefault?: boolean
  province?: { nameFa: string } | null
  jobType?: { id: string; title: string } | null
}
