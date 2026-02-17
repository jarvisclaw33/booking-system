// @ts-nocheck
'use client';

import {
  format,
  isToday,
  getHours,
  getMinutes,
} from 'date-fns';
import { de } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface Booking {
  id: string;
  start_time: string;
  end_time: string;
  guest_name: string;
  service: string;
  status: string;
  location_id: string;
}

interface DayCalendarProps {
  currentDate: Date;
  bookings: Booking[];
  startHour?: number;
  endHour?: number;
}

const getServiceColor = (service: string) => {
  switch (service?.toLowerCase()) {
    case 'haircut':
      return 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700';
    case 'massage':
      return 'bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700';
    case 'konsultation':
      return 'bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-700';
    default:
      return 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600';
  }
};

const getServiceTextColor = (service: string) => {
  switch (service?.toLowerCase()) {
    case 'haircut':
      return 'text-blue-800 dark:text-blue-100';
    case 'massage':
      return 'text-green-800 dark:text-green-100';
    case 'konsultation':
      return 'text-purple-800 dark:text-purple-100';
    default:
      return 'text-gray-800 dark:text-gray-100';
  }
};

const getStatusBadgeColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'confirmed':
      return 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-100';
    case 'pending':
      return 'bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100';
    case 'cancelled':
      return 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-100';
    default:
      return 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-100';
  }
};

export function DayCalendar({
  currentDate,
  bookings,
  startHour = 7,
  endHour = 20,
}: DayCalendarProps) {
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);

  const dayBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.start_time);
    return (
      bookingDate.getDate() === currentDate.getDate() &&
      bookingDate.getMonth() === currentDate.getMonth() &&
      bookingDate.getFullYear() === currentDate.getFullYear()
    );
  }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  const now = new Date();
  const currentHour = getHours(now);
  const currentMinute = getMinutes(now);
  const showNowLine = isToday(currentDate) && currentHour >= startHour && currentHour < endHour;
  const nowPercentage = (currentMinute / 60) * 100;
  const nowTopPercent = ((currentHour - startHour) * 100) + (currentMinute / 60) * 100 / (endHour - startHour);

  const calculateBookingPosition = (booking: Booking) => {
    const startTime = new Date(booking.start_time);
    const endTime = new Date(booking.end_time);
    
    const startHourOfDay = getHours(startTime);
    const startMinOfDay = getMinutes(startTime);

    const hourRange = endHour - startHour;
    const startPosition = ((startHourOfDay - startHour + startMinOfDay / 60) / hourRange) * 100;
    const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    const heightPercent = (durationHours / hourRange) * 100;

    return {
      top: `${startPosition}%`,
      height: `${Math.max(8, heightPercent)}%`,
    };
  };

  const formatTime = (date: Date) => {
    return format(date, 'HH:mm');
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      confirmed: 'Bestätigt',
      pending: 'Ausstehend',
      cancelled: 'Abgesagt',
    };
    return labels[status?.toLowerCase()] || status;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-4 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100">
            {format(currentDate, 'EEEE, d. MMMM yyyy', { locale: de })}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400 mt-1">
            {dayBookings.length} Buchung{dayBookings.length !== 1 ? 'en' : ''} heute
          </p>
        </div>
        <Button className="gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Neue Buchung
        </Button>
      </div>

      {/* Timeline */}
      <div className="relative bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Hours column with current time line */}
        <div className="relative" style={{ height: `${(endHour - startHour) * 80}px` }}>
          {/* Time labels */}
          <div className="absolute left-0 top-0 w-16 sm:w-20 bottom-0 border-r border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 overflow-y-auto">
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-20 border-b border-gray-200 dark:border-slate-800 px-2 py-2 text-right"
              >
                <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-slate-400">
                  {String(hour).padStart(2, '0')}:00
                </p>
              </div>
            ))}
          </div>

          {/* Timeline grid */}
          <div className="ml-16 sm:ml-20 relative">
            {hours.map((hour, idx) => (
              <div
                key={hour}
                className="h-20 border-b border-gray-100 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
              />
            ))}

            {/* Current time line */}
            {showNowLine && (
              <div
                className="absolute left-0 right-0 h-1 bg-red-500 shadow-md z-20"
                style={{
                  top: `${nowTopPercent}%`,
                }}
              >
                <div className="absolute -left-2 -top-1.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
              </div>
            )}

            {/* Bookings */}
            <div className="relative h-full">
              {dayBookings.map((booking) => (
                <div
                  key={booking.id}
                  className={`absolute left-2 right-2 rounded-lg border-l-4 p-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow ${getServiceColor(
                    booking.service
                  )}`}
                  style={calculateBookingPosition(booking)}
                  title={booking.guest_name}
                >
                  {/* Booking content */}
                  <div className="flex flex-col h-full justify-between">
                    <div>
                      <h3 className={`font-bold text-sm ${getServiceTextColor(booking.service)}`}>
                        {booking.guest_name}
                      </h3>
                      <p className={`text-xs ${getServiceTextColor(booking.service)} opacity-75`}>
                        {booking.service}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-xs font-medium ${getServiceTextColor(booking.service)}`}>
                        {formatTime(new Date(booking.start_time))} -{' '}
                        {formatTime(new Date(booking.end_time))}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${getStatusBadgeColor(
                        booking.status
                      )}`}>
                        {getStatusLabel(booking.status)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {dayBookings.length === 0 && (
        <div className="text-center py-12 text-gray-600 dark:text-slate-400">
          <p className="text-lg font-medium mb-2">Keine Buchungen heute</p>
          <p className="text-sm">Erstelle eine neue Buchung mit dem Button oben</p>
        </div>
      )}

      {/* Summary */}
      {dayBookings.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-600 dark:text-blue-300 font-medium">Bestätigt</p>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
              {dayBookings.filter((b) => b.status === 'confirmed').length}
            </p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
            <p className="text-xs text-yellow-600 dark:text-yellow-300 font-medium">Ausstehend</p>
            <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100 mt-1">
              {dayBookings.filter((b) => b.status === 'pending').length}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <p className="text-xs text-green-600 dark:text-green-300 font-medium">Services</p>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
              {dayBookings.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
