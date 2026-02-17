'use client'

import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { Skeleton } from '@/components/ui/skeleton'

interface BookingTrendPoint {
  date: Date
  value: number
}

interface BookingTrendsChartProps {
  data: BookingTrendPoint[]
  loading?: boolean
}

export function BookingTrendsChart({ data, loading }: BookingTrendsChartProps) {
  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, idx) => (
            <Skeleton key={idx} className="h-24 w-full" />
          ))}
        </div>
      </div>
    )
  }

  const max = Math.max(1, ...data.map(point => point.value))

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100">Buchungstrends</h3>
          <p className="text-xs text-gray-500 dark:text-slate-400">Letzte 14 Tage</p>
        </div>
        <span className="text-xs text-gray-500 dark:text-slate-400">Summe: {data.reduce((sum, point) => sum + point.value, 0)}</span>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {data.map((point, idx) => {
          const height = Math.round((point.value / max) * 100)
          const label = format(point.date, 'dd. MMM', { locale: de })
          return (
            <div key={`${label}-${idx}`} className="flex flex-col items-center gap-2">
              <div className="flex h-24 w-full items-end">
                <div
                  className="w-full rounded-md bg-blue-500/80 transition-all duration-300 dark:bg-blue-400"
                  style={{ height: `${height}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-500 dark:text-slate-400">{label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
