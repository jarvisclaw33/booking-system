# Multi-Staff Management Feature Guide

## Overview

This guide documents the Multi-Staff Management system for the booking platform, implemented with a salon/hairdresser scenario in mind. The system allows salon owners to manage bookings across multiple staff members with aggregated capacity views and individual staff scheduling.

## Architecture

### Backend API Routes

#### 1. Enhanced Availability Endpoint
**Route:** `GET /api/availability/enhanced`

Returns availability information with staff filtering and aggregation support.

**Query Parameters:**
- `locationId` (required): UUID of the location
- `offeringId` (required): UUID of the offering/service
- `date` (required): Date in format `YYYY-MM-DD`
- `staffId` (optional): UUID of specific staff member
- `aggregated` (optional): Boolean - returns aggregated data across all staff
- `duration` (optional): Duration in minutes (overrides offering default)

**Response Types:**

1. **Individual Staff Member** (when `staffId` is provided):
```json
{
  "type": "individual",
  "date": "2025-02-16",
  "staffMember": {
    "staffId": "uuid",
    "staffName": "John Doe",
    "slots": [
      {
        "startTime": "2025-02-16T09:00:00Z",
        "endTime": "2025-02-16T09:30:00Z",
        "available": true
      }
    ],
    "availableSlots": 8,
    "totalSlots": 10,
    "utilizationRate": 20
  }
}
```

2. **Aggregated View** (when `aggregated=true`):
```json
{
  "type": "aggregated",
  "aggregated": {
    "date": "2025-02-16",
    "totalCapacity": 3,
    "bookedCapacity": 1,
    "availableCapacity": 2,
    "utilizationRate": 33.33,
    "status": "green",
    "peakHours": ["2025-02-16T14:00Z", "2025-02-16T15:00Z"],
    "freeSlots": ["2025-02-16T09:00Z", "2025-02-16T10:00Z"],
    "staffSummary": [
      {
        "staffId": "uuid",
        "staffName": "John Doe",
        "utilization": 20
      }
    ]
  },
  "staffDetails": [...]
}
```

3. **All Staff** (default):
```json
{
  "type": "multi",
  "date": "2025-02-16",
  "staffAvailabilities": [
    {
      "staffId": "uuid",
      "staffName": "John Doe",
      "slots": [...],
      "availableSlots": 8,
      "totalSlots": 10,
      "utilizationRate": 20
    }
  ]
}
```

**Status Codes:**
- `green` (>50% available): Plenty of capacity
- `orange` (20-50% available): Moderate availability
- `red` (<20% available): Limited capacity

#### 2. Enhanced Bookings Endpoint
**Route:** `GET/POST /api/bookings/enhanced`

**GET Query Parameters:**
- `location_id`: Filter by location
- `resource_id`: Filter by staff member
- `start_date`: Filter by start date
- `end_date`: Filter by end date
- `status`: Filter by booking status

**POST Request Body:**
```json
{
  "organizationId": "optional-uuid",
  "locationId": "required-uuid",
  "offeringId": "required-uuid",
  "resourceId": "optional-staff-uuid",
  "customerName": "John Smith",
  "customerEmail": "john@example.com",
  "customerPhone": "+49 123 456789",
  "startTime": "2025-02-16T10:00:00Z",
  "endTime": "2025-02-16T10:30:00Z",
  "notes": "Optional notes"
}
```

**Response:**
```json
{
  "id": "uuid",
  "organizationId": "uuid",
  "locationId": "uuid",
  "offeringId": "uuid",
  "resourceId": "uuid",
  "customerName": "John Smith",
  "customerEmail": "john@example.com",
  "startTime": "2025-02-16T10:00:00Z",
  "endTime": "2025-02-16T10:30:00Z",
  "status": "confirmed",
  "resources": {
    "id": "uuid",
    "name": "Jane Stylist",
    "type": "staff"
  }
}
```

### Data Model

The system uses the existing resource model with the following structure:

