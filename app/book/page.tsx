'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Calendar, Clock, User, Scissors, MapPin, ChevronLeft, ChevronRight, Check } from 'lucide-react'

interface Location {
  id: string
  name: string
  address: string
}

interface Offering {
  id: string
  name: string
  description: string
  duration_minutes: number
  price_cents: number
  color: string
}

interface TimeSlot {
  startTime: string
  endTime: string
  available: boolean
}

export default function BookPage() {
  const supabase = createClient()
  
  const [step, setStep] = useState(1)
  const [locations, setLocations] = useState<Location[]>([])
  const [offerings, setOfferings] = useState<Offering[]>([])
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [selectedOffering, setSelectedOffering] = useState<Offering | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  // Form data
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [notes, setNotes] = useState('')

  // Fetch locations on mount
  useEffect(() => {
    fetchLocations()
  }, [])

  // Fetch offerings when location is selected
  useEffect(() => {
    if (selectedLocation) {
      fetchOfferings(selectedLocation.id)
    }
  }, [selectedLocation])

  // Fetch availability when date/offering changes
  useEffect(() => {
    if (selectedOffering && selectedLocation && selectedDate) {
      fetchAvailability()
    }
  }, [selectedOffering, selectedLocation, selectedDate])

  async function fetchLocations() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('id, name, address')
        .limit(20)
      
      if (error) throw error
      setLocations(data || [])
    } catch (error) {
      console.error('Error fetching locations:', error)
      // Fallback to mock data if API fails
      setLocations([
        { id: '1', name: 'Demo Friseursalon', address: 'Hauptstraße 1, Berlin' }
      ])
    } finally {
      setLoading(false)
    }
  }

  async function fetchOfferings(locationId: string) {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('offerings')
        .select('id, name, description, duration_minutes, price_cents, color')
        .eq('location_id', locationId)
        .eq('is_active', true)
      
      if (error) throw error
      setOfferings(data || [])
    } catch (error) {
      console.error('Error fetching offerings:', error)
      // Fallback
      setOfferings([
        { id: '1', name: 'Haarschnitt', description: 'Waschen, Schneiden, Föhnen', duration_minutes: 45, price_cents: 3500, color: '#3b82f6' },
        { id: '2', name: 'Färben', description: 'Professionelle Coloration', duration_minutes: 120, price_cents: 7500, color: '#8b5cf6' },
        { id: '3', name: 'Styling', description: 'Professionelles Styling', duration_minutes: 30, price_cents: 2500, color: '#ec4899' }
      ])
    } finally {
      setLoading(false)
    }
  }

  async function fetchAvailability() {
    setLoading(true)
    try {
      const dateStr = selectedDate.toISOString().split('T')[0]
      const response = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationId: selectedLocation!.id,
          offeringId: selectedOffering!.id,
          date: dateStr,
        }),
      })
      const data = await response.json()
      
      if (data.slots) {
        setAvailableSlots(data.slots)
      } else {
        // Generate mock slots if API fails
        const mockSlots: TimeSlot[] = []
        for (let hour = 9; hour < 18; hour++) {
          for (let min = 0; min < 60; min += 30) {
            const start = new Date(selectedDate)
            start.setHours(hour, min, 0, 0)
            const end = new Date(start)
            end.setMinutes(end.getMinutes() + (selectedOffering?.duration_minutes || 45))
            
            mockSlots.push({
              startTime: start.toISOString(),
              endTime: end.toISOString(),
              available: Math.random() > 0.3
            })
          }
        }
        setAvailableSlots(mockSlots)
      }
    } catch (error) {
      console.error('Error fetching availability:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit() {
    if (!selectedLocation || !selectedOffering || !selectedSlot || !customerName || !customerEmail) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus')
      return
    }

    setSubmitting(true)
    try {
      const bookingData = {
        location_id: selectedLocation.id,
        offering_id: selectedOffering.id,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone || null,
        start_time: selectedSlot.startTime,
        end_time: selectedSlot.endTime,
        status: 'pending' as const,
        notes: notes || null
      }
      
      const { error } = await supabase.from('bookings').insert(bookingData as any)

      if (error) throw error

      toast.success('Buchung erfolgreich! Wir bestätigen per E-Mail.')
      setStep(5) // Success step
    } catch (error) {
      console.error('Error creating booking:', error)
      toast.error('Buchung fehlgeschlagen. Bitte versuchen Sie es erneut.')
    } finally {
      setSubmitting(false)
    }
  }

  function formatPrice(cents: number) {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(cents / 100)
  }

  function formatTime(isoString: string) {
    return new Date(isoString).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
  }

  // Week days for calendar
  const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
  const today = new Date()
  const weekStart = new Date(selectedDate)
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Termin buchen
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Wählen Sie einen Termin für Ihren Besuch
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500 dark:bg-gray-700'}
              `}>
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 4 && (
                <div className={`w-12 h-0.5 ${step > s ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Location Selection */}
        {step === 1 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">1. Standort auswählen</h2>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Laden...</div>
            ) : (
              <div className="space-y-3">
                {locations.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => { setSelectedLocation(loc); setStep(2) }}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all hover:border-blue-500 ${
                      selectedLocation?.id === loc.id 
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-medium dark:text-white">{loc.name}</div>
                        <div className="text-sm text-gray-500">{loc.address}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Service Selection */}
        {step === 2 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <button 
              onClick={() => setStep(1)}
              className="flex items-center gap-1 text-gray-500 mb-4 hover:text-gray-700"
            >
              <ChevronLeft className="w-4 h-4" /> Zurück
            </button>
            <h2 className="text-xl font-semibold mb-4 dark:text-white">2. Leistung auswählen</h2>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Laden...</div>
            ) : (
              <div className="space-y-3">
                {offerings.map((offering) => (
                  <button
                    key={offering.id}
                    onClick={() => { setSelectedOffering(offering); setStep(3) }}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all hover:border-blue-500 ${
                      selectedOffering?.id === offering.id 
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: offering.color }}
                        />
                        <div>
                          <div className="font-medium dark:text-white">{offering.name}</div>
                          <div className="text-sm text-gray-500">{offering.description}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold dark:text-white">{formatPrice(offering.price_cents)}</div>
                        <div className="text-sm text-gray-500">{offering.duration_minutes} Min.</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Date & Time Selection */}
        {step === 3 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <button 
              onClick={() => setStep(2)}
              className="flex items-center gap-1 text-gray-500 mb-4 hover:text-gray-700"
            >
              <ChevronLeft className="w-4 h-4" /> Zurück
            </button>
            <h2 className="text-xl font-semibold mb-4 dark:text-white">3. Datum & Uhrzeit</h2>
            
            {/* Simple Date Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={() => {
                  const newDate = new Date(selectedDate)
                  newDate.setDate(newDate.getDate() - 1)
                  if (newDate >= today) setSelectedDate(newDate)
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <ChevronLeft className="w-5 h-5 dark:text-white" />
              </button>
              <span className="font-medium dark:text-white">
                {selectedDate.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
              <button 
                onClick={() => {
                  const newDate = new Date(selectedDate)
                  newDate.setDate(newDate.getDate() + 1)
                  setSelectedDate(newDate)
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <ChevronRight className="w-5 h-5 dark:text-white" />
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-500">Verfügbarkeit wird geladen...</div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {availableSlots
                  .filter(slot => slot.available)
                  .map((slot, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setSelectedSlot(slot); setStep(4) }}
                      className={`p-2 rounded-lg text-sm font-medium transition-all ${
                        selectedSlot?.startTime === slot.startTime
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-900'
                      }`}
                    >
                      {formatTime(slot.startTime)}
                    </button>
                  ))}
                {availableSlots.filter(s => s.available).length === 0 && (
                  <div className="col-span-full text-center py-4 text-gray-500">
                    Keine freien Termine für dieses Datum
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Customer Details */}
        {step === 4 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <button 
              onClick={() => setStep(3)}
              className="flex items-center gap-1 text-gray-500 mb-4 hover:text-gray-700"
            >
              <ChevronLeft className="w-4 h-4" /> Zurück
            </button>
            <h2 className="text-xl font-semibold mb-4 dark:text-white">4. Ihre Daten</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">
                  Name *
                </label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Max Mustermann"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">
                  E-Mail *
                </label>
                <Input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="max@example.de"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">
                  Telefon (optional)
                </label>
                <Input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+49 123 456789"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">
                  Anmerkungen (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Besondere Wünsche..."
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
                  rows={3}
                />
              </div>

              {/* Booking Summary */}
              <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 mt-4">
                <h3 className="font-medium mb-2 dark:text-white">Zusammenfassung</h3>
                <div className="text-sm space-y-1 text-gray-600 dark:text-gray-300">
                  <p><span className="font-medium">Standort:</span> {selectedLocation?.name}</p>
                  <p><span className="font-medium">Leistung:</span> {selectedOffering?.name}</p>
                  <p><span className="font-medium">Datum:</span> {selectedDate.toLocaleDateString('de-DE')}</p>
                  <p><span className="font-medium">Uhrzeit:</span> {selectedSlot && formatTime(selectedSlot.startTime)}</p>
                  <p><span className="font-medium">Preis:</span> {selectedOffering && formatPrice(selectedOffering.price_cents)}</p>
                </div>
              </div>

              <Button 
                onClick={handleSubmit}
                disabled={submitting || !customerName || !customerEmail}
                className="w-full"
              >
                {submitting ? 'Wird gebucht...' : 'Termin buchen'}
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Success */}
        {step === 5 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2 dark:text-white">Buchung erfolgreich!</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Vielen Dank für Ihre Buchung. Sie erhalten in Kürze eine Bestätigung per E-Mail.
            </p>
            <Button onClick={() => window.location.reload()}>
              Neuen Termin buchen
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
