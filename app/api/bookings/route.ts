// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/supabase/server'
import { CreateBookingRequest, Booking } from '@/types/models'
import { z } from 'zod'

const createBookingSchema = z.object({
  organizationId: z.string().uuid().optional(),
  locationId: z.string().uuid(),
  offeringId: z.string().uuid(),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  notes: z.string().optional(),
})

/**
 * GET /api/bookings
 * List bookings for authenticated user's organizations
 * Query params: location_id, start_date, end_date, status
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const locationId = searchParams.get('location_id')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const status = searchParams.get('status')

    const client = await createClient()

    // Get user's organizations
    const { data: userOrgs, error: orgError } = await client
      .from('user_organizations')
      .select('organization_id')
      .eq('user_id', user.id)

    if (orgError) throw orgError
    if (!userOrgs?.length) {
      return NextResponse.json({ bookings: [] })
    }

    const orgIds = userOrgs.map(uo => uo.organization_id)

    // Build query
    let query = client
      .from('bookings')
      .select('*')
      .in('organization_id', orgIds)

    if (locationId) {
      query = query.eq('location_id', locationId)
    }

    if (startDate) {
      query = query.gte('start_time', startDate)
    }

    if (endDate) {
      query = query.lte('end_time', endDate)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data: bookings, error } = await query.order('start_time', {
      ascending: false,
    })

    if (error) throw error

    return NextResponse.json({ bookings: bookings || [] })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/bookings
 * Create a new booking
 * Can be called by authenticated users or public (with rate limiting)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request
    const validationResult = createBookingSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validierung fehlgeschlagen', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const {
      organizationId,
      locationId,
      offeringId,
      customerName,
      customerEmail,
      customerPhone,
      startTime,
      endTime,
      notes,
    } = validationResult.data

    const client = await createClient()
    const user = await getUser()

    let finalOrganizationId = organizationId
    if (!finalOrganizationId) {
      // For public bookings, get org from location
      const { data: location, error: locError } = await client
        .from('locations')
        .select('organization_id')
        .eq('id', locationId)
        .single() as any

      if (locError || !location) {
        return NextResponse.json(
          { error: 'Standort nicht gefunden' },
          { status: 404 }
        )
      }

      finalOrganizationId = location.organization_id
    }

    // Verify user has access if authenticated
    if (user) {
      const { data: membership } = await client
        .from('user_organizations')
        .select('id')
        .eq('user_id', user.id)
        .eq('organization_id', finalOrganizationId)
        .single() as any

      // User must be part of organization
      if (!membership) {
        return NextResponse.json(
          { error: 'Nicht autorisiert' },
          { status: 403 }
        )
      }
    }

    // Check availability (basic check - ensure no overlapping bookings)
    const { data: conflictingBookings, error: conflictError } = await client
      .from('bookings')
      .select('id')
      .eq('location_id', locationId)
      .eq('offering_id', offeringId)
      .in('status', ['pending', 'confirmed'])
      .lt('end_time', endTime)
      .gt('start_time', startTime)
      .limit(1)

    if (conflictError) throw conflictError
    if (conflictingBookings?.length) {
      return NextResponse.json(
        { error: 'Time slot not available' },
        { status: 409 }
      )
    }

    // Create booking
    const { data: booking, error: createError } = await client
      .from('bookings')
      .insert({
        organization_id: finalOrganizationId,
        location_id: locationId,
        offering_id: offeringId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone || null,
        start_time: startTime,
        end_time: endTime,
        notes: notes || null,
        status: 'confirmed',
        metadata: {},
      })
      .select()
      .single() as any

    if (createError) throw createError

    // TODO: Send confirmation email via Resend
    // TODO: Create audit log entry

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}
