// @ts-check
/**
 * Public API for offerings (services)
 * Returns active services that customers can book
 * No authentication required
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * GET /api/public/offerings
 * Returns active offerings, optionally filtered by location
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const locationId = searchParams.get('location_id')

    let query = supabase
      .from('offerings')
      .select(`
        id,
        name,
        description,
        duration_minutes,
        price_cents,
        color,
        location_id,
        is_active,
        locations:name,organization_id
      `)
      .eq('is_active', true)

    if (locationId) {
      query = query.eq('location_id', locationId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch offerings' },
        { status: 500 }
      )
    }

    return NextResponse.json({ offerings: data || [] })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
