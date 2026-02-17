# Booking System - Setup Guide

## Status: ✅ Ready for Schema Initialization

The booking system backend is ready. You need to initialize the Supabase database schema manually.

## Step 1: Initialize Database Schema (Manual)

### Option A: Via Supabase Dashboard (Recommended)

1. Go to: https://app.supabase.com/projects
2. Select your project: **lqtjsgevtnvlrwwkkmgk**
3. Click **SQL Editor** → **New Query**
4. Copy the entire SQL from: `/supabase/migrations/20250213000000_init_schema.sql`
5. Paste it into the SQL editor
6. Click **Execute** button
7. Wait for completion (should take 5-10 seconds)

### Option B: Via psql (Terminal)

```bash
psql "postgresql://postgres:PASSWORD@db.lqtjsgevtnvlrwwkkmgk.supabase.co:5432/postgres" \
  -f supabase/migrations/20250213000000_init_schema.sql
```

Replace `PASSWORD` with your Supabase database password.

## Step 2: Verify Schema Creation

Run the verification test:

```bash
npm run test:db
```

Expected output:
```
Testing database connection...
✅ Database connection successful
✅ Organizations table exists
✅ locations: OK
✅ offerings: OK
✅ resources: OK
✅ bookings: OK
```

## Step 3: Test API Endpoints

```bash
npm run test:api
```

This will:
- Create a test organization
- Create test locations, offerings, and resources
- Create a test booking
- Verify data retrieval

## Step 4: Start Development Server

```bash
npm run dev
```

Then open: http://localhost:3000

## Database Tables Created

### Core Tables
- `organizations` - Multi-tenant root entities
- `user_organizations` - User membership + roles
- `locations` - Branches/venues
- `offerings` - Services/booking types
- `resources` - Staff/tables/rooms/equipment
- `schedules` - Working hours/availability
- `blocks` - Holidays/breaks/maintenance
- `bookings` - Reservations/appointments

### Support Tables
- `audit_logs` - Activity logging
- `notification_log` - Email/SMS tracking

## Environment Variables

All required variables are in `.env`:
- `NEXT_PUBLIC_SUPABASE_URL` ✅ Set
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅ Set
- `SUPABASE_SERVICE_ROLE_KEY` ✅ Set
- `DATABASE_URL` ✅ Set

## API Endpoints Ready

### Locations
- `GET /api/locations` - List all locations
- `POST /api/locations` - Create location
- `GET /api/locations/[id]` - Get location details
- `PATCH /api/locations/[id]` - Update location
- `DELETE /api/locations/[id]` - Delete location

### Health Check
- `GET /api/health` - Check database connection

(More endpoints coming: Bookings, Offerings, Resources, etc.)

## Troubleshooting

### "Table not found" Error

This means the schema hasn't been executed yet. Go to Step 1 and initialize the schema.

### Connection Timeout

Make sure your Supabase project is active and not paused.

### CORS Issues

This is a Next.js application - API routes run on the same origin, so CORS shouldn't be an issue for internal API calls.

## Production Deployment

When deploying to Vercel:
1. Add environment variables to Vercel project settings
2. The database schema must already exist in Supabase
3. API routes will work automatically on Vercel Functions

## Next Steps

After schema initialization:
1. Implement booking creation/management endpoints
2. Add authentication (Supabase Auth integration)
3. Build frontend (React components for booking)
4. Add email notifications (Resend integration)
5. Deploy to Vercel

---

**Project:** Booking System  
**Tech:** Next.js 15 + Supabase + TypeScript  
**Status:** Backend Infrastructure Ready ✅
