// @ts-nocheck
export function getErrorMessage(error: unknown, fallback = 'Ein unbekannter Fehler ist aufgetreten') {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  if (error && typeof error === 'object' && 'message' in error) {
    const value = (error as { message?: string }).message
    if (typeof value === 'string') return value
  }
  return fallback
}
