// @ts-nocheck
// API utility functions

import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

/**
 * Success response
 */
export function successResponse<T>(
  data: T,
  statusCode = 200,
  message?: string
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status: statusCode }
  )
}

/**
 * Error response
 */
export function errorResponse(
  error: string | Error,
  statusCode = 500,
  details?: unknown
): NextResponse {
  const message = error instanceof Error ? error.message : error

  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(details && { details }),
    },
    { status: statusCode }
  )
}

/**
 * Validation error response (from Zod)
 */
export function validationErrorResponse(error: ZodError): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: 'Validierung fehlgeschlagen',
      details: error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    },
    { status: 400 }
  )
}

/**
 * Unauthorized response
 */
export function unauthorizedResponse(): NextResponse {
  return errorResponse('Nicht autorisiert', 401)
}

/**
 * Forbidden response
 */
export function forbiddenResponse(message = 'Zugriff verweigert'): NextResponse {
  return errorResponse(message, 403)
}

/**
 * Not found response
 */
export function notFoundResponse(resource = 'Resource'): NextResponse {
  return errorResponse(`${resource} nicht gefunden`, 404)
}

/**
 * Conflict response (e.g., resource already exists)
 */
export function conflictResponse(message: string): NextResponse {
  return errorResponse(message, 409)
}

/**
 * Too many requests response
 */
export function rateLimitResponse(): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: 'Zu viele Anfragen. Bitte versuche es später erneut.',
    },
    {
      status: 429,
      headers: {
        'Retry-After': '60',
      },
    }
  )
}

/**
 * Pagination helper
 */
export interface PaginationParams {
  page: number
  pageSize: number
}

export function getPaginationParams(
  searchParams: URLSearchParams,
  defaultPageSize = 20,
  maxPageSize = 100
): PaginationParams {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const pageSize = Math.min(
    Math.max(1, parseInt(searchParams.get('pageSize') || String(defaultPageSize))),
    maxPageSize
  )

  return { page, pageSize }
}

/**
 * Calculate pagination offset
 */
export function calculateOffset(page: number, pageSize: number): number {
  return (page - 1) * pageSize
}

/**
 * Create paginated response
 */
export function paginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
  statusCode = 200
): NextResponse {
  const totalPages = Math.ceil(total / pageSize)

  return NextResponse.json(
    {
      success: true,
      data: {
        items,
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
          hasMore: page < totalPages,
        },
      },
    },
    { status: statusCode }
  )
}
