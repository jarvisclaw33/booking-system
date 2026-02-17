// @ts-nocheck
// Date utility functions

import { format, parse, addMinutes, startOfDay, endOfDay, parseISO } from 'date-fns'
import { toZonedTime, fromZonedTime } from 'date-fns-tz'

/**
 * Format a date to YYYY-MM-DD
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'yyyy-MM-dd')
}

/**
 * Format a time to HH:MM
 */
export function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'HH:mm')
}

/**
 * Format a date and time to readable string
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'PPP p')
}

/**
 * Parse a time string (HH:MM:SS) into a Date
 */
export function parseTimeString(timeStr: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return { hours, minutes }
}

/**
 * Convert a date to a specific timezone
 */
export function convertToTimezone(date: Date | string, timezone: string): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return toZonedTime(dateObj, timezone)
}

/**
 * Convert a date from a specific timezone to UTC
 */
export function convertFromTimezone(date: Date | string, timezone: string): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return fromZonedTime(dateObj, timezone)
}

/**
 * Get the day of week (0 = Sunday, 6 = Saturday)
 */
export function getDayOfWeek(date: Date | string): number {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return dateObj.getDay()
}

/**
 * Get the day of week name
 */
export function getDayOfWeekName(dayOfWeek: number): string {
  const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return names[dayOfWeek] || 'Invalid'
}

/**
 * Check if two time ranges overlap
 */
export function timesOverlap(
  start1: Date | string,
  end1: Date | string,
  start2: Date | string,
  end2: Date | string
): boolean {
  const s1 = typeof start1 === 'string' ? parseISO(start1) : start1
  const e1 = typeof end1 === 'string' ? parseISO(end1) : end1
  const s2 = typeof start2 === 'string' ? parseISO(start2) : start2
  const e2 = typeof end2 === 'string' ? parseISO(end2) : end2

  return s1 < e2 && e1 > s2
}

/**
 * Calculate duration in minutes between two times
 */
export function calculateDurationMinutes(
  startTime: Date | string,
  endTime: Date | string
): number {
  const start = typeof startTime === 'string' ? parseISO(startTime) : startTime
  const end = typeof endTime === 'string' ? parseISO(endTime) : endTime
  return Math.round((end.getTime() - start.getTime()) / 60000)
}

/**
 * Parse an ISO datetime string and extract date components
 */
export function parseDateTime(dateTimeStr: string) {
  const date = parseISO(dateTimeStr)
  return {
    date: formatDate(date),
    time: formatTime(date),
    dateTime: dateTimeStr,
    iso: date.toISOString(),
  }
}
