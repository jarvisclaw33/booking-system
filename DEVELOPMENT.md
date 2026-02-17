# Development Guide

This guide covers setup, development workflows, and testing procedures for the Booking System.

## Local Development Setup

### Prerequisites
- Node.js 18+ with npm
- Docker (for local Supabase)
- Git

### Initial Setup

1. **Clone the repository**
```bash
cd ~/projects/booking-system
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Supabase locally**
```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Initialize Supabase
supabase init

# Start local Supabase stack
npm run supabase:start
```

4. **Generate Supabase types**
```bash
npm run supabase:generate-types
```

5. **Create `.env.local` file**
```bash
cp .env.example .env.local
```

The CLI will output Supabase connection details. Update `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from CLI output>
SUPABASE_SERVICE_ROLE_KEY=<from CLI output>
```

6. **Start development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Development Workflow

### Creating a Migration

When modifying the database schema:

```bash
# Create a new migration
supabase migration new my_migration_name

# Edit the generated file in supabase/migrations/
vim supabase/migrations/20250213HHMMSS_my_migration_name.sql

# Apply the migration locally
supabase db reset

# Generate updated types
npm run supabase:generate-types
```

### Testing API Endpoints

Use curl or Postman to test:

```bash
# Create a location
curl -X POST http://localhost:3000/api/locations \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Main Office"
  }'

# Get availability
curl -X POST http://localhost:3000/api/availability \
  -H "Content-Type: application/json" \
  -d '{
    "locationId": "550e8400-e29b-41d4-a716-446655440000",
    "offeringId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "date": "2025-02-13"
  }'
```

### Using React Query Hooks

Client-side data fetching:

```tsx
'use client'

import { useLocations, useCreateLocation } from '@/lib/hooks/use-locations'
import { useBookings, useCreateBooking } from '@/lib/hooks/use-bookings'

export function LocationList() {
  const { data: locations, isLoading } = useLocations()

  if (isLoading) return <div>Loading...</div>

  return (
    <ul>
      {locations?.map(loc => (
        <li key={loc.id}>{loc.name}</li>
      ))}
    </ul>
  )
}

export function CreateBookingForm() {
  const createBooking = useCreateBooking()

  const handleSubmit = async (formData: CreateBookingRequest) => {
    await createBooking.mutateAsync(formData)
  }

  return (
    <form onSubmit={e => {
      e.preventDefault()
      handleSubmit({
        locationId: '...',
        offeringId: '...',
        customerName: '...',
        customerEmail: '...',
        startTime: '...',
        endTime: '...'
      })
    }}>
      {/* form fields */}
    </form>
  )
}
```

### Using Server Actions

For server-side operations:

```tsx
import { getMyOrganizations, getLocationsByOrganization } from '@/server/database-actions'

export async function Dashboard() {
  const orgsResult = await getMyOrganizations()
  if ('error' in orgsResult) {
    return <div>Error: {orgsResult.error}</div>
  }

  const { organizations } = orgsResult

  return (
    <div>
      {organizations.map(org => (
        <div key={org.id}>
          <h2>{org.name}</h2>
          <Locations orgId={org.id} />
        </div>
      ))}
    </div>
  )
}

async function Locations({ orgId }: { orgId: string }) {
  const locResult = await getLocationsByOrganization(orgId)
  if ('error' in locResult) {
    return <div>Error: {locResult.error}</div>
  }

  return (
    <ul>
      {locResult.locations.map(loc => (
        <li key={loc.id}>{loc.name}</li>
      ))}
    </ul>
  )
}
```

## Testing

### Unit Tests

Create test files alongside implementation:

```bash
# Example: lib/utils/availability.test.ts
npm test -- lib/utils/availability.test.ts
```

### API Integration Tests

Test API endpoints with sample data:

```bash
# Create test organization
curl -X POST http://localhost:3000/api/organizations \
  -H "Content-Type: application/json" \
  -d '{...}'

# Create test location
curl -X POST http://localhost:3000/api/locations \
  -H "Content-Type: application/json" \
  -d '{...}'

# Test booking creation
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{...}'
```

### RLS Policy Testing

Test row-level security policies:

```sql
-- Test as different users in Supabase Studio
SET LOCAL role authenticated;
SET LOCAL request.jwt.claims.sub = 'user-id-1';
SELECT * FROM locations;

SET LOCAL request.jwt.claims.sub = 'user-id-2';
SELECT * FROM locations;
```

## Debugging

### Check Database State

```bash
# View current data
supabase db list

# Run custom SQL
supabase db execute < query.sql
```

### View API Logs

```bash
# Next.js server logs
npm run dev

# Check Supabase logs
supabase log
```

### Browser DevTools

- Network tab: Monitor API requests and responses
- Application tab: Check cookies and local storage
- Console: View errors and warnings

## Common Issues

### Migration Fails
```bash
# Reset database to clean state
supabase db reset

# Reapply all migrations
supabase migration up
```

### Types Out of Sync
```bash
# Regenerate Supabase types
npm run supabase:generate-types
```

### Port Already in Use
```bash
# Kill process using port 3000
lsof -ti :3000 | xargs kill -9
```

## Building for Production

```bash
# Type check
npm run type-check

# Build
npm run build

# Test production build locally
npm run start
```

## Deployment

### Deploy to Vercel

1. Push to GitHub
2. Connect to Vercel dashboard
3. Set environment variables
4. Deploy

```bash
git push origin main
```

### Set Production Supabase

1. Create production Supabase project
2. Link project: `supabase link --project-ref <ref>`
3. Push migrations: `supabase db push`
4. Update environment variables in Vercel dashboard

## File Structure Quick Reference

```
booking-system/
├── app/
│   ├── api/                 # API routes
│   ├── (dashboard)/         # Dashboard pages
│   ├── (auth)/              # Auth pages
│   └── layout.tsx
├── lib/
│   ├── supabase/           # Supabase clients
│   ├── hooks/              # React hooks
│   ├── utils/              # Utility functions
│   ├── validations/        # Zod schemas
│   └── types/              # TypeScript types
├── server/                 # Server actions
├── supabase/
│   ├── migrations/         # SQL migrations
│   └── config.toml
├── types/
│   ├── database.ts         # Generated DB types
│   └── models.ts           # Domain models
└── API.md                  # API documentation
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Zod Documentation](https://zod.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
