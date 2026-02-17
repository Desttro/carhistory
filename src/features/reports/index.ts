// types
export type {
  ReportProvider,
  ProviderVersion,
  EventType,
  Severity,
  DatePrecision,
  ParsedVehicleInfo,
  AccidentRecord,
  RawParsedEvent,
  SourceReport,
  NormalizedEvent,
  EventSource,
  CanonicalReport,
  ParseResult,
} from './types'

export { EventTypes } from './types'

// constants
export {
  REPORT_VALIDITY_DAYS,
  PARSER_VERSIONS,
  eventTypeKeywords,
  negativeEventKeywords,
  severityKeywords,
  usStateAbbreviations,
  validStateAbbreviations,
} from './constants'

// ingest
export { detectProvider, extractVinFromHtml } from './ingest/detectProvider'
export { computeContentHash, computeFingerprint } from './ingest/computeHash'
export { storeHtml, retrieveHtml } from './ingest/storeHtml'

// parsers
export { BaseParser } from './parsers/base/BaseParser'
export { AutoCheckParser } from './parsers/autocheck/AutoCheckParser'
export { CarfaxParser } from './parsers/carfax/CarfaxParser'

// normalize
export {
  classifyEventType,
  isNegativeEvent,
  extractSeverity,
  extractEventSubtype,
  createEventSummary,
} from './normalize/normalizeEvent'
export {
  parseLocation,
  extractState,
  formatLocation,
} from './normalize/normalizeLocation'

// merge
export { createEventFingerprint, areSimilarEvents } from './merge/fingerprint'
export { mergeReports } from './merge/mergeReports'

// server actions
export { reportActions } from './server/reportActions'
