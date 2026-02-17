// @ts-nocheck
export const MOCK_MODE_ENABLED = process.env.NEXT_PUBLIC_MOCK_MODE === 'true'

export function isMockMode(): boolean {
  return MOCK_MODE_ENABLED
}

export function getMockModeStatus(): { enabled: boolean; message: string } {
  return {
    enabled: MOCK_MODE_ENABLED,
    message: MOCK_MODE_ENABLED
      ? '🟠 Mock Mode ist aktiviert. Verwende lokale Daten.'
      : '🟢 Production Mode. Verbunden mit Supabase.',
  }
}
