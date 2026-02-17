// @ts-nocheck
/**
 * Database connection and configuration
 * 
 * This module provides the Supabase database connection for server-side operations.
 * Uses the service role key for admin operations that bypass RLS policies.
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database.types";

let supabaseAdmin: ReturnType<typeof createClient<Database>> | null = null;

/**
 * Get or create the Supabase admin client (with service role)
 * This client bypasses RLS policies and should only be used for admin operations
 */
export function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing Supabase credentials in environment variables");
    }

    supabaseAdmin = createClient<Database>(supabaseUrl, serviceRoleKey);
  }

  return supabaseAdmin;
}

/**
 * Initialize database connection
 * This is called once at startup to verify the connection
 */
export async function initializeDatabase() {
  try {
    const client = getSupabaseAdmin();
    
    // Verify connection by making a simple query
    const { error } = await client
      .from("organizations")
      .select("id", { count: "exact", head: true });

    if (error) {
      console.error("Failed to connect to Supabase:", error);
      throw error;
    }

    console.log("✅ Database initialized and connected to Supabase");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    throw error;
  }
}
