'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { mockTimezones } from '@/lib/mock-data';

interface LocationFormProps {
  onSubmit?: (data: LocationFormData) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  initialData?: LocationFormData;
}

export interface LocationFormData {
  name: string;
  address?: string;
  timezone?: string;
  openingHours?: OpeningHours[];
}

export interface OpeningHours {
  day: number; // 0 = Sunday, 1 = Monday, etc.
  open: string; // HH:mm format
  close: string; // HH:mm format
  closed?: boolean;
}

const DAYS = [
  { value: 1, label: 'Montag' },
  { value: 2, label: 'Dienstag' },
  { value: 3, label: 'Mittwoch' },
  { value: 4, label: 'Donnerstag' },
  { value: 5, label: 'Freitag' },
  { value: 6, label: 'Samstag' },
  { value: 0, label: 'Sonntag' },
];

const timezones = [
  'UTC',
  ...mockTimezones,
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
];

export function LocationForm({
  onSubmit,
  onCancel,
  loading,
  initialData,
}: LocationFormProps) {
  const defaultOpeningHours: OpeningHours[] = [
    { day: 1, open: '09:00', close: '18:00', closed: false },
    { day: 2, open: '09:00', close: '18:00', closed: false },
    { day: 3, open: '09:00', close: '18:00', closed: false },
    { day: 4, open: '09:00', close: '18:00', closed: false },
    { day: 5, open: '09:00', close: '18:00', closed: false },
    { day: 6, open: '10:00', close: '14:00', closed: false },
    { day: 0, open: '', close: '', closed: true },
  ];

  const [formData, setFormData] = useState<LocationFormData>({
    name: initialData?.name || '',
    address: initialData?.address || '',
    timezone: initialData?.timezone || 'Europe/Berlin',
    openingHours: initialData?.openingHours || defaultOpeningHours,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpeningHoursChange = (day: number, field: keyof OpeningHours, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      openingHours: (prev.openingHours || defaultOpeningHours).map((hours) =>
        hours.day === day ? { ...hours, [field]: value } : hours
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Standortname ist erforderlich');
      return;
    }

    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
    } catch (error) {
      toast.error('Formular konnte nicht eingereicht werden');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 dark:text-slate-300"
        >
          Standortname
        </label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="z.B. Hauptbüro"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1"
        />
      </div>

      <div>
        <label
          htmlFor="address"
          className="block text-sm font-medium text-gray-700 dark:text-slate-300"
        >
          Adresse
        </label>
        <Input
          id="address"
          name="address"
          type="text"
          placeholder="z.B. Musterstraße 123, 12345 Stadt"
          value={formData.address}
          onChange={handleChange}
          className="mt-1"
        />
      </div>

      <div>
        <label
          htmlFor="timezone"
          className="block text-sm font-medium text-gray-700 dark:text-slate-300"
        >
          Zeitzone
        </label>
        <select
          id="timezone"
          name="timezone"
          value={formData.timezone}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          {timezones.map((zone) => (
            <option key={zone} value={zone}>
              {zone}
            </option>
          ))}
        </select>
      </div>

      {/* Opening Hours */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
          Öffnungszeiten
        </label>
        <div className="space-y-2 bg-gray-50 dark:bg-slate-800 p-3 rounded-lg">
          {(formData.openingHours || defaultOpeningHours).map((hours) => (
            <div key={hours.day} className="flex items-center gap-2">
              <span className="w-24 text-sm text-gray-600 dark:text-slate-400">
                {DAYS.find(d => d.value === hours.day)?.label}
              </span>
              <input
                type="checkbox"
                checked={!hours.closed}
                onChange={(e) => handleOpeningHoursChange(hours.day, 'closed', !e.target.checked)}
                className="w-4 h-4"
              />
              {!hours.closed && (
                <>
                  <input
                    type="time"
                    value={hours.open}
                    onChange={(e) => handleOpeningHoursChange(hours.day, 'open', e.target.value)}
                    className="rounded border border-gray-300 px-2 py-1 text-sm dark:bg-slate-900"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="time"
                    value={hours.close}
                    onChange={(e) => handleOpeningHoursChange(hours.day, 'close', e.target.value)}
                    className="rounded border border-gray-300 px-2 py-1 text-sm dark:bg-slate-900"
                  />
                </>
              )}
              {hours.closed && (
                <span className="text-sm text-gray-400">Geschlossen</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Speichern...' : 'Standort speichern'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Abbrechen
        </Button>
      </div>
    </form>
  );
}
