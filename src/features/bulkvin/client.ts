import { BULKVIN_API_KEY } from '~/server/env-server'

import type {
  VinCheckResult,
  VinReportResult,
  BulkVinCheckResponse,
  BulkVinReportResponse,
} from './types'

const BASE_URL = 'https://bulkvin.com/restapi'

// request queue to serialize all bulkvin API calls globally
// prevents concurrent requests from overwhelming the API
class RequestQueue {
  private queue: Array<() => Promise<void>> = []
  private processing = false
  private lastRequestTime = 0
  private minDelayBetweenRequests = 5000 // 5 seconds between any requests

  async enqueue<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          // ensure minimum delay between requests
          const now = Date.now()
          const timeSinceLastRequest = now - this.lastRequestTime
          if (timeSinceLastRequest < this.minDelayBetweenRequests) {
            const waitTime = this.minDelayBetweenRequests - timeSinceLastRequest
            console.info(`[bulkvin] waiting ${waitTime}ms before next request`)
            await new Promise((r) => setTimeout(r, waitTime))
          }

          this.lastRequestTime = Date.now()
          const result = await fn()
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })

      this.processQueue()
    })
  }

  private async processQueue() {
    if (this.processing) return
    this.processing = true

    while (this.queue.length > 0) {
      const task = this.queue.shift()
      if (task) {
        await task()
      }
    }

    this.processing = false
  }
}

const requestQueue = new RequestQueue()

async function fetchWithRetry<T>(
  url: string,
  options: { maxRetries?: number; baseDelay?: number } = {}
): Promise<T> {
  const { maxRetries = 5, baseDelay = 3000 } = options

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const res = await fetch(url)
    const data = (await res.json()) as T & { error?: string; message?: string }

    const errorText = data.error || data.message || ''
    if (!errorText.includes('Server is busy')) {
      return data
    }

    if (attempt === maxRetries - 1) {
      return data
    }

    // exponential backoff: 3s, 6s, 12s, 24s
    const delay = baseDelay * Math.pow(2, attempt)
    console.info(
      `[bulkvin] server busy, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`
    )
    await new Promise((resolve) => setTimeout(resolve, delay))
  }

  throw new Error('Unexpected: exhausted retries')
}

async function queuedFetch<T>(
  url: string,
  options: { maxRetries?: number; baseDelay?: number } = {}
): Promise<T> {
  return requestQueue.enqueue(() => fetchWithRetry<T>(url, options))
}

export const bulkvinClient = {
  async checkVin(vin: string): Promise<VinCheckResult> {
    try {
      const data = await queuedFetch<BulkVinCheckResponse>(
        `${BASE_URL}/check/?key=${BULKVIN_API_KEY}&vin=${vin}`
      )

      if (!data.status) {
        return { success: false, error: 'VIN not found or no records available' }
      }

      return {
        success: true,
        carfaxRecords: data.records?.carfax ?? 0,
        autocheckRecords: data.records?.autocheck ?? 0,
        model: data.records?.model,
        year: data.records?.year,
      }
    } catch (error) {
      console.info('bulkvin check error:', error)
      return { success: false, error: 'Failed to check VIN availability' }
    }
  },

  async getCarfaxReport(vin: string): Promise<VinReportResult> {
    try {
      const data = await queuedFetch<BulkVinReportResponse>(
        `${BASE_URL}/carfax/?key=${BULKVIN_API_KEY}&vin=${vin}`
      )

      console.info('[bulkvin] carfax response:', {
        status: data.status,
        hasReport: !!data.report_carfax,
        message: data.message,
        error: data.error,
      })

      if (!data.status || !data.report_carfax) {
        return {
          success: false,
          error: data.message || data.error || 'Failed to fetch Carfax report',
        }
      }

      return {
        success: true,
        html: Buffer.from(data.report_carfax, 'base64').toString('utf-8'),
      }
    } catch (error) {
      console.info('bulkvin carfax error:', error)
      return { success: false, error: 'Failed to fetch Carfax report' }
    }
  },

  async getAutocheckReport(vin: string): Promise<VinReportResult> {
    try {
      const data = await queuedFetch<BulkVinReportResponse>(
        `${BASE_URL}/autocheck/?key=${BULKVIN_API_KEY}&vin=${vin}`
      )

      console.info('[bulkvin] autocheck response:', {
        status: data.status,
        hasReport: !!data.report_autocheck,
        message: data.message,
        error: data.error,
      })

      if (!data.status || !data.report_autocheck) {
        return {
          success: false,
          error: data.message || data.error || 'Failed to fetch AutoCheck report',
        }
      }

      return {
        success: true,
        html: Buffer.from(data.report_autocheck, 'base64').toString('utf-8'),
      }
    } catch (error) {
      console.info('bulkvin autocheck error:', error)
      return { success: false, error: 'Failed to fetch AutoCheck report' }
    }
  },

  // fetch both reports with retry logic for partial failures
  async getBothReports(
    vin: string,
    options: { requireBoth?: boolean } = {}
  ): Promise<{ carfax: VinReportResult; autocheck: VinReportResult }> {
    const { requireBoth = true } = options

    let carfax = await this.getCarfaxReport(vin)
    let autocheck = await this.getAutocheckReport(vin)

    // if one failed but other succeeded, retry the failed one
    if (requireBoth) {
      if (!carfax.success && autocheck.success) {
        console.info(
          '[bulkvin] carfax failed but autocheck succeeded, retrying carfax...'
        )
        carfax = await this.getCarfaxReport(vin)
      } else if (carfax.success && !autocheck.success) {
        console.info(
          '[bulkvin] autocheck failed but carfax succeeded, retrying autocheck...'
        )
        autocheck = await this.getAutocheckReport(vin)
      }
    }

    return { carfax, autocheck }
  },
}
