// @ts-nocheck
'use server'

// Server Actions for database operations
// These can be called directly from client components

import { createClient, getUser } from '@/lib/supabase/server'
import { Database } from '@/types/database'
import { Organization, Location, Booking } from '@/types/models'

// ============================================================================
// ORGANIZATION ACTIONS
// ============================================================================

export async function getMyOrganizations() {
  const user = await getUser()
  if (!user) return { error: 'Unauthorized' }

  try {
    const client = await createClient()

    const { data, error } = await client
      .from('user_organizations')
      .select('organization_id')
      .eq('user_id', user.id)

    if (error) throw error

    const orgIds = data.map(uo => uo.organization_id)
    if (!orgIds.length) return { organizations: [] }

    const { data: organizations, error: orgError } = await client
      .from('organizations')
      .select('*')
      .in('id', orgIds)

    if (orgError) throw orgError
    return { organizations: organizations || [] }
  } catch (error) {
    console.error('Error fetching organizations:', error)
    return { error: 'Failed to fetch organizations' }
  }
}

export async function getOrganization(organizationId: string) {
  const user = await getUser()
  if (!user) return { error: 'Unauthorized' }

  try {
    const client = await createClient()

    // Check membership
    const { data: membership, error: memberError } = await client
      .from('user_organizations')
      .select('id')
      .eq('user_id', user.id)
      .eq('organization_id', organizationId)
      .single()

    if (memberError || !membership) {
      return { error: 'Not authorized' }
    }

    const { data: organization, error } = await client
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single()

    if (error || !organization) {
      return { error: 'Organization not found' }
    }

    return { organization }
  } catch (error) {
    console.error('Error fetching organization:', error)
    return { error: 'Failed to fetch organization' }
  }
}

// ============================================================================
// LOCATION ACTIONS
// ============================================================================

export async function getLocationsByOrganization(organizationId: string) {
  const user = await getUser()
  if (!user) return { error: 'Unauthorized' }

  try {
    const client = await createClient()

    // Check membership
    const { data: membership } = await client
      .from('user_organizations')
      .select('id')
      .eq('user_id', user.id)
      .eq('organization_id', organizationId)
      .single()

    if (!membership) {
      return { error: 'Not authorized' }
    }

    const { data: locations, error } = await client
      .from('locations')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { locations: locations || [] }
  } catch (error) {
    console.error('Error fetching locations:', error)
    return { error: 'Failed to fetch locations' }
  }
}

// ============================================================================
// BOOKING ACTIONS
// ============================================================================

export async function getBookingsByLocation(
  organizationId: string,
  locationId: string,
  startDate?: string,
  endDate?: string
) {
  const user = await getUser()
  if (!user) return { error: 'Unauthorized' }

  try {
    const client = await createClient()

    // Check membership
    const { data: membership } = await client
      .from('user_organizations')
      .select('id')
      .eq('user_id', user.id)
      .eq('organization_id', organizationId)
      .single()

    if (!membership) {
      return { error: 'Not authorized' }
    }

    let query = client
      .from('bookings')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('location_id', locationId)

    if (startDate) {
      query = query.gte('start_time', startDate)
    }

    if (endDate) {
      query = query.lte('end_time', endDate)
    }

    const { data: bookings, error } = await query.order('start_time', { ascending: false })

    if (error) throw error
    return { bookings: bookings || [] }
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return { error: 'Failed to fetch bookings' }
  }
}

export async function getMyBookings() {
  const user = await getUser()
  if (!user) return { error: 'Unauthorized' }

  try {
    const client = await createClient()

    // Get bookings where user is either staff or customer
    const { data: bookings, error } = await client
      .from('bookings')
      .select('*')
      .eq('customer_email', user.email)
      .order('start_time', { ascending: false })

    if (error) throw error
    return { bookings: bookings || [] }
  } catch (error) {
    console.error('Error fetching my bookings:', error)
    return { error: 'Failed to fetch bookings' }
  }
}

export async function getBooking(bookingId: string) {
  const user = await getUser()
  if (!user) return { error: 'Unauthorized' }

  try {
    const client = await createClient()

    const { data: booking, error } = await client
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single()

    if (error || !booking) {
      return { error: 'Booking not found' }
    }

    // Check access
    const isCustomer = booking.customer_email === user.email
    if (!isCustomer) {
      const { data: membership } = await client
        .from('user_organizations')
        .select('id')
        .eq('user_id', user.id)
        .eq('organization_id', booking.organization_id)
        .single()

      if (!membership) {
        return { error: 'Not authorized' }
      }
    }

    return { booking }
  } catch (error) {
    console.error('Error fetching booking:', error)
    return { error: 'Failed to fetch booking' }
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export async function checkAvailability(
  locationId: string,
  offeringId: string,
  startTime: string,
  endTime: string
): Promise<{ available: boolean; error?: string }> {
  try {
    const client = await createClient()

    // Check for conflicting bookings
    const { data: conflicts, error } = await client
      .from('bookings')
      .select('id')
      .eq('location_id', locationId)
      .eq('offering_id', offeringId)
      .in('status', ['pending', 'confirmed'])
      .lt('end_time', endTime)
      .gt('start_time', startTime)
      .limit(1)

    if (error) throw error

    return { available: !conflicts || conflicts.length === 0 }
  } catch (error) {
    console.error('Error checking availability:', error)
    return { available: false, error: 'Failed to check availability' }
  }
}
