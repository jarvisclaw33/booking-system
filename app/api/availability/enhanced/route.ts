// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AvailabilitySlot } from '@/types/models'
import { z } from 'zod'
import { parse, addMinutes, format, setHours, setMinutes } from 'date-fns'

const enhancedAvailabilitySchema = z.object({
  locationId: z.string().uuid(),
  offeringId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  staffId: z.string().uuid().optional(), // Specific staff member
  aggregated: z.boolean().optional(), // Show combined availability
  duration: z.number().int().positive().optional(),
})

interface StaffAvailability {
  staffId: string
  staffName: string
  slots: AvailabilitySlot[]
  utilizationRate: number
  availableSlots: number
  totalSlots: number
}

interface AggregatedAvailability {
  date: string
  totalCapacity: number
  bookedCapacity: number
  availableCapacity: number
  utilizationRate: number
  peakHours: string[]
  freeSlots: string[]
  status: 'green' | 'orange' | 'red' // green: >50% free, orange: 20-50% free, red: <20% free
  staffSummary: Array<{
    staffId: string
    staffName: string
    utilization: number
  }>
}

/**
 * GET /api/availability/enhanced
 * Get available time slots with staff filtering and aggregation
 * 
 * Query params:
 * - locationId: required
 * - offeringId: required
 * - date: required (YYYY-MM-DD)
 * - staffId: optional (filter by specific staff member)
 * - aggregated: optional (show combined availability across staff)
 * - duration: optional (override offering duration)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const validationData = {
      locationId: searchParams.get('locationId'),
      offeringId: searchParams.get('offeringId'),
      date: searchParams.get('date'),
      staffId: searchParams.get('staffId') || undefined,
      aggregated: searchParams.get('aggregated') === 'true',
      duration: searchParams.get('duration') ? parseInt(searchParams.get('duration')!) : undefined,
    }

    const validationResult = enhancedAvailabilitySchema.safeParse(validationData)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validierung fehlgeschlagen', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { locationId, offeringId, date, staffId, aggregated, duration: customDuration } = validationResult.data

    const client = await createClient()

    // Get offering to determine duration
    const { data: offering, error: offeringError } = await client
      .from('offerings')
      .select('duration_minutes, id, name')
      .eq('id', offeringId)
      .single() as any

    if (offeringError || !offering) {
      return NextResponse.json(
        { error: 'Offering not found' },
        { status: 404 }
      )
    }

    const durationMinutes = customDuration || offering.duration_minutes

    // Get location timezone
    const { data: location, error: locError } = await client
      .from('locations')
      .select('timezone, organization_id')
      .eq('id', locationId)
      .single() as any

    if (locError || !location) {
      return NextResponse.json(
        { error: 'Standort nicht gefunden' },
        { status: 404 }
      )
    }

    // Get staff members (resources with type='staff')
    let staffQuery = client
      .from('resources')
      .select('id, name, capacity')
      .eq('location_id', locationId)
      .eq('type', 'staff')
      .eq('is_active', true)

    if (staffId) {
      staffQuery = staffQuery.eq('id', staffId)
    }

    const { data: staffMembers, error: staffError } = await staffQuery as any

    if (staffError) throw staffError
    if (!staffMembers || staffMembers.length === 0) {
      return NextResponse.json(
        aggregated
          ? { error: 'No staff members found' }
          : { error: 'Staff member not found' },
        { status: 404 }
      )
    }

    const dateObj = parse(date, 'yyyy-MM-dd', new Date())
    const dayOfWeek = dateObj.getDay()

    // Get schedules for the day
    const { data: schedules, error: schedError } = await client
      .from('schedules')
      .select('start_time, end_time, resource_id')
      .eq('location_id', locationId)
      .eq('day_of_week', dayOfWeek)
      .eq('is_active', true)
      .in('resource_id', staffMembers.map(s => s.id)) as any

    if (schedError) throw schedError

    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    // Get existing bookings for all staff members
    const { data: bookings, error: bookError } = await client
      .from('bookings')
      .select('start_time, end_time, resource_id')
      .eq('location_id', locationId)
      .eq('offering_id', offeringId)
      .in('status', ['pending', 'confirmed'])
      .gte('start_time', startOfDay.toISOString())
      .lte('end_time', endOfDay.toISOString())
      .in('resource_id', staffMembers.map(s => s.id)) as any

    if (bookError) throw bookError

    // Get blocks for the date
    const { data: blocks, error: blockError } = await client
      .from('blocks')
      .select('start_time, end_time, resource_id')
      .gte('start_time', startOfDay.toISOString())
      .lte('end_time', endOfDay.toISOString()) as any

    if (blockError) throw blockError

    // Helper function to generate slots for a staff member
    const generateSlotsForStaff = (
      staffMemberId: string,
      staffName: string,
      staffSchedules: any[]
    ): AvailabilitySlot[] => {
      const slots: AvailabilitySlot[] = []

      if (!staffSchedules || staffSchedules.length === 0) return slots

      for (const schedule of staffSchedules) {
        const [startHour, startMin] = schedule.start_time.split(':').map(Number)
        const [endHour, endMin] = schedule.end_time.split(':').map(Number)

        let slotStart = setMinutes(setHours(dateObj, startHour), startMin)
        const dayEnd = setMinutes(setHours(dateObj, endHour), endMin)

        while (slotStart.getTime() + durationMinutes * 60000 <= dayEnd.getTime()) {
          const slotEnd = addMinutes(slotStart, durationMinutes)

          // Check for conflicts with this staff's bookings
          let hasConflict = false

          if (bookings) {
            for (const booking of bookings) {
              if (booking.resource_id === staffMemberId) {
                const bookingStart = new Date(booking.start_time)
                const bookingEnd = new Date(booking.end_time)

                if (slotStart < bookingEnd && slotEnd > bookingStart) {
                  hasConflict = true
                  break
                }
              }
            }
          }

          // Check for blocks
          if (!hasConflict && blocks) {
            for (const block of blocks) {
              if (!block.resource_id || block.resource_id === staffMemberId) {
                const blockStart = new Date(block.start_time)
                const blockEnd = new Date(block.end_time)

                if (slotStart < blockEnd && slotEnd > blockStart) {
                  hasConflict = true
                  break
                }
              }
            }
          }

          slots.push({
            startTime: slotStart.toISOString(),
            endTime: slotEnd.toISOString(),
            available: !hasConflict,
          })

          slotStart = addMinutes(slotStart, 30) // 30-minute intervals
        }
      }

      return slots
    }

    // Generate availability for each staff member
    const staffAvailabilities: StaffAvailability[] = []

    for (const staff of staffMembers) {
      const staffSchedules = schedules.filter(s => s.resource_id === staff.id)
      const slots = generateSlotsForStaff(staff.id, staff.name, staffSchedules)

      const totalSlots = slots.length
      const availableSlots = slots.filter(s => s.available).length

      staffAvailabilities.push({
        staffId: staff.id,
        staffName: staff.name,
        slots: slots.map(s => ({
          startTime: s.startTime,
          endTime: s.endTime,
          available: s.available,
        })),
        availableSlots,
        totalSlots,
        utilizationRate: totalSlots > 0 ? ((totalSlots - availableSlots) / totalSlots) * 100 : 0,
      })
    }

    // Return single staff member availability
    if (staffId && staffAvailabilities.length > 0) {
      return NextResponse.json({
        type: 'individual',
        date,
        staffMember: staffAvailabilities[0],
      })
    }

    // Return aggregated availability
    if (aggregated) {
      const allSlots = staffAvailabilities.flatMap(s => s.slots)
      const totalAvailableSlots = staffAvailabilities.reduce((sum, s) => sum + s.availableSlots, 0)
      const totalSlots = staffAvailabilities.reduce((sum, s) => sum + s.totalSlots, 0)

      // Identify peak hours (hours with least availability)
      const hourMap = new Map<string, number>()
      allSlots.forEach(slot => {
        const hour = slot.startTime.substring(0, 13) + ':00Z' // Round to hour
        hourMap.set(hour, (hourMap.get(hour) || 0) + (slot.available ? 1 : 0))
      })

      const sortedHours = Array.from(hourMap.entries())
        .sort((a, b) => a[1] - b[1])
      const peakHours = sortedHours.slice(0, 3).map(([hour]) => hour)
      const freeSlots = sortedHours.slice(-3).map(([hour]) => hour)

      const utilizationRate = totalSlots > 0 ? ((totalSlots - totalAvailableSlots) / totalSlots) * 100 : 0
      const availabilityRate = 100 - utilizationRate

      let status: 'green' | 'orange' | 'red'
      if (availabilityRate > 50) status = 'green'
      else if (availabilityRate > 20) status = 'orange'
      else status = 'red'

      const aggregated: AggregatedAvailability = {
        date,
        totalCapacity: staffAvailabilities.length,
        bookedCapacity: staffAvailabilities.length - Math.ceil(totalAvailableSlots / (totalSlots || 1) * staffAvailabilities.length),
        availableCapacity: Math.floor(totalAvailableSlots / (totalSlots || 1) * staffAvailabilities.length),
        utilizationRate,
        peakHours,
        freeSlots,
        status,
        staffSummary: staffAvailabilities.map(s => ({
          staffId: s.staffId,
          staffName: s.staffName,
          utilization: s.utilizationRate,
        })),
      }

      return NextResponse.json({
        type: 'aggregated',
        aggregated,
        staffDetails: staffAvailabilities,
      })
    }

    // Default: return all staff availabilities
    return NextResponse.json({
      type: 'multi',
      date,
      staffAvailabilities,
    })
  } catch (error) {
    console.error('Error calculating enhanced availability:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}
