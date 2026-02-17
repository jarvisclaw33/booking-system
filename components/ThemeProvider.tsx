'use client'

import React from 'react'
import { UIProvider } from '@/lib/store/ui-context'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <UIProvider>{children}</UIProvider>
}
