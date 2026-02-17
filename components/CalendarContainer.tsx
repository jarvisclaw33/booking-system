// @ts-nocheck
'use client';

import { useState } from 'react';
import {
  format,
  addWeeks,
  subWeeks,
  startOfWeek,
  endOfWeek,
  addDays,
  subDays,
} from 'date-fns';
import { de } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WeekCalendar } from './WeekCalendar';
import { DayCalendar } from './DayCalendar';

interface Booking {
  id: string;
  start_time: string;
  end_time: string;
  guest_name: string;
  service: string;
  status: string;
  location_id: string;
}

interface CalendarContainerProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  bookings: Booking[];
  startHour?: number;
  endHour?: number;
}

type ViewType = 'week' | 'day';

export function CalendarContainer({
  currentDate,
  setCurrentDate,
  bookings,
  startHour = 7,
  endHour = 20,
}: CalendarContainerProps) {
  const [view, setView] = useState<ViewType>('week');

  const handlePrevious = () => {
    if (view === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(subDays(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (view === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getDateRangeLabel = () => {
    if (view === 'week') {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
      return `${format(weekStart, 'dd. MMM', { locale: de })} – ${format(weekEnd, 'dd. MMM yyyy', {
        locale: de,
      })}`;
    } else {
      return format(currentDate, 'dd. MMMM yyyy', { locale: de });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100">
              Kalender
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
              Deine Buchungen in der Kalenderansicht
            </p>
          </div>
        </div>

        {/* Navigation and tabs */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* View tabs */}
          <div className="flex gap-2 bg-gray-100 dark:bg-slate-800 p-1 rounded-lg w-fit">
            <Button
              variant={view === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('week')}
              className={`text-xs font-medium ${
                view === 'week'
                  ? ''
                  : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100'
              }`}
            >
              Woche
            </Button>
            <Button
              variant={view === 'day' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('day')}
              className={`text-xs font-medium ${
                view === 'day'
                  ? ''
                  : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100'
              }`}
            >
              Tag
            </Button>
          </div>

          {/* Navigation controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              title={view === 'week' ? 'Vorherige Woche' : 'Vorheriger Tag'}
              className="text-xs"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="text-sm font-semibold text-gray-900 dark:text-slate-100 min-w-fit px-2 text-center">
              {getDateRangeLabel()}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              title={view === 'week' ? 'Nächste Woche' : 'Nächster Tag'}
              className="text-xs"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleToday}
              className="text-xs font-medium"
            >
              Heute
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar view */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm">
        {view === 'week' ? (
          <WeekCalendar
            currentDate={currentDate}
            bookings={bookings}
            startHour={startHour}
            endHour={endHour}
          />
        ) : (
          <DayCalendar
            currentDate={currentDate}
            bookings={bookings}
            startHour={startHour}
            endHour={endHour}
          />
        )}
      </div>
    </div>
  );
}
