// @ts-nocheck
// Server-side Supabase client (for Route Handlers and Server Actions)
import { createServerClient, parseCookieHeader, serializeCookieHeader } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database.types";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "mock-anon-key",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware handling the cookie.
          }
        },
      },
    }
  );
}

export function createServiceClient() {
  // Service role client (bypasses RLS - use with caution)
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "mock-service-role"
  );
}

export async function getSession() {
  const client = await createClient();
  const { data, error } = await client.auth.getSession();
  
  if (error) {
    return null;
  }

  return data.session;
}

export async function getUser() {
  const session = await getSession();
  if (!session) return null;
  return session.user;
}
