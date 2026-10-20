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
  hostLicenseNumber?: string | null
  hostLicenseIssuedAt?: string | null
  hostLicenseExpiresAt?: string | null
  cardNumber?: string | null
  cardIssuedAt?: string | null
  cardExpiresAt?: string | null
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
  intakeSubmittedAt?: string | null
  completedAt: string | null
  createdAt: string
  canCancel?: boolean
}

export type CaseSuspensionFile = {
  id: string
  kind: 'SUSPEND' | 'LIFT'
  originalName: string | null
  mimeType: string | null
}

export type CaseSuspension = {
  id: string
  reason: string
  startsAt: string
  endsAt: string | null
  liftNote: string | null
  active: boolean
  files: CaseSuspensionFile[]
}

export type PortalViolationAttachment = {
  id: string
  kind: string
  originalName: string | null
  mimeType: string | null
}

export type PortalViolationCase = {
  id: string
  businessUnitTitle: string | null
  licenseNumber?: string | null
}

export type PortalViolationSummary = {
  id: string
  occurredAt: string | null
  status: string
  violationType: { id: string; title: string }
  caseFile: PortalViolationCase | null
}

export type PortalViolation = PortalViolationSummary & {
  nationalId: string
  description: string | null
  attachments: PortalViolationAttachment[]
}

export type PortalCaseHost = {
  id: string
  licenseNumber: string | null
  businessUnitTitle: string | null
  firstName: string
  lastName: string
  fullName: string
  phone: string | null
  jobGroupTitle: string | null
  jobTitle: string | null
  jobTypeTitle: string | null
}

