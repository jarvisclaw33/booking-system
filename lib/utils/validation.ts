// @ts-nocheck
import { ZodError, ZodSchema } from 'zod'

export function validateSchema<T>(schema: ZodSchema<T>, payload: unknown) {
  const result = schema.safeParse(payload)
  if (result.success) {
    return { data: result.data, error: null }
  }
  return { data: null, error: result.error }
}

export function formatZodErrors(error: ZodError) {
  return error.issues.map(issue => ({
    path: issue.path.join('.'),
    message: issue.message,
  }))
}
