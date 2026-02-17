'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface BookingFormProps {
  locationId?: string;
  onSubmit?: (data: BookingFormData) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

export interface BookingFormData {
  guest_name: string;
  location_id: string;
  start_time: string;
  end_time: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export function BookingForm({
  locationId,
  onSubmit,
  onCancel,
  loading,
}: BookingFormProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    guest_name: '',
    location_id: locationId || '',
    start_time: '',
    end_time: '',
    status: 'pending',
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

    if (!formData.guest_name || !formData.location_id || !formData.start_time || !formData.end_time) {
      toast.error('Bitte alle Pflichtfelder ausfüllen');
      return;
    }

    if (new Date(formData.start_time) >= new Date(formData.end_time)) {
      toast.error('Die Endzeit muss nach der Startzeit liegen');
      return;
    }

    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
    } catch (error) {
      toast.error('Formular konnte nicht gesendet werden');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="guest_name"
          className="block text-sm font-medium text-gray-700 dark:text-slate-300"
        >
          Gastname
        </label>
        <Input
          id="guest_name"
          name="guest_name"
          type="text"
          placeholder="Max Mustermann"
          value={formData.guest_name}
          onChange={handleChange}
          required
          className="mt-1"
        />
      </div>

      <div>
        <label
          htmlFor="location_id"
          className="block text-sm font-medium text-gray-700 dark:text-slate-300"
        >
          Standort
        </label>
        <select
          id="location_id"
          name="location_id"
          value={formData.location_id}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          <option value="">Standort wählen...</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="start_time"
            className="block text-sm font-medium text-gray-700 dark:text-slate-300"
          >
            Startzeit
          </label>
          <Input
            id="start_time"
            name="start_time"
            type="datetime-local"
            value={formData.start_time}
            onChange={handleChange}
            required
            className="mt-1"
          />
        </div>

        <div>
          <label
            htmlFor="end_time"
            className="block text-sm font-medium text-gray-700 dark:text-slate-300"
          >
            Endzeit
          </label>
          <Input
            id="end_time"
            name="end_time"
            type="datetime-local"
            value={formData.end_time}
            onChange={handleChange}
            required
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="status"
          className="block text-sm font-medium text-gray-700 dark:text-slate-300"
        >
          Status
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          <option value="pending">Ausstehend</option>
          <option value="confirmed">Bestätigt</option>
          <option value="cancelled">Storniert</option>
        </select>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Speichert...' : 'Buchung speichern'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Abbrechen
        </Button>
      </div>
    </form>
  );
}
