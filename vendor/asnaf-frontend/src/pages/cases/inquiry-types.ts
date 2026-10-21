export type CaseInquiryStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type CaseInquiryChannel = 'MANUAL' | 'SYSTEM'

export type CaseInquiryFile = {
  id: string
  originalName: string | null
  mimeType: string
  byteSize: number
  createdAt: string
}

export type CaseInquiryRow = {
  id: string
  status: CaseInquiryStatus
  channel: CaseInquiryChannel | null
  note: string | null
  createdAt: string
  referredAt?: string | null
  decidedAt: string | null
  decidedBy: { id: string; fullName: string } | null
  center: {
    id: string
    name: string
    phone: string | null
    officerId?: string | null
    officerName: string | null
  }
  files: CaseInquiryFile[]
}

export type InquiryDossierFile = {
  id: string
  originalName: string | null
  mimeType: string
}

export type InquiryDossierDocument = {
  id: string
  title: string
  group: 'FIXED' | 'JOB'
  isRequired: boolean
  file: InquiryDossierFile | null
}

export type InquiryDocumentStats = {
  fixedTotal: number
  jobTotal: number
  uploaded: number
  remaining: number
}

export type InquiryGeoName = {
  nameFa: string
  nameEn: string
}

export type InquiryDossier = {
  person: {
    firstName: string
    lastName: string
    fatherName: string | null
    lastNameEn: string | null
    gender: 'MALE' | 'FEMALE' | null
    religion: string | null
    religionOther: string | null
    nationalId: string | null
    birthDate: string | null
    birthPlace: string | null
    identityCertificateNo: string | null
    identityIssuedIn: string | null
    country: InquiryGeoName | null
    residencyStatus: 'RESIDENT' | 'NON_RESIDENT' | null
    passportNumber: string | null
    nationalCardExpiresAt: string | null
    passportExpiresAt: string | null
    phone: string | null
    homePhone: string | null
    postalCode: string | null
    email: string | null
    address: string | null
    educationLevel: string | null
    citizenGroup: string | null
    jobTitle: string | null
    activityJobTitle: string | null
    unitTitle: string | null
  }
  documents: InquiryDossierDocument[]
  documentStats: InquiryDocumentStats
  location: {
    city: InquiryGeoName | null
    province: InquiryGeoName | null
    complex: { name: string; nameEn: string } | null
    establishment: string | null
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
    registrationPlace: string | null
    ownership: string | null
    deedNo: string | null
    area: string | null
    leaseIssuedAt: string | null
    leaseExpiresAt: string | null
    leaseAgency: string | null
    ownerName: string | null
  }
}

export type CaseLetterheadView = {
  organizationName: string | null
  address: string | null
  phone: string | null
  website: string | null
  signerName: string | null
  signerTitle: string | null
  logoDataUrl: string | null
  signatureDataUrl: string | null
  defaultPaper: 'A4' | 'A5'
}

export type CaseInquiryLetter = {
  id: string
  centerName: string
  centerPhone: string | null
  nationalId: string | null
  letterNo: string
  issuedAt: string
  letterhead: CaseLetterheadView
  letterTitle: string
  letterBody: string
  fields: Record<string, string>
}
