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
}

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
  const [formData, setFormData] = useState<LocationFormData>({
    name: initialData?.name || '',
    address: initialData?.address || '',
    timezone: initialData?.timezone || 'Europe/Berlin',
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
