import { usStateAbbreviations, validStateAbbreviations } from '../constants'

interface ParsedLocation {
  city?: string
  state?: string
  country: string
}

// parse and normalize a location string
export function parseLocation(location: string): ParsedLocation {
  if (!location) {
    return { country: 'US' }
  }

  const trimmed = location.trim()

  // pattern: "CITY, ST"
  const cityStateMatch = trimmed.match(/^([^,]+),\s*([A-Z]{2})$/i)
  if (cityStateMatch) {
    const [, city, state] = cityStateMatch
    return {
      city: normalizeCity(city),
      state: state.toUpperCase(),
      country: 'US',
    }
  }

  // pattern: just "ST" (2-letter abbreviation)
  if (/^[A-Z]{2}$/i.test(trimmed)) {
    const state = trimmed.toUpperCase()
    if (validStateAbbreviations.has(state)) {
      return { state, country: 'US' }
    }
  }

  // pattern: full state name
  const lowerTrimmed = trimmed.toLowerCase()
  if (usStateAbbreviations[lowerTrimmed]) {
    return { state: usStateAbbreviations[lowerTrimmed], country: 'US' }
  }

  // pattern: "CITY, STATE NAME"
  const cityFullStateMatch = trimmed.match(/^([^,]+),\s*(.+)$/i)
  if (cityFullStateMatch) {
    const [, city, statePart] = cityFullStateMatch
    const stateAbbr = usStateAbbreviations[statePart.toLowerCase()]
    if (stateAbbr) {
      return {
        city: normalizeCity(city),
        state: stateAbbr,
        country: 'US',
      }
    }
    // might be a two-letter abbreviation
    if (validStateAbbreviations.has(statePart.toUpperCase())) {
      return {
        city: normalizeCity(city),
        state: statePart.toUpperCase(),
        country: 'US',
      }
    }
  }

  // online/dealer locations
  if (lowerTrimmed.includes('online')) {
    return { city: 'Online', country: 'US' }
  }

  // if nothing matches, return just the city
  return { city: normalizeCity(trimmed), country: 'US' }
}

// normalize city name (proper case)
function normalizeCity(city: string): string {
  return city
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// extract just the state from a location string
export function extractState(location: string): string | undefined {
  const parsed = parseLocation(location)
  return parsed.state
}

// format a parsed location back to string
export function formatLocation(parsed: ParsedLocation): string {
  if (parsed.city && parsed.state) {
    return `${parsed.city}, ${parsed.state}`
  }
  if (parsed.state) {
    return parsed.state
  }
  if (parsed.city) {
    return parsed.city
  }
  return ''
}
