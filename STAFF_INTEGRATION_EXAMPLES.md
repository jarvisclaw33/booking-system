# Staff Management Integration Examples

This guide shows how to integrate the new multi-staff management components into existing pages.

## Quick Start

### 1. Full Booking Interface (Easiest)

Replace your existing booking form with the complete interface:

```typescript
// app/dashboard/bookings/page.tsx
'use client'

import { StaffBookingInterface } from '@/components/StaffBookingInterface'
import { useParams } from 'next/navigation'

export default function BookingsPage() {
  const params = useParams()
  
  return (
    <div className="container mx-auto py-8">
      <StaffBookingInterface
        locationId={params.locationId as string}
        offeringId={params.offeringId as string}
        organizationId={params.organizationId as string}
      />
    </div>
  )
}
```

### 2. Dashboard with Staff Metrics

Add staff metrics to your dashboard:

```typescript
// app/dashboard/page.tsx
'use client'

import { StaffDashboard } from '@/components/StaffDashboard'
import { StaffSelector } from '@/components/StaffSelector'
import { useState } from 'react'

export default function DashboardPage() {
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null)
  const locationId = 'your-location-uuid'
  const offeringId = 'your-offering-uuid'

  return (
    <div className="space-y-8 container mx-auto py-8">
      <h1 className="text-3xl font-bold">Salon Dashboard</h1>

      {/* Staff Selector */}
      <StaffSelector
        locationId={locationId}
        selectedStaffId={selectedStaffId}
        onStaffSelect={setSelectedStaffId}
      />

      {/* Aggregated Metrics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Verfügbarkeitsübersicht</h2>
        <StaffDashboard
          locationId={locationId}
          offeringId={offeringId}
        />
      </div>
    </div>
  )
}
```

### 3. Calendar with Staff Selection

Integrate calendar into existing page:

```typescript
// app/dashboard/calendar/page.tsx
'use client'

import { StaffCalendarView } from '@/components/StaffCalendarView'
import { StaffSelector } from '@/components/StaffSelector'
import { useState } from 'react'

export default function CalendarPage() {
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState(null)

  const locationId = 'your-location-uuid'
  const offeringId = 'your-offering-uuid'

  return (
    <div className="space-y-6 container mx-auto py-8">
      <h1 className="text-3xl font-bold">Availability Calendar</h1>

      {/* Staff Selector */}
      <StaffSelector
        locationId={locationId}
        selectedStaffId={selectedStaffId}
        onStaffSelect={setSelectedStaffId}
      />

      {/* Calendar */}
      <StaffCalendarView
        locationId={locationId}
        offeringId={offeringId}
        selectedStaffId={selectedStaffId}
        onSlotSelect={(slot, staffId) => {
          setSelectedSlot({ slot, staffId })
          // Open booking modal or navigate
        }}
      />

      {/* Show selected slot info */}
      {selectedSlot && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <p>Selected: {selectedSlot.slot.startTime} - {selectedSlot.staff}</p>
        </div>
      )}
    </div>
  )
}
```

### 4. Booking Form with Staff Assignment

Enhance your existing booking form:

```typescript
// components/BookingFormEnhanced.tsx
'use client'

import { useState } from 'react'
import { StaffSelector } from '@/components/StaffSelector'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface BookingFormEnhancedProps {
  locationId: string
  offeringId: string
}

export function BookingFormEnhanced({
  locationId,
  offeringId,
}: BookingFormEnhancedProps) {
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/bookings/enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationId,
          offeringId,
          resourceId: selectedStaffId, // NEW: Assign to specific staff
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone,
          startTime: '2025-02-16T10:00:00Z', // From calendar selection
          endTime: '2025-02-16T10:30:00Z',
        }),
      })

      if (!response.ok) throw new Error('Booking failed')
      toast.success('Booking created!')
    } catch (error) {
      toast.error('Booking failed')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <StaffSelector
        locationId={locationId}
        selectedStaffId={selectedStaffId}
        onStaffSelect={setSelectedStaffId}
      />

      <Input
        placeholder="Customer name"
        value={formData.customerName}
        onChange={(e) =>
          setFormData({ ...formData, customerName: e.target.value })
        }
      />

      <Input
        type="email"
        placeholder="Email"
        value={formData.customerEmail}
        onChange={(e) =>
          setFormData({ ...formData, customerEmail: e.target.value })
        }
      />

      <Button type="submit">Book Appointment</Button>
    </form>
  )
}
```

### 5. API Integration Examples

Check availability for specific staff:

```typescript
// pages/availability.tsx
async function getStaffAvailability(
  locationId: string,
  staffId: string,
  date: string
) {
  const response = await fetch(
    `/api/availability/enhanced?locationId=${locationId}&staffId=${staffId}&date=${date}&offeringId=offering-uuid`
  )
  return response.json()
}

// Check aggregated capacity
async function getAggregatedCapacity(
  locationId: string,
  date: string
) {
  const response = await fetch(
    `/api/availability/enhanced?locationId=${locationId}&date=${date}&offeringId=offering-uuid&aggregated=true`
  )
  return response.json()
}

// Get bookings for specific staff
async function getStaffBookings(locationId: string, staffId: string) {
  const response = await fetch(
    `/api/bookings/enhanced?location_id=${locationId}&resource_id=${staffId}`
  )
  return response.json()
}
```