export type CaseDetail = Omit<CaseSummary, 'requests'> & {
  ownerName: string
  ownerFirstName?: string
  ownerLastName?: string
  ownerPhone?: string | null
  ownerNationalId?: string | null
  host?: PortalCaseHost | null
  violationCount: number
  suspensionCount: number
  suspensions: CaseSuspension[]
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

export type PortalAuctionItem = {
  id: string
  name: string
  price: number
  discountPercent: number
  priceAfterDiscount: number
}

export type PortalAuctionReview = {
  id: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  note: string | null
  referredAt: string
  decidedAt: string | null
  decidedBy: { id: string; fullName: string } | null
  title: string
  people: { id: string; fullName: string }[]
  files: Array<{
    id: string
    originalName: string | null
    mimeType: string
    byteSize: number
  }>
}

export type PortalRenewalFile = {
  id: string
  originalName: string | null
  mimeType: string
  byteSize: number
}

export type PortalRenewalReview = {
  id: string
  status: string
  note: string | null
  referredAt: string | null
  decidedAt: string | null
  decidedBy: { fullName: string } | null
  files: PortalRenewalFile[]
}

export type PortalLocationState = {
  id: string
  caseId: string
  number: string
  type: 'LOCATION_CHANGE'
  status: 'OPEN' | 'ISSUED' | 'COMPLETED' | 'REJECTED' | 'CANCELLED'
  formationStep: number
  completedAt: string | null
  awaitingIntake?: boolean
  canUpload: boolean
  canSaveLocation: boolean
  canContinue: boolean
  documentsMissing: boolean
  needsDocuments: boolean
  licenseNumber: string | null
  businessUnitTitle: string | null
  jobTitle: string | null
  person: { firstName: string; lastName: string; fullName: string }
  location: PortalDossierPlace | null
  currentLocation: PortalDossierPlace | null
  requirements: Array<{ id: string; code: string | null; title: string; isRequired: boolean }>
  documents: Array<{
    documentId: string
    current: {
      id: string
      version: number
      originalName: string | null
      mimeType: string
      byteSize: number
    } | null
  }>
  inquiries: Array<PortalRenewalReview & { inquiryCenter: { name: string } }>
  placesReview: PortalRenewalReview | null
  managementReviews: Array<PortalRenewalReview & { title: string }>
}

export type PortalRenewalState = {
  id: string
  caseId: string
  number: string
  type: 'RENEWAL'
  status: 'OPEN' | 'ISSUED' | 'COMPLETED' | 'REJECTED' | 'CANCELLED'
  formationStep: number
  completedAt: string | null
  awaitingIntake?: boolean
  canUpload: boolean
  canContinue: boolean
  documentsMissing: boolean
  needsDocuments: boolean
  contractYears: number
  licenseNumber: string | null
  businessUnitTitle: string | null
  jobTitle: string | null
  person: { firstName: string; lastName: string; fullName: string }
  renewal: {
    currentIssuedAt: string
    currentExpiresAt: string
    nextIssuedAt: string
    nextExpiresAt: string
    delayDays: number
  } | null
  requirements: Array<{ id: string; code: string | null; title: string; isRequired: boolean }>
  documents: Array<{
    documentId: string
    current: {
      id: string
      version: number
      originalName: string | null
      mimeType: string
      byteSize: number
    } | null
  }>
  inquiries: Array<PortalRenewalReview & { inquiryCenter: { name: string } }>
  placesReview: PortalRenewalReview | null
  managementReviews: Array<PortalRenewalReview & { title: string }>
}

export type PortalAuctionRequest = {
  id: string
  caseId: string
  number: string
  status: 'OPEN' | 'ISSUED' | 'COMPLETED' | 'REJECTED' | 'CANCELLED'
  editable: boolean
  phase: number
  intakeSubmittedAt?: string | null
  awaitingIntake?: boolean
  title: string | null
  startsAt: string
  endsAt: string
  discountMin: number
  discountMax: number
  items: PortalAuctionItem[]
  inquiries: Array<PortalRenewalReview & { inquiryCenter: { name: string } }>
  placesReview: PortalRenewalReview | null
  reviews: PortalAuctionReview[]
  caseFile: {
    businessUnitTitle: string | null
    licenseNumber: string | null
    jobTitle: string | null
    person: { firstName: string; lastName: string; fullName: string }
  }
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

export type PortalStewardFormationReview = {
  id: string
  status: string
  note: string | null
  referredAt: string | null
  decidedAt: string | null
  decidedBy: { fullName: string } | null
  files: Array<{
    id: string
    originalName: string | null
    mimeType: string
    byteSize: number
  }>
}

export type PortalStewardFormationState = {
  caseId: string
  requestId: string
  number: string
  status: string
  formationStep: number
  cardNumber: string | null
  editable: boolean
  canContinue: boolean
  documentsMissing: boolean
  host: {
    licenseNumber: string | null
    businessUnitTitle: string | null
    jobTitle: string | null
    fullName: string
  } | null
  person: {
    id: string
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
    jobId: string | null
    jobTitle: string | null
  }
  requirements: Array<{ id: string; code: string | null; title: string; isRequired: boolean }>
  documents: Array<{
    documentId: string
    current: {
      id: string
      version: number
      originalName: string | null
      mimeType: string
      byteSize: number
    } | null
  }>
  inquiries: Array<PortalStewardFormationReview & { inquiryCenter: { name: string } }>
  placesReview: PortalStewardFormationReview | null
  managementReviews: Array<PortalStewardFormationReview & { title: string }>
}

export type PortalStewardshipCard = {
  id: string
  viewerIsHolder?: boolean
  status: CaseSummary['status']
  cardNumber: string | null
  cardIssuedAt: string | null
  cardExpiresAt: string | null
  revokeReason: string | null
  revokeSource: 'HOST' | 'STEWARD' | 'LICENSE' | null
  revokeRequestedAt?: string | null
  revokedAt?: string | null
  revokedBy?: {
    firstName: string
    lastName: string
    fullName: string
  } | null
  person: {
    fullName: string
    firstName: string
    lastName: string
    nationalId: string | null
  }
  host: {
    id: string
    licenseNumber: string | null
    businessUnitTitle: string | null
    firstName: string
    lastName: string
    fullName: string
    jobTitle: string | null
    jobGroupTitle: string | null
  } | null
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
  stewards: PortalStewardRow[]
}

export type PortalStewardLookupPerson = {
  firstName: string
  lastName: string
  nationalId: string
  phone: string | null
}

export type PortalStewardLookup = {
  found: boolean
  person: PortalStewardLookupPerson | null
}

export type PortalStewardRow = {
  id: string
  status: CaseSummary['status']
  firstName?: string
  lastName?: string
  fullName: string
  nationalId: string | null
  phone?: string | null
  requestNumber: string | null
  requestStatus: string | null
  cardNumber: string | null
  requestCreatedAt: string | null
  cardIssuedAt: string | null
  cardExpiresAt: string | null
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
  nationalityIso2: string | null
  nationalityFa: string | null
  nationalityEn: string | null
  passportNumber: string | null
  phone: string | null
  tradeName: string | null
  activityTitle: string | null
  activityTitleEn: string | null
  hasPhoto: boolean
  signerName: string | null
  signerTitle: string | null
  signatureDataUrl: string | null
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
  awaitingIntake?: boolean
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

export type Paginated<T> = {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export type CatalogJobType = {
  id: string
  title: string
  description: string | null
  annualFee: number | null
}

export type CatalogJobGroup = {
  id: string
  title: string
  titleEn: string | null
  description: string | null
  code: string | null
  isActive: boolean
  _count?: { jobs: number }
}

export type CatalogJob = {
  id: string
  groupId: string | null
  title: string
  titleEn: string | null
  taxIntaCode: string | null
  description: string | null
  code: string
  jobTypeId: string
  annualFee: number | null
  isActive: boolean
  jobType: { id: string; title: string }
  group: { id: string; title: string; titleEn: string | null; code: string | null; isActive: boolean } | null
}

export type CatalogJobStats = {
  jobCount: number
  jobGroupCount: number
  byJobType: { id: string; title: string; count: number }[]
}

export const SMS_STATUSES = ['SKIPPED', 'SENT', 'FAILED'] as const
export type PortalSmsStatus = (typeof SMS_STATUSES)[number]

export const SMS_SOURCES = ['MANUAL', 'PASSWORD', 'PAYMENT_LINK', 'STEWARDSHIP'] as const
export type PortalSmsSource = (typeof SMS_SOURCES)[number]

export type PortalSmsMessage = {
  id: string
  phone: string
  body: string
  status: PortalSmsStatus
  source: PortalSmsSource
  createdAt: string
}
