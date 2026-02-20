import { createMiddleware } from 'one'

import { analytics } from '~/features/analytics/analytics'
import { detectLocaleFromHeaders } from '~/i18n/detect'
import { DEFAULT_LOCALE, isValidLocale } from '~/i18n/locales'

type MaybeResponse = Response | void | null

function handleErrorTracking(request: Request, response: MaybeResponse): MaybeResponse {
  if (response && response.status >= 400) {
    const url = new URL(request.url)
    const endpoint = url.pathname
    const method = request.method

    let responseBody: Record<string, unknown> | null = null
    let errorCode: string | undefined
    let errorMessage: string | undefined

    try {
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        const clonedResponse = response.clone()
        clonedResponse.json().then((body) => {
          responseBody = body as Record<string, unknown>

          if (typeof responseBody!.error === 'string') {
            errorMessage = responseBody!.error
          }
          if (typeof responseBody!.code === 'string') {
            errorCode = responseBody!.code
          }
          if (typeof responseBody!.message === 'string') {
            errorMessage = responseBody!.message
          }

          analytics.track('api_error', {
            status: response.status,
            errorCode,
            errorMessage: errorMessage || `HTTP ${response.status}`,
            endpoint,
            method,
            responseBody,
          })
        })
      } else {
        analytics.track('api_error', {
          status: response.status,
          errorCode,
          errorMessage: errorMessage || `HTTP ${response.status}`,
          endpoint,
          method,
          responseBody,
        })
      }
    } catch (error) {
      console.error('Failed to parse error response body:', error)
      analytics.track('api_error', {
        status: response.status,
        endpoint,
        method,
      })
    }
  }

  return response
}

export default createMiddleware(async ({ request, next }) => {
  const url = new URL(request.url)

  // skip locale processing for API routes
  if (url.pathname.startsWith('/api/')) {
    return handleErrorTracking(request, await next())
  }

  // detect locale from URL prefix
  const segments = url.pathname.split('/')
  const maybeLocale = segments[1]

  if (maybeLocale && isValidLocale(maybeLocale) && maybeLocale !== DEFAULT_LOCALE) {
    // valid non-default locale prefix: /es/pricing
    const response = await next()
    if (response?.headers) {
      response.headers.set(
        'Set-Cookie',
        `locale=${maybeLocale}; Path=/; Max-Age=31536000; SameSite=Lax`
      )
    }
    return handleErrorTracking(request, response)
  }

  if (maybeLocale === DEFAULT_LOCALE) {
    // /en/pricing -> redirect to /pricing (canonical)
    const newPath = '/' + segments.slice(2).join('/')
    return Response.redirect(new URL(newPath || '/', url.origin), 301)
  }

  // no locale prefix: serve English, detect locale for UX hints
  const detected = detectLocaleFromHeaders(request.headers)
  const response = await next()
  if (response?.headers && detected !== DEFAULT_LOCALE) {
    response.headers.set(
      'Set-Cookie',
      `locale=${detected}; Path=/; Max-Age=31536000; SameSite=Lax`
    )
  }
  return handleErrorTracking(request, response)
})
