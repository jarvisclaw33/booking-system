'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/ThemeProvider'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { UIProvider } from '@/lib/store/ui-context'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <ThemeProvider>
      <UIProvider>
        <QueryClientProvider client={queryClient}>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
          <Toaster position="top-right" richColors expand />
        </QueryClientProvider>
      </UIProvider>
    </ThemeProvider>
  )
}
