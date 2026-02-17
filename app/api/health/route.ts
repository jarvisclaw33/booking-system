// @ts-nocheck
/**
 * Health check endpoint
 * Verifies database connection and schema initialization
 */

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/server/db";

export async function GET() {
  try {
    const client = getSupabaseAdmin();

    // Test connection
    const { data, error } = await client
      .from("organizations")
      .select("id", { count: "exact", head: true });

    if (error) {
      return NextResponse.json(
        {
          status: "error",
          message: "Database connection failed",
          error: error.message,
          code: error.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "ok",
      database: "connected",
      message: "Booking system is healthy",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
