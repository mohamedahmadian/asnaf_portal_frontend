export const userStatuses = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;

export type UserStatus = (typeof userStatuses)[keyof typeof userStatuses];

export const userGenders = {
  MALE: "MALE",
  FEMALE: "FEMALE",
} as const;

export type UserGender = (typeof userGenders)[keyof typeof userGenders];

export const personTypes = {
  NATURAL: "NATURAL",
  LEGAL: "LEGAL",
} as const;

export type PersonType = (typeof personTypes)[keyof typeof personTypes];

export const religions = {
  ISLAM: "ISLAM",
  CHRISTIANITY: "CHRISTIANITY",
  JUDAISM: "JUDAISM",
  ZOROASTRIANISM: "ZOROASTRIANISM",
  OTHER: "OTHER",
} as const;

export type Religion = (typeof religions)[keyof typeof religions];

export const accommodationTypes = {
  SCHOOL: "SCHOOL",
  MOSQUE: "MOSQUE",
  HUSSEINIEH: "HUSSEINIEH",
  HALL: "HALL",
  HOUSE: "HOUSE",
  OTHER: "OTHER",
} as const;

export type AccommodationType =
  (typeof accommodationTypes)[keyof typeof accommodationTypes];

export const accommodationStatuses = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  FULL: "FULL",
} as const;

export type AccommodationStatus =
  (typeof accommodationStatuses)[keyof typeof accommodationStatuses];

export const genderTypes = {
  MALE: "MALE",
  FEMALE: "FEMALE",
  MIXED: "MIXED",
} as const;

export type GenderType = (typeof genderTypes)[keyof typeof genderTypes];

export const managementTypes = {
  SELF_SUFFICIENT: "SELF_SUFFICIENT",
  SEMI_SELF_SUFFICIENT: "SEMI_SELF_SUFFICIENT",
  NON_SELF_SUFFICIENT: "NON_SELF_SUFFICIENT",
} as const;

export type ManagementType =
  (typeof managementTypes)[keyof typeof managementTypes];

export const supplierTypes = {
  GOVERNMENT_ORGANIZATION: "GOVERNMENT_ORGANIZATION",
  CHARITY: "CHARITY",
  COMPANY: "COMPANY",
  STORE: "STORE",
  MANUFACTURER: "MANUFACTURER",
  WAREHOUSE: "WAREHOUSE",
  SUPPLIER: "SUPPLIER",
  OTHER: "OTHER",
} as const;

export type SupplierType = (typeof supplierTypes)[keyof typeof supplierTypes];

export const itemUnits = {
  PIECE: "PIECE",
  PAIR: "PAIR",
  SET: "SET",
  DEVICE: "DEVICE",
  KILOGRAM: "KILOGRAM",
  GRAM: "GRAM",
  TON: "TON",
  LITER: "LITER",
  METER: "METER",
  SQUARE_METER: "SQUARE_METER",
  CUBIC_METER: "CUBIC_METER",
  CARTON: "CARTON",
  PACK: "PACK",
  BOX: "BOX",
  BAG: "BAG",
  ROLL: "ROLL",
  SHEET: "SHEET",
  BOLT: "BOLT",
  BRANCH: "BRANCH",
  GALLON: "GALLON",
  CAN: "CAN",
  OTHER: "OTHER",
} as const;

export type ItemUnit = (typeof itemUnits)[keyof typeof itemUnits];

export function isPresetItemUnit(
  unit: string,
): unit is Exclude<ItemUnit, "OTHER"> {
  return unit in itemUnits && unit !== itemUnits.OTHER;
}

export function formatItemUnit(unit: string, t: (key: string) => string) {
  return isPresetItemUnit(unit) ? t(`itemUnits.${unit}`) : unit;
}

export type NavMenu = {
  code: string;
  nameKey: string;
  path: string;
  icon: string;
  sortOrder: number;
  /** برچسب نمایشی؛ اگر باشد به‌جای ترجمهٔ nameKey در منو و بردکرامب می‌آید. */
  label?: string;
};

export type NavModule = {
  code: string;
  nameKey: string;
  icon: string;
  sortOrder: number;
  menus: NavMenu[];
};

export type RoleOption = {
  id: string;
  code: string;
  name: string;
  nameKey?: string;
};

export type AppRole = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissionCodes: string[];
  createdAt: string;
  updatedAt: string;
  _count?: { users: number };
};

export type AuthUser = {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  fullName: string;
  locale: string;
  gender?: UserGender | null;
  provinceId?: string | null;
  cityId?: string | null;
  countryId?: string | null;
  issuingOrganization?: {
    id: string;
    name: string;
    phone: string | null;
  } | null;
  roles: RoleOption[];
  isAdmin?: boolean;
  permissionCodes?: string[];
  hasGroup?: boolean;
  managesAccommodation?: boolean;
  honoraryServices?: HonoraryServiceSummary[];
  modules: NavModule[];
  photoId?: string | null;
  impersonating?: boolean;
  impersonatedBy?: { id: string; fullName: string } | null;
  orgUnitId?: string | null;
  orgUnit?: { id: string; name: string } | null;
  positionId?: string | null;
  position?: { id: string; code: string | null; name: string } | null;
  isNutritionRep?: boolean;
  inquiryCenters?: { id: string; name: string }[];
};

export type Caravan = {
  id: string;
  name: string;
  description: string | null;
  officeAddress: string | null;
  officePhone: string | null;
  foundedYear: number | null;
  licenseNumber: string | null;
  cityId: string;
  city?: {
    id: string;
    nameFa: string;
    nameEn: string;
    provinceId: string;
    province?: {
      id: string;
      nameFa: string;
      nameEn: string;
      countryId: string;
      country?: {
        id: string;
        nameFa: string;
        nameEn: string;
      };
    };
  } | null;
  walkingRouteId: string | null;
  walkingRoute?: {
    id: string;
    name: string;
  } | null;
  licenseImageId: string | null;
  managerUserId: string | null;
  manager?: {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    nationalId: string | null;
    phone: string | null;
    birthDate?: string | null;
    status: UserStatus;
  } | null;
  contacts?: Array<{
    id: string;
    role: "DEPUTY" | "CLERIC" | "CULTURAL" | "SECURITY" | "RECEPTION";
    userId: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      fullName: string;
      nationalId: string | null;
      phone: string | null;
      birthDate?: string | null;
      status: UserStatus;
    };
  }>;
  eitaa: string | null;
  bale: string | null;
  telegram: string | null;
  instagram: string | null;
  totalCount: number;
  maleCount: number;
  femaleCount: number;
  isActive: boolean;
  createdAt: string;
  managerReused?: boolean;
  years?: CaravanYearLink[];
};

export type CaravanYearLink = {
  id: string;
  year: number;
  managerUserId: string | null;
  maleCount: number;
  femaleCount: number;
  manager?: {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
  } | null;
};

export const caravanGenderKinds = {
  FEMALE: "FEMALE",
  MALE: "MALE",
  MIXED: "MIXED",
  UNSPECIFIED: "UNSPECIFIED",
} as const;

export type CaravanGenderKind =
  (typeof caravanGenderKinds)[keyof typeof caravanGenderKinds];

export const caravanOrigins = {
  IRANIAN: "IRANIAN",
  INTERNATIONAL: "INTERNATIONAL",
} as const;

export type CaravanOrigin =
  (typeof caravanOrigins)[keyof typeof caravanOrigins];

export type CaravanYearStats = {
  year: number;
  total: number;
  active: number;
  inactive: number;
};

export type CaravanReport = {
  year: number;
  total: number;
  capacity: {
    male: number;
    female: number;
    total: number;
  };
  byManagerStatus: {
    withManager: number;
    withoutManager: number;
  };
  byYearActivity: {
    active: number;
    inactive: number;
  };
  byOrigin: {
    iranian: number;
    international: number;
  };
  byContactStatus: {
    complete: number;
    partial: number;
    none: number;
  };
  byGenderType: { genderType: CaravanGenderKind; count: number }[];
  byWalkingRoute: { id: string | null; name: string; count: number }[];
  byProvince: { id: string; name: string; count: number }[];
  byCombination: {
    genderType: CaravanGenderKind;
    origin: CaravanOrigin;
    count: number;
  }[];
};

export type ProvincialMonitoringCounts = {
  caravanCount: number;
  activeCaravanCount: number;
  groupCount: number;
  caravanCapacity: { male: number; female: number; total: number };
  reservationCount: number;
  reservationPilgrims: { male: number; female: number; total: number };
  residentPilgrims: number;
};

export type ProvincialMonitoringPlace = ProvincialMonitoringCounts & {
  id: string;
  nameFa: string;
  nameEn: string;
  code: string;
  latitude: number | null;
  longitude: number | null;
};

export type ProvincialMonitoringCityPlace = ProvincialMonitoringPlace & {
  provinceId: string;
  provinceNameFa: string;
  provinceNameEn: string;
  isProvinceCapital: boolean;
};

export type ProvincialMonitoringParty = {
  id: string;
  name: string;
  cityId: string;
  cityNameFa: string;
  reservationCount: number;
  reservationPilgrims: { male: number; female: number; total: number };
  capacity: { male: number; female: number; total: number };
};

export type ProvincialMonitoringCaravan = ProvincialMonitoringParty & {
  active: boolean;
};

export type ProvincialMonitoringGroup = ProvincialMonitoringParty;

export type ProvincialMonitoringMap = {
  year: number;
  totals: ProvincialMonitoringCounts;
  provinces: ProvincialMonitoringPlace[];
  cities: ProvincialMonitoringCityPlace[];
  lookup: {
    provinces: { id: string; nameFa: string; nameEn: string; code: string }[];
    cities: {
      id: string;
      nameFa: string;
      nameEn: string;
      code: string;
      provinceId: string;
      provinceNameFa: string;
      provinceNameEn: string;
    }[];
  };
};

export type ProvincialMonitoringProvinceDetail = {
  year: number;
  province: {
    id: string;
    nameFa: string;
    nameEn: string;
    code: string;
    latitude: number | null;
    longitude: number | null;
  };
  totals: ProvincialMonitoringCounts;
  cities: ProvincialMonitoringPlace[];
  caravans: ProvincialMonitoringCaravan[];
  groups: ProvincialMonitoringGroup[];
};

export type NationalMonitoringPlace = {
  id: string;
  nameFa: string;
  nameEn: string;
  pilgrims: number;
  pilgrimMale: number;
  pilgrimFemale: number;
  reservationCount: number;
  caravanCount: number;
  accommodationCount: number;
  activeAccommodationCount: number;
  lodgingCapacity: { male: number; female: number; total: number };
  lodgingGap: number;
};

export type NationalMonitoringCity = NationalMonitoringPlace & {
  provinceId: string;
  provinceNameFa: string;
  provinceNameEn: string;
};

export type NationalMonitoringRoute = {
  id: string | null;
  name: string;
  pilgrims: number;
  pilgrimMale: number;
  pilgrimFemale: number;
  reservationCount: number;
  caravanCount: number;
  groupCount: number;
};

export type NationalMonitoringReport = {
  year: number;
  totals: {
    pilgrims: number;
    pilgrimMale: number;
    pilgrimFemale: number;
    reservationCount: number;
    caravanCount: number;
    accommodationCount: number;
    activeAccommodationCount: number;
    lodgingCapacity: { male: number; female: number; total: number };
    lodgingGap: number;
  };
  highlights: {
    busiestProvince: { id: string; nameFa: string; nameEn: string; pilgrims: number } | null;
    busiestCity: { id: string; nameFa: string; nameEn: string; pilgrims: number } | null;
    busiestRoute: { id: string; name: string; pilgrims: number } | null;
    tightestProvince: {
      id: string;
      nameFa: string;
      nameEn: string;
      pilgrims: number;
      lodgingCapacity: number;
      lodgingGap: number;
    } | null;
  };
  byProvince: NationalMonitoringPlace[];
  byCity: NationalMonitoringCity[];
  byWalkingRoute: NationalMonitoringRoute[];
};

export type ProvincialMonitoringCityDetail = {
  year: number;
  city: {
    id: string;
    nameFa: string;
    nameEn: string;
    code: string;
    latitude: number | null;
    longitude: number | null;
    isProvinceCapital: boolean;
    province: {
      id: string;
      nameFa: string;
      nameEn: string;
      code: string;
    };
  };
  totals: ProvincialMonitoringCounts;
  caravans: ProvincialMonitoringCaravan[];
  groups: ProvincialMonitoringGroup[];
};

export type CaravanYearRow = Caravan & {
  activeInYear: boolean;
};

export type CaravanYearTransferResult = {
  sourceYear: number;
  targetYear: number;
  copyManagers: boolean;
  requested: number;
  transferred: number;
  skipped: number;
  errors: { caravanId: string; message: string }[];
};

