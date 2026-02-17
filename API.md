# Booking System API Documentation

## Overview

This document describes the REST API endpoints for the Booking System. All endpoints follow RESTful conventions and return JSON responses.

## Authentication

Most endpoints require authentication via Supabase Auth. Include the session cookie (automatically set) or authorization header.

### Public Endpoints
- `POST /api/bookings` - Create booking (public)
- `POST /api/availability` - Check availability (public)

### Protected Endpoints
All other endpoints require authentication.

## Response Format

### Success Response (2xx)
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional success message"
}
```

### Error Response (4xx, 5xx)
```json
{
  "success": false,
  "error": "Error message",
  "details": null
}
```

### Validation Error Response (400)
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "path": "field.name",
      "message": "Error description"
    }
  ]
}
```

## Endpoints

### Locations

#### `GET /api/locations`
List all locations for authenticated user's organizations.

**Query Parameters:**
- None

**Response:**
```json
{
  "locations": [
    {
      "id": "uuid",
      "organization_id": "uuid",
      "name": "Main Office",
      "address": "123 Main St",
      "timezone": "Europe/Berlin",
      "settings": {},
      "created_at": "2025-02-13T10:00:00Z",
      "updated_at": "2025-02-13T10:00:00Z"
    }
  ]
}
```

#### `POST /api/locations`
Create a new location.

**Request Body:**
```json
{
  "organizationId": "uuid",
  "name": "Branch Office",
  "address": "456 Branch Ave",
  "timezone": "Europe/Berlin"
}
```

**Response:** Location object (201 Created)

#### `GET /api/locations/[id]`
Get a specific location.

**Response:** Location object

