// @ts-nocheck
'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { CalendarContainer } from '@/components/CalendarContainer';
import { isMockMode } from '@/lib/utils/mock';
import { mockBookings } from '@/lib/mock-data';
import { Calendar as CalendarIcon } from 'lucide-react';

interface Booking {
  id: string;
  start_time: string;
  end_time: string;
  guest_name: string;
  service: string;
  status: string;
  location_id: string;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);

      if (isMockMode()) {
        setBookings(mockBookings);
        return;
      }

      const { data, error } = await supabase
        .from('bookings')
        .select('*');

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      toast.error('Buchungen konnten nicht geladen werden');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-8 sm:p-12 text-center shadow-sm">
        <CalendarIcon className="h-8 w-8 text-gray-400 dark:text-slate-600 mx-auto mb-2 animate-pulse" />
        <p className="text-gray-600 dark:text-slate-400">Kalender wird geladen...</p>
      </div>
    );
  }

  return (
    <CalendarContainer
      currentDate={currentDate}
      setCurrentDate={setCurrentDate}
      bookings={bookings}
      startHour={7}
      endHour={20}
    />
  );
}
