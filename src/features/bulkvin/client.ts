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

          const result = await fn()
          this.lastRequestTime = Date.now()
          resolve(result)
        } catch (error) {
          this.lastRequestTime = Date.now()
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
  options: { maxRetries?: number; baseDelay?: number; endpoint?: string } = {}
): Promise<T> {
  const { maxRetries = 4, baseDelay = 6000, endpoint = 'unknown' } = options
  const operationStart = Date.now()

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const attemptStart = Date.now()
    const res = await fetch(url)
    const responseTime = Date.now() - attemptStart
    const data = (await res.json()) as T & { error?: string; message?: string }

    console.info(`[bulkvin] ${endpoint} attempt ${attempt + 1}/${maxRetries}:`, {
      status: res.status,
      responseTime: `${responseTime}ms`,
      error: data.error || data.message || null,
    })

    const errorText = data.error || data.message || ''
    if (!errorText.includes('Server is busy')) {
      if (attempt > 0) {
        console.info(
          `[bulkvin] ${endpoint} succeeded after ${attempt + 1} attempts (${Date.now() - operationStart}ms total)`
        )
      }
      return data
    }

    if (attempt === maxRetries - 1) {
      console.info(
        `[bulkvin] ${endpoint} exhausted retries after ${Date.now() - operationStart}ms`
      )
      return data
    }

    // respect Retry-After header if present
    const retryAfter = res.headers.get('Retry-After')
    const retryAfterMs = retryAfter ? Number.parseInt(retryAfter, 10) * 1000 : 0

    // exponential backoff: 6s, 12s, 24s, 48s
    const delay = Math.max(baseDelay * Math.pow(2, attempt), retryAfterMs)
    console.info(
      `[bulkvin] ${endpoint} server busy, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`
    )
    await new Promise((resolve) => setTimeout(resolve, delay))
  }

  throw new Error('Unexpected: exhausted retries')
}

async function queuedFetch<T>(
  url: string,
  options: { maxRetries?: number; baseDelay?: number; endpoint?: string } = {}
): Promise<T> {
  return requestQueue.enqueue(() => fetchWithRetry<T>(url, options))
}

export const bulkvinClient = {
  async checkVin(vin: string): Promise<VinCheckResult> {
    try {
      const data = await queuedFetch<BulkVinCheckResponse>(
        `${BASE_URL}/check/?key=${BULKVIN_API_KEY}&vin=${vin}`,
        { endpoint: 'check' }
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
        `${BASE_URL}/carfax/?key=${BULKVIN_API_KEY}&vin=${vin}`,
        { endpoint: 'carfax' }
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
        `${BASE_URL}/autocheck/?key=${BULKVIN_API_KEY}&vin=${vin}`,
        { endpoint: 'autocheck' }
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
    const maxOuterRetries = 2

    let carfax = await this.getCarfaxReport(vin)
    let autocheck = await this.getAutocheckReport(vin)

    // retry partial failures — up to 2 outer retries with 10s gaps
    if (requireBoth) {
      for (let retry = 0; retry < maxOuterRetries; retry++) {
        const carfaxOk = carfax.success
        const autocheckOk = autocheck.success

        // both succeeded or both failed — no point retrying
        if ((carfaxOk && autocheckOk) || (!carfaxOk && !autocheckOk)) break

        console.info(
          `[bulkvin] partial failure (retry ${retry + 1}/${maxOuterRetries}): carfax=${carfaxOk}, autocheck=${autocheckOk}`
        )
        await new Promise((r) => setTimeout(r, 10_000))

        if (!carfaxOk) {
          carfax = await this.getCarfaxReport(vin)
        } else {
          autocheck = await this.getAutocheckReport(vin)
        }
      }
    }

    return { carfax, autocheck }
  },
}
