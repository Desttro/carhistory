import {
  classifyEventType,
  createEventSummary,
  extractEventSubtype,
  extractSeverity,
  isNegativeEvent,
} from '../normalize/normalizeEvent'
import { parseLocation } from '../normalize/normalizeLocation'
import { createEventFingerprint, areSimilarEvents } from './fingerprint'

import type {
  SourceReport,
  CanonicalReport,
  NormalizedEvent,
  EventSource,
  AccidentRecord,
  ParsedVehicleInfo,
  ReportProvider,
} from '../types'

// merge multiple source reports into a single canonical report
export function mergeReports(
  sources: Array<{ report: SourceReport; parsedReportId: string }>
): CanonicalReport {
  if (sources.length === 0) {
    throw new Error('Cannot merge empty source list')
  }

  // merge vehicle info (prefer non-empty values)
  const vehicleInfo = mergeVehicleInfo(sources.map((s) => s.report.vehicleInfo))

  // merge events with deduplication
  const events = mergeEvents(sources)

  // merge accidents
  const accidents = mergeAccidents(sources.map((s) => s.report.accidents))

  // calculate summary values
  const estimatedOwners = Math.max(...sources.map((s) => s.report.estimatedOwners || 0))
  const accidentCount = accidents.length
  const totalLoss = sources.some((s) => s.report.totalLoss)
  const odometerIssues = sources.some((s) => s.report.odometerIssues)

  // merge title brands
  const titleBrands = mergeUnique(sources.flatMap((s) => s.report.titleBrands || []))

  // find last odometer reading
  const eventsWithOdometer = events.filter((e) => e.odometerMiles !== undefined)
  eventsWithOdometer.sort((a, b) => b.eventDate.localeCompare(a.eventDate))
  const odometerLastReported = eventsWithOdometer[0]?.odometerMiles
  const odometerLastDate = eventsWithOdometer[0]?.eventDate

  // count open recalls (take max from any source)
  const openRecallCount = Math.max(...sources.map((s) => s.report.openRecallCount || 0))

  // count service records
  const serviceRecordCount = events.filter((e) => e.eventType === 'SERVICE').length

  // collect source providers
  const sourceProviders = mergeUnique(
    sources.map((s) => s.report.provider)
  ) as ReportProvider[]

  return {
    vehicleId: vehicleInfo.vin,
    vehicleInfo,
    estimatedOwners: estimatedOwners > 0 ? estimatedOwners : undefined,
    accidentCount,
    odometerLastReported,
    odometerLastDate,
    odometerIssues,
    titleBrands,
    totalLoss,
    openRecallCount,
    eventCount: events.length,
    serviceRecordCount,
    sourceProviders,
    events,
    accidents,
  }
}

// merge vehicle info from multiple sources
function mergeVehicleInfo(infos: ParsedVehicleInfo[]): ParsedVehicleInfo {
  const merged: ParsedVehicleInfo = {
    vin: infos[0]?.vin || '',
  }

  for (const info of infos) {
    // prefer non-empty values
    if (!merged.year && info.year) merged.year = info.year
    if (!merged.make && info.make) merged.make = info.make
    if (!merged.model && info.model) merged.model = info.model
    if (!merged.trim && info.trim) merged.trim = info.trim
    if (!merged.bodyStyle && info.bodyStyle) merged.bodyStyle = info.bodyStyle
    if (!merged.engine && info.engine) merged.engine = info.engine
    if (!merged.transmission && info.transmission) merged.transmission = info.transmission
    if (!merged.drivetrain && info.drivetrain) merged.drivetrain = info.drivetrain
    if (!merged.fuelType && info.fuelType) merged.fuelType = info.fuelType
    if (!merged.vehicleClass && info.vehicleClass) merged.vehicleClass = info.vehicleClass
    if (!merged.countryOfAssembly && info.countryOfAssembly)
      merged.countryOfAssembly = info.countryOfAssembly
  }

  return merged
}

// merge and deduplicate events from multiple sources
function mergeEvents(
  sources: Array<{ report: SourceReport; parsedReportId: string }>
): NormalizedEvent[] {
  const mergedEvents: NormalizedEvent[] = []
  const fingerprintMap = new Map<string, NormalizedEvent>()

  for (const { report, parsedReportId } of sources) {
    for (const event of report.events) {
      const eventType = classifyEventType(event)
      const fingerprint = createEventFingerprint(eventType, event)

      const existing = fingerprintMap.get(fingerprint)

      if (existing) {
        // add this source to existing event
        existing.sources.push({
          parsedReportId,
          provider: report.provider,
          confidence: 1.0,
          rawEvidence: event.details.slice(0, 200),
        })
      } else {
        // check for similar events that might not have same fingerprint
        let foundSimilar = false
        for (const [, existingEvent] of fingerprintMap) {
          // find the raw event for comparison
          const existingRaw = report.events.find(
            (e) =>
              createEventFingerprint(classifyEventType(e), e) ===
              existingEvent.fingerprint
          )
          if (
            existingRaw &&
            areSimilarEvents(
              event,
              existingRaw,
              eventType,
              existingEvent.eventType as any
            )
          ) {
            existingEvent.sources.push({
              parsedReportId,
              provider: report.provider,
              confidence: 0.8,
              rawEvidence: event.details.slice(0, 200),
            })
            foundSimilar = true
            break
          }
        }

        if (!foundSimilar) {
          // create new normalized event
          const location = parseLocation(event.location || '')
          const normalizedEvent: NormalizedEvent = {
            eventType,
            eventSubtype: extractEventSubtype(eventType, event),
            eventDate: event.date,
            eventDatePrecision: event.datePrecision || 'day',
            location: event.location,
            state: location.state,
            country: location.country,
            odometerMiles: event.odometer,
            summary: createEventSummary(eventType, event),
            details: event.details,
            severity: extractSeverity(event),
            isNegative: isNegativeEvent(event),
            ownerSequence: event.ownerSequence,
            fingerprint,
            sources: [
              {
                parsedReportId,
                provider: report.provider,
                confidence: 1.0,
                rawEvidence: event.details.slice(0, 200),
              },
            ],
          }

          fingerprintMap.set(fingerprint, normalizedEvent)
          mergedEvents.push(normalizedEvent)
        }
      }
    }
  }

  // sort events by date
  mergedEvents.sort((a, b) => a.eventDate.localeCompare(b.eventDate))

  return mergedEvents
}

// merge accidents from multiple sources
function mergeAccidents(accidentLists: AccidentRecord[][]): AccidentRecord[] {
  const merged: AccidentRecord[] = []
  const seenDates = new Set<string>()

  for (const list of accidentLists) {
    for (const accident of list) {
      // dedupe by date (within same month)
      const dateMonth = accident.date.slice(0, 7)
      if (!seenDates.has(dateMonth)) {
        seenDates.add(dateMonth)
        merged.push(accident)
      }
    }
  }

  // sort by date
  merged.sort((a, b) => a.date.localeCompare(b.date))

  return merged
}

// utility: merge arrays and remove duplicates
function mergeUnique<T>(items: T[]): T[] {
  return [...new Set(items)]
}
