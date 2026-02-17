# Dashboard UI - Booking System Phase 3

## Overview

This document describes the Dashboard UI implementation for the Booking System. The dashboard provides a complete user interface for managing bookings, locations, and viewing analytics.

## Architecture

### File Structure

```
app/
├── auth/
│   ├── callback/route.ts          # OAuth callback handler
│   ├── layout.tsx                 # Auth layout wrapper
│   ├── login/page.tsx             # Login page
│   └── signup/page.tsx            # Signup page
├── dashboard/
│   ├── layout.tsx                 # Protected dashboard layout
│   ├── page.tsx                   # Dashboard overview/stats
│   ├── locations/page.tsx         # Locations management
│   ├── bookings/page.tsx          # Bookings management
│   └── calendar/page.tsx          # Calendar view
├── api/
│   ├── bookings/                  # Booking APIs (existing)
│   ├── locations/                 # Location APIs (existing)
│   └── availability/              # Availability APIs (existing)
└── page.tsx                       # Home page (redirects to dashboard or login)

components/
├── Sidebar.tsx                    # Navigation sidebar
├── Header.tsx                     # Top bar with user info
├── StatCard.tsx                   # Statistics card component
├── BookingCard.tsx                # Booking display card
├── BookingForm.tsx                # Booking form component
├── LocationCard.tsx               # Location display card
└── ui/
    ├── button.tsx                 # Button component
    ├── input.tsx                  # Input component
    └── dialog.tsx                 # Dialog/Modal component
```

## Features

### Authentication

#### Login Page (`app/auth/login/page.tsx`)
- Email/password login
- Form validation
- Error handling with toast notifications
- Link to signup page
- Redirects to dashboard on successful login

#### Signup Page (`app/auth/signup/page.tsx`)
- Email/password registration
- Password confirmation
- Form validation
- Email verification flow
- Redirects to login after signup

#### Auth Callback (`app/auth/callback/route.ts`)
- Handles OAuth callback from Supabase
- Exchanges auth code for session
- Redirects to dashboard

### Dashboard Layout

#### Sidebar (`components/Sidebar.tsx`)
- Navigation menu with four main sections:
  - Overview (dashboard stats)
  - Locations (location management)
  - Bookings (booking management)
  - Calendar (calendar view)
- Active link highlighting
- Logout button
- Responsive design

#### Header (`components/Header.tsx`)
- Displays current user email
- Clean, minimal design
- Fixed at top of dashboard

#### Dashboard Pages

##### Overview (`app/dashboard/page.tsx`)
- **Statistics Cards:**
  - Total Bookings count
  - Total Locations count
  - Upcoming Bookings count
  - Average bookings per location
- **Recent Activity** section (placeholder for future expansion)
- Real-time data fetching from Supabase
- Error handling and loading states

##### Locations (`app/dashboard/locations/page.tsx`)
- **Location List:**
  - Display all locations in grid
  - Location name, address, timezone
  - Edit and delete buttons for each location
- **Add Location Button** (UI ready for integration)
- Filter and search capabilities
- Error handling

##### Bookings (`app/dashboard/bookings/page.tsx`)
- **Booking List:**
  - Display all bookings with details
  - Guest name, location, time, status
  - Color-coded status badges (confirmed, pending, cancelled)
  - Edit and delete actions
- **Status Filter:**
  - All Bookings
  - Confirmed
  - Pending
  - Cancelled
- **Add Booking Button** (UI ready for integration)
- Real-time updates

##### Calendar (`app/dashboard/calendar/page.tsx`)
- **Month Navigation:**
  - Previous/Next month buttons
  - Today button to jump to current date
- **Calendar Grid:**
  - Visual representation of month
  - Booking indicators on dates
  - Click-friendly date cells
  - Shows count of bookings per day
- **Responsive Design:**
  - Adapts to different screen sizes

### Components

#### StatCard
A reusable card component for displaying statistics with optional icons and trend indicators.

```tsx
<StatCard
  label="Total Bookings"
  value={123}
  icon={<Calendar className="h-8 w-8" />}
  trend="up"
/>
```

#### BookingCard
Displays booking information with status badge, location, time, and action buttons.

```tsx
<BookingCard
  id="123"
  locationName="Downtown Office"
  startTime="2024-02-15T10:00:00Z"
  endTime="2024-02-15T11:00:00Z"
  status="confirmed"
  guestName="John Doe"
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

#### LocationCard
Shows location details with address, timezone, and action buttons.

```tsx
<LocationCard
  id="loc-123"
  name="Downtown Office"
  address="123 Main St"
  timezone="America/New_York"
  onDelete={handleDelete}