```typescript
// resources table
{
  id: string (uuid)
  organization_id: string (uuid)
  location_id: string (uuid)
  name: string
  type: 'staff' | 'table' | 'room' | 'equipment'
  capacity: number
  is_active: boolean
}

// bookings table (enhanced)
{
  id: string (uuid)
  organization_id: string (uuid)
  location_id: string (uuid)
  offering_id: string (uuid)
  resource_id: string (uuid) // NEW: Link to staff member
  customer_name: string
  customer_email: string
  start_time: timestamp
  end_time: timestamp
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  metadata: {
    staffAssigned: boolean
  }
}

// schedules table
{
  id: string (uuid)
  resource_id: string (uuid) // Which staff member
  location_id: string (uuid)
  day_of_week: 0-6 (Sunday-Saturday)
  start_time: HH:MM:SS
  end_time: HH:MM:SS
  is_active: boolean
}
```

## Frontend Components

### 1. StaffSelector
**File:** `components/StaffSelector.tsx`

Allows users to switch between individual staff members or aggregated view.

**Props:**
```typescript
interface StaffSelectorProps {
  locationId: string
  selectedStaffId?: string
  onStaffSelect: (staffId: string | null) => void
  showAggregated?: boolean
  onAggregatedToggle?: (aggregated: boolean) => void
  aggregated?: boolean
}
```

**Features:**
- Tabs/buttons to select staff members
- Toggle between individual and aggregated views
- Shows utilization indicator for each staff member
- Responsive design (horizontal scroll on mobile)

### 2. StaffDashboard
**File:** `components/StaffDashboard.tsx`

Shows aggregated capacity and utilization metrics.

**Props:**
```typescript
interface StaffDashboardProps {
  locationId: string
  offeringId: string
  date?: string
}
```

**Displays:**
- Overall utilization percentage
- Available staff vs total staff
- Peak hours (least availability)
- Free time slots
- Individual staff utilization bars
- Color-coded status (green/orange/red)

### 3. StaffCalendarView
**File:** `components/StaffCalendarView.tsx`

Calendar grid showing availability for each staff member across time slots.

**Props:**
```typescript
interface StaffCalendarViewProps {
  locationId: string
  offeringId: string
  selectedStaffId?: string | null
  date?: string
  onSlotSelect?: (slot: AvailabilitySlot, staffId: string) => void
}
```

**Features:**
- Time slot matrix (staff members × time slots)
- Green for available, red for booked
- Click to select a slot
- Date navigation (previous/next day)
- Utilization rate per staff member

### 4. StaffBookingInterface
**File:** `components/StaffBookingInterface.tsx`

Complete integrated interface combining all components.

**Props:**
```typescript
interface StaffBookingInterfaceProps {
  locationId: string
  offeringId: string
  organizationId: string
}
```

**Features:**
- Staff member selector
- Aggregated dashboard OR individual calendar view
- Booking form with customer details
- Automatic staff assignment when booking

## Usage Examples

### Example 1: Individual Staff Scheduling
```typescript
import { StaffBookingInterface } from '@/components/StaffBookingInterface'

export default function BookingPage() {
  return (
    <StaffBookingInterface
      locationId="location-uuid"
      offeringId="offering-uuid"
      organizationId="org-uuid"
    />
  )
}
```

### Example 2: Check Staff Availability
```typescript
const response = await fetch(
  '/api/availability/enhanced?locationId=loc-uuid&offeringId=offer-uuid&date=2025-02-16&staffId=staff-uuid'
)
const { staffMember } = await response.json()
console.log(`Available slots: ${staffMember.availableSlots}`)
```

### Example 3: Create Booking with Staff Assignment
```typescript
const booking = await fetch('/api/bookings/enhanced', {
  method: 'POST',
  body: JSON.stringify({
    locationId: 'loc-uuid',
    offeringId: 'offer-uuid',
    resourceId: 'staff-uuid', // Specific staff member
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    startTime: '2025-02-16T10:00:00Z',
    endTime: '2025-02-16T10:30:00Z',
  })
})
```

### Example 4: Get Aggregated Dashboard Data
```typescript
const response = await fetch(
  '/api/availability/enhanced?locationId=loc-uuid&offeringId=offer-uuid&date=2025-02-16&aggregated=true'
)
const { aggregated } = await response.json()
console.log(`Overall utilization: ${aggregated.utilizationRate}%`)
console.log(`Status: ${aggregated.status}`) // green/orange/red
```

