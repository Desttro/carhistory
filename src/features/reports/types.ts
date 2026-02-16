export type ReportProvider = 'autocheck' | 'carfax'

export type ProviderVersion = `${ReportProvider}@v${string}`

export const EventTypes = {
  TITLE: 'TITLE',
  REGISTRATION: 'REGISTRATION',
  LIEN: 'LIEN',
  SERVICE: 'SERVICE',
  ODOMETER_READING: 'ODOMETER_READING',
  ACCIDENT: 'ACCIDENT',
  DAMAGE: 'DAMAGE',
  AUCTION: 'AUCTION',
  LISTING: 'LISTING',
  RECALL: 'RECALL',
  WARRANTY: 'WARRANTY',
  INSPECTION: 'INSPECTION',
  EMISSION: 'EMISSION',
  MANUFACTURER: 'MANUFACTURER',
  INSURANCE: 'INSURANCE',
  OTHER: 'OTHER',
} as const

export type EventType = (typeof EventTypes)[keyof typeof EventTypes]

export type Severity = 'minor' | 'moderate' | 'severe' | 'unknown'

export type DatePrecision = 'day' | 'month' | 'year'

export interface ParsedVehicleInfo {
  vin: string
  year?: number
  make?: string
  model?: string
  trim?: string
  bodyStyle?: string
  engine?: string
  transmission?: string
  drivetrain?: string
  fuelType?: string
  vehicleClass?: string
  countryOfAssembly?: string
}

export interface AccidentRecord {
  date: string
  type: string
  severity: Severity
  location?: string
  description?: string
  airbagDeployed?: boolean
  structuralDamage?: boolean
  overturned?: boolean
  impactAreas?: string[]
}

export interface RawParsedEvent {
  date: string
  datePrecision?: DatePrecision
  location?: string
  state?: string
  odometer?: number
  dataSource?: string
  details: string
  rawHtml?: string
  ownerSequence?: number
}

export interface SourceReport {
  provider: ReportProvider
  parserVersion: ProviderVersion
  reportDate?: string
  vehicleInfo: ParsedVehicleInfo
  estimatedOwners?: number
  accidentCount?: number
  odometerLastReported?: number
  odometerLastDate?: string
  odometerIssues?: boolean
  titleBrands?: string[]
  totalLoss?: boolean
  openRecallCount?: number
  events: RawParsedEvent[]
  accidents: AccidentRecord[]
  providerScore?: number
  providerScoreRangeLow?: number
  providerScoreRangeHigh?: number
  serviceRecordCount?: number
  rawJson?: Record<string, unknown>
}

export interface EventSource {
  parsedReportId: string
  provider: ReportProvider
  confidence: number
  rawEvidence: string
}

export interface NormalizedEvent {
  eventType: EventType
  eventSubtype?: string
  eventDate: string
  eventDatePrecision: DatePrecision
  location?: string
  state?: string
  country?: string
  odometerMiles?: number
  summary: string
  details?: string
  detailsJson?: Record<string, unknown>
  severity?: Severity
  isNegative: boolean
  ownerSequence?: number
  fingerprint: string
  sources: EventSource[]
}

export interface CanonicalReport {
  vehicleId: string
  vehicleInfo: ParsedVehicleInfo
  estimatedOwners?: number
  accidentCount: number
  odometerLastReported?: number
  odometerLastDate?: string
  odometerIssues: boolean
  titleBrands: string[]
  totalLoss: boolean
  openRecallCount: number
  eventCount: number
  serviceRecordCount: number
  sourceProviders: ReportProvider[]
  events: NormalizedEvent[]
  accidents: AccidentRecord[]
}

export interface ParseResult {
  success: boolean
  report?: SourceReport
  errors: string[]
  warnings: string[]
}