/>
```

#### BookingForm
Comprehensive form for creating and editing bookings with validation.

```tsx
<BookingForm
  locationId="loc-123"
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  loading={isLoading}
/>
```

## Styling

### Design System
- **Colors:** Blue (#3b82f6) for primary actions, gray for neutral elements
- **Typography:** Clean, modern sans-serif with clear hierarchy
- **Spacing:** Consistent padding and margins using Tailwind
- **Components:** shadcn/ui for consistent, accessible components

### Responsive Design
- **Mobile:** Single column layout, full-width cards
- **Tablet:** Two column grid for cards
- **Desktop:** Three to four column grid for optimal viewing

## State Management

### Data Fetching
- Uses Supabase client for real-time data
- useEffect hooks for initial data loading
- useCallback for function stability
- Proper dependency arrays to prevent infinite loops

### Error Handling
- Toast notifications for errors
- Graceful fallbacks for missing data
- Try-catch blocks in async operations

## Security

### Route Protection
- Middleware redirects unauthenticated users to login
- Auth callback exchange code for session
- Supabase session management in cookies

### API Usage
- All API calls use authenticated Supabase client
- User context is validated server-side
- No sensitive data exposed in client-side code

## Performance

### Optimization
- Server-side rendering for layouts
- Client-side hydration for interactive components
- Efficient data fetching with select queries
- Memoized callbacks to prevent unnecessary re-renders

### Load States
- Loading indicators on data fetch
- Skeleton screens ready for implementation
- Error states with user-friendly messages

## Future Enhancements

### Planned Features
1. **Create/Edit Modals:**
   - Dialog component infrastructure ready
   - BookingForm and LocationForm ready
   - API integration needed

2. **Advanced Filtering:**
   - Date range filters
   - Location-based filtering
   - Status-based filtering (partial implementation)

3. **Real-time Updates:**
   - Supabase real-time subscriptions
   - WebSocket support ready

4. **Export Functionality:**
   - CSV export for bookings and locations
   - PDF generation for reports

5. **Advanced Calendar:**
   - Week view, day view
   - Drag-and-drop rescheduling
   - Time slot selection

6. **Analytics:**
   - Revenue charts
   - Occupancy rates
   - Peak hour analysis

## Dependencies

### Core
- `next@15.5.12` - React framework
- `react@19.0.0-rc` - UI library
- `tailwindcss@3.4.0` - Styling

### Supabase
- `@supabase/ssr@0.5.0` - Server-side auth
- `@supabase/supabase-js@2.45.0` - Client library

### UI Components
- `lucide-react@0.460.0` - Icons
- `class-variance-authority@0.7.1` - Component variants
- `@radix-ui/react-slot` - Slot abstraction
- `@radix-ui/react-dialog` - Dialog component

### Utilities
- `react-hook-form@7.53.0` - Form handling
- `date-fns@3.0.0` - Date utilities
- `sonner@1.7.0` - Toast notifications
- `zod@3.23.0` - Schema validation

## Testing

### Manual Testing Checklist
- [ ] Login page loads and validates credentials
- [ ] Signup creates new account
- [ ] Dashboard loads with authenticated user
- [ ] Navigation between dashboard sections works
- [ ] Sidebar highlights active page
- [ ] Statistics display correctly
- [ ] Booking list filters by status
- [ ] Calendar displays bookings
- [ ] Logout works correctly

### Integration Testing
- [ ] Auth flow complete
- [ ] Data fetching from Supabase
- [ ] Error handling and toast notifications
- [ ] Responsive design on mobile, tablet, desktop

## Development

### Running the Dashboard
```bash
npm run dev
# Dashboard available at http://localhost:3000/dashboard
```

### Building for Production
```bash
npm run build
npm start
```

### Environment Variables
Ensure these are set in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Commits

### Phase 3 Dashboard UI Commits
1. `feat: Add authentication pages (login, signup, callback)` - Auth system
2. `feat: Build dashboard layout with sidebar, header, and pages` - Layout and pages

## Notes

- All components are fully typed with TypeScript
- Tailwind CSS provides responsive, utility-first styling
- Supabase handles authentication and data persistence
- Toast notifications provide user feedback
- Icons from Lucide React provide visual consistency
