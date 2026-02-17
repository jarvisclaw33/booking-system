// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/supabase/server'
import { UpdateBookingRequest, BookingStatus } from '@/types/models'
import { z } from 'zod'

const updateBookingSchema = z.object({
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed', 'no_show']).optional(),
  notes: z.string().optional(),
  customerName: z.string().min(1).optional(),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
})

/**
 * GET /api/bookings/[id]
 * Get a specific booking
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      )
    }

    const { id } = await params
    const client = await createClient()

    const { data: booking, error } = await client
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single() as any

    if (error || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check access: user must be part of organization or customer
    const userEmail = user.email
    if (booking.customer_email !== userEmail) {
      const { data: membership } = await client
        .from('user_organizations')
        .select('id')
        .eq('user_id', user.id)
        .eq('organization_id', booking.organization_id)
        .single() as any

      if (!membership) {
        return NextResponse.json(
          { error: 'Nicht autorisiert' },
          { status: 403 }
        )
      }
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/bookings/[id]
 * Update a booking (status, notes, customer info)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()

    // Validate request
    const validationResult = updateBookingSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validierung fehlgeschlagen', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const client = await createClient()

    // Get booking
    const { data: booking, error: getError } = await client
      .from('bookings')
      .select('organization_id')
      .eq('id', id)
      .single() as any

    if (getError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check permission (must be admin/manager of organization)
    const { data: membership } = await client
      .from('user_organizations')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', booking.organization_id)
      .single() as any

    if (!['owner', 'admin', 'manager'].includes(membership?.role || '')) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 403 }
      )
    }

    const updateData: Record<string, any> = {}
    if (validationResult.data.startTime) updateData.start_time = validationResult.data.startTime
    if (validationResult.data.endTime) updateData.end_time = validationResult.data.endTime
    if (validationResult.data.status) updateData.status = validationResult.data.status
    if (validationResult.data.notes !== undefined) updateData.notes = validationResult.data.notes
    if (validationResult.data.customerName) updateData.customer_name = validationResult.data.customerName
    if (validationResult.data.customerEmail) updateData.customer_email = validationResult.data.customerEmail
    if (validationResult.data.customerPhone !== undefined) updateData.customer_phone = validationResult.data.customerPhone

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Keine gültigen Felder zum Aktualisieren' },
        { status: 400 }
      )
    }

    // Update booking
    const { data: updated, error: updateError } = await (client as any)
      .from('bookings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single() as any

    if (updateError) throw updateError

    // TODO: Send notification email if status changed

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/bookings/[id]
 * Cancel/delete a booking (soft delete via status)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      )
    }

    const { id } = await params
    const client = await createClient()

    // Get booking
    const { data: booking, error: getError } = await client
      .from('bookings')
      .select('organization_id, customer_email')
      .eq('id', id)
      .single() as any

    if (getError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check permission: admin/manager or customer
    const isCustomer = booking.customer_email === user.email
    if (!isCustomer) {
      const { data: membership } = await client
        .from('user_organizations')
        .select('role')
        .eq('user_id', user.id)
        .eq('organization_id', booking.organization_id)
        .single() as any

      if (!['owner', 'admin', 'manager'].includes(membership?.role || '')) {
        return NextResponse.json(
          { error: 'Nicht autorisiert' },
          { status: 403 }
        )
      }
    }

    // Soft delete: set status to cancelled
    const { error: deleteError } = await client
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', id)

    if (deleteError) throw deleteError

    // TODO: Send cancellation email

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting booking:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}
