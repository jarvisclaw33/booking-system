// @ts-nocheck
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Booking, CreateBookingRequest, UpdateBookingRequest } from '@/types/models'
import { isMockMode, mockDelay } from '@/lib/utils/mock'
import { mockBookings } from '@/lib/mock-data'

const BOOKINGS_QUERY_KEY = ['bookings']

export function useBookings(
  locationId?: string,
  startDate?: string,
  endDate?: string,
  status?: string
) {
  const queryKey = [
    ...BOOKINGS_QUERY_KEY,
    { locationId, startDate, endDate, status },
  ]

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (isMockMode()) {
        await mockDelay()
        return mockBookings.filter(booking => {
          if (locationId && booking.location_id !== locationId) return false
          if (status && booking.status !== status) return false
          return true
        }) as Booking[]
      }

      const params = new URLSearchParams()
      if (locationId) params.append('location_id', locationId)
      if (startDate) params.append('start_date', startDate)
      if (endDate) params.append('end_date', endDate)
      if (status) params.append('status', status)

      const response = await fetch(`/api/bookings?${params}`)
      if (!response.ok) throw new Error('Failed to fetch bookings')

      const data = await response.json()
      return data.bookings
    },
  })
}

export function useBooking(bookingId: string) {
  return useQuery({
    queryKey: [...BOOKINGS_QUERY_KEY, bookingId],
    queryFn: async () => {
      if (isMockMode()) {
        await mockDelay()
        return mockBookings.find(b => b.id === bookingId)
      }

      const response = await fetch(`/api/bookings/${bookingId}`)
      if (!response.ok) throw new Error('Failed to fetch booking')
      return response.json()
    },
  })
}

export function useCreateBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (booking: CreateBookingRequest) => {
      if (isMockMode()) {
        await mockDelay()
        return { id: `mock-book-${Date.now()}`, ...booking }
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create booking')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKINGS_QUERY_KEY })
    },
  })
}

export function useUpdateBooking(bookingId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates: UpdateBookingRequest) => {
      if (isMockMode()) {
        await mockDelay()
        return { id: bookingId, ...updates }
      }

      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update booking')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKINGS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: [...BOOKINGS_QUERY_KEY, bookingId] })
    },
  })
}

export function useCancelBooking(bookingId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      if (isMockMode()) {
        await mockDelay()
        return { success: true }
      }

      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to cancel booking')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKINGS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: [...BOOKINGS_QUERY_KEY, bookingId] })
    },
  })
}
