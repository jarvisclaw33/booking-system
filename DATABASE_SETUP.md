# Database Setup Guide - Supabase Integration

## Current Status

✅ **Completed:**
- Database schema designed and migrations created (`supabase/migrations/`)
- TypeScript database types generated (`lib/types/database.types.ts`)
- Server-side Supabase client configured (`lib/supabase/server.ts`)
- API endpoints updated to use Supabase (`app/api/**`)
- Environment variables configured (`.env.local`)
- Middleware for session handling (`middleware.ts`)
- Error handling and validation in place

## Prerequisites

1. **Supabase Account**: Create a project at https://supabase.com
2. **Environment Variables**: Ensure `.env.local` contains valid Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```

## Pushing Migrations to Supabase

### Option 1: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI (if not already installed)
brew install supabase/tap/supabase

# Navigate to project directory
cd ~/projects/booking-system

# Link to your Supabase project
supabase link --project-ref [your-project-id]

# Push migrations to the database
supabase db push

# Generate latest TypeScript types
supabase gen types typescript --out-dir lib/types/database.types.ts
```

### Option 2: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the entire contents of `supabase/migrations/20250213000000_init_schema.sql`
4. Create a new query and paste the migration
5. Execute the query

### Option 3: Using supabase-js Admin Client

```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Execute the migration SQL
const migration = `... (paste migration content) ...`;
const { error } = await supabase.rpc("exec", { sql: migration });
```

## Database Structure

The booking system database includes the following main tables:

### Organizations & Users
- `organizations` - Multi-tenant organizations
- `user_organizations` - User-to-organization relationships with roles

### Core Booking Tables
- `locations` - Physical locations/branches
- `offerings` - Services/products offered
- `resources` - Staff, tables, rooms, equipment
- `schedules` - Working hours and availability
- `blocks` - Holidays, breaks, maintenance periods
- `bookings` - Customer reservations

### Supporting Tables
- `audit_logs` - Compliance and change tracking
- `notification_log` - Email/SMS tracking

## API Endpoints

All endpoints are available at `/api/*` and support:

### Locations
- `GET /api/locations` - List user's organization locations
- `POST /api/locations` - Create new location
- `GET /api/locations/[id]` - Get location details
- `PUT /api/locations/[id]` - Update location
- `DELETE /api/locations/[id]` - Delete location

### Offerings
- `GET /api/offerings` - List offerings
- `POST /api/offerings` - Create offering
- `GET /api/offerings/[id]` - Get offering details
- `PUT /api/offerings/[id]` - Update offering
- `DELETE /api/offerings/[id]` - Delete offering

### Resources
- `GET /api/resources` - List resources
- `POST /api/resources` - Create resource
- `GET /api/resources/[id]` - Get resource details
- `PUT /api/resources/[id]` - Update resource
- `DELETE /api/resources/[id]` - Delete resource

### Bookings
- `GET /api/bookings` - List bookings (authenticated)
- `POST /api/bookings` - Create booking (public or authenticated)
- `GET /api/bookings/[id]` - Get booking details
- `PUT /api/bookings/[id]` - Update booking
- `DELETE /api/bookings/[id]` - Delete booking

### Availability
- `GET /api/availability` - Get available time slots

## Testing the Connection

### 1. Verify Environment Variables
```bash
# Check if Supabase credentials are set
printenv | grep SUPABASE
```

### 2. Run Manual Tests
```bash
# Start the development server
npm run dev

# In another terminal, test an endpoint
curl -X GET http://localhost:3002/api/locations
```

### 3. Check Server Logs
The development server will show connection errors if Supabase is unreachable.

## Row Level Security (RLS)

All tables have RLS enabled with policies that:
- Users can only see data from their organizations
- Managers+ can modify organization data
- Public can create bookings (with rate limiting recommended)
- Audit data accessible only to admins

## Security Considerations

1. **Service Role Key**: Never expose `SUPABASE_SERVICE_ROLE_KEY` in client code
2. **RLS Policies**: Verified in migrations - user data is properly isolated
3. **Validation**: All inputs validated with Zod schemas
4. **Error Handling**: Database errors logged but not exposed to clients

## Next Steps

1. Ensure Supabase CLI is installed: `supabase --version`
2. Link your Supabase project: `supabase link`
3. Push migrations: `supabase db push`
4. Verify tables exist: Check Supabase dashboard under SQL Editor
5. Test API endpoints with real data
6. Implement authentication UI
7. Add email notifications (Resend integration)

## Troubleshooting

### "ENOTFOUND supabase.co"
- Check `.env.local` has valid Supabase URL
- Verify internet connectivity
- Confirm Supabase credentials are correct

### "Unauthorized" errors
- Verify session/token is valid
- Check RLS policies in Supabase
- Ensure user is member of the organization

### Type errors in API routes
- Regenerate types: `supabase gen types typescript`
- Ensure `Database` type is properly imported
- Check that database.types.ts file exists

## References

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli/introduction)
- [Next.js with Supabase](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
