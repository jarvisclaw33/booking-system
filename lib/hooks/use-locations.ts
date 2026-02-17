// @ts-nocheck
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Location, CreateLocationRequest, UpdateLocationRequest } from '@/types/models'
import { isMockMode, mockDelay } from '@/lib/utils/mock'
import { mockLocations } from '@/lib/mock-data'

const LOCATIONS_QUERY_KEY = ['locations']

export function useLocations() {
  return useQuery({
    queryKey: LOCATIONS_QUERY_KEY,
    queryFn: async () => {
      if (isMockMode()) {
        await mockDelay()
        return mockLocations as unknown as Location[]
      }

      const response = await fetch('/api/locations')
      if (!response.ok) throw new Error('Failed to fetch locations')

      const data = await response.json()
      return data.locations
    },
  })
}

export function useLocation(locationId: string) {
  return useQuery({
    queryKey: [...LOCATIONS_QUERY_KEY, locationId],
    queryFn: async () => {
      if (isMockMode()) {
        await mockDelay()
        return mockLocations.find(loc => loc.id === locationId)
      }

      const response = await fetch(`/api/locations/${locationId}`)
      if (!response.ok) throw new Error('Failed to fetch location')
      return response.json()
    },
  })
}

export function useCreateLocation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (location: CreateLocationRequest) => {
      if (isMockMode()) {
        await mockDelay()
        return { id: `mock-loc-${Date.now()}`, ...location }
      }

      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(location),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create location')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOCATIONS_QUERY_KEY })
    },
  })
}

export function useUpdateLocation(locationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates: UpdateLocationRequest) => {
      if (isMockMode()) {
        await mockDelay()
        return { id: locationId, ...updates }
      }

      const response = await fetch(`/api/locations/${locationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update location')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOCATIONS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: [...LOCATIONS_QUERY_KEY, locationId] })
    },
  })
}

export function useDeleteLocation(locationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      if (isMockMode()) {
        await mockDelay()
        return { success: true }
      }

      const response = await fetch(`/api/locations/${locationId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete location')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOCATIONS_QUERY_KEY })
    },
  })
}
