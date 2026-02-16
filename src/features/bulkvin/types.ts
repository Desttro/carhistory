export interface VinCheckResult {
  success: boolean
  vin?: string
  carfaxRecords?: number
  autocheckRecords?: number
  model?: string
  year?: number
  error?: string
}

export interface VinReportResult {
  success: boolean
  html?: string
  error?: string
}

export interface BulkVinCheckResponse {
  status: boolean
  records?: {
    carfax?: number
    autocheck?: number
    model?: string
    year?: number
  }
}

export interface BulkVinReportResponse {
  status: boolean
  report_carfax?: string
  report_autocheck?: string
  message?: string
  error?: string
}
