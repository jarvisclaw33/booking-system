// @ts-nocheck
export const MOCK_MODE_ENV_KEY = 'NEXT_PUBLIC_MOCK_MODE'

export function isMockMode(): boolean {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_MOCK_MODE === 'true'
  }

  return (
    process.env.MOCK_MODE === 'true' ||
    process.env.NEXT_PUBLIC_MOCK_MODE === 'true'
  )
}

export function mockDelay(ms = 200): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
