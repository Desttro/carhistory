export const VIN_LENGTH = 17

// VINs contain alphanumeric characters, excluding I, O, Q
export const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/i

export interface VinValidationResult {
  valid: boolean
  normalizedVin: string
  error?: string
}

export function validateVin(vin: string): VinValidationResult {
  const normalizedVin = vin.toUpperCase().trim()

  if (normalizedVin.length !== VIN_LENGTH) {
    return {
      valid: false,
      normalizedVin,
      error: `Invalid VIN format. VIN must be exactly ${VIN_LENGTH} characters.`,
    }
  }

  if (!VIN_REGEX.test(normalizedVin)) {
    return {
      valid: false,
      normalizedVin,
      error: 'Invalid VIN format. VIN contains invalid characters.',
    }
  }

  return {
    valid: true,
    normalizedVin,
  }
}
