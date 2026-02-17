// @ts-nocheck
/**
 * German date and time formatting utilities
 * Consistent formatting across the application
 */

import { format, parse, isValid } from 'date-fns';
import { de } from 'date-fns/locale';

/**
 * Format date as dd.mm.yyyy (German standard)
 */
export function formatDateDE(date: Date | string): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (!isValid(dateObj)) return '';
    return format(dateObj, 'dd.MM.yyyy', { locale: de });
  } catch {
    return '';
  }
}

/**
 * Format time as HH:mm (24-hour format)
 */
export function formatTimeDE(date: Date | string): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (!isValid(dateObj)) return '';
    return format(dateObj, 'HH:mm', { locale: de });
  } catch {
    return '';
  }
}

/**
 * Format datetime as dd.mm.yyyy HH:mm (German standard)
 */
export function formatDateTimeDE(date: Date | string): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (!isValid(dateObj)) return '';
    return format(dateObj, 'dd.MM.yyyy HH:mm', { locale: de });
  } catch {
    return '';
  }
}

/**
 * Format month name (e.g., "Januar" or "Jan")
 */
export function formatMonthDE(date: Date | string, abbreviated = false): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (!isValid(dateObj)) return '';
    return format(dateObj, abbreviated ? 'MMM' : 'MMMM', { locale: de });
  } catch {
    return '';
  }
}

/**
 * Format relative time (e.g., "vor 2 Stunden")
 */
export function getRelativeTimeDE(date: Date | string): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (!isValid(dateObj)) return '';

    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'gerade eben';
    if (diffMins < 60) return `vor ${diffMins} Min`;
    if (diffHours < 24) return `vor ${diffHours}h`;
    if (diffDays < 7) return `vor ${diffDays}d`;

    return formatDateDE(dateObj);
  } catch {
    return '';
  }
}

/**
 * Parse German date string (dd.mm.yyyy) to Date
 */
export function parseDateDE(dateString: string): Date | null {
  try {
    const date = parse(dateString, 'dd.MM.yyyy', new Date());
    return isValid(date) ? date : null;
  } catch {
    return null;
  }
}

/**
 * Get duration string (e.g., "1h 30m" or "45m")
 */
export function formatDurationDE(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/**
 * Get booking status in German
 */
export const statusLabelsDE: Record<string, string> = {
  confirmed: 'Bestätigt',
  pending: 'Ausstehend',
  cancelled: 'Storniert',
  completed: 'Abgeschlossen',
  'no-show': 'Nicht erschienen',
};

export function getStatusLabelDE(status: string): string {
  return statusLabelsDE[status] || status;
}
