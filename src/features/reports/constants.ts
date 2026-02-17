import { EventTypes } from './types'

import type { EventType, Severity } from './types'

export { EventTypes }

export const REPORT_VALIDITY_DAYS = 30

export const PARSER_VERSIONS = {
  autocheck: 'autocheck@v1.0.0',
  carfax: 'carfax@v1.0.0',
} as const

// keywords for event type classification (lowercase)
export const eventTypeKeywords: Record<string, EventType> = {
  // title events
  title: EventTypes.TITLE,
  'title issued': EventTypes.TITLE,
  'title transfer': EventTypes.TITLE,

  // registration events
  registration: EventTypes.REGISTRATION,
  registered: EventTypes.REGISTRATION,
  'registration issued': EventTypes.REGISTRATION,
  'registration renewed': EventTypes.REGISTRATION,

  // lien events
  lien: EventTypes.LIEN,
  'lien reported': EventTypes.LIEN,
  'lien released': EventTypes.LIEN,

  // service events
  service: EventTypes.SERVICE,
  'service record': EventTypes.SERVICE,
  'oil change': EventTypes.SERVICE,
  'oil changed': EventTypes.SERVICE,
  maintenance: EventTypes.SERVICE,
  repair: EventTypes.SERVICE,
  tire: EventTypes.SERVICE,
  tires: EventTypes.SERVICE,
  brake: EventTypes.SERVICE,
  brakes: EventTypes.SERVICE,
  'vehicle serviced': EventTypes.SERVICE,
  'vehicle service': EventTypes.SERVICE,
  alignment: EventTypes.SERVICE,
  battery: EventTypes.SERVICE,
  filter: EventTypes.SERVICE,
  fluid: EventTypes.SERVICE,
  'safety inspection': EventTypes.SERVICE,
  'multiple point': EventTypes.SERVICE,
  'vehicle interior': EventTypes.SERVICE,
  accessories: EventTypes.SERVICE,
  engine: EventTypes.SERVICE,

  // odometer events
  odometer: EventTypes.ODOMETER_READING,
  'odometer reading': EventTypes.ODOMETER_READING,

  // accident events
  accident: EventTypes.ACCIDENT,
  collision: EventTypes.ACCIDENT,
  'accident reported': EventTypes.ACCIDENT,

  // damage events
  damage: EventTypes.DAMAGE,
  salvage: EventTypes.DAMAGE,
  'damage reported': EventTypes.DAMAGE,
  'major damage': EventTypes.DAMAGE,
  'structural damage': EventTypes.DAMAGE,
  flood: EventTypes.DAMAGE,
  fire: EventTypes.DAMAGE,
  hail: EventTypes.DAMAGE,

  // auction events
  auction: EventTypes.AUCTION,
  'auction record': EventTypes.AUCTION,
  'auction sale': EventTypes.AUCTION,
  'sold at auction': EventTypes.AUCTION,

  // listing events
  listing: EventTypes.LISTING,
  'for sale': EventTypes.LISTING,
  listed: EventTypes.LISTING,
  advertised: EventTypes.LISTING,

  // recall events
  recall: EventTypes.RECALL,
  'recall issued': EventTypes.RECALL,
  'recall repaired': EventTypes.RECALL,
  'safety recall': EventTypes.RECALL,

  // warranty events
  warranty: EventTypes.WARRANTY,
  'warranty service': EventTypes.WARRANTY,

  // inspection events
  inspection: EventTypes.INSPECTION,
  'state inspection': EventTypes.INSPECTION,
  'safety inspection performed': EventTypes.INSPECTION,

  // emission events
  emission: EventTypes.EMISSION,
  'emissions test': EventTypes.EMISSION,
  'smog check': EventTypes.EMISSION,

  // manufacturer events
  manufacturer: EventTypes.MANUFACTURER,
  'shipped to dealer': EventTypes.MANUFACTURER,
  assembly: EventTypes.MANUFACTURER,
  'vehicle prep': EventTypes.MANUFACTURER,

  // insurance events
  insurance: EventTypes.INSURANCE,
  'insurance claim': EventTypes.INSURANCE,
  'insurance loss': EventTypes.INSURANCE,
  'total loss': EventTypes.INSURANCE,
}

// keywords that indicate negative events
export const negativeEventKeywords = [
  'accident',
  'collision',
  'damage',
  'salvage',
  'total loss',
  'flood',
  'fire',
  'hail',
  'structural damage',
  'airbag deployed',
  'recall',
  'lemon',
  'theft',
  'stolen',
  'odometer rollback',
  'odometer discrepancy',
  'frame damage',
  'junk',
  'rebuilt',
  'insurance loss',
]

// severity keywords for accident classification
export const severityKeywords: Record<string, Severity> = {
  minor: 'minor',
  moderate: 'moderate',
  severe: 'severe',
  major: 'severe',
  'minor damage': 'minor',
  'moderate damage': 'moderate',
  'severe damage': 'severe',
  'major damage': 'severe',
}

// US state abbreviations for normalization
export const usStateAbbreviations: Record<string, string> = {
  alabama: 'AL',
  alaska: 'AK',
  arizona: 'AZ',
  arkansas: 'AR',
  california: 'CA',
  colorado: 'CO',
  connecticut: 'CT',
  delaware: 'DE',
  florida: 'FL',
  georgia: 'GA',
  hawaii: 'HI',
  idaho: 'ID',
  illinois: 'IL',
  indiana: 'IN',
  iowa: 'IA',
  kansas: 'KS',
  kentucky: 'KY',
  louisiana: 'LA',
  maine: 'ME',
  maryland: 'MD',
  massachusetts: 'MA',
  michigan: 'MI',
  minnesota: 'MN',
  mississippi: 'MS',
  missouri: 'MO',
  montana: 'MT',
  nebraska: 'NE',
  nevada: 'NV',
  'new hampshire': 'NH',
  'new jersey': 'NJ',
  'new mexico': 'NM',
  'new york': 'NY',
  'north carolina': 'NC',
  'north dakota': 'ND',
  ohio: 'OH',
  oklahoma: 'OK',
  oregon: 'OR',
  pennsylvania: 'PA',
  'rhode island': 'RI',
  'south carolina': 'SC',
  'south dakota': 'SD',
  tennessee: 'TN',
  texas: 'TX',
  utah: 'UT',
  vermont: 'VT',
  virginia: 'VA',
  washington: 'WA',
  'west virginia': 'WV',
  wisconsin: 'WI',
  wyoming: 'WY',
  'district of columbia': 'DC',
}

// reverse mapping for state validation
export const validStateAbbreviations = new Set(Object.values(usStateAbbreviations))