#### `PATCH /api/locations/[id]`
Update a location.

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Name",
  "address": "New Address",
  "timezone": "Europe/Paris"
}
```

**Response:** Updated location object

#### `DELETE /api/locations/[id]`
Delete a location (admin/owner only).

**Response:** `{ "success": true }`

---

### Offerings (Services)

#### `GET /api/offerings`
List all offerings for user's organizations.

**Query Parameters:**
- `location_id` - Filter by location (optional)

**Response:**
```json
{
  "offerings": [
    {
      "id": "uuid",
      "organization_id": "uuid",
      "location_id": "uuid",
      "name": "1-Hour Massage",
      "description": "Professional relaxation massage",
      "duration_minutes": 60,
      "capacity": 1,
      "price_cents": 5000,
      "color": "#FF6B6B",
      "is_active": true,
      "created_at": "2025-02-13T10:00:00Z",
      "updated_at": "2025-02-13T10:00:00Z"
    }
  ]
}
```

#### `POST /api/offerings`
Create a new offering.

**Request Body:**
```json
{
  "organizationId": "uuid",
  "locationId": "uuid",
  "name": "Haircut",
  "description": "Professional haircut service",
  "durationMinutes": 30,
  "capacity": 1,
  "priceCents": 2000,
  "color": "#4ECDC4"
}
```

**Response:** Offering object (201 Created)

#### `GET /api/offerings/[id]`
Get a specific offering.

#### `PATCH /api/offerings/[id]`
Update an offering.

#### `DELETE /api/offerings/[id]`
Delete an offering.

---

### Resources

#### `GET /api/resources`
List all resources for user's organizations.

**Query Parameters:**
- `location_id` - Filter by location (optional)

**Response:**
```json
{
  "resources": [
    {
      "id": "uuid",
      "organization_id": "uuid",
      "location_id": "uuid",
      "name": "Massage Table 1",
      "type": "equipment",
      "capacity": 1,
      "is_active": true,
      "created_at": "2025-02-13T10:00:00Z"
    }
  ]
}
```

**Resource Types:** `staff`, `table`, `room`, `equipment`

#### `POST /api/resources`
Create a new resource.

**Request Body:**
```json
{
  "organizationId": "uuid",
  "locationId": "uuid",
  "name": "John Smith",
  "type": "staff",
  "capacity": 1
}
```

#### `GET /api/resources/[id]`
Get a specific resource.

#### `PATCH /api/resources/[id]`
Update a resource.

#### `DELETE /api/resources/[id]`
Delete a resource.

---

### Bookings

#### `GET /api/bookings`
List bookings for authenticated user's organizations.

**Query Parameters:**
- `location_id` - Filter by location (optional)
- `start_date` - Filter by start date (ISO 8601, optional)
- `end_date` - Filter by end date (ISO 8601, optional)
- `status` - Filter by status (optional)

**Response:**
```json
{
  "bookings": [
    {
      "id": "uuid",
      "organization_id": "uuid",
      "location_id": "uuid",
      "offering_id": "uuid",
      "resource_id": "uuid",
      "customer_name": "John Doe",
      "customer_email": "john@example.com",
      "customer_phone": "+1234567890",
      "start_time": "2025-02-13T14:00:00Z",
      "end_time": "2025-02-13T15:00:00Z",
      "status": "confirmed",
      "notes": "VIP customer",
      "metadata": {},
      "created_at": "2025-02-13T10:00:00Z",
      "updated_at": "2025-02-13T10:00:00Z"
    }
  ]
}
```

**Booking Status:** `pending`, `confirmed`, `cancelled`, `completed`, `no_show`

#### `POST /api/bookings`
Create a new booking (public or authenticated).

**Request Body:**
```json
{
  "locationId": "uuid",
  "offeringId": "uuid",
  "customerName": "Jane Doe",
  "customerEmail": "jane@example.com",
  "customerPhone": "+1987654321",
  "startTime": "2025-02-13T14:00:00Z",
  "endTime": "2025-02-13T15:00:00Z",
  "notes": "First time customer"
}
```

**Response:** Booking object (201 Created)

#### `GET /api/bookings/[id]`
Get a specific booking (accessible by booking staff or customer).

#### `PATCH /api/bookings/[id]`
Update a booking (staff/admin only).

**Request Body:** (all fields optional)
```json
{
  "status": "completed",
  "notes": "Updated notes",
  "customerName": "Updated Name",
  "customerEmail": "updated@example.com"
}
```

#### `DELETE /api/bookings/[id]`
Cancel a booking (customer or staff/admin).

**Response:** `{ "success": true }`

---

### Availability

#### `POST /api/availability`
Get available time slots for a location/offering on a specific date.

**Request Body:**
```json
{
  "locationId": "uuid",
  "offeringId": "uuid",
  "date": "2025-02-13",
  "duration": 60
}
```

**Response:**
```json
{
  "slots": [
    {
      "startTime": "2025-02-13T09:00:00Z",
      "endTime": "2025-02-13T10:00:00Z",
      "available": true
    },
    {
      "startTime": "2025-02-13T10:00:00Z",
      "endTime": "2025-02-13T11:00:00Z",
      "available": false
    }
  ]
}
```

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Access denied |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict (e.g., time slot unavailable) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

---

## Rate Limiting

- **Public endpoints:** 10 requests per 10 minutes per IP
- **Authenticated endpoints:** 100 requests per minute per user
- **Webhooks:** No limit (signature verification required)

---

## Examples

### Create a Booking
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "locationId": "550e8400-e29b-41d4-a716-446655440000",
    "offeringId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "startTime": "2025-02-13T14:00:00Z",
    "endTime": "2025-02-13T15:00:00Z"
  }'
```

### Check Availability
```bash
curl -X POST http://localhost:3000/api/availability \
  -H "Content-Type: application/json" \
  -d '{
    "locationId": "550e8400-e29b-41d4-a716-446655440000",
    "offeringId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "date": "2025-02-13"
  }'
```

### Update a Booking
```bash
curl -X PATCH http://localhost:3000/api/bookings/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <session-token>" \
  -d '{
    "status": "completed",
    "notes": "Service completed successfully"
  }'
```

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Dates should be in YYYY-MM-DD format
- Times should be in HH:MM:SS format
- Organization ID is required for most operations (derived from authenticated user)
- RLS (Row-Level Security) enforces data access at the database level
