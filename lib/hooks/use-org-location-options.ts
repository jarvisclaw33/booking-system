// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import { getMyOrganizations, getLocationsByOrganization } from '@/server/database-actions'
import { isMockMode } from '@/lib/utils/mock'
import { mockLocations, mockOrganizations } from '@/lib/mock-data'

export type OrganizationOption = {
  id: string
  name: string
}

export type LocationOption = {
  id: string
  name: string
  organizationId: string
}

type RawOrganization = {
  id: string
  name: string
}

type RawLocation = {
  id: string
  name: string
  organization_id?: string
  organizationId?: string
}

export function useOrgLocationOptions() {
  const [organizations, setOrganizations] = useState<OrganizationOption[]>([])
  const [locations, setLocations] = useState<LocationOption[]>([])
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null)
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null)
  const [loadingOrganizations, setLoadingOrganizations] = useState(true)
  const [loadingLocations, setLoadingLocations] = useState(false)

  useEffect(() => {
    let isActive = true

    async function loadOrganizations() {
      setLoadingOrganizations(true)

      if (isMockMode()) {
        const orgOptions = mockOrganizations.map(org => ({
          id: org.id,
          name: org.name,
        }))
        if (!isActive) return
        setOrganizations(orgOptions)
        setLoadingOrganizations(false)
        return
      }

      const result = await getMyOrganizations()
      if (!isActive) return

      const orgs = (result as { organizations?: RawOrganization[] }).organizations || []
      const orgOptions = orgs.map(org => ({ id: org.id, name: org.name }))
      setOrganizations(orgOptions)
      setLoadingOrganizations(false)
    }

    loadOrganizations()

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    if (!organizations.length) {
      setSelectedOrganizationId(null)
      return
    }

    if (organizations.length === 1) {
      setSelectedOrganizationId(organizations[0].id)
      return
    }

    if (selectedOrganizationId && organizations.some(org => org.id === selectedOrganizationId)) {
      return
    }

    setSelectedOrganizationId(null)
  }, [organizations, selectedOrganizationId])

  useEffect(() => {
    let isActive = true

    async function loadLocations(orgId: string) {
      setLoadingLocations(true)

      if (isMockMode()) {
        const locOptions = mockLocations
          .filter(loc => loc.organization_id === orgId)
          .map(loc => ({
            id: loc.id,
            name: loc.name,
            organizationId: loc.organization_id,
          }))
        if (!isActive) return
        setLocations(locOptions)
        setLoadingLocations(false)
        return
      }

      const result = await getLocationsByOrganization(orgId)
      if (!isActive) return

      const locs = (result as { locations?: RawLocation[] }).locations || []
      const locOptions = locs.map(loc => ({
        id: loc.id,
        name: loc.name,
        organizationId: loc.organization_id || loc.organizationId || '',
      }))
      setLocations(locOptions)
      setLoadingLocations(false)
    }

    if (!selectedOrganizationId) {
      setLocations([])
      setSelectedLocationId(null)
      return
    }

    loadLocations(selectedOrganizationId)

    return () => {
      isActive = false
    }
  }, [selectedOrganizationId])

  useEffect(() => {
    if (!locations.length) {
      setSelectedLocationId(null)
      return
    }

    if (locations.length === 1) {
      setSelectedLocationId(locations[0].id)
      return
    }

    if (selectedLocationId && locations.some(loc => loc.id === selectedLocationId)) {
      return
    }

    setSelectedLocationId(null)
  }, [locations, selectedLocationId])

  return {
    organizations,
    locations,
    selectedOrganizationId,
    selectedLocationId,
    setSelectedOrganizationId,
    setSelectedLocationId,
    loadingOrganizations,
    loadingLocations,
  }
}
