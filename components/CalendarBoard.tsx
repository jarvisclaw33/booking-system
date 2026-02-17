'use client'

import { useMemo } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
} from 'date-fns'
import { de } from 'date-fns/locale'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CalendarView } from '@/components/CalendarView'

interface CalendarBooking {
  id: string
  start_time: string
  end_time: string
  location_id: string
}

interface CalendarBoardProps {
  currentDate: Date
  setCurrentDate: (date: Date) => void
  view: 'month' | 'week'
  setView: (view: 'month' | 'week') => void
  bookings: CalendarBooking[]
  loading?: boolean
}

export function CalendarBoard({
  currentDate,
  setCurrentDate,
  view,
  setView,
  bookings,
  loading,
}: CalendarBoardProps) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = useMemo(
    () => eachDayOfInterval({ start: monthStart, end: monthEnd }),
    [monthStart, monthEnd]
  )

  const getBookingsForDay = (day: Date) => {
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.start_time)
      return (
        bookingDate.getDate() === day.getDate() &&
        bookingDate.getMonth() === day.getMonth() &&
        bookingDate.getFullYear() === day.getFullYear()
      )
    })
  }

  const goToPrevious = () => {
    setCurrentDate(view === 'week' ? subWeeks(currentDate, 1) : subMonths(currentDate, 1))
  }

  const goToNext = () => {
    setCurrentDate(view === 'week' ? addWeeks(currentDate, 1) : addMonths(currentDate, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100">Kalender</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
            Deine Buchungen in der Kalenderansicht
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={view === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('week')}
            className="text-xs"
          >
            Woche
          </Button>
          <Button
            variant={view === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('month')}
            className="text-xs"
          >
            Monat
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 sm:p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <CalendarIcon className="h-8 w-8 text-gray-400 mx-auto mb-2 animate-pulse" />
          <p className="text-gray-600 dark:text-slate-400">Kalender wird geladen...</p>
        </div>
      ) : view === 'week' ? (
        <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <CalendarView
            currentDate={currentDate}
            onPreviousWeek={goToPrevious}
            onNextWeek={goToNext}
            onToday={goToToday}
            view="week"
          />
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
              {format(currentDate, 'MMMM yyyy', { locale: de })}
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPrevious}
                title="Vorheriger Monat"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday} className="text-xs">
                Heute
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNext}
                title="Nächster Monat"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="hidden sm:mb-4 sm:grid grid-cols-7 gap-2 text-center text-sm font-semibold text-gray-600 dark:text-slate-400">
            <div>So</div>
            <div>Mo</div>
            <div>Di</div>
            <div>Mi</div>
            <div>Do</div>
            <div>Fr</div>
            <div>Sa</div>
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {days.map(day => {
              const dayBookings = getBookingsForDay(day)
              const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')

              return (
                <div
                  key={day.toString()}
                  className={`relative min-h-16 sm:min-h-24 rounded-md border p-1 sm:p-2 text-xs sm:text-sm dark:border-slate-700 ${
                    isSameMonth(day, currentDate)
                      ? 'bg-white dark:bg-slate-900'
                      : 'bg-gray-50 dark:bg-slate-800'
                  } ${isToday ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40' : 'border-gray-200'}`}
                >
                  <p
                    className={`font-medium ${
                      isToday ? 'text-blue-600 dark:text-blue-300' : 'text-gray-900 dark:text-slate-100'
                    }`}
                  >
                    {format(day, 'd')}
                  </p>

                  <div className="mt-0.5 sm:mt-1 space-y-0.5 sm:space-y-1">
                    {dayBookings.slice(0, 1).map(booking => (
                      <div
                        key={booking.id}
                        className="truncate rounded bg-blue-100 px-1 py-0.5 text-xs text-blue-700 dark:bg-blue-500/20 dark:text-blue-200"
                      >
                        <span className="hidden sm:inline">Buchung</span>
                        <span className="sm:hidden">•</span>
                      </div>
                    ))}
                    {dayBookings.length > 1 && (
                      <div className="text-xs text-gray-500 dark:text-slate-400">
                        +{dayBookings.length - 1}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