## Component Composition Patterns

### Pattern 1: Dashboard + Calendar

```typescript
export function SalonDashboard() {
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null)
  const [view, setView] = useState<'dashboard' | 'calendar'>('dashboard')

  return (
    <div className="space-y-6">
      <StaffSelector
        locationId="loc-uuid"
        selectedStaffId={selectedStaffId}
        onStaffSelect={setSelectedStaffId}
      />

      {view === 'dashboard' ? (
        <StaffDashboard locationId="loc-uuid" offeringId="offer-uuid" />
      ) : (
        <StaffCalendarView
          locationId="loc-uuid"
          offeringId="offer-uuid"
          selectedStaffId={selectedStaffId}
        />
      )}
    </div>
  )
}
```

### Pattern 2: Multi-Service Selection

```typescript
export function MultiServiceBooking() {
  const [selectedService, setSelectedService] = useState('haircut')
  const serviceIds = {
    haircut: 'offer-uuid-1',
    styling: 'offer-uuid-2',
    coloring: 'offer-uuid-3',
  }

  return (
    <div className="space-y-6">
      {/* Service Selector */}
      <div className="flex gap-2">
        {Object.keys(serviceIds).map((service) => (
          <button
            key={service}
            onClick={() => setSelectedService(service)}
            className={`px-4 py-2 rounded ${
              selectedService === service ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            {service}
          </button>
        ))}
      </div>

      {/* Staff Selector + Calendar */}
      <StaffBookingInterface
        locationId="loc-uuid"
        offeringId={serviceIds[selectedService as keyof typeof serviceIds]}
        organizationId="org-uuid"
      />
    </div>
  )
}
```

### Pattern 3: Conditional Staff Assignment

```typescript
export function SmartBooking() {
  const [assignToStaff, setAssignToStaff] = useState(false)

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={assignToStaff}
          onChange={(e) => setAssignToStaff(e.target.checked)}
        />
        Request specific staff member?
      </label>

      {assignToStaff ? (
        <StaffBookingInterface
          locationId="loc-uuid"
          offeringId="offer-uuid"
          organizationId="org-uuid"
        />
      ) : (
        <SimpleBookingForm />
      )}
    </div>
  )
}
```

## Data Flow Example

```
User selects staff member
    ↓
StaffSelector calls onStaffSelect(staffId)
    ↓
State updates selectedStaffId
    ↓
StaffCalendarView fetches availability for that staff
    ↓
User clicks time slot
    ↓
onSlotSelect callback fired
    ↓
Booking form opens with pre-filled slot
    ↓
User submits booking
    ↓
POST /api/bookings/enhanced with resourceId
    ↓
Booking created with staff assignment
```

## Testing the Integration

### Test in Development

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Test staff availability
curl "http://localhost:3000/api/availability/enhanced?locationId=<uuid>&offeringId=<uuid>&date=2025-02-16"

# Test aggregated view
curl "http://localhost:3000/api/availability/enhanced?locationId=<uuid>&offeringId=<uuid>&date=2025-02-16&aggregated=true"

# Test booking with staff
curl -X POST http://localhost:3000/api/bookings/enhanced \
  -H "Content-Type: application/json" \
  -d '{
    "locationId": "<uuid>",
    "offeringId": "<uuid>",
    "resourceId": "<staff-uuid>",
    "customerName": "Test User",
    "customerEmail": "test@example.com",
    "startTime": "2025-02-16T10:00:00Z",
    "endTime": "2025-02-16T10:30:00Z"
  }'
```

### Test in React DevTools

```typescript
// Check component state in React DevTools
// Look for:
// - selectedStaffId: string | null
// - staffAvailabilities: StaffAvailability[]
// - aggregated: AggregatedAvailability
```

## Troubleshooting Integration

### Issue: "No staff members found"
**Solution:**
- Check location has active staff resources
- Verify staff resources have type='staff'
- Ensure staff schedules are created for selected date

### Issue: "Slots not showing"
**Solution:**
- Check staff schedule exists for day of week
- Verify schedule times are valid
- Ensure no blocks overlap entire day

### Issue: "Booking creation fails"
**Solution:**
- Verify resourceId is valid staff UUID
- Check staff has availability at selected time
- Ensure offering and location IDs are correct

## Performance Tips

1. **Memoize Components:**
```typescript
export const StaffSelectorMemo = React.memo(StaffSelector)
```

2. **Lazy Load Calendar:**
```typescript
const StaffCalendarView = dynamic(
  () => import('@/components/StaffCalendarView'),
  { loading: () => <LoadingSpinner /> }
)
```

3. **Batch API Calls:**
```typescript
// Fetch multiple dates at once
const availabilities = await Promise.all(
  dates.map(date =>
    fetch(`/api/availability/enhanced?date=${date}&aggregated=true`)
  )
)
```

---

For complete API documentation, see [STAFF_MANAGEMENT_GUIDE.md](./STAFF_MANAGEMENT_GUIDE.md)
