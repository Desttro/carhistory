import type { ErrorCode } from '@take-out/helpers'

interface ApiSuccessResponse<T> {
  success: true
  data?: T
}

interface ApiErrorResponse {
  success: false
  error: string
  code?: ErrorCode
}

export function apiSuccess<T>(data?: T): Response {
  const body: ApiSuccessResponse<T> = { success: true }
  if (data !== undefined) {
    body.data = data
  }
  return Response.json(body)
}

export function apiError(
  error: string,
  status: number = 400,
  code?: ErrorCode
): Response {
  const body: ApiErrorResponse = { success: false, error }
  if (code) {
    body.code = code
  }
  return Response.json(body, { status })
}

export const ApiErrors = {
  badRequest: (error: string) => apiError(error, 400, 'VALIDATION_ERROR'),
  unauthorized: (error = 'Authentication required') =>
    apiError(error, 401, 'NOT_AUTHENTICATED'),
  forbidden: (error = 'Not authorized') => apiError(error, 403, 'NOT_AUTHORIZED'),
  notFound: (error = 'Not found') => apiError(error, 404, 'NOT_FOUND'),
  rateLimited: (error = 'Too many requests') => apiError(error, 429, 'RATE_LIMITED'),
  internal: (error = 'Internal server error') => apiError(error, 500, 'INTERNAL_ERROR'),
}
