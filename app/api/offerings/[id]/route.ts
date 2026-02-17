// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/supabase/server'
import { z } from 'zod'

const updateOfferingSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  durationMinutes: z.number().int().positive().optional(),
  capacity: z.number().int().positive().optional(),
  priceCents: z.number().int().nonnegative().optional(),
  color: z.string().optional(),
  isActive: z.boolean().optional(),
})

/**
 * GET /api/offerings/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { id } = await params
    const client = await createClient()

    const { data: offering, error } = await client
      .from('offerings')
      .select('*')
      .eq('id', id)
      .single() as any

    if (error || !offering) {
      return NextResponse.json({ error: 'Offering not found' }, { status: 404 })
    }

    // Check access via membership
    const { data: membership } = await client
      .from('user_organizations')
      .select('id')
      .eq('user_id', user.id)
      .eq('organization_id', offering.organization_id)
      .single() as any

    if (!membership) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 })
    }

    return NextResponse.json(offering)
  } catch (error) {
    console.error('Error fetching offering:', error)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}

/**
 * PATCH /api/offerings/[id]
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const validationResult = updateOfferingSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validierung fehlgeschlagen', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const client = await createClient()

    // Get offering
    const { data: offering, error: getError } = await client
      .from('offerings')
      .select('organization_id')
      .eq('id', id)
      .single() as any

    if (getError || !offering) {
      return NextResponse.json({ error: 'Offering not found' }, { status: 404 })
    }

    // Check permission
    const { data: membership } = await client
      .from('user_organizations')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', offering.organization_id)
      .single() as any

    if (!['owner', 'admin', 'manager'].includes(membership?.role || '')) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 })
    }

    // Update
    const { data: updated, error: updateError } = await client
      .from('offerings')
      .update(validationResult.data)
      .eq('id', id)
      .select()
      .single() as any

    if (updateError) throw updateError
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating offering:', error)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}

/**
 * DELETE /api/offerings/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { id } = await params
    const client = await createClient()

    // Get offering
    const { data: offering, error: getError } = await client
      .from('offerings')
      .select('organization_id')
      .eq('id', id)
      .single() as any

    if (getError || !offering) {
      return NextResponse.json({ error: 'Offering not found' }, { status: 404 })
    }

    // Check permission (admin/owner only)
    const { data: membership } = await client
      .from('user_organizations')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', offering.organization_id)
      .single() as any

    if (!['owner', 'admin'].includes(membership?.role || '')) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 })
    }

    // Delete
    const { error: deleteError } = await client
      .from('offerings')
      .delete()
      .eq('id', id)

    if (deleteError) throw deleteError
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting offering:', error)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