export type Group = {
  id: string;
  name: string;
  cityId: string;
  city?: {
    id: string;
    nameFa: string;
    nameEn: string;
    provinceId: string;
    province?: {
      id: string;
      nameFa: string;
      nameEn: string;
      countryId: string;
      country?: {
        id: string;
        nameFa: string;
        nameEn: string;
      };
    };
  } | null;
  walkingRouteId: string | null;
  walkingRoute?: {
    id: string;
    name: string;
  } | null;
  managerUserId: string | null;
  manager?: {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    nationalId: string | null;
    phone: string | null;
    status: UserStatus;
  } | null;
  eitaa: string | null;
  bale: string | null;
  telegram: string | null;
  instagram: string | null;
  totalCount: number;
  maleCount: number;
  femaleCount: number;
  createdAt: string;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export const projectImportances = {
  VERY_HIGH: "VERY_HIGH",
  HIGH: "HIGH",
  MEDIUM: "MEDIUM",
  LOW: "LOW",
} as const;

export type ProjectImportance =
  (typeof projectImportances)[keyof typeof projectImportances];

export const projectImportanceOrder: ProjectImportance[] = [
  projectImportances.VERY_HIGH,
  projectImportances.HIGH,
  projectImportances.MEDIUM,
  projectImportances.LOW,
];

export const projectStatuses = {
  NOT_STARTED: "NOT_STARTED",
  IN_PROGRESS: "IN_PROGRESS",
  SUSPENDED: "SUSPENDED",
  COMPLETED: "COMPLETED",
} as const;

export type ProjectStatus =
  (typeof projectStatuses)[keyof typeof projectStatuses];

export const projectStatusOrder: ProjectStatus[] = [
  projectStatuses.NOT_STARTED,
  projectStatuses.IN_PROGRESS,
  projectStatuses.SUSPENDED,
  projectStatuses.COMPLETED,
];

export type ProjectOperator = {
  id: string;
  name: string;
  parentId: string | null;
  pathLabel: string;
  kind: { id: string; name: string };
};

export type ProjectGroup = {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { projects: number };
};

export type ProjectOrgUnit = {
  id: string;
  name: string;
  parentId: string | null;
  pathLabel: string;
  kind: { id: string; name: string };
};

export type ProjectBoundary =
  | { type: 'Polygon'; coordinates: number[][][] }
  | { type: 'MultiPolygon'; coordinates: number[][][][] };

export type Project = {
  id: string;
  operators: ProjectOperator[];
  orgUnitId: string | null;
  orgUnit: ProjectOrgUnit | null;
  groupId: string | null;
  group: Pick<ProjectGroup, 'id' | 'name' | 'color'> | null;
  systemName: string;
  code: string;
  isActive: boolean;
  status: ProjectStatus | null;
  progressPercent: number | null;
  startDate: string | null;
  endDate: string | null;
  latitude: number | null;
  longitude: number | null;
  boundary: ProjectBoundary | null;
  address: string | null;
  companyName: string | null;
  systemUrl: string | null;
  launchYear: number | null;
  isSupportActive: boolean;
  replacementProjectId: string | null;
  replacementProject: { id: string; systemName: string } | null;
  description: string | null;
  color: string | null;
  showOnLiveBoard: boolean;
  showOnHomePage: boolean;
  importance: ProjectImportance;
  createdAt: string;
  updatedAt: string;
  _count?: { contractors: number; phases: number; progressEntries?: number };
};

export type ProjectDocument = {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  originalName: string;
  mimeType: string;
  byteSize: number;
  createdAt: string;
  updatedAt: string;
  project: { id: string; systemName: string };
};

export type ProjectPhase = {
  id: string;
  projectId: string;
  name: string;
  startDate: string | null;
  endDate: string | null;
  status: ProjectStatus | null;
  progressPercent: number | null;
  createdAt: string;
  updatedAt: string;
  project: { id: string; systemName: string };
};

export const projectProgressProcessingModes = {
  IMMEDIATE: "IMMEDIATE",
  DEFERRED: "DEFERRED",
} as const;

export type ProjectProgressProcessingMode =
  (typeof projectProgressProcessingModes)[keyof typeof projectProgressProcessingModes];

export const projectProgressTranscriptionStatuses = {
  NONE: "NONE",
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  READY: "READY",
  FAILED: "FAILED",
} as const;

export type ProjectProgressTranscriptionStatus =
  (typeof projectProgressTranscriptionStatuses)[keyof typeof projectProgressTranscriptionStatuses];

export const projectProgressTranscriptionStatusOrder: ProjectProgressTranscriptionStatus[] =
  [
    projectProgressTranscriptionStatuses.PENDING,
    projectProgressTranscriptionStatuses.PROCESSING,
    projectProgressTranscriptionStatuses.READY,
    projectProgressTranscriptionStatuses.FAILED,
    projectProgressTranscriptionStatuses.NONE,
  ];

export type ProjectProgressAudio = {
  id: string;
  mimeType: string;
  byteSize: number;
  originalName: string | null;
  durationMs: number | null;
};

export type ProjectProgressEntry = {
  id: string;
  projectId: string;
  occurredAt: string;
  body: string | null;
  transcript: string | null;
  summary: string | null;
  progressPercent: number | null;
  processingMode: ProjectProgressProcessingMode;
  transcriptionStatus: ProjectProgressTranscriptionStatus;
  transcriptionError: string | null;
  audioId: string | null;
  createdAt: string;
  updatedAt: string;
  project: { id: string; systemName: string };
  audio: ProjectProgressAudio | null;
  images: { id: string; imageId: string; sortOrder: number }[];
};

export type ProjectContractor = {
  id: string;
  projectId: string;
  name: string;
  nationalId: string | null;
  description: string | null;
  ceoName: string | null;
  timeEstimate: string | null;
  costEstimate: number | null;
  createdAt: string;
  updatedAt: string;
  project: { id: string; systemName: string };
  _count?: { members: number; phases: number; payments: number; projectLinks?: number };
};

export type ContractorProject = {
  id: string;
  systemName: string;
  code: string;
  isActive: boolean;
  status: ProjectStatus | null;
  progressPercent: number | null;
  operators: ProjectOperator[];
};

export type ContractorMember = {
  id: string;
  contractorId: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ContractorPhase = {
  id: string;
  contractorId: string;
  name: string;
  startDate: string;
  endDate: string;
  goals: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ContractorPayment = {
  id: string;
  contractorId: string;
  paidAt: string;
  amount: number;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProjectLiveBoardContractor = {
  id: string;
  name: string;
};

export type ProjectLiveBoardActivity = {
  id: string;
  occurredAt: string;
  title: string;
  excerpt: string;
  text?: string;
};

export type ProjectLiveBoardItem = Project & {
  mainContractor: ProjectLiveBoardContractor | null;
  contractors: ProjectLiveBoardContractor[];
  activityCount: number;
  lastActivity: ProjectLiveBoardActivity | null;
  recentActivities?: ProjectLiveBoardActivity[];
};

export type ProjectLiveBoardStats = {
  total: number;
  avgProgressPercent: number | null;
  maxProgressPercent: number | null;
  minProgressPercent: number | null;
  byStatus: ProjectReportKeyCount[];
};

export type ProjectLiveBoard = {
  items: ProjectLiveBoardItem[];
  stats: ProjectLiveBoardStats;
};

export type ProjectLookups = {
  companies: string[];
};

export type ProjectReportNamedCount = {
  name: string;
  count: number;
};

export type ProjectReportOrgRow = ProjectReportNamedCount & {
  activeCount: number;
  contractorCount: number;
  estimate: number;
  paid: number;
};

export type ProjectReportKeyCount = {
  key: string;
  count: number;
};

export type ProjectReportsOverview = {
  kpis: {
    totalProjects: number;
    activeProjects: number;
    inactiveProjects: number;
    supportActive: number;
    supportInactive: number;
    withContractors: number;
    withoutContractors: number;
    withReplacement: number;
    withoutReplacement: number;
    withUrl: number;
    withCompany: number;
    withLaunchYear: number;
    totalContractors: number;
    totalMembers: number;
    totalPhases: number;
    totalPayments: number;
    totalCostEstimate: number;
    totalPaid: number;
    remainingEstimate: number;
    overspendContractors: number;
    upcomingPhases: number;
    ongoingPhases: number;
    endedPhases: number;
    avgContractorsPerProject: number;
    avgMembersPerContractor: number;
    avgPhaseDays: number;
    avgProgressPercent: number;
    paidRatio: number | null;
  };
  byImportance: ProjectReportKeyCount[];
  byLifecycleStatus: ProjectReportKeyCount[];
  byStatus: ProjectReportKeyCount[];
  bySupport: ProjectReportKeyCount[];
  byContractorCoverage: ProjectReportKeyCount[];
  byPhaseStatus: ProjectReportKeyCount[];
  byOperator: ProjectReportOrgRow[];
  byCompany: ProjectReportNamedCount[];
  byContractor?: ProjectReportNamedCount[];
  byLaunchYear: { year: number | null; count: number; activeCount: number }[];
  paymentByMonth: { month: string; amount: number; count: number }[];
  financeByOperator: { name: string; estimate: number; paid: number }[];
  topProjects: {
    id: string;
    name: string;
    operators: string;
    contractorCount: number;
    memberCount: number;
    phaseCount: number;
    estimate: number;
    paid: number;
  }[];
  topContractors: {
    id: string;
    name: string;
    projectId: string;
    projectName: string;
    memberCount: number;
    phaseCount: number;
    estimate: number;
    paid: number;
  }[];
};

export type LocationSource = 'MANUAL' | 'APP' | 'STATION';

export type UserLocationHistoryItem = {
  id: string;
  seq: number;
  provinceId: string | null;
  cityId: string | null;
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
  source: LocationSource;
  createdAt: string;
  province: (GeoName & { id: string; countryId: string }) | null;
  city: (GeoName & { id: string; provinceId: string }) | null;
};

export type UserLocationHistoryList = Paginated<UserLocationHistoryItem> & {
  mapPoints: UserLocationHistoryItem[];
};

export type ManagedAccommodationLink = {
  id: string;
  isPrimary: boolean;
  year: number;
  createdAt: string;
  accommodation: {
    id: string;
    name: string;
    type?: AccommodationType;
    status?: AccommodationStatus;
  };
};

export type ManagedCaravan = {
  id: string;
  name: string;
  isActive: boolean;
  licenseNumber?: string | null;
  totalCount?: number;
  city?: (GeoName & { id: string; provinceId: string }) | null;
  walkingRoute?: { id: string; name: string } | null;
};

export type ManagedUser = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  locale: string;
  status: UserStatus;
  gender: UserGender | null;
  personType: PersonType;
  companyName: string | null;
  companyNationalId: string | null;
  companyRegistrationNo: string | null;
  companyRegisteredAt: string | null;
  economicCode: string | null;
  nationalId: string | null;
  phone: string | null;
  birthDate?: string | null;
  activityStartYear?: number | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  religion: Religion | null;
  religionOther: string | null;
  telegram: string | null;
  bale: string | null;
  eitaa: string | null;
  whatsapp: string | null;
  otherSocial: string | null;
  vehiclePlates: string[];
  countryId: string | null;
  provinceId: string | null;
  cityId: string | null;
  locationProvinceId: string | null;
  locationCityId: string | null;
  latitude: number | null;
  longitude: number | null;
  locationNotes: string | null;
  locationUpdatedAt: string | null;
  issuingOrganizationId: string | null;
  country: (GeoName & { id: string }) | null;
  province: (GeoName & { id: string; countryId: string }) | null;
  city: (GeoName & { id: string; provinceId: string }) | null;
  locationProvince: (GeoName & { id: string; countryId: string }) | null;
  locationCity: (GeoName & { id: string; provinceId: string }) | null;
  issuingOrganization: {
    id: string;
    name: string;
    phone: string | null;
  } | null;
  orgUnitId?: string | null;
  positionId?: string | null;
  workUnitId?: string | null;
  staffPostId?: string | null;
  orgUnit?: { id: string; name: string } | null;
  position?: { id: string; name: string } | null;
  workUnit?: { id: string; title: string } | null;
  staffPost?: { id: string; title: string } | null;
  photoId: string | null;
  createdAt: string;
  updatedAt: string;
  roles: RoleOption[];
  accommodationCount?: number;
  caravanCount?: number;
  representedProvinceCount?: number;
  representedCityCount?: number;
  representedProvinces?: (GeoName & { id: string })[];
  representedCities?: (GeoName & {
    id: string;
    provinceId: string;
    province: GeoName & { id: string };
  })[];
  primaryAccommodation?: { id: string; name: string } | null;
  accommodations?: ManagedAccommodationLink[];
  caravans?: ManagedCaravan[];
};

export type PublicProfilePilgrimage = {
  id: string;
  year: number;
  type: ReservationType;
  status: ReservationStatus;
  stayStartDate: string | null;
  stayEndDate: string | null;
  walkingStartDate: string | null;
  originCity: (GeoName & { id: string; provinceId: string }) | null;
  walkingRoute: { id: string; name: string } | null;
  caravan: { id: string; name: string } | null;
};

export type PublicProfileAccommodation = {
  id: string;
  year: number;
  isPrimary: boolean;
  accommodation: {
    id: string;
    name: string;
    type?: AccommodationType;
    status?: AccommodationStatus;
  };
};

export type PublicProfile = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  gender: UserGender | null;
  nationalId: string | null;
  phone: string | null;
  photoId: string | null;
  activityStartYear: number | null;
  country: (GeoName & { id: string }) | null;
  province: (GeoName & { id: string; countryId: string }) | null;
  city: (GeoName & { id: string; provinceId: string }) | null;
  roles: RoleOption[];
  caravans: ManagedCaravan[];
  accommodations: PublicProfileAccommodation[];
  pilgrimages: PublicProfilePilgrimage[];
};

export type PublicAccommodation = {
  id: string;
  name: string;
  type: AccommodationType;
  status: AccommodationStatus;
  genderType: GenderType;
  managementType: ManagementType;
  maleCapacity: number;
  femaleCapacity: number;
  phone: string | null;
  address: string | null;
  neshanAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  eitaa: string | null;
  bale: string | null;
  otherSocial: string | null;
  description: string | null;
  country: (GeoName & { id: string }) | null;
  province: (GeoName & { id: string; countryId: string }) | null;
  city: (GeoName & { id: string; provinceId: string }) | null;
  distanceToShrineKm: number | null;
  distanceToMashhadKm: number | null;
  hasLaundry: boolean;
  hasInternet: boolean;
  hasPrayerRoom: boolean;
  hasElevator: boolean;
  heatingSystem: string | null;
  coolingSystem: string | null;
  parkingCapacity: number | null;
  bathroomCount: number | null;
  toiletCount: number | null;
};

export type PublicWalkingStation = StationAmenities & {
  id: string;
  name: string;
  city: GeoName & {
    id: string;
    provinceId: string;
    latitude: number | null;
    longitude: number | null;
    province: GeoName & { id: string; countryId: string };
  };
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  neshanAddress: string | null;
  maleCount: number;
  femaleCount: number;
  managerName: string | null;
  managerPhone: string | null;
  managerTelegram: string | null;
  managerWhatsapp: string | null;
  managerEitaa: string | null;
  distanceToMashhadKm: number | null;
  description: string | null;
  routes: { id: string; name: string; stageNumber: number }[];
};

export type GeoName = {
  nameFa: string;
  nameEn: string;
};

export type Country = GeoName & {
  id: string;
  iso2: string;
  iso3: string | null;
  phoneCode: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  _count?: { provinces: number };
};

export type BankAccount = {
  id: string;
  bankName: string;
  accountNumber: string;
  cardNumber: string | null;
  iban: string | null;
  paymentId: string | null;
  description: string | null;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Discount = {
  id: string;
  year: number;
  title: string;
  percent: number;
  processTypes: FinancialProcessType[];
  appliesToAllRequests: boolean;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export const financialProcessTypes = {
  ISSUANCE: "ISSUANCE",
  RENEWAL: "RENEWAL",
  LOCATION_CHANGE: "LOCATION_CHANGE",
  AUCTION: "AUCTION",
  STEWARDSHIP: "STEWARDSHIP",
} as const;

export type FinancialProcessType =
  (typeof financialProcessTypes)[keyof typeof financialProcessTypes];

export type PaymentCaseFile = {
  id: string;
  kind: "LICENSE" | "STEWARDSHIP";
  status: "ACTIVE" | "SUSPENDED" | "EXPIRED" | "REVOKED";
  trackingCode: string | null;
  licenseNumber: string | null;
  cardNumber: string | null;
  businessUnitTitle: string | null;
  activityJobTitle: string | null;
  jobGroupTitle: string | null;
  jobTypeTitle: string | null;
  requests?: { id: string; number: string; type: string; status: string }[];
};

export type PaymentParty = {
  id: string;
  personType: PersonType;
  fullName: string;
  nationalId: string | null;
  phone: string | null;
  companyName: string | null;
  companyNationalId: string | null;
  companyRegistrationNo: string | null;
  photoId?: string | null;
  cases: PaymentCaseFile[];
};

export const paymentMethods = ["ONLINE", "POS", "BANK_RECEIPT"] as const;
export type PaymentMethod = (typeof paymentMethods)[number];
export const paymentStatuses = ["PENDING", "PAID", "FAILED"] as const;
export type PaymentStatus = (typeof paymentStatuses)[number];
export type OnlinePaymentChannel = "OPERATOR" | "PUBLIC_LINK";

export type GatewayRedirect = {
  url: string;
  fields: Record<string, string>;
};

export type PaymentLinkSms = {
  sent: boolean;
  reason: "NO_PHONE" | "SMS_UNAVAILABLE" | null;
};

export type PaymentGatewayAttempt = {
  id: string;
  gateway: string;
  channel: OnlinePaymentChannel;
  orderId: string;
  amount: number;
  status: "INITIATED" | "VERIFIED" | "SETTLED" | "FAILED" | "REVERSED";
  resCode: string | null;
  saleReferenceId: string | null;
  cardHolderPan: string | null;
  createdAt: string;
  verifiedAt: string | null;
  settledAt: string | null;
};

export type PublicPaymentSummary = {
  receiptNumber: string;
  payerName: string;
  personType: PersonType;
  status: PaymentStatus;
  open: boolean;
  expiresAt: string | null;
  subtotal: number;
  discountAmount: number;
  finalAmount: number;
  trackingCode: string | null;
  paidAt: string | null;
  createdAt: string;
  bankName: string;
  lines: { id: string; title: string; amount: number }[];
};

export type PaymentGroupFee = {
  id: string;
  title: string;
  amount: number;
  isActive: boolean;
  bankAccountId: string;
};

export type PaymentGroup = {
  id: string;
  title: string;
  bankAccountId: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  bankAccount: {
    id: string;
    bankName: string;
    accountNumber: string;
    isActive: boolean;
  };
  fees: PaymentGroupFee[];
};

export type PaymentRecord = {
  id: string;
  personType: PersonType;
  nationalId: string | null;
  companyName: string | null;
  companyNationalId: string | null;
  companyRegistrationNo: string | null;
  payerName: string;
  currentPayerName: string | null;
  payerPhone: string | null;
  payerPhotoId?: string | null;
  description: string | null;
  paymentGroupId: string | null;
  paymentGroupTitle: string | null;
  method: PaymentMethod;
  status: PaymentStatus;
  trackingCode: string | null;
  receiptNumber: string;
  payLink: {
    url: string;
    expiresAt: string | null;
    sentAt: string | null;
    open: boolean;
  } | null;
  deletedAt: string | null;
  deleteReason: string | null;
  deletedBy: { id: string; fullName: string } | null;
  caseRequest: { id: string; number: string; type: string; status: string } | null;
  discountMode: "MANUAL" | "CATALOG";
  discountId: string | null;
  discountTitle: string | null;
  discountPercent: number | null;
  feeCount: number;
  subtotal: number;
  discountAmount: number;
  finalAmount: number;
  paidAt: string | null;
  createdAt: string;
  recordedBy: { id: string; fullName: string };
  bankAccount: {
    id: string;
    bankName: string;
    accountNumber: string;
    isActive: boolean;
  };
  caseFile: PaymentCaseFile | null;
  receiptCount: number;
  lines?: {
    id: string;
    municipalFeeId: string | null;
    title: string;
    amount: number;
    sortOrder: number;
  }[];
  receipts?: PaymentReceipt[];
  gatewayTransactions?: PaymentGatewayAttempt[];
  sms?: PaymentLinkSms | null;
};

export type CaseRequestFeeStatus = "PAID" | "PENDING" | "UNPAID";

export type CaseFinance = {
  caseFile: PaymentCaseFile;
  payer: Omit<PaymentParty, "cases">;
  request: { id: string; number: string; type: string; status: string };
  hasSettings: boolean;
  settingsAccountChanged: boolean;
  finance: {
    bankAccount: {
      id: string;
      bankName: string;
      accountNumber: string;
      paymentId: string | null;
      isActive: boolean;
    };
    fees: {
      id: string;
      municipalFeeId: string;
      title: string;
      amount: number;
      calcKind: MunicipalFeeCalcKind;
      calcInputs: FeeCalcInputs | null;
      isActive: boolean;
      status: CaseRequestFeeStatus;
      /** سهم تخفیف این هزینه از پرداخت مربوط */
      discount: number;
    }[];
    availableFees: {
      id: string;
      title: string;
      amount: number;
      calcKind: MunicipalFeeCalcKind;
      calcInputs: FeeCalcInputs | null;
    }[];
  } | null;
  payments: PaymentRecord[];
  totals: {
    total: number;
    paid: number;
    discount: number;
    pending: number;
    remaining: number;
  };
};

export type CaseFinanceHead = Pick<CaseFinance, "caseFile" | "payer">;
export type CaseRequestFinance = Omit<CaseFinance, "caseFile" | "payer">;

/** امور مالی کل پرونده به تفکیک درخواست */
export type CaseFileFinance = CaseFinanceHead & {
  items: CaseRequestFinance[];
  totals: CaseFinance["totals"];
};

export type PaymentReceipt = {
  id: string;
  imageId: string;
  originalName: string | null;
  createdAt: string;
  uploadedBy: { id: string; fullName: string };
};

export type MunicipalFeeCalcKind =
  | "FIXED"
  | "ANNUAL_MEMBERSHIP"
  | "AREA_LEVY"
  | "LATE_MEMBERSHIP"
  | "LATE_AREA_LEVY";

export type FeeCalcInputs = {
  area: number | null;
  membershipFee: number | null;
  areaTariff: number | null;
  delayDays: number;
  yearNumber: number;
  factor: number;
  jobTypeTitle?: string | null;
  jobTypeAnnualFee?: number | null;
  jobTitle?: string | null;
  jobAnnualFee?: number | null;
};

export type MunicipalFee = {
  id: string;
  title: string;
  bankAccountId: string;
  amount: number;
  calcKind: MunicipalFeeCalcKind;
  processTypes: FinancialProcessType[];
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  bankAccount: {
    id: string;
    bankName: string;
    accountNumber: string;
    paymentId: string | null;
    isActive: boolean;
  };
};

export type JobType = {
  id: string;
  title: string;
  description: string | null;
  annualFee: number | null;
  annualAreaTariff: number | null;
  createdAt: string;
  updatedAt: string;
};

export type WorkUnit = {
  id: string;
  title: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type StaffPost = {
  id: string;
  title: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type RegistrationPlace = {
  id: string;
  title: string;
  description: string | null;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ViolationType = {
  id: string;
  title: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ViolationStatus =
  | 'REGISTERED'
  | 'UNDER_REVIEW'
  | 'NOTICE'
  | 'REFERRED'
  | 'VERDICT_ISSUED'
  | 'CLOSED'
  | 'DISMISSED';

export type ViolationAttachment = {
  id: string;
  kind: 'IMAGE' | 'FILE';
  originalName: string | null;
  sortOrder: number;
  mimeType?: string | null;
};

export type ViolationPerson = {
  id: string;
  fullName: string;
  photoId?: string | null;
};

export type ViolationCaseFile = {
  id: string;
  fullName: string;
  caseTrackingCode: string | null;
  licenseNumber: string | null;
  businessUnitTitle: string | null;
  jobGroupTitle: string | null;
  jobTitle: string | null;
  formationStep: number;
  violationCount?: number;
};

export type ViolationPersonLookup = {
  nationalId: string;
  found: boolean;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  birthPlace: string | null;
  identityCertificateNo: string | null;
  photoId: string | null;
  cases: ViolationCaseFile[];
};

export type CaseViolationSummary = {
  id: string;
  occurredAt: string;
  description: string | null;
  status: ViolationStatus;
  violationType: { id: string; title: string };
};

export type Violation = {
  id: string;
  nationalId: string;
  violationTypeId: string;
  violationType: { id: string; title: string };
  occurredAt: string;
  description: string | null;
  status: ViolationStatus;
  person: ViolationPerson | null;
  caseFile: ViolationCaseFile | null;
  attachments: ViolationAttachment[];
  createdAt: string;
  updatedAt: string;
  _count: { proceedings: number };
};

export type ViolationProceeding = {
  id: string;
  violationId: string;
  occurredAt: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  attachments?: ViolationAttachment[];
  _count?: { attachments: number };
};

export type ViolationReport = {
  calendar: 'jalali' | 'gregorian';
  span: 'year' | 'all';
  year: number;
  month: number | null;
  total: number;
  byStatus: { status: ViolationStatus; count: number }[];
  byType: { id: string; title: string; count: number }[];
  byPerson: { nationalId: string; fullName: string | null; count: number }[];
  monthly: { month: number; count: number }[];
  yearly: { year: number; count: number }[];
  years: number[];
};

export type InquiryCenterOfficer = {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
};

export type InquiryCenter = {
  id: string;
  name: string;
  description: string | null;
  phone: string | null;
  officerId: string | null;
  officer: InquiryCenterOfficer | null;
  letterTitle: string | null;
  letterBody: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type JobGroup = {
  id: string;
  title: string;
  titleEn: string | null;
  description: string | null;
  code: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { jobs: number };
};

export type JobGroupRepresentative = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  nationalId: string | null;
  phone: string | null;
  createdAt: string;
};

export type JobInquiryCenterRef = {
  id: string;
  name: string;
  isActive: boolean;
};

export type JobDocumentRef = {
  id: string;
  title: string;
  isRequired: boolean;
  gender: DocumentGender;
};

export type Job = {
  id: string;
  groupId: string | null;
  title: string;
  titleEn: string | null;
  taxIntaCode: string | null;
  description: string | null;
  code: string;
  jobTypeId: string;
  annualFee: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  jobType: { id: string; title: string };
  group: { id: string; title: string; titleEn: string | null; code: string | null; isActive: boolean } | null;
  inquiryCenters: JobInquiryCenterRef[];
  documents: JobDocumentRef[];
};

export const documentGenders = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  BOTH: 'BOTH',
} as const;

export type DocumentGender = (typeof documentGenders)[keyof typeof documentGenders];

export type DocumentItem = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type CommercialComplexRef = {
  id: string;
  name: string;
  nameEn: string;
  isActive: boolean;
};

export type CommercialComplex = CommercialComplexRef & {
  address: string | null;
  postalCode: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { floors: number };
};

export type CommercialFloor = {
  id: string;
  complexId: string;
  title: string;
  description: string | null;
  code: string;
  createdAt: string;
  updatedAt: string;
  complex: CommercialComplexRef;
  _count?: { lanes: number };
};

export type CommercialLane = {
  id: string;
  floorId: string;
  title: string;
  description: string | null;
  code: string;
  createdAt: string;
  updatedAt: string;
  floor: {
    id: string;
    title: string;
    code: string;
    complexId: string;
    complex: CommercialComplexRef;
  };
  _count?: { units: number };
};

export type CommercialUnit = {
  id: string;
  laneId: string;
  plaque: string;
  description: string | null;
  code: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lane: {
    id: string;
    title: string;
    code: string;
    floorId: string;
    floor: {
      id: string;
      title: string;
      code: string;
      complexId: string;
      complex: CommercialComplexRef;
    };
  };
};

export type HeadquartersRepresentativeRef = {
  id: string;
  fullName: string;
  username: string;
};

export type Province = GeoName & {
  id: string;
  countryId: string;
  code: string;
  neshanAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  hasRailway: boolean;
  hasAirport: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  country: Pick<Country, "id" | "iso2" | "nameFa" | "nameEn" | "isActive">;
  representativeId?: string | null;
  representative?: HeadquartersRepresentativeRef | null;
  _count?: { cities: number };
};

export type City = GeoName & {
  id: string;
  provinceId: string;
  code: string;
  neshanAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  isProvinceCapital: boolean;
  hasRailway: boolean;
  hasAirport: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  representativeId?: string | null;
  representative?: HeadquartersRepresentativeRef | null;
  province: {
    id: string;
    code: string;
    nameFa: string;
    nameEn: string;
    isActive: boolean;
    countryId: string;
    representativeId?: string | null;
    representative?: HeadquartersRepresentativeRef | null;
    country: Pick<Country, "id" | "iso2" | "nameFa" | "nameEn" | "isActive">;
  };
};

export const ENTRY_BORDER_TYPES = ["LAND", "AIR", "SEA"] as const;

export type EntryBorderType = (typeof ENTRY_BORDER_TYPES)[number];

export type EntryBorder = {
  id: string;
  name: string;
  neighboringCountryId: string;
  provinceId: string;
  cityId: string;
  borderType: EntryBorderType;
  isActive: boolean;
  description: string | null;
  neighboringCountry: GeoName & { id: string; iso2: string };
  province: GeoName & { id: string; countryId: string };
  city: GeoName & { id: string; provinceId: string };
  createdAt: string;
  updatedAt: string;
};

export type AccommodationManagerLink = {
  id: string;
  userId: string | null;
  isPrimary: boolean;
  year: number;
  maleCapacity: number;
  femaleCapacity: number;
  createdAt: string;
  user: { id: string; username: string; fullName: string } | null;
};

export type AccommodationYearReservation = {
  id: string;
  code: string;
  type: ReservationType;
  maleCount: number;
  femaleCount: number;
  placedMaleCount: number;
  placedFemaleCount: number;
  caravanManager: {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
  } | null;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
  };
  originCity: (GeoName & { id: string; provinceId: string }) | null;
  walkingRoute: { id: string; name: string } | null;
};

export type AccommodationContactPerson = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  nationalId: string | null;
  phone: string | null;
  birthDate?: string | null;
  status?: string;
};

export type AccommodationContactLink = {
  id: string;
  role:
    | "DEPUTY"
    | "RECEPTION"
    | "FACILITIES_SAFETY"
    | "SECURITY"
    | "HEALTH"
    | "CULTURAL"
    | "LOGISTICS_SUPPORT";
  userId: string;
  user: AccommodationContactPerson;
};

export type AccommodationYearContactLink = AccommodationContactLink & {
  year: number;
};

export type Accommodation = {
  id: string;
  name: string;
  type: AccommodationType;
  status: AccommodationStatus;
  genderType: GenderType;
  managementType: ManagementType;
  maleCapacity: number;
  femaleCapacity: number;
  overflowPercent: number;
  assignedMaleCapacity: number;
  assignedFemaleCapacity: number;
  phone: string | null;
  address: string | null;
  neshanAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  eitaa: string | null;
  bale: string | null;
  otherSocial: string | null;
  description: string | null;
  countryId: string | null;
  provinceId: string | null;
  cityId: string | null;
  country: (GeoName & { id: string }) | null;
  province: (GeoName & { id: string; countryId: string }) | null;
  city: (GeoName & { id: string; provinceId: string }) | null;
  distanceToShrineKm: number | null;
  distanceToMashhadKm: number | null;
  hasLaundry: boolean;
  hasInternet: boolean;
  hasPrayerRoom: boolean;
  hasElevator: boolean;
  heatingSystem: string | null;
  coolingSystem: string | null;
  parkingCapacity: number | null;
  bathroomCount: number | null;
  toiletCount: number | null;
  managers: AccommodationManagerLink[];
  contacts?: AccommodationContactLink[];
  yearContacts?: AccommodationYearContactLink[];
  createdAt: string;
  updatedAt: string;
};

export type AccommodationReport = {
  year: number;
  total: number;
  byManagerStatus: {
    withManager: number;
    withoutManager: number;
  };
  byYearActivity: {
    active: number;
    inactive: number;
  };
  byType: { type: AccommodationType; count: number }[];
  byGenderType: { genderType: GenderType; count: number }[];
  byManagementType: { managementType: ManagementType; count: number }[];
  byCombination: {
    genderType: GenderType;
    managementType: ManagementType;
    count: number;
  }[];
};

export type AccommodationYearStats = {
  year: number;
  total: number;
  active: number;
  inactive: number;
};

export type AccommodationYearRow = Accommodation & {
  activeInYear: boolean;
};

export type AccommodationYearTransferResult = {
  sourceYear: number;
  targetYear: number;
  copyManagers: boolean;
  requested: number;
  transferred: number;
  skipped: number;
  errors: { accommodationId: string; message: string }[];
};

export type PilgrimReportNamedCount = {
  id: string;
  name: string;
  count: number;
  previousCount: number | null;
  changePercent: number | null;
  changeCount: number | null;
};

export type PilgrimReportSummary = {
  year: number | null;
  total: number;
  byGender: {
    male: number;
    female: number;
    unspecified: number;
  };
};

export type PilgrimReportGeo = {
  year: number | null;
  byCountry: PilgrimReportNamedCount[];
  byProvince: PilgrimReportNamedCount[];
  byCity: PilgrimReportNamedCount[];
};

export type PilgrimReportTimeline = {
  year: number | null;
  byYear: {
    year: number;
    count: number;
    changePercent: number | null;
    changeCount: number | null;
  }[];
};

export type PilgrimReportPlaceTimeline = {
  placeId: string;
  placeName: string;
  byYear: {
    year: number;
    count: number;
    changePercent: number | null;
    changeCount: number | null;
  }[];
};

export type PilgrimReportProvinceTimeline = {
  provinceId: string;
  provinceName: string;
  byYear: PilgrimReportPlaceTimeline['byYear'];
};

export type PilgrimReportCityTimeline = {
  cityId: string;
  cityName: string;
  byYear: PilgrimReportPlaceTimeline['byYear'];
};

export type PilgrimReport = PilgrimReportSummary &
  PilgrimReportGeo &
  Pick<PilgrimReportTimeline, "byYear">;

export type StationAmenities = {
  hasLaundry: boolean;
  hasInternet: boolean;
  hasPrayerRoom: boolean;
  hasElevator: boolean;
  heatingSystem: string | null;
  coolingSystem: string | null;
  parkingCapacity: number | null;
  bathroomCount: number | null;
  toiletCount: number | null;
  areaSqm: number | null;
};

export const emptyStationAmenities: StationAmenities = {
  hasLaundry: false,
  hasInternet: false,
  hasPrayerRoom: false,
  hasElevator: false,
  heatingSystem: null,
  coolingSystem: null,
  parkingCapacity: null,
  bathroomCount: null,
  toiletCount: null,
  areaSqm: null,
};

export type WalkingRouteStage = StationAmenities & {
  id?: string;
  stationId: string;
  cityId: string;
  city: GeoName & {
    id: string;
    provinceId: string;
    latitude: number | null;
    longitude: number | null;
    province: GeoName & { id: string; countryId: string };
  };
  stageNumber: number;
  name: string | null;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  neshanAddress: string | null;
  maleCount: number;
  femaleCount: number;
  managerName: string | null;
  managerPhone: string | null;
  managerTelegram: string | null;
  managerWhatsapp: string | null;
  managerEitaa: string | null;
  distanceToNextKm: number | null;
  distanceToPreviousKm: number | null;
  distanceToMashhadKm: number | null;
  description: string | null;
};

export type WalkingStation = StationAmenities & {
  id: string;
  cityId: string;
  city: GeoName & {
    id: string;
    provinceId: string;
    latitude: number | null;
    longitude: number | null;
    province: GeoName & { id: string; countryId: string };
  };
  name: string;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  neshanAddress: string | null;
  maleCount: number;
  femaleCount: number;
  occupiedMaleCount?: number;
  occupiedFemaleCount?: number;
  managerUserId: string | null;
  managerName: string | null;
  managerPhone: string | null;
  managerTelegram: string | null;
  managerWhatsapp: string | null;
  managerEitaa: string | null;
  distanceToMashhadKm: number | null;
  description: string | null;
  routes: { id: string; name: string; stageNumber: number }[];
  createdAt: string;
  updatedAt: string;
};

export type ActiveWalkingRoute = {
  route: WalkingRoute | null;
};

export type WalkingRoute = {
  id: string;
  name: string;
  distanceToMashhadKm: number;
  entryBorderId: string | null;
  entryBorder: {
    id: string;
    name: string;
    borderType: EntryBorderType;
    neighboringCountry: GeoName & { id: string; iso2: string };
    province: GeoName & { id: string; countryId: string };
    city: GeoName & { id: string; provinceId: string };
  } | null;
  originCountries: (GeoName & { id: string; iso2: string })[];
  stages: WalkingRouteStage[];
  createdAt: string;
  updatedAt: string;
};

export const reservationStationStayStatuses = {
  RESERVED: "RESERVED",
  CANCELLED: "CANCELLED",
  EVACUATED: "EVACUATED",
} as const;

export type ReservationStationStayStatus =
  (typeof reservationStationStayStatuses)[keyof typeof reservationStationStayStatuses];

export type ReservationRoutePlacementStay = {
  id: string;
  stayDate: string;
  mealType: 'LUNCH' | 'DINNER';
  status: ReservationStationStayStatus;
  present: boolean;
  maleCount: number;
  femaleCount: number;
};

export type ReservationRoutePlacementStage = {
  stageId: string;
  stageNumber: number;
  stationId: string;
  name: string;
  city: GeoName & { id: string; provinceId: string };
  maleCount: number;
  femaleCount: number;
  occupiedMaleCount: number;
  occupiedFemaleCount: number;
  managerName: string | null;
  managerPhone: string | null;
  address: string | null;
  stay: ReservationRoutePlacementStay | null;
  stays?: ReservationRoutePlacementStay[];
};

export type ReservationRoutePlacementStation = {
  stationId: string;
  stageNumber: number;
  name: string;
  city: GeoName & { id: string; provinceId: string };
  maleCount: number;
  femaleCount: number;
  occupiedMaleCount: number;
  occupiedFemaleCount: number;
  managerName: string | null;
  managerPhone: string | null;
  address: string | null;
};

export type ReservationRoutePlacementMealSlot = {
  stay: ReservationRoutePlacementStay;
  station: ReservationRoutePlacementStation;
} | null;

export type ReservationRoutePlacementDay = {
  stayDate: string;
  lunch: ReservationRoutePlacementMealSlot;
  dinner: ReservationRoutePlacementMealSlot;
};

export type ReservationRoutePlacement = {
  walkingRoute: { id: string; name: string } | null;
  maleCount: number;
  femaleCount: number;
  walkingStartDate?: string | null;
  stayStartDate?: string | null;
  stages: ReservationRoutePlacementStage[];
  days?: ReservationRoutePlacementDay[];
};

export type WalkingStationStayPerson = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
};

export type WalkingStationStay = {
  id: string;
  stayDate: string;
  mealType: 'LUNCH' | 'DINNER';
  maleCount: number;
  femaleCount: number;
  status: ReservationStationStayStatus;
  present: boolean;
  reservedAt: string;
  cancelledAt: string | null;
  evacuatedAt: string | null;
  reservation: {
    id: string;
    code: string;
    type: ReservationType;
    status: ReservationStatus;
    year: number;
    createdBy: WalkingStationStayPerson;
    caravanManager: WalkingStationStayPerson | null;
    walkingStartDate?: string | null;
    walkingRoute?: { id: string; name: string } | null;
    caravan?: { id: string; name: string } | null;
    group: {
      id: string;
      name?: string;
      manager: WalkingStationStayPerson | null;
    } | null;
    person?: WalkingStationStayPerson;
    partyName?: string | null;
  };
  station?: { id: string; name: string } | null;
  reservedBy: { id: string; fullName: string };
  cancelledBy: { id: string; fullName: string } | null;
  evacuatedBy: { id: string; fullName: string } | null;
};

export type StationStayFile = WalkingStationStay;

export type StationReport = {
  year: number;
  stationId: string | null;
  stations: { id: string; name: string; maleCount: number; femaleCount: number }[];
  totals: {
    stays: number;
    reserved: number;
    present: number;
    absent: number;
    cancelled: number;
    evacuated: number;
    male: number;
    female: number;
    reservations: number;
  };
  capacity: { male: number; female: number } | null;
  byDay: {
    date: string;
    total: number;
    present: number;
    absent: number;
    male: number;
    female: number;
  }[];
  byMeal: { mealType: string; count: number }[];
  byType: { type: string; count: number }[];
  byMonth: { month: number; total: number; present: number; absent: number }[];
};

export type FoodSupplier = {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  description: string | null;
  provinceId: string;
  cityId: string;
  province: GeoName & { id: string; countryId: string };
  city: GeoName & { id: string; provinceId: string };
  createdAt: string;
  updatedAt: string;
};

export type Benefactor = {
  id: string;
  code: string | null;
  firstName: string;
  lastName: string;
  name: string;
  nationalId: string | null;
  phone: string | null;
  address: string | null;
  neshanAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  provinceId: string | null;
  cityId: string | null;
  province: (GeoName & { id: string; countryId: string }) | null;
  city: (GeoName & { id: string; provinceId: string }) | null;
  createdAt: string;
  updatedAt: string;
};

export type ContributionType = 'CASH' | 'IN_KIND';

export type GoodsUnit = {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ContributionGood = {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ContributionReportNamedRow = {
  id: string | null;
  name: string;
  count: number;
  amount: number;
  quantity?: number;
};

export type ContributionReportTimeRow = {
  year?: number;
  month?: number;
  count: number;
  amount: number;
  cashAmount: number;
  inKindAmount: number;
};

export type ContributionReport = {
  year: number | null;
  totalCount: number;
  totalAmount: number;
  cashCount: number;
  cashAmount: number;
  inKindCount: number;
  inKindAmount: number;
  benefactorCount: number;
  goodsCount: number;
  campaignCount: number;
  onlineCount: number;
  onlineAmount: number;
  campaignLinkedCount: number;
  campaignLinkedAmount: number;
  avgAmount: number;
  byType: { type: ContributionType; count: number; amount: number }[];
  byYear: ContributionReportTimeRow[];
  byMonth: ContributionReportTimeRow[];
  byGoods: ContributionReportNamedRow[];
  byBenefactor: ContributionReportNamedRow[];
  byCampaign: ContributionReportNamedRow[];
  topGoods: ContributionReportNamedRow[];
  topBenefactors: ContributionReportNamedRow[];
};

export type ContributionGoodsReportTimeRow = {
  year?: number;
  month?: number;
  count: number;
  amount: number;
  quantity: number;
};

export type ContributionGoodsReport = {
  year: number | null;
  goods: { id: string; name: string };
  unitName: string | null;
  totalCount: number;
  totalAmount: number;
  totalQuantity: number;
  benefactorCount: number;
  byYear: ContributionGoodsReportTimeRow[];
  byMonth: ContributionGoodsReportTimeRow[];
};

export type Contribution = {
  id: string;
  type: ContributionType;
  benefactorId: string;
  benefactor: {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    phone: string | null;
  };
  amount: number;
  quantity: number | null;
  goodsId: string | null;
  goods: { id: string; name: string } | null;
  unitId: string | null;
  unit: { id: string; name: string } | null;
  campaignId: string | null;
  campaign: { id: string; name: string; sharePrice?: number } | null;
  shareCount: number | null;
  trackingCode: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PlaceType = GeoName & {
  id: string;
  code: string;
  icon: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  _count?: { places: number };
};

export type PlaceTypeRef = GeoName & {
  id: string;
  code: string;
  icon: string;
  isActive: boolean;
};

export type Place = {
  id: string;
  name: string;
  placeTypeId: string;
  provinceId: string;
  cityId: string;
  phone: string | null;
  address: string | null;
  neshanAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  placeType: PlaceTypeRef;
  province: GeoName & { id: string; countryId: string };
  city: GeoName & { id: string; provinceId: string };
  createdAt: string;
  updatedAt: string;
};

export type GovernmentOrganizationContactUser = {
  id: string;
  fullName: string;
  phone: string | null;
  nationalId: string | null;
};

export type GovernmentOrganization = {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  contactUserId: string | null;
  contactUser: GovernmentOrganizationContactUser | null;
  mobile: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export const supportRequestTypes = {
  GOODS: "GOODS",
  PLACE: "PLACE",
  TRANSPORT: "TRANSPORT",
  OTHER: "OTHER",
} as const;
export type SupportRequestType =
  (typeof supportRequestTypes)[keyof typeof supportRequestTypes];

export const supportRequestStatuses = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  FULFILLED: "FULFILLED",
  REJECTED: "REJECTED",
} as const;
export type SupportRequestStatus =
  (typeof supportRequestStatuses)[keyof typeof supportRequestStatuses];

export type SupportRequestOrg = {
  id: string;
  name: string;
};

export type SupportRequestPerson = {
  id: string;
  fullName: string;
};

export type SupportRequest = {
  id: string;
  organizationId: string;
  organization: SupportRequestOrg;
  type: SupportRequestType;
  subject: string;
  quantity: number | null;
  requestedAt: string;
  neededBy: string | null;
  description: string | null;
  status: SupportRequestStatus;
  handlingOrganizationId: string | null;
  handlingOrganization: SupportRequestOrg | null;
  handledAt: string | null;
  handlingNotes: string | null;
  requestedById: string | null;
  requestedBy: SupportRequestPerson | null;
  handledById: string | null;
  handledBy: SupportRequestPerson | null;
  createdAt: string;
  updatedAt: string;
};

export type SupportRequestReportTypeRow = {
  type: SupportRequestType;
  count: number;
  quantity: number;
  pending: number;
  inProgress: number;
  fulfilled: number;
  rejected: number;
};

export type SupportRequestReportStatusRow = {
  status: SupportRequestStatus;
  count: number;
  quantity: number;
};

export type SupportRequestReportOrgRow = {
  id: string;
  name: string;
  count: number;
  quantity: number;
  pending: number;
  inProgress: number;
  fulfilled: number;
  rejected: number;
};

export type SupportRequestReportHandlingOrgRow = {
  id: string;
  name: string;
  count: number;
  quantity: number;
};

export type SupportRequestReportMonthRow = {
  month: number;
  count: number;
  quantity: number;
};

export type SupportRequestReport = {
  year: number;
  fromDate: string;
  toDate: string;
  total: number;
  quantity: number;
  pending: number;
  inProgress: number;
  fulfilled: number;
  rejected: number;
  byType: SupportRequestReportTypeRow[];
  byStatus: SupportRequestReportStatusRow[];
  byOrganization: SupportRequestReportOrgRow[];
  byHandlingOrganization: SupportRequestReportHandlingOrgRow[];
  byMonth: SupportRequestReportMonthRow[];
};

export type HeadquartersPhone = {
  id: string;
  headquartersId: string;
  phone: string;
  department: string | null;
  description: string | null;
  headquarters?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
};

export type HeadquartersInfo = {
  id: string;
  name: string;
  title: string | null;
  address: string | null;
  neshanAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  activityStartYear: number | null;
  website: string | null;
  eitaa: string | null;
  bale: string | null;
  telegram: string | null;
  instagram: string | null;
  logoId: string | null;
  phoneCount: number;
  phones?: HeadquartersPhone[];
  createdAt: string;
  updatedAt: string;
};

export type HeadquartersSummaryPhone = {
  id: string;
  phone: string;
  department: string | null;
};

export type HeadquartersServiceSummary = {
  name: string | null;
  title: string | null;
  address: string | null;
  neshanAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  activityStartYear: number | null;
  currentYear: number;
  yearsOfService: number | null;
  website: string | null;
  eitaa: string | null;
  bale: string | null;
  telegram: string | null;
  instagram: string | null;
  logoId: string | null;
  phones: HeadquartersSummaryPhone[];
};

export type HeadquartersNewsTranslation = {
  locale: string;
  title: string;
  summary: string | null;
  body: string;
};

export type HeadquartersNews = {
  id: string;
  title: string;
  summary: string | null;
  body: string;
  publishedAt: string;
  isPublished: boolean;
  imageId: string | null;
  translations?: HeadquartersNewsTranslation[];
  translatedLocales?: string[];
  contentLocale?: string;
  createdAt: string;
  updatedAt: string;
};

export const announcementAudiences = {
  PILGRIMS: "PILGRIMS",
  CARAVAN_MANAGERS: "CARAVAN_MANAGERS",
  ACCOMMODATION_MANAGERS: "ACCOMMODATION_MANAGERS",
} as const;

export type AnnouncementAudience =
  (typeof announcementAudiences)[keyof typeof announcementAudiences];

export type HeadquartersAnnouncement = {
  id: string;
  title: string;
  body: string;
  audience: AnnouncementAudience;
  publishedAt: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type OrgUnitManager = {
  id: string;
  fullName: string;
  phone: string | null;
  nationalId: string | null;
};

export type PublicOrgUnitManager = {
  id: string;
  fullName: string;
  photoId: string | null;
};

export type PublicOrgUnit = {
  id: string;
  name: string;
  phone: string | null;
  description: string | null;
  eitaaChannel: string | null;
  telegramChannel: string | null;
  manager: PublicOrgUnitManager | null;
};

export type OrgUnit = {
  id: string;
  name: string;
  phone: string | null;
  description: string | null;
  eitaaChannel: string | null;
  telegramChannel: string | null;
  managerUserId: string | null;
  manager: OrgUnitManager | null;
  accommodationLiaisonCount: number;
  caravanLiaisonCount: number;
  createdAt: string;
  updatedAt: string;
};

export type OrgUnitLiaisonPerson = {
  id: string;
  fullName: string;
  phone: string | null;
  nationalId: string | null;
  role: string;
  place: { id: string; name: string };
  units: { id: string; name: string }[];
};

export const issuedLicenseStatuses = {
  ISSUED: "ISSUED",
  APPROVED: "APPROVED",
  REVOKED: "REVOKED",
} as const;

export type IssuedLicenseStatus =
  (typeof issuedLicenseStatuses)[keyof typeof issuedLicenseStatuses];

export type IssuedLicensePerson = {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  nationalId: string | null;
  phone: string | null;
  status: UserStatus;
};

export type IssuedLicenseCaravan = {
  id: string;
  name: string;
  officeAddress: string | null;
  officePhone: string | null;
  licenseNumber: string | null;
  foundedYear: number | null;
  isActive: boolean;
  city: {
    id: string;
    nameFa: string;
    nameEn: string;
    provinceId: string;
    province: GeoName & { id: string; countryId: string };
  };
};

export type IssuedLicense = {
  id: string;
  managerUserId: string;
  caravanId: string;
  issuerUserId: string;
  organizationId: string | null;
  description: string | null;
  issuedAt: string;
  status: IssuedLicenseStatus;
  revokedAt: string | null;
  revokedById: string | null;
  approvedAt: string | null;
  approvedById: string | null;
  fileId: string | null;
  createdAt: string;
  updatedAt: string;
  manager: IssuedLicensePerson;
  issuer: IssuedLicensePerson;
  approvedBy: IssuedLicensePerson | null;
  revokedBy: IssuedLicensePerson | null;
  organization: { id: string; name: string; phone: string | null } | null;
  caravan: IssuedLicenseCaravan;
};

export type CaravanManagerLookup = {
  manager: IssuedLicensePerson & {
    city?:
      | (GeoName & { id: string; provinceId: string; province: GeoName })
      | null;
  };
  caravans: IssuedLicenseCaravan[];
};

export type Supplier = {
  id: string;
  name: string;
  type: SupplierType;
  address: string | null;
  phone: string | null;
  contactPerson: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SupplierItem = {
  id: string;
  supplierId: string;
  year: number;
  name: string;
  unit: string;
  quantity: number;
  remainingQuantity: number;
  deliveryDate: string;
  returnDate: string | null;
  description: string | null;
  supplier: Pick<Supplier, "id" | "name" | "type">;
  createdAt: string;
  updatedAt: string;
};

export type AccommodationLoan = {
  id: string;
  supplierItemId: string;
  accommodationManagerId: string;
  quantity: number;
  returnedQuantity: number | null;
  shortage: number | null;
  deliveryDate: string;
  plannedReturnDate: string | null;
  actualReturnDate: string | null;
  description: string | null;
  supplierItem: {
    id: string;
    name: string;
    unit: string;
    year: number;
    supplier: { id: string; name: string };
  };
  accommodationManager: { id: string; fullName: string; username: string };
  createdAt: string;
  updatedAt: string;
};

export type LoanReportItemRow = {
  itemName: string;
  unit: string;
  received: number;
  delivered: number;
  returned: number;
  unreturned: number;
};

export type LoanReportItemStockRow = {
  itemId: string;
  itemName: string;
  supplierName: string;
  quantity: number;
  unit: string;
  delivered: number;
  returned: number;
  remaining: number;
};

export type LoanReportSupplierRow = {
  supplierId: string;
  supplierName: string;
  received: number;
  delivered: number;
  returned: number;
  unreturned: number;
};

export type LoanReportManagerRow = {
  managerId: string;
  managerName: string;
  delivered: number;
  returned: number;
  unreturned: number;
};

export type LoanReport = {
  year: number;
  receivedFromSuppliers: number;
  deliveredToManagers: number;
  returned: number;
  unreturned: number;
  warehouseRemaining: number;
  itemStock: LoanReportItemStockRow[];
  byItem: LoanReportItemRow[];
  bySupplier: LoanReportSupplierRow[];
  byManager: LoanReportManagerRow[];
};

export type ItemQuota = {
  id: string;
  year: number;
  name: string;
  unit: string;
  quantity: number;
  remainingQuantity: number;
  supplierId: string | null;
  description: string | null;
  supplier: Pick<Supplier, "id" | "name" | "type" | "phone" | "address"> | null;
  createdAt: string;
  updatedAt: string;
};

export type ItemQuotaVoucher = {
  id: string;
  code: string;
  quotaId: string;
  accommodationManagerId: string;
  quantity: number;
  supplierId: string | null;
  supplierName: string;
  pickupLocation: string | null;
  description: string | null;
  issuedAt: string;
  quota: {
    id: string;
    year: number;
    name: string;
    unit: string;
    quantity: number;
  };
  accommodationManager: {
    id: string;
    fullName: string;
    username: string;
    firstName: string;
    lastName: string;
    gender: UserGender | null;
    nationalId: string | null;
    phone: string | null;
  };
  currentAccommodation?: { id: string; name: string } | null;
  supplier: Pick<Supplier, "id" | "name" | "phone" | "address" | "type"> | null;
  createdAt: string;
  updatedAt: string;
};

export type ItemQuotaVoucherReportQuotaRow = {
  quotaId: string;
  itemName: string;
  unit: string;
  supplierName: string | null;
  quotaQuantity: number;
  issuedQuantity: number;
  remainingQuantity: number;
  voucherCount: number;
};

export type ItemQuotaVoucherReportItemRow = {
  itemName: string;
  unit: string;
  quotaQuantity: number;
  issuedQuantity: number;
  remainingQuantity: number;
  voucherCount: number;
};

export type ItemQuotaVoucherReportSupplierRow = {
  supplierId: string | null;
  supplierName: string;
  voucherCount: number;
  issuedQuantity: number;
};

export type ItemQuotaVoucherReportManagerRow = {
  managerId: string;
  managerName: string;
  voucherCount: number;
  issuedQuantity: number;
};

export type ItemQuotaVoucherReportDay = {
  date: string;
  voucherCount: number;
  issuedQuantity: number;
};

export type ItemQuotaVoucherReport = {
  year: number;
  quotaCount: number;
  issuedCount: number;
  quotaQuantity: number;
  issuedQuantity: number;
  remainingQuantity: number;
  managerCount: number;
  supplierCount: number;
  byQuota: ItemQuotaVoucherReportQuotaRow[];
  byItem: ItemQuotaVoucherReportItemRow[];
  bySupplier: ItemQuotaVoucherReportSupplierRow[];
  byManager: ItemQuotaVoucherReportManagerRow[];
  byDay: ItemQuotaVoucherReportDay[];
};

export const iceVoucherStatuses = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export type IceVoucherStatus =
  (typeof iceVoucherStatuses)[keyof typeof iceVoucherStatuses];

export const iceVoucherPaymentStatuses = {
  UNPAID: "UNPAID",
  PAID: "PAID",
} as const;

export type IceVoucherPaymentStatus =
  (typeof iceVoucherPaymentStatuses)[keyof typeof iceVoucherPaymentStatuses];

export type IceVoucherSettings = {
  id: string;
  moldsPer50Pilgrims: number;
  costPerMold: number;
  activityStartDate: string | null;
  activityEndDate: string | null;
};

export type IceVoucherQuota = {
  accommodationId: string;
  accommodationName: string;
  capacity: number;
  moldsPer50Pilgrims: number;
  costPerMold: number;
  maxMoldCount: number;
};

export type IceVoucherAccommodationOption = {
  id: string;
  name: string;
  maleCapacity: number;
  femaleCapacity: number;
  managerName: string | null;
};

export type IceVoucher = {
  id: string;
  code: string;
  year: number;
  accommodationId: string;
  accommodationManagerId: string;
  requestedAt: string;
  moldCount: number;
  costPerMold: number;
  totalCost: number;
  description: string | null;
  status: IceVoucherStatus;
  paymentStatus: IceVoucherPaymentStatus;
  paidAt: string | null;
  approvedAt: string | null;
  approvedById: string | null;
  accommodation: {
    id: string;
    name: string;
    maleCapacity: number;
    femaleCapacity: number;
  };
  accommodationManager: {
    id: string;
    fullName: string;
    username: string;
    phone: string | null;
  };
  approvedBy: { id: string; fullName: string; username: string } | null;
  createdAt: string;
  updatedAt: string;
};

export type IceVoucherReportDay = {
  date: string;
  voucherCount: number;
  moldCount: number;
  totalCost: number;
};

export type IceVoucherReport = {
  year: number;
  issuedCount: number;
  moldCount: number;
  totalCost: number;
  paidCount: number;
  paidCost: number;
  unpaidCount: number;
  unpaidCost: number;
  byDay: IceVoucherReportDay[];
};

export type IceVoucherStats = {
  year: number;
  total: number;
  approved: number;
  unapproved: number;
  paid: number;
  unpaid: number;
  payableUnpaid?: { id: string; totalCost: number }[];
};

export const reservationTypes = {
  INDIVIDUAL: "INDIVIDUAL",
  GROUP: "GROUP",
  CARAVAN: "CARAVAN",
} as const;

export type ReservationType =
  (typeof reservationTypes)[keyof typeof reservationTypes];

export const placementModes = {
  MANUAL: "MANUAL",
  SYSTEM: "SYSTEM",
} as const;

export type PlacementMode = (typeof placementModes)[keyof typeof placementModes];

export const placementGenderPolicies = {
  SINGLE_GENDER: "SINGLE_GENDER",
  MIXED: "MIXED",
} as const;

export type PlacementGenderPolicy =
  (typeof placementGenderPolicies)[keyof typeof placementGenderPolicies];

export const placementStatuses = {
  NOT_REQUIRED: "NOT_REQUIRED",
  PENDING: "PENDING",
  PARTIAL: "PARTIAL",
  PLACED: "PLACED",
} as const;

export type PlacementStatus =
  (typeof placementStatuses)[keyof typeof placementStatuses];

export type ReservationFeatures = {
  companions: boolean;
  insurance: boolean;
  mashhadPlacement: boolean;
  routePlacement: boolean;
  caravanContacts: boolean;
};

export const allocationSources = {
  SYSTEM: "SYSTEM",
  MANUAL: "MANUAL",
  HYBRID: "HYBRID",
} as const;

export type AllocationSource =
  (typeof allocationSources)[keyof typeof allocationSources];

export const reservationStatuses = {
  DRAFT: "DRAFT",
  PENDING_MANAGEMENT_REVIEW: "PENDING_MANAGEMENT_REVIEW",
  COMPANIONS: "COMPANIONS",
  CARAVAN_CONTACTS: "CARAVAN_CONTACTS",
  INSURANCE: "INSURANCE",
  COMPLETED: "COMPLETED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
} as const;

export type ReservationStatus =
  (typeof reservationStatuses)[keyof typeof reservationStatuses];

export const reservationMemberInsuranceStatuses = {
  PENDING: "PENDING",
  PAID: "PAID",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export type ReservationMemberInsuranceStatus =
  (typeof reservationMemberInsuranceStatuses)[keyof typeof reservationMemberInsuranceStatuses];

export const reservationMemberInsurancePaidMethods = {
  MANAGEMENT: "MANAGEMENT",
  ONLINE_GATEWAY: "ONLINE_GATEWAY",
  BANK_RECEIPT: "BANK_RECEIPT",
} as const;

export type ReservationMemberInsurancePaidMethod =
  (typeof reservationMemberInsurancePaidMethods)[keyof typeof reservationMemberInsurancePaidMethods];

export const reservationPermitStatuses = {
  NONE: "NONE",
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export type ReservationPermitStatus =
  (typeof reservationPermitStatuses)[keyof typeof reservationPermitStatuses];

export const reservationPermitSources = {
  UPLOAD: "UPLOAD",
  ISSUED_LICENSE: "ISSUED_LICENSE",
} as const;

export type ReservationPermitSource =
  (typeof reservationPermitSources)[keyof typeof reservationPermitSources];

export type ReservationPermitOption = {
  id: string;
  managerUserId: string;
  caravanId: string;
  organizationId: string | null;
  description: string | null;
  issuedAt: string;
  status: IssuedLicenseStatus;
  fileId: string | null;
  organization: { id: string; name: string } | null;
  issuer: ReservationPerson;
};

export type ReservationPermitOptions = {
  caravanId: string;
  managerUserId: string | null;
  items: ReservationPermitOption[];
};

export type ReservationInsuranceSummary = {
  total: number;
  pending: number;
  paid: number;
  approved: number;
  rejected: number;
  completed: boolean;
  paidAmount?: number;
  lastPaidAt?: string | null;
};

export type ReservationPerson = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  nationalId: string | null;
  phone: string | null;
  eitaa?: string | null;
  gender: UserGender | null;
  birthDate: string | null;
  status: UserStatus;
};

export type ReservationMember = {
  id: string;
  user: ReservationPerson;
  requestsSimCard: boolean;
  requestsBankCard: boolean;
  insuranceStatus: ReservationMemberInsuranceStatus;
  insurancePaidAt: string | null;
  insurancePaidAmount: number | null;
  insuranceCoverageAmount: number | null;
  insurancePlanId: string | null;
  insurancePaymentRef: string | null;
  insuranceReceiptDate: string | null;
  insuranceReceiptBankName: string | null;
  insurancePaidMethod: ReservationMemberInsurancePaidMethod | null;
  insurancePaidById: string | null;
  insurancePaidBy: ReservationPerson | null;
  insuranceManualNote: string | null;
};

export type MemberImportRowStatus = "VALID" | "INVALID" | "DUPLICATE";
export type MemberImportUserState = "NEW" | "EXISTING" | "ALREADY_MEMBER";

export type MemberImportPreviewRow = {
  rowNumber: number;
  nationalId: string;
  firstName: string;
  lastName: string;
  gender: UserGender | null;
  genderText: string;
  phone: string | null;
  birthDate: string | null;
  requestsSimCard: boolean;
  requestsBankCard: boolean;
  status: MemberImportRowStatus;
  errors: string[];
  duplicateOfRow?: number;
  userState: MemberImportUserState;
  existingUser?: { fullName: string; gender: UserGender | null };
};

export type MemberImportPreview = {
  total: number;
  valid: number;
  invalid: number;
  duplicate: number;
  maleCount: number;
  femaleCount: number;
  remainingMale: number;
  remainingFemale: number;
  rows: MemberImportPreviewRow[];
};

export type PilgrimHistoryPerson = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  nationalId: string | null;
  phone: string | null;
};

export type PilgrimHistoryParty = {
  id: string;
  name: string;
  maleCount?: number;
  femaleCount?: number;
  totalCount?: number;
  city?: (GeoName & { id: string; provinceId: string }) | null;
  manager?: PilgrimHistoryPerson | null;
  officePhone?: string | null;
  foundedYear?: number | null;
  licenseNumber?: string | null;
  isActive?: boolean;
};

export type PilgrimPilgrimageHistoryItem = {
  id: string;
  code: string;
  year: number;
  type: ReservationType;
  status: ReservationStatus;
  originCity: (GeoName & { id: string; provinceId: string }) | null;
  walkingRoute: { id: string; name: string } | null;
  stayStartDate: string | null;
  stayEndDate: string | null;
  walkingStartDate: string | null;
  requestsAccommodation: boolean;
  requestsBus: boolean;
  requestsSimCard: boolean;
  requestsBankCard: boolean;
  specialServices: string | null;
  requestedMaleCount: number;
  requestedFemaleCount: number;
  maleCount: number;
  femaleCount: number;
  totalCount: number;
  hasPermit: boolean;
  permitStatus: ReservationPermitStatus;
  createdAt: string;
  completedAt: string | null;
  insuranceStatus: ReservationMemberInsuranceStatus | null;
  isMember: boolean;
  caravan: PilgrimHistoryParty | null;
  group: PilgrimHistoryParty | null;
  caravanManager: PilgrimHistoryPerson | null;
  createdBy: PilgrimHistoryPerson | null;
};

export type CaravanPilgrimageHistoryItem = {
  id: string;
  code: string;
  year: number;
  type: ReservationType;
  status: ReservationStatus;
  originCity: (GeoName & { id: string; provinceId: string }) | null;
  walkingRoute: { id: string; name: string } | null;
  stayStartDate: string | null;
  stayEndDate: string | null;
  walkingStartDate: string | null;
  requestsAccommodation: boolean;
  requestsBus: boolean;
  requestsSimCard: boolean;
  requestsBankCard: boolean;
  specialServices: string | null;
  requestedMaleCount: number;
  requestedFemaleCount: number;
  maleCount: number;
  femaleCount: number;
  totalCount: number;
  memberCount: number;
  hasPermit: boolean;
  permitStatus: ReservationPermitStatus;
  createdAt: string;
  completedAt: string | null;
  caravanManager: PilgrimHistoryPerson | null;
  createdBy: PilgrimHistoryPerson | null;
};

export type PreviousCaravanReservation = {
  id: string;
  code: string;
  year: number;
  status: ReservationStatus;
  stayStartDate: string | null;
  stayEndDate: string | null;
  originCity: { nameFa: string; nameEn: string } | null;
  memberCount: number;
  maleCount: number;
  femaleCount: number;
  alreadyMemberCount: number;
  transferableCount: number;
};

export type PreviousCaravanReservations = {
  items: PreviousCaravanReservation[];
};

export type PreviousApprovedCounts = {
  previous: {
    id: string;
    year: number;
    type: ReservationType;
    status: ReservationStatus;
    maleCount: number;
    femaleCount: number;
    totalCount: number;
    requestedMaleCount: number;
    requestedFemaleCount: number;
    managementReviewedAt: string | null;
  } | null;
};

export type ReservationCaravanContact = {
  id: string;
  role: "DEPUTY" | "CLERIC" | "CULTURAL" | "SECURITY" | "RECEPTION";
  user: ReservationPerson;
};

export type ReservationTravelHistoryItem = {
  id: string;
  reservationId: string;
  userId: string;
  walkingStationId: string | null;
  walkingStation: {
    id: string;
    name: string | null;
    latitude: number | null;
    longitude: number | null;
  } | null;
  provinceId: string | null;
  cityId: string | null;
  province: (GeoName & { id: string; countryId: string }) | null;
  city: (GeoName & { id: string; provinceId: string; latitude?: number | null; longitude?: number | null }) | null;
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
  createdAt: string;
};

export type ReservationTravelHistoryList = {
  items: ReservationTravelHistoryItem[];
};

export type ReservationHonoraryAssignment = {
  id: string;
  user: ReservationPerson;
  serviceType: { id: string; name: string; code: string | null };
  assignedBy?: ReservationPerson | null;
  createdAt: string;
};

export type ReservationListItem = {
  id: string;
  code: string;
  year: number;
  type: ReservationType;
  status: ReservationStatus;
  placementMode: PlacementMode;
  placementStatus: PlacementStatus;
  originCity: (GeoName & { id: string; provinceId: string }) | null;
  stayStartDate: string | null;
  stayEndDate: string | null;
  walkingStartDate: string | null;
  requestsAccommodation: boolean;
  requestsBus: boolean;
  requestsSimCard: boolean;
  requestsBankCard: boolean;
  simCardRequestCount?: number;
  bankCardRequestCount?: number;
  specialServices: string | null;
  requestedMaleCount: number;
  requestedFemaleCount: number;
  maleCount: number;
  femaleCount: number;
  totalCount: number;
  accommodatedMaleCount?: number;
  accommodatedFemaleCount?: number;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  caravanId: string | null;
  groupId: string | null;
  caravan: {
    id: string;
    name: string;
    managerUserId: string | null;
    eitaa?: string | null;
    maleCount?: number;
    femaleCount?: number;
    totalCount?: number;
    city?: Group["city"];
  } | null;
  group: {
    id: string;
    name: string;
    managerUserId: string | null;
    maleCount?: number;
    femaleCount?: number;
    totalCount?: number;
    city?: Group["city"];
  } | null;
  createdBy?: ReservationPerson;
  caravanManager?: ReservationPerson | null;
  hasPermit: boolean;
  permitStatus: ReservationPermitStatus;
  permitSource: ReservationPermitSource | null;
  returnedToStatus?: ReservationStatus | null;
  createWizardStep?: string | null;
  walkingRoute?: { id: string; name: string } | null;
  originCountry?: (GeoName & { id: string; iso2: string }) | null;
  features?: ReservationFeatures;
  internationalWorkflow?: boolean;
  iraqiWorkflow?: boolean;
  honoraryAssignments?: ReservationHonoraryAssignment[];
};

export type Reservation = ReservationListItem & {
  createdBy: ReservationPerson;
  walkingRoute: { id: string; name: string } | null;
  stayStartDate: string | null;
  stayEndDate: string | null;
  walkingStartDate: string | null;
  simCardNumber: string | null;
  simCardOperator: string | null;
  simCardDeliveredAt: string | null;
  simCardInitialCharge: number | null;
  bankCardNumber: string | null;
  bankCardIban: string | null;
  bankCardBank: string | null;
  bankCardDeliveredAt: string | null;
  bankCardInitialBalance: number | null;
  caravanManager: ReservationPerson | null;
  honoraryAssignments?: ReservationHonoraryAssignment[];
  iraqiWorkflow?: boolean;
  caravanManagerNotes: string | null;
  managementNotes: string | null;
  rejectionReason: string | null;
  permitImageId: string | null;
  issuedLicenseId: string | null;
  issuedLicense: ReservationPermitOption | null;
  permitReviewedAt: string | null;
  permitReviewedBy?: ReservationPerson | null;
  permitRejectionReason: string | null;
  basicInfoLockedAt: string | null;
  basicInfoCompletedAt: string | null;
  managementReviewedAt: string | null;
  companionsCompletedAt: string | null;
  caravanContactsCompletedAt: string | null;
  insuranceCompletedAt: string | null;
  placementCompletedAt: string | null;
  cancelledAt: string | null;
  rejectedAt: string | null;
  returnedToStatus?: ReservationStatus | null;
  basicInfoCompletedBy?: ReservationPerson | null;
  managementReviewedBy?: ReservationPerson | null;
  companionsCompletedBy?: ReservationPerson | null;
  caravanContactsCompletedBy?: ReservationPerson | null;
  insuranceCompletedBy?: ReservationPerson | null;
  completedBy?: ReservationPerson | null;
  placementCompletedBy?: ReservationPerson | null;
  rejectedBy?: ReservationPerson | null;
  cancelledBy?: ReservationPerson | null;
  members?: ReservationMember[];
  caravanContacts?: ReservationCaravanContact[];
  allocations?: ReservationAllocationSummary[];
};

export type ReservationStayManager = {
  id: string;
  userId: string | null;
  isPrimary: boolean;
  year: number;
  user: { id: string; fullName: string; phone?: string | null } | null;
};

export type ReservationStayAccommodation = {
  id: string;
  name: string;
  genderType: GenderType;
  phone?: string | null;
  address?: string | null;
  neshanAddress?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  distanceToShrineKm?: number | null;
  eitaa?: string | null;
  bale?: string | null;
  otherSocial?: string | null;
  managers?: ReservationStayManager[];
};

export type ReservationAllocationSummary = {
  id: string;
  accommodationId: string;
  accommodation: ReservationStayAccommodation;
  gender: UserGender;
  headcount: number;
  source: AllocationSource;
  genderOverride: boolean;
  overrideNote: string | null;
  placedAt: string;
  placedBy: ReservationPerson;
};

export type PlacementQueueItem = {
  id: string;
  code: string;
  year: number;
  type: ReservationType;
  status: ReservationStatus;
  placementMode: PlacementMode;
  placementStatus: PlacementStatus;
  stayStartDate: string | null;
  stayEndDate: string | null;
  maleCount: number;
  femaleCount: number;
  totalCount: number;
  accommodatedMaleCount?: number;
  accommodatedFemaleCount?: number;
  allocatedMale: number;
  allocatedFemale: number;
  partyName: string;
  caravan: { id: string; name: string } | null;
  group: { id: string; name: string } | null;
  createdBy: ReservationPerson;
  caravanManager: ReservationPerson | null;
  createdAt: string;
};

export type PlacementAllocation = ReservationAllocationSummary & {
  status: "ACTIVE" | "VACATED";
  notes: string | null;
  usesOverflow?: boolean;
};

export type PlacementReservationDetail = PlacementQueueItem & {
  placementGenderPolicy: PlacementGenderPolicy;
  allocations: PlacementAllocation[];
};

export type PlacementAvailability = {
  id: string;
  name: string;
  genderType: GenderType;
  maleCapacity: number;
  femaleCapacity: number;
  overflowPercent: number;
  effectiveMale: number;
  effectiveFemale: number;
  remainingMale: number;
  remainingFemale: number;
  remainingNominalMale: number;
  remainingNominalFemale: number;
  otherGenders: UserGender[];
};

export type PlacementDueItem = {
  id: string;
  gender: UserGender;
  headcount: number;
  source: AllocationSource;
  placedAt: string;
  accommodation: { id: string; name: string; genderType: GenderType };
  reservation: {
    id: string;
    code: string;
    type: ReservationType;
    year: number;
    stayStartDate: string | null;
    stayEndDate: string | null;
    partyName: string;
  };
};

export type ReceptionInsurancePlan = {
  id: string;
  coverageAmount: number;
  premiumAmount: number;
  description: string;
  sortOrder: number;
};

export type ReceptionSettings = {
  year: number;
  exists: boolean;
  individualEnabled: boolean;
  individualMaleCapacity: number;
  individualFemaleCapacity: number;
  individualAutoApprove: boolean;
  individualPlacementMode: PlacementMode;
  individualIntro: string;
  individualRules: string;
  groupEnabled: boolean;
  groupMaleCapacity: number;
  groupFemaleCapacity: number;
  groupAutoApprove: boolean;
  groupPlacementMode: PlacementMode;
  groupIntro: string;
  groupRules: string;
  caravanEnabled: boolean;
  caravanMaleCapacity: number;
  caravanFemaleCapacity: number;
  caravanAutoApprove: boolean;
  caravanAutoApproveLicenses: boolean;
  caravanPlacementMode: PlacementMode;
  caravanIntro: string;
  caravanRules: string;
  placementGenderPolicy: PlacementGenderPolicy;
  mashhadPlacementCountries: (GeoName & { id: string; iso2: string })[];
  routePlacementCountries: (GeoName & { id: string; iso2: string })[];
  companionsCountries: (GeoName & { id: string; iso2: string })[];
  insuranceCountries: (GeoName & { id: string; iso2: string })[];
  individualCountries: (GeoName & { id: string; iso2: string })[];
  groupCountries: (GeoName & { id: string; iso2: string })[];
  caravanCountries: (GeoName & { id: string; iso2: string })[];
  caravanContactsCountries: (GeoName & { id: string; iso2: string })[];
  insuranceOrganization: string;
  insuranceBankAccountId: string | null;
  insuranceBankAccount: PublicBankAccount | null;
  insurancePlans: ReceptionInsurancePlan[];
  imamRezaMartyrdomDate: string | null;
  prophetDemiseDate: string | null;
  helpTravel: string;
  helpReview: string;
  helpCompanions: string;
  helpCompanionsCaravan: string;
  helpContacts: string;
  helpInsurance: string;
  helpComplete: string;
  helpPlacement: string;
};

export type ReceptionCapacitySlice = {
  maleCapacity: number;
  femaleCapacity: number;
  maleUsed: number;
  femaleUsed: number;
  maleRemaining: number;
  femaleRemaining: number;
};

export type ReceptionDashboardTypeSlice = {
  reservations: number;
  maleCount: number;
  femaleCount: number;
  totalCount: number;
};

export type ReceptionDashboard = {
  year: number;
  totals: {
    all: number;
    pendingReview: number;
    inProgress: number;
    completed: number;
    rejected: number;
    cancelled: number;
  };
  progress: {
    draft: number;
    companions: number;
    contacts: number;
    insurance: number;
  };
  types: {
    individual: ReceptionDashboardTypeSlice;
    group: ReceptionDashboardTypeSlice;
    caravan: ReceptionDashboardTypeSlice;
  };
  capacity: ReceptionCapacity;
};

export type ReceptionCapacity = {
  year: number;
  exists: boolean;
  individual: ReceptionCapacitySlice;
  group: ReceptionCapacitySlice;
  caravan: ReceptionCapacitySlice;
};

export type UserHomeReservationTotals = {
  all: number;
  inProgress: number;
  pendingReview: number;
  completed: number;
};

export type UserHomeCaravan = {
  id: string;
  name: string;
  isActive: boolean;
  city: GeoName & { id: string; provinceId: string };
};

export type UserHomePilgrim = {
  totals: UserHomeReservationTotals;
  recent: ReservationListItem[];
};

export type UserHomeCaravanManager = {
  caravanCount: number;
  activeCaravanCount: number;
  totals: UserHomeReservationTotals;
  recentCaravans: UserHomeCaravan[];
  recentReservations: ReservationListItem[];
};

export type UserHomeDashboard = {
  pilgrim: UserHomePilgrim | null;
  caravanManager: UserHomeCaravanManager | null;
};

export type ReceptionKind =
  | "pilgrim"
  | "caravanManager"
  | "accommodationManager";

export type ReceptionSearchScope = "primary" | "extended";

export type ReceptionRecordType =
  | "person"
  | "reservation"
  | "accommodation"
  | "walkingStation"
  | "benefactor"
  | "caravan";

export type ReceptionGeo = GeoName & { id: string; provinceId?: string };

export type ReceptionMatch = {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  nationalId: string | null;
  phone: string | null;
  photoId: string | null;
  gender: UserGender | null;
  status: UserStatus;
  city?: ReceptionGeo | null;
  roles: Pick<RoleOption, "code" | "name" | "nameKey">[];
  kinds: ReceptionKind[];
  hasHonoraryService?: boolean;
};

export type ReceptionRecord = {
  type: ReceptionRecordType;
  id: string;
  title: string;
  subtitle?: string | null;
  phone?: string | null;
  nationalId?: string | null;
  city?: ReceptionGeo | null;
  code?: string | null;
  year?: number;
  reservationType?: ReservationType;
  status?: ReservationStatus;
  person?: ReceptionMatch;
};

export type ReceptionVisit = {
  id: string;
  code: string;
  year: number;
  type: ReservationType;
  status: ReservationStatus;
  stayStartDate: string | null;
  stayEndDate: string | null;
  walkingStartDate: string | null;
  originCity: ReceptionGeo | null;
  walkingRoute: { id: string; name: string } | null;
  requestedMaleCount: number;
  requestedFemaleCount: number;
  maleCount: number;
  femaleCount: number;
  totalCount: number;
  partyName: string | null;
  partyKind: "caravan" | "group" | null;
  caravanId: string | null;
  groupId: string | null;
};

export type ReceptionCaravanSummary = {
  id: string;
  name: string;
  isActive: boolean;
  licenseNumber: string | null;
  officePhone: string | null;
  maleCount: number;
  femaleCount: number;
  totalCount: number;
  city: ReceptionGeo | null;
};

export type ReceptionAccommodationSummary = {
  id: string;
  name: string;
  type: AccommodationType;
  status: AccommodationStatus;
  genderType: GenderType;
  phone: string | null;
  address: string | null;
  maleCapacity: number;
  femaleCapacity: number;
  assignedMaleCapacity: number;
  assignedFemaleCapacity: number;
  city: ReceptionGeo | null;
};

export type ReceptionHousingRow = {
  assignmentId: string;
  year: number;
  isPrimary: boolean;
  iceVoucherCount: number;
  iceMoldCount: number;
  accommodation: ReceptionAccommodationSummary;
};

export type ReceptionPerson = ReceptionMatch & {
  birthDate: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  religion: Religion | null;
  religionOther: string | null;
  country: ReceptionGeo | null;
  province: ReceptionGeo | null;
  city: ReceptionGeo | null;
};

export type ReceptionProfile = {
  person: ReceptionPerson;
  currentYear: number;
  pilgrim: { visits: ReceptionVisit[] } | null;
  caravanManager: {
    caravans: ReceptionCaravanSummary[];
    visits: ReceptionVisit[];
  } | null;
  accommodationManager: {
    current: ReceptionHousingRow[];
    history: ReceptionHousingRow[];
  } | null;
  honorary?: { visits: ReceptionVisit[] } | null;
};

export type ReceptionSearchResult = {
  q: string;
  scope?: ReceptionSearchScope;
  page?: number;
  pageSize?: number;
  total: number;
  matches: ReceptionMatch[];
  records?: ReceptionRecord[];
  profile: ReceptionProfile | null;
};

export type EvaluationEvaluatorType =
  | 'UNIT_MANAGER'
  | 'CARAVAN_MANAGER'
  | 'ACCOMMODATION_MANAGER'
  | 'PILGRIM';

export type EvaluationTargetType =
  | 'CARAVAN_MANAGER'
  | 'ACCOMMODATION_MANAGER'
  | 'HEADQUARTERS';

export type EvaluationCampaignStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED';

export type EvaluationStatus = 'IN_PROGRESS' | 'COMPLETED';

export type EvaluationAnswerType = 'FIVE_SCALE' | 'TEXT' | 'YES_NO';

export type EvaluationPerson = {
  id: string;
  fullName: string;
  nationalId: string | null;
  phone: string | null;
  username: string;
};

export type EvaluationCampaign = {
  id: string;
  title: string;
  description: string | null;
  startAt: string;
  endAt: string;
  status: EvaluationCampaignStatus;
  createdAt: string;
  updatedAt: string;
  _count?: { evaluations: number };
};

export type EvaluationQuestion = {
  id: string;
  title: string;
  description: string | null;
  evaluatorType: EvaluationEvaluatorType;
  targetType: EvaluationTargetType;
  answerType: EvaluationAnswerType;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type EvaluationAnswer = {
  id: string;
  evaluationId: string;
  questionId: string;
  score: number | null;
  yesNo: boolean | null;
  textValue: string | null;
  description: string | null;
  question?: EvaluationQuestion;
  createdAt: string;
  updatedAt: string;
};

export type Evaluation = {
  id: string;
  campaignId: string;
  campaign?: EvaluationCampaign;
  evaluatorId: string;
  evaluator?: EvaluationPerson;
  evaluatorType: EvaluationEvaluatorType;
  targetId: string | null;
  target?: EvaluationPerson | null;
  targetType: EvaluationTargetType;
  targetKey: string;
  status: EvaluationStatus;
  startedAt: string;
  completedAt: string | null;
  submittedById: string;
  submittedBy?: EvaluationPerson;
  submittedAt: string | null;
  performanceRank: number | null;
  answers?: EvaluationAnswer[];
  _count?: { answers: number };
  createdAt: string;
  updatedAt: string;
};

export type MyEvaluationsPayload = {
  evaluatorTypes: EvaluationEvaluatorType[];
  allowedPairs: {
    evaluatorType: EvaluationEvaluatorType;
    targetTypes: EvaluationTargetType[];
  }[];
  activeCampaigns: EvaluationCampaign[];
  evaluations: Evaluation[];
};

export const honoraryServiceWeekDays = [
  "SATURDAY",
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
] as const;

export type HonoraryServiceWeekDay = (typeof honoraryServiceWeekDays)[number];

export const OTHER_HONORARY_SERVICE = "other";

export type HonoraryServiceSummary = {
  id: string;
  name: string;
  code: string | null;
};

export type HonoraryServiceType = {
  id: string;
  code?: string | null;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type HonoraryServantPerson = {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  nationalId: string | null;
  phone: string | null;
};

export type HonoraryServant = {
  id: string;
  userId: string;
  serviceTypeId: string | null;
  otherDescription: string | null;
  startDate: string;
  endDate: string;
  weekDays: HonoraryServiceWeekDay[];
  startTime: string;
  endTime: string;
  user: HonoraryServantPerson;
  serviceType: HonoraryServiceType | null;
  createdAt: string;
  updatedAt: string;
};

export type HonoraryServantStats = {
  total: number;
  currentYear: number;
  year: number;
};

export const cryptoCurrencies = [
  'USDT',
  'BTC',
  'ETH',
  'TON',
  'TRX',
  'USDC',
  'LTC',
  'BNB',
] as const;

export type CryptoCurrency = (typeof cryptoCurrencies)[number];

export type CryptoWallet = {
  id: string;
  currency: CryptoCurrency | string;
  network: string | null;
  address: string;
  label: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CampaignReportNamedRow = {
  id: string;
  name: string;
  count: number;
  amount: number;
  purchasedShares: number;
  progressPercent: number;
};

export type CampaignReportTimeRow = {
  year?: number;
  month?: number;
  count: number;
  targetAmount: number;
  collectedAmount: number;
  purchasedShares: number;
  participantCount: number;
};

export type CampaignReportKeyedRow = {
  key: string;
  count: number;
};

export type CampaignReport = {
  year: number | null;
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
  targetAmount: number;
  collectedAmount: number;
  purchasedShares: number;
  remainingShares: number;
  totalShares: number;
  participantCount: number;
  benefactorCount: number;
  onlineCount: number;
  avgProgress: number;
  completedCount: number;
  emptyCount: number;
  inProgressCount: number;
  upcomingCount: number;
  runningCount: number;
  endedCount: number;
  byActive: CampaignReportKeyedRow[];
  byProgress: CampaignReportKeyedRow[];
  byLifecycle: CampaignReportKeyedRow[];
  byPayment: CampaignReportKeyedRow[];
  byYear: CampaignReportTimeRow[];
  byMonth: CampaignReportTimeRow[];
  topByAmount: CampaignReportNamedRow[];
  topByParticipants: CampaignReportNamedRow[];
  topByProgress: CampaignReportNamedRow[];
};

export type ParticipationCampaign = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  description: string | null;
  imageId: string | null;
  isActive: boolean;
  totalAmount: number;
  sharePrice: number;
  bankAccountId: string | null;
  cryptoWalletId: string | null;
  bankAccount: BankAccount | null;
  cryptoWallet: CryptoWallet | null;
  totalShares: number;
  purchasedShares: number;
  remainingShares: number;
  participantCount: number;
  progressPercent: number;
  createdAt: string;
  updatedAt: string;
};

export type PublicBankAccount = {
  id: string;
  bankName: string;
  accountNumber: string;
  cardNumber: string | null;
  iban: string;
};

export type PublicCryptoWallet = {
  id: string;
  label: string;
  currency: string;
  network: string | null;
  address: string;
};

export type PublicPaymentMethods = {
  bankAccounts: PublicBankAccount[];
  cryptoWallets: PublicCryptoWallet[];
};

export type PublicCampaign = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  description: string | null;
  imageId: string | null;
  isActive: boolean;
  totalAmount: number;
  sharePrice: number;
  totalShares: number;
  purchasedShares: number;
  remainingShares: number;
  participantCount: number;
  progressPercent: number;
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    cardNumber: string | null;
    iban: string;
  } | null;
  cryptoWallet?: {
    label: string;
    currency: string;
    network: string | null;
    address: string;
  } | null;
};

export const ingredientUnits = {
  GRAM: "GRAM",
  KILOGRAM: "KILOGRAM",
  MILLILITER: "MILLILITER",
  LITER: "LITER",
  PIECE: "PIECE",
} as const;

export type IngredientUnit =
  (typeof ingredientUnits)[keyof typeof ingredientUnits];

export type Ingredient = {
  id: string;
  name: string;
  unit: IngredientUnit;
  pricePerUnit: number;
  stockQty: number;
  description: string | null;
  foodsCount: number;
  createdAt: string;
  updatedAt: string;
};

export type FoodIngredientLine = {
  id: string;
  foodId: string;
  ingredientId: string;
  quantity: number;
  unit: IngredientUnit;
  cost: number;
  qtyInIngredientUnit: number;
  ingredient: {
    id: string;
    name: string;
    unit: IngredientUnit;
    pricePerUnit: number;
    stockQty: number;
    description: string | null;
  };
};

export type Food = {
  id: string;
  name: string;
  description: string | null;
  photoId: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { menuItems: number };
};

export type Restaurant = {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  logoId: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { menuItems: number; orgUnits: number };
};

export type RestaurantMenuItem = {
  id: string;
  restaurantId: string;
  foodId: string;
  offeredAt: string;
  price: number;
  isActive: boolean;
  food: Pick<Food, 'id' | 'name' | 'description' | 'photoId'>;
  createdAt: string;
  updatedAt: string;
};

export type OrganizationPhone = {
  id: string;
  organizationId?: string;
  title: string;
  phone: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OrganizationPosition = {
  id: string;
  code?: string | null;
  name: string;
  isSystem?: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { users: number };
};

export type OrganizationUnitKind = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  _count?: { units: number };
};

export type OrganizationUnit = {
  id: string;
  name: string;
  kindId: string;
  kind: Pick<OrganizationUnitKind, 'id' | 'name'>;
  parentId: string | null;
  parent: { id: string; name: string; kind?: Pick<OrganizationUnitKind, 'id' | 'name'> } | null;
  pathLabel: string;
  phone: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  eitaa: string | null;
  bale: string | null;
  rubika: string | null;
  instagram: string | null;
  telegram: string | null;
  whatsapp: string | null;
  nutritionRepId: string | null;
  nutritionRep: { id: string; firstName: string; lastName: string; fullName: string } | null;
  maxMeals: number | null;
  createdAt: string;
  updatedAt: string;
  _count?: { employees: number; restaurants: number; children: number };
};

export const foodReservationStatuses = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
} as const;

export type FoodReservationStatus =
  (typeof foodReservationStatuses)[keyof typeof foodReservationStatuses];

export type FoodReservation = {
  id: string;
  reservedAt: string;
  restaurantId: string;
  foodId: string;
  userId: string;
  orgUnitId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: FoodReservationStatus;
  restaurant: Pick<Restaurant, 'id' | 'name' | 'logoId'>;
  food: Pick<Food, 'id' | 'name' | 'photoId'>;
  user: { id: string; fullName: string };
  orgUnit: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
};

export type FoodReservationContext = {
  orgUnit: { id: string; name: string; maxMeals: number | null } | null;
  isNutritionRep: boolean;
  restaurants: Pick<Restaurant, 'id' | 'name' | 'logoId'>[];
};

export type FoodReservationReportGroup = {
  id: string;
  name: string;
  count: number;
  quantity: number;
  totalPrice: number;
};

export type FoodReservationReportSummary = {
  count: number;
  quantity: number;
  totalPrice: number;
  pendingCount: number;
  confirmedCount: number;
  pendingQuantity: number;
  confirmedQuantity: number;
  pendingTotal: number;
  confirmedTotal: number;
};

export type FoodReservationReport = Paginated<FoodReservation> & {
  summary: FoodReservationReportSummary;
  byFood: FoodReservationReportGroup[];
  byUnit: FoodReservationReportGroup[];
};

export type FoodCostEstimateGroup = {
  id: string;
  name: string;
  count: number;
  quantity: number;
  totalPrice: number;
};

export type FoodCostEstimateFoodGroup = FoodCostEstimateGroup & {
  avgUnitPrice: number;
  minUnitPrice: number;
  maxUnitPrice: number;
};

export type FoodCostEstimatePeriod = {
  period: string;
  count: number;
  quantity: number;
  totalPrice: number;
};

export type FoodCostEstimateSummary = {
  totalCost: number;
  confirmedCost: number;
  pendingCost: number;
  totalQuantity: number;
  confirmedQuantity: number;
  pendingQuantity: number;
  reservationCount: number;
  confirmedCount: number;
  pendingCount: number;
  avgCostPerServing: number;
  avgCostPerReservation: number;
  avgDailyCost: number;
  uniqueDays: number;
  uniqueEmployees: number;
};

export type FoodCostEstimateReport = {
  summary: FoodCostEstimateSummary;
  extremes: {
    highestCostUnit: FoodCostEstimateGroup | null;
    lowestCostUnit: FoodCostEstimateGroup | null;
    mostExpensiveFood: FoodCostEstimateFoodGroup | null;
    cheapestFood: FoodCostEstimateFoodGroup | null;
    topSpendFood: FoodCostEstimateFoodGroup | null;
    topSpendRestaurant: FoodCostEstimateGroup | null;
  };
  byUnit: FoodCostEstimateGroup[];
  byFood: FoodCostEstimateFoodGroup[];
  byRestaurant: FoodCostEstimateGroup[];
  byDay: FoodCostEstimatePeriod[];
  byWeek: FoodCostEstimatePeriod[];
  byMonth: FoodCostEstimatePeriod[];
};

export type OrganizationUnitRestaurant = {
  id: string;
  unitId: string;
  restaurantId: string;
  restaurant: Pick<Restaurant, 'id' | 'name' | 'phone' | 'address' | 'logoId'>;
  createdAt: string;
  updatedAt: string;
};

export type RestaurantUnit = {
  id: string;
  unitId: string;
  restaurantId: string;
  unit: Pick<OrganizationUnit, 'id' | 'name' | 'phone'> & {
    kind: Pick<OrganizationUnitKind, 'id' | 'name'>;
    parent: { id: string; name: string } | null;
  };
  createdAt: string;
  updatedAt: string;
};

export type Organization = {
  id: string;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  eitaa: string | null;
  bale: string | null;
  rubika: string | null;
  instagram: string | null;
  telegram: string | null;
  whatsapp: string | null;
  phones?: OrganizationPhone[];
  createdAt: string;
  updatedAt: string;
  _count?: { phones: number };
};

export const mealTypes = {
  BREAKFAST: "BREAKFAST",
  LUNCH: "LUNCH",
  DINNER: "DINNER",
} as const;

export type MealType = (typeof mealTypes)[keyof typeof mealTypes];

export type RestaurantMealPlan = {
  id: string;
  restaurantId: string;
  foodId: string;
  planDate: string;
  mealType: MealType;
  servings: number;
  distributedServings: number;
  remainingServings: number;
  description: string | null;
  restaurant: Pick<Restaurant, "id" | "name" | "address">;
  food: Pick<Food, "id" | "name">;
  createdAt: string;
  updatedAt: string;
};

export type RestaurantMealPlanDistributionManager = {
  id: string;
  isPrimary: boolean;
  user: { id: string; fullName: string; phone: string | null; nationalId: string | null } | null;
};

export type RestaurantMealPlanDistribution = {
  id: string;
  mealPlanId: string;
  accommodationId: string;
  servings: number;
  accommodation: Pick<Accommodation, "id" | "name" | "managementType"> & {
    managers: RestaurantMealPlanDistributionManager[];
  };
  createdAt: string;
  updatedAt: string;
};

export type WarehouseServingsLine = {
  ingredientId: string;
  name: string;
  unit: IngredientUnit;
  quantityPerServing: number;
  quantityNeeded: number;
  stockQty: number;
  shortage: number;
  costPerServing: number;
  costTotal: number;
};

export type WarehouseServingsResult = {
  food: {
    id: string;
    name: string;
    finalPrice: number;
    costPrice: number;
  };
  servings: number;
  costTotal: number;
  saleTotal: number;
  lines: WarehouseServingsLine[];
};

export type WarehouseServingsBatchResult = {
  items: WarehouseServingsResult[];
  totals: {
    foodsCount: number;
    servings: number;
    costTotal: number;
    saleTotal: number;
    lines: WarehouseServingsLine[];
  };
};

export type WarehouseStockResult = {
  ingredient: {
    id: string;
    name: string;
    unit: IngredientUnit;
    stockQty: number;
  };
  quantity: number;
  foods: Array<{
    foodId: string;
    name: string;
    quantityPerServing: number;
    maxServingsByIngredient: number;
    feasibleServings: number;
    otherLimits: Array<{
      ingredientId: string;
      name: string;
      unit: IngredientUnit;
      quantityPerServing: number;
      stockQty: number;
      maxServings: number;
    }>;
  }>;
};

export const vehicleTypes = {
  SEDAN: 'SEDAN',
  PICKUP: 'PICKUP',
  TRUCK: 'TRUCK',
  MINIBUS: 'MINIBUS',
  MOTORCYCLE: 'MOTORCYCLE',
  OTHER: 'OTHER',
} as const;

export type VehicleType = (typeof vehicleTypes)[keyof typeof vehicleTypes];

export const vehicleTypeOrder: VehicleType[] = [
  vehicleTypes.SEDAN,
  vehicleTypes.PICKUP,
  vehicleTypes.TRUCK,
  vehicleTypes.MINIBUS,
  vehicleTypes.MOTORCYCLE,
  vehicleTypes.OTHER,
];

export const vehicleStatuses = {
  ACTIVE: 'ACTIVE',
  IN_REPAIR: 'IN_REPAIR',
  SCRAPPED: 'SCRAPPED',
  TRANSFERRED: 'TRANSFERRED',
  MISSING: 'MISSING',
} as const;

export type VehicleStatus = (typeof vehicleStatuses)[keyof typeof vehicleStatuses];

export const vehicleStatusOrder: VehicleStatus[] = [
  vehicleStatuses.ACTIVE,
  vehicleStatuses.IN_REPAIR,
  vehicleStatuses.SCRAPPED,
  vehicleStatuses.TRANSFERRED,
  vehicleStatuses.MISSING,
];

export const vehicleAssignmentTypes = {
  UNIT: 'UNIT',
  PERSON: 'PERSON',
} as const;

export type VehicleAssignmentType =
  (typeof vehicleAssignmentTypes)[keyof typeof vehicleAssignmentTypes];

export const vehicleAssignmentStatuses = {
  LENT: 'LENT',
  RETURNED: 'RETURNED',
} as const;

export type VehicleAssignmentStatus =
  (typeof vehicleAssignmentStatuses)[keyof typeof vehicleAssignmentStatuses];

export const vehicleAssignmentStatusOrder: VehicleAssignmentStatus[] = [
  vehicleAssignmentStatuses.LENT,
  vehicleAssignmentStatuses.RETURNED,
];

export type VehicleBrand = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  _count?: { vehicles: number };
};

export type VehicleAssignmentRef = {
  id: string;
  type: VehicleAssignmentType;
  status: VehicleAssignmentStatus;
  startDate: string;
  endDate: string | null;
  returnedAt: string | null;
  organizationUnit: { id: string; name: string } | null;
  person: { id: string; fullName: string } | null;
};

export type Vehicle = {
  id: string;
  assetCode: string;
  plate: string;
  type: VehicleType;
  brandId: string;
  brand: Pick<VehicleBrand, 'id' | 'name'>;
  model: string;
  color: string | null;
  year: number | null;
  chassisNumber: string | null;
  engineNumber: string | null;
  status: VehicleStatus;
  description: string | null;
  currentAssignment: VehicleAssignmentRef | null;
  createdAt: string;
  updatedAt: string;
  _count?: { assignments: number };
};

export type VehicleAssignment = {
  id: string;
  vehicleId: string;
  organizationUnitId: string | null;
  personId: string | null;
  startDate: string;
  endDate: string | null;
  returnedAt: string | null;
  type: VehicleAssignmentType;
  status: VehicleAssignmentStatus;
  description: string | null;
  organizationUnit: { id: string; name: string } | null;
  person: { id: string; fullName: string } | null;
  vehicle: {
    id: string;
    plate: string;
    assetCode: string;
    brand: Pick<VehicleBrand, 'id' | 'name'>;
    model: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type VehicleReportNamedCount = {
  id?: string | null;
  name: string;
  count: number;
};

export type VehicleReportKeyCount = {
  key: string;
  count: number;
};

export const singardFeedbackKinds = {
  SUGGESTION: 'SUGGESTION',
  COMPLAINT: 'COMPLAINT',
  CRITICISM: 'CRITICISM',
  REPORT: 'REPORT',
} as const;

export type SingardFeedbackKind =
  (typeof singardFeedbackKinds)[keyof typeof singardFeedbackKinds];

export const singardFeedbackStatuses = {
  NEW: 'NEW',
  IN_PROGRESS: 'IN_PROGRESS',
  ANSWERED: 'ANSWERED',
  CLOSED: 'CLOSED',
} as const;

export type SingardFeedbackStatus =
  (typeof singardFeedbackStatuses)[keyof typeof singardFeedbackStatuses];

export const singardActivityKinds = {
  NOTE: 'NOTE',
  CONTACT: 'CONTACT',
} as const;

export type SingardActivityKind =
  (typeof singardActivityKinds)[keyof typeof singardActivityKinds];

export const singardAttachmentKinds = {
  IMAGE: 'IMAGE',
  AUDIO: 'AUDIO',
  VIDEO: 'VIDEO',
} as const;

export type SingardAttachmentKind =
  (typeof singardAttachmentKinds)[keyof typeof singardAttachmentKinds];

export type SingardCategory = {
  id: string;
  parentId: string | null;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  path?: string;
  parent?: { id: string; name: string } | null;
  children?: SingardCategory[];
  createdAt: string;
  updatedAt: string;
  _count: { children: number; feedbacks: number };
};

export type SingardAttachment = {
  id: string;
  kind: SingardAttachmentKind;
  imageId: string | null;
  fileId: string | null;
  sortOrder: number;
  createdAt: string;
  file?: {
    id: string;
    mimeType: string;
    byteSize: number;
    originalName: string | null;
    durationMs: number | null;
  } | null;
};

export type SingardActivity = {
  id: string;
  feedbackId: string;
  kind: SingardActivityKind;
  occurredAt: string;
  title: string;
  body: string | null;
  createdById: string;
  createdBy: { id: string; fullName: string };
  createdAt: string;
  updatedAt: string;
};

export type SingardFeedback = {
  id: string;
  trackingCode: string;
  kind: SingardFeedbackKind;
  status: SingardFeedbackStatus;
  categoryId: string;
  category: Pick<SingardCategory, 'id' | 'name' | 'parentId'> & {
    parent?: { id: string; name: string } | null;
  };
  userId: string | null;
  isAnonymous: boolean;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  submitterName: string | null;
  body: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  replyBody?: string | null;
  repliedAt: string | null;
  repliedById?: string | null;
  repliedBy?: { id: string; fullName: string } | null;
  user?: { id: string; fullName: string; phone: string | null } | null;
  attachments?: SingardAttachment[];
  activities?: SingardActivity[];
  createdAt: string;
  updatedAt: string;
  _count?: { attachments: number; activities: number };
};

export type SingardReports = {
  kpis: {
    total: number;
    pending: number;
    answered: number;
    closed: number;
    suggestions: number;
    complaints: number;
    criticisms: number;
    reports: number;
  };
  byKind: { key: string; count: number }[];
  byStatus: { key: string; count: number }[];
  byCategory: { id: string; name: string; count: number }[];
};

export type VehicleReportsOverview = {
  kpis: {
    totalVehicles: number;
    activeVehicles: number;
    inRepair: number;
    scrapped: number;
    transferred: number;
    missing: number;
    assigned: number;
    unassigned: number;
    unitAssignments: number;
    personAssignments: number;
    topType: string | null;
    topTypeCount: number;
    topModel: string | null;
    topModelCount: number;
    topUnit: string | null;
    topUnitCount: number;
    topCustodian: string | null;
    topCustodianCount: number;
  };
  byType: VehicleReportKeyCount[];
  byStatus: VehicleReportKeyCount[];
  byAssignment: VehicleReportKeyCount[];
  byAssignmentType: VehicleReportKeyCount[];
  byUnit: VehicleReportNamedCount[];
  byPerson: VehicleReportNamedCount[];
  byBrand: VehicleReportNamedCount[];
  byModel: VehicleReportNamedCount[];
};

export const boardRequestStatuses = {
  PENDING_REVIEW: 'PENDING_REVIEW',
  PENDING_LEGAL: 'PENDING_LEGAL',
  PENDING_BUDGET: 'PENDING_BUDGET',
  PENDING_SECRETARY: 'PENDING_SECRETARY',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type BoardRequestStatus =
  (typeof boardRequestStatuses)[keyof typeof boardRequestStatuses];

export const boardStages = {
  REQUEST: 'REQUEST',
  MANAGEMENT: 'MANAGEMENT',
  LEGAL: 'LEGAL',
  BUDGET: 'BUDGET',
  SECRETARY: 'SECRETARY',
} as const;

export type BoardStage = (typeof boardStages)[keyof typeof boardStages];

export type BoardPerson = {
  id: string;
  fullName: string;
  username: string;
};

export type BoardAttachment = {
  id: string;
  stage: BoardStage;
  kind: 'IMAGE' | 'FILE';
  imageId: string | null;
  fileId: string | null;
  originalName: string | null;
  mimeType: string | null;
  byteSize: number | null;
  createdAt: string;
};

export type BoardRequest = {
  id: string;
  status: BoardRequestStatus;
  requestedAt: string;
  unitId: string;
  unit: { id: string; name: string };
  orgPositionText: string;
  subject: string;
  justification: string | null;
  topicHistory: string | null;
  description: string | null;
  createdById: string;
  createdBy: BoardPerson;
  managementComment: string | null;
  managementAt: string | null;
  managementBy: BoardPerson | null;
  legalOrgMatch: boolean | null;
  legalRegulationsMatch: boolean | null;
  legalComment: string | null;
  legalAt: string | null;
  legalBy: BoardPerson | null;
  budgetProgramHistory: boolean | null;
  budgetCurrentYearFunding: boolean | null;
  budgetComment: string | null;
  budgetAt: string | null;
  budgetBy: BoardPerson | null;
  secretaryComment: string | null;
  secretaryAt: string | null;
  secretaryBy: BoardPerson | null;
  rejectedStage: BoardStage | null;
  rejectedComment: string | null;
  rejectedAt: string | null;
  rejectedBy: BoardPerson | null;
  attachments: BoardAttachment[];
  createdAt: string;
  updatedAt: string;
  _count?: { attachments: number };
};

export type BoardAccess = {
  canAccess: boolean;
  canPickUnit: boolean;
  canSeeAll: boolean;
  canEditPermissions: boolean;
  canChangeStage: boolean;
  canManageMinutes: boolean;
  orgUnitId: string | null;
  positionName: string | null;
  stages: Record<BoardStage, boolean>;
};

export type BoardStagePermission = {
  stage: Exclude<BoardStage, 'REQUEST'>;
  units: { id: string; name: string }[];
  positions: { id: string; name: string; code: string | null }[];
};

export type BoardRequestStats = {
  total: number;
  pendingReview: number;
  pendingLegal: number;
  pendingBudget: number;
  pendingSecretary: number;
  approved: number;
  rejected: number;
};

export const boardMinutesAttendances = {
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
} as const;

export type BoardMinutesAttendance =
  (typeof boardMinutesAttendances)[keyof typeof boardMinutesAttendances];

export type BoardMinutesMember = {
  id: string;
  userId: string;
  attendance: BoardMinutesAttendance;
  user: BoardPerson;
};

export type BoardMinutesAttachment = {
  id: string;
  kind: 'IMAGE' | 'AUDIO';
  imageId: string | null;
  fileId: string | null;
  originalName: string | null;
  mimeType: string | null;
  byteSize: number | null;
  durationMs: number | null;
};

export type BoardMinutes = {
  id: string;
  requestId: string | null;
  request: { id: string; subject: string; status: BoardRequestStatus } | null;
  heldAt: string;
  subject: string;
  body: string | null;
  createdById: string;
  createdBy: BoardPerson;
  members: BoardMinutesMember[];
  attachments: BoardMinutesAttachment[];
  createdAt: string;
  updatedAt: string;
  _count?: { members: number; resolutions: number; attachments: number };
};

export type BoardMinutesStats = {
  total: number;
  linked: number;
  regular: number;
  resolutionCount: number;
};

export type BoardReportsOverview = {
  kpis: {
    totalMinutes: number;
    linkedMinutes: number;
    regularMinutes: number;
    totalResolutions: number;
    withDueDate: number;
    withoutDueDate: number;
    overdue: number;
    dueToday: number;
    dueSoon: number;
    upcoming: number;
    later: number;
    withoutUnit: number;
    withUnit: number;
    meetingsWithResolutions: number;
    meetingsWithoutResolutions: number;
    meetingsWithAttachments: number;
    meetingsWithMembers: number;
    imageAttachments: number;
    audioAttachments: number;
    presentCount: number;
    absentCount: number;
    attendanceRate: number;
    avgResolutionsPerMeeting: number;
    avgMembersPerMeeting: number;
    avgDueLeadDays: number;
    topUnit: string | null;
    topUnitCount: number;
  };
  byKind: { key: string; count: number }[];
  byDueStatus: { key: string; count: number }[];
  byAttendance: { key: string; count: number }[];
  byCoverage: { key: string; count: number }[];
  byAttachment: { key: string; count: number }[];
  byWeekday: { key: string; count: number }[];
  byMonth: { month: string; minutes: number; resolutions: number }[];
  byUnit: {
    id: string | null;
    name: string;
    count: number;
    overdue: number;
    soon: number;
    upcoming: number;
    later: number;
    noDue: number;
  }[];
  byRequestUnit: { id: string; name: string; count: number }[];
};

export type BoardMinutesResolution = {
  id: string;
  minutesId: string;
  title: string;
  description: string | null;
  unitId: string | null;
  unit: { id: string; name: string } | null;
  dueDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  minutes?: {
    id: string;
    subject: string;
    heldAt: string;
    requestId: string | null;
    request: { id: string; subject: string; status: BoardRequestStatus } | null;
  };
};

export const boardSmartSearchMatchKinds = ['minutes', 'request', 'resolution'] as const

export type BoardSmartSearchMatchKind = (typeof boardSmartSearchMatchKinds)[number]

export type BoardSmartSearchResult = Paginated<BoardSmartSearchHit> & {
  minutesCount: number
  requestCount: number
  resolutionCount: number
}

export type BoardSmartSearchMinutesHit = {
  kind: 'minutes'
  id: string
  subject: string
  heldAt: string
  body: string | null
  request: { id: string; subject: string; status: BoardRequestStatus } | null
  resolutionCount: number
  matchIn: BoardSmartSearchMatchKind[]
  snippet: string | null
  matchedResolutions: { id: string; title: string }[]
}

export type BoardSmartSearchRequestHit = {
  kind: 'request'
  id: string
  subject: string
  requestedAt: string
  status: BoardRequestStatus
  unit: { id: string; name: string }
  snippet: string | null
  matchIn: BoardSmartSearchMatchKind[]
  minutesCount: number
}

export type BoardSmartSearchHit = BoardSmartSearchMinutesHit | BoardSmartSearchRequestHit

export type BoardMinutesDossier = {
  minutes: BoardMinutes
  request: BoardRequest | null
  resolutions: BoardMinutesResolution[]
}



