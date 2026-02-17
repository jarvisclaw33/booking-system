'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { toast } from 'sonner'

export interface StaffMember {
  id: string
  name: string
  capacity: number
  utilization?: number
  availableSlots?: number
}

interface StaffSelectorProps {
  locationId: string
  selectedStaffId?: string
  onStaffSelect: (staffId: string | null) => void
  showAggregated?: boolean
  onAggregatedToggle?: (aggregated: boolean) => void
  aggregated?: boolean
}

/**
 * StaffSelector Component
 * Displays staff members as tabs or dropdown for filtering availability
 * Can toggle between individual and aggregated view
 */
export function StaffSelector({
  locationId,
  selectedStaffId,
  onStaffSelect,
  showAggregated = true,
  onAggregatedToggle,
  aggregated = false,
}: StaffSelectorProps) {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStaffMembers = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          `/api/resources?location_id=${locationId}&type=staff`,
          { method: 'GET' }
        )

        if (!response.ok) {
          throw new Error('Mitarbeiter konnten nicht geladen werden')
        }

        const data = await response.json()
        setStaffMembers(data.resources || [])
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten'
        setError(message)
        toast.error(message)
      } finally {
        setLoading(false)
      }
    }

    if (locationId) {
      fetchStaffMembers()
    }
  }, [locationId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-500 text-sm text-center py-4">
        {error}
      </div>
    )
  }

  const getStatusColor = (utilization?: number) => {
    if (utilization === undefined) return 'gray'
    if (utilization < 50) return 'green'
    if (utilization < 80) return 'orange'
    return 'red'
  }

  const getStatusLabel = (utilization?: number) => {
    if (utilization === undefined) return 'Verfügbar'
    if (utilization < 50) return 'Viel frei'
    if (utilization < 80) return 'Teilweise'
    return 'Voll'
  }

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      {showAggregated && onAggregatedToggle && (
        <div className="flex gap-2 mb-4">
          <Button
            variant={aggregated ? 'outline' : 'default'}
            onClick={() => onAggregatedToggle(false)}
            size="sm"
          >
            Mitarbeiter-Ansicht
          </Button>
          <Button
            variant={aggregated ? 'default' : 'outline'}
            onClick={() => onAggregatedToggle(true)}
            size="sm"
          >
            Gesamt-Ansicht
          </Button>
        </div>
      )}

      {/* Staff Member Tabs/Cards */}
      {!aggregated && (
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 block">
            Wähle einen Mitarbeiter
          </label>
          <div className="flex flex-wrap gap-2 md:flex-nowrap md:overflow-x-auto pb-2">
            {/* All Staff Button */}
            <Button
              variant={selectedStaffId === null ? 'default' : 'outline'}
              onClick={() => onStaffSelect(null)}
              className="whitespace-nowrap"
              size="sm"
            >
              Alle Mitarbeiter
            </Button>

            {/* Individual Staff Buttons */}
            {staffMembers.map((staff) => (
              <Button
                key={staff.id}
                variant={selectedStaffId === staff.id ? 'default' : 'outline'}
                onClick={() => onStaffSelect(staff.id)}
                className="whitespace-nowrap relative"
                size="sm"
              >
                <span>{staff.name}</span>
                {staff.utilization !== undefined && (
                  <span
                    className={`ml-2 inline-block w-2 h-2 rounded-full bg-${getStatusColor(
                      staff.utilization
                    )}-500`}
                  />
                )}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Aggregated View Info */}
      {aggregated && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
            📊 Aggregierte Ansicht
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-200 mt-1">
            Zeigt die verfügbare Kapazität über alle {staffMembers.length} Mitarbeiter
          </p>
        </div>
      )}

      {/* Staff Members Info Card (Condensed) */}
      {!aggregated && selectedStaffId === null && staffMembers.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {staffMembers.slice(0, 6).map((staff) => (
            <div
              key={staff.id}
              className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800"
            >
              <p className="text-xs font-medium text-gray-700 dark:text-slate-300">
                {staff.name}
              </p>
              {staff.utilization !== undefined && (
                <p className={`text-xs mt-1 font-medium text-${getStatusColor(staff.utilization)}-600 dark:text-${getStatusColor(staff.utilization)}-400`}>
                  {getStatusLabel(staff.utilization)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
