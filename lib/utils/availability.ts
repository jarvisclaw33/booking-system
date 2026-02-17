// @ts-nocheck
// Availability checking utilities

import { AvailabilitySlot } from '@/types/models'

/**
 * Filter available slots from a list
 */
export function filterAvailableSlots(slots: AvailabilitySlot[]): AvailabilitySlot[] {
  return slots.filter(slot => slot.available)
}

/**
 * Get the next available slot
 */
export function getNextAvailableSlot(slots: AvailabilitySlot[]): AvailabilitySlot | null {
  const available = filterAvailableSlots(slots)
  return available.length > 0 ? available[0] : null
}

/**
 * Get available slots for a specific hour
 */
export function getSlotsForHour(
  slots: AvailabilitySlot[],
  hour: number
): AvailabilitySlot[] {
  return slots.filter(slot => {
    const slotHour = new Date(slot.startTime).getHours()
    return slotHour === hour && slot.available
  })
}

/**
 * Group slots by hour
 */
export function groupSlotsByHour(slots: AvailabilitySlot[]): Map<number, AvailabilitySlot[]> {
  const grouped = new Map<number, AvailabilitySlot[]>()

  for (const slot of slots) {
    const hour = new Date(slot.startTime).getHours()
    if (!grouped.has(hour)) {
      grouped.set(hour, [])
    }
    grouped.get(hour)!.push(slot)
  }

  return grouped
}

/**
 * Check if a specific time slot is available
 */
export function isTimeAvailable(
  slots: AvailabilitySlot[],
  startTime: string,
  endTime: string
): boolean {
  return slots.some(
    slot =>
      slot.startTime === startTime &&
      slot.endTime === endTime &&
      slot.available
  )
}

/**
 * Get peak hours (hours with most available slots)
 */
export function getPeakAvailableHours(
  slots: AvailabilitySlot[],
  limit = 3
): number[] {
  const grouped = groupSlotsByHour(slots)
  const hourCounts = Array.from(grouped.entries())
    .map(([hour, hourSlots]) => ({
      hour,
      count: hourSlots.filter(s => s.available).length,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)

  return hourCounts.map(item => item.hour)
}

/**
 * Format availability summary
 */
export function getAvailabilitySummary(slots: AvailabilitySlot[]): {
  totalSlots: number
  availableSlots: number
  occupancyRate: number
} {
  const totalSlots = slots.length
  const availableSlots = filterAvailableSlots(slots).length
  const occupancyRate = totalSlots > 0 ? ((totalSlots - availableSlots) / totalSlots) * 100 : 0

  return {
    totalSlots,
    availableSlots,
    occupancyRate: Math.round(occupancyRate),
  }
}

/**
 * Find consecutive available slots
 */
export function findConsecutiveAvailableSlots(
  slots: AvailabilitySlot[],
  minConsecutive = 2
): AvailabilitySlot[][] {
  const available = filterAvailableSlots(slots).sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  )

  const groups: AvailabilitySlot[][] = []
  let currentGroup: AvailabilitySlot[] = []

  for (let i = 0; i < available.length; i++) {
    if (currentGroup.length === 0) {
      currentGroup.push(available[i])
    } else {
      const lastSlot = currentGroup[currentGroup.length - 1]
      const currentSlot = available[i]

      // Check if slots are consecutive (no gap)
      if (new Date(lastSlot.endTime).getTime() === new Date(currentSlot.startTime).getTime()) {
        currentGroup.push(currentSlot)
      } else {
        // Gap found
        if (currentGroup.length >= minConsecutive) {
          groups.push(currentGroup)
        }
        currentGroup = [currentSlot]
      }
    }
  }

  // Don't forget the last group
  if (currentGroup.length >= minConsecutive) {
    groups.push(currentGroup)
  }

  return groups
}

/**
 * Suggest best times based on availability
 */
export function suggestBestTimes(
  slots: AvailabilitySlot[],
  preferences?: {
    preferredHours?: number[]
    preferredDayPart?: 'morning' | 'afternoon' | 'evening'
    minConsecutive?: number
  }
): AvailabilitySlot[] {
  let filtered = filterAvailableSlots(slots)

  if (preferences?.preferredDayPart) {
    const partHours = {
      morning: [6, 7, 8, 9, 10, 11],
      afternoon: [12, 13, 14, 15, 16, 17],
      evening: [18, 19, 20, 21, 22],
    }

    filtered = filtered.filter(slot => {
      const hour = new Date(slot.startTime).getHours()
      return partHours[preferences.preferredDayPart!].includes(hour)
    })
  }

  if (preferences?.preferredHours) {
    filtered = filtered.filter(slot => {
      const hour = new Date(slot.startTime).getHours()
      return preferences.preferredHours!.includes(hour)
    })
  }

  // Sort by time
  return filtered.sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  )
}
