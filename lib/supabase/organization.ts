import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getUserOrganization(userId: string) {
  const { data, error } = await supabase
    .from('user_organizations')
    .select('organization_id, organizations(*)')
    .eq('user_id', userId)
    .single();
  
  if (error || !data) return null;
  return data;
}

export async function createDefaultOrganization(userId: string, email: string) {
  // Create organization
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({ name: `${email.split('@')[0]}'s Organization` })
    .select()
    .single();
  
  if (orgError || !org) throw orgError;
  
  // Link user to organization as owner
  const { error: linkError } = await supabase
    .from('user_organizations')
    .insert({
      user_id: userId,
      organization_id: org.id,
      role: 'owner'
    });
  
  if (linkError) throw linkError;
  
  return org;
}