## Database Considerations

### Ensuring resource_id is linked to bookings

The booking model needs to support resource_id. Check your Supabase migration:

```sql
-- Ensure bookings table has resource_id column
ALTER TABLE bookings ADD COLUMN resource_id UUID REFERENCES resources(id) ON DELETE SET NULL;

-- Add index for faster queries
CREATE INDEX idx_bookings_resource_id ON bookings(resource_id);
CREATE INDEX idx_bookings_resource_location_date ON bookings(resource_id, location_id, start_time);
```

### Schedule Setup

Each staff member needs schedules defined:

```sql
-- Example: Add schedule for staff member
INSERT INTO schedules (resource_id, location_id, day_of_week, start_time, end_time, is_active)
VALUES 
  (staff-uuid, location-uuid, 1, '09:00:00', '18:00:00', true), -- Monday
  (staff-uuid, location-uuid, 2, '09:00:00', '18:00:00', true), -- Tuesday
  -- ... more days
;
```

## Performance Optimization

### Query Optimization
- Indexes on `bookings(resource_id, location_id, start_time)`
- Indexes on `schedules(resource_id, day_of_week)`
- Consider materializing aggregated stats for real-time performance

### Caching Strategy
- Cache staff member lists (rarely changes)
- Cache availability slots for 5 minutes
- Invalidate cache on new booking

### Batch Operations
For checking availability across multiple dates:
```typescript
const dates = ['2025-02-16', '2025-02-17', '2025-02-18']
const availabilities = await Promise.all(
  dates.map(date =>
    fetch(`/api/availability/enhanced?locationId=...&date=${date}&aggregated=true`)
  )
)
```

## Status Indicators

### Color-Coded Status
- 🟢 **Green**: >50% available (plenty of capacity)
- 🟠 **Orange**: 20-50% available (moderate capacity)
- 🔴 **Red**: <20% available (limited capacity)

### Utilization Calculation
```
utilization = (booked_slots / total_slots) * 100
availability = 100 - utilization
```

## Future Enhancements

1. **Load Balancing**: Auto-assign bookings to least-utilized staff
2. **Preferences**: Customer can request specific staff
3. **Skill-Based Routing**: Assign based on staff specialties
4. **Bulk Import**: Import staff schedules from CSV
5. **Analytics**: Track staff performance and utilization trends
6. **Notifications**: Alert when staff reaches capacity threshold

## Troubleshooting

### No availability slots shown
- Check staff member has active schedule for the day
- Verify location timezone is correct
- Ensure offering duration is set

### Bookings not assigned to staff
- Verify `resourceId` is passed in booking POST request
- Check staff member exists and is active
- Ensure staff member has schedule for the requested time

### Aggregated view not working
- Verify location has multiple active staff members
- Check at least one staff member has availability on selected date
- Ensure schedules are properly configured

## API Testing

### Test Staff Availability Endpoint
```bash
curl "http://localhost:3000/api/availability/enhanced?locationId=<uuid>&offeringId=<uuid>&date=2025-02-16"
```

### Test Aggregated Data
```bash
curl "http://localhost:3000/api/availability/enhanced?locationId=<uuid>&offeringId=<uuid>&date=2025-02-16&aggregated=true"
```

### Test Individual Staff
```bash
curl "http://localhost:3000/api/availability/enhanced?locationId=<uuid>&offeringId=<uuid>&date=2025-02-16&staffId=<uuid>"
```

### Create Booking with Staff
```bash
curl -X POST http://localhost:3000/api/bookings/enhanced \
  -H "Content-Type: application/json" \
  -d '{
    "locationId": "<uuid>",
    "offeringId": "<uuid>",
    "resourceId": "<staff-uuid>",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "startTime": "2025-02-16T10:00:00Z",
    "endTime": "2025-02-16T10:30:00Z"
  }'
```

## References

- [Original Booking System Docs](./API.md)
- [Database Schema](./DATABASE_SETUP.md)
- [Dashboard Guide](./DASHBOARD.md)
