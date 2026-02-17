'use client';

import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks } from 'date-fns';
import { de } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TimeSlot {
  hour: number;
  minute: number;
}

interface CalendarViewProps {
  currentDate: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  view?: 'week' | 'day';
  onViewChange?: (view: 'week' | 'day') => void;
}

export function CalendarView({
  currentDate,
  onPreviousWeek,
  onNextWeek,
  onToday,
  view = 'week',
  onViewChange,
}: CalendarViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const timeSlots: TimeSlot[] = [];
  for (let hour = 7; hour < 20; hour++) {
    timeSlots.push({ hour, minute: 0 });
    timeSlots.push({ hour, minute: 30 });
  }

  const formatTimeSlot = (hour: number, minute: number) => {
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
            {format(weekStart, 'dd. MMM', { locale: de })} - {format(weekEnd, 'dd. MMM yyyy', { locale: de })}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onPreviousWeek} title="Vorherige Woche">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onToday} className="text-xs">
            Heute
          </Button>
          <Button variant="outline" size="sm" onClick={onNextWeek} title="Nächste Woche">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="min-w-full">
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 dark:border-slate-800 dark:bg-slate-800">
            <div className="border-r border-gray-200 px-2 py-3 sm:px-4 bg-white dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs font-semibold text-gray-600 dark:text-slate-400">Zeit</p>
            </div>

            {days.map((day, idx) => {
              const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
              return (
                <div
                  key={day.toString()}
                  className={`border-r border-gray-200 px-2 py-3 sm:px-4 text-center dark:border-slate-800 ${
                    isToday ? 'bg-blue-50 dark:bg-blue-500/20' : 'bg-gray-50 dark:bg-slate-800'
                  } ${idx === 6 ? 'border-r-0' : ''}`}
                >
                  <p className={`text-xs font-semibold ${isToday ? 'text-blue-600 dark:text-blue-200' : 'text-gray-600 dark:text-slate-400'}`}>
                    {format(day, 'EEE', { locale: de }).toUpperCase()}
                  </p>
                  <p className={`text-sm font-bold mt-1 ${isToday ? 'text-blue-700 dark:text-blue-100' : 'text-gray-900 dark:text-slate-100'}`}>
                    {format(day, 'd')}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-7">
            <div className="border-r border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              {timeSlots.map((slot) => (
                <div
                  key={`${slot.hour}-${slot.minute}`}
                  className="border-b border-gray-100 px-2 py-2 sm:px-4 text-right dark:border-slate-800"
                >
                  {slot.minute === 0 && (
                    <p className="text-xs text-gray-500 font-medium dark:text-slate-400">
                      {formatTimeSlot(slot.hour, slot.minute)}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {days.map((day, dayIdx) => (
              <div
                key={day.toString()}
                className={`relative border-r border-gray-200 dark:border-slate-800 ${dayIdx === 6 ? 'border-r-0' : ''}`}
              >
                {timeSlots.map((slot) => (
                  <div
                    key={`${day}-${slot.hour}-${slot.minute}`}
                    className="border-b border-gray-100 h-12 min-h-12 hover:bg-blue-50 transition-colors cursor-pointer dark:border-slate-800 dark:hover:bg-blue-500/10"
                    title={`${formatTimeSlot(slot.hour, slot.minute)} - ${formatTimeSlot(slot.hour, slot.minute + 30)}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-gray-500 py-2 dark:text-slate-400">
        <p>Klicke auf einen Zeitslot, um eine neue Buchung zu erstellen</p>
      </div>
    </div>
  );
}
