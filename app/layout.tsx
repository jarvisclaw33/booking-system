import type { Metadata } from 'next'
import '@/styles/globals.css'
import { Providers } from '@/components/Providers'

export const metadata: Metadata = {
  title: 'Booking System',
  description: 'A modern booking system built with Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
