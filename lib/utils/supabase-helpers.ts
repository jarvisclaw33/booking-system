// @ts-nocheck
import { createClient } from '@/lib/supabase/client'

export type SupabaseClient = ReturnType<typeof createClient>

export async function getPrimaryOrganizationId(client: SupabaseClient) {
  const {
    data: { user },
  } = await client.auth.getUser()

  if (!user) return null

  const { data, error } = await client
    .from('user_organizations')
    .select('organization_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()

  if (error) return null
  return data?.organization_id || null
}

export async function getPrimaryLocationId(client: SupabaseClient, organizationId: string) {
  const { data, error } = await client
    .from('locations')
    .select('id')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) return null
  return data?.id || null
}
