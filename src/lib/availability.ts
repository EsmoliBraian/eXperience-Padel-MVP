import type { ClosedDate, Court, Reservation, Settings } from '@/types'
import { generateTimeLabels } from '@/lib/timeSlots'

export interface TimeSlot {
  time: string
  court: Court
}

export interface TimeSlotStatus {
  time: string
  court: Court | null
}

export function getTimeSlotsWithStatus(
  settings: Settings,
  courts: Court[],
  reservations: Reservation[],
  date: string,
  closedDates: ClosedDate[] = [],
): TimeSlotStatus[] {
  if (closedDates.some((c) => c.date === date)) return []

  const dayReservations = reservations.filter(
    (r) => r.date === date && r.status !== 'cancelado',
  )

  return generateTimeLabels(settings).map((time) => {
    const takenCourtIds = new Set(
      dayReservations.filter((r) => r.time === time).map((r) => r.courtId),
    )
    const court = courts.find((c) => !takenCourtIds.has(c.id)) ?? null
    return { time, court }
  })
}

export function getAvailableSlots(
  settings: Settings,
  courts: Court[],
  reservations: Reservation[],
  date: string,
  closedDates: ClosedDate[] = [],
): TimeSlot[] {
  return getTimeSlotsWithStatus(settings, courts, reservations, date, closedDates)
    .filter((slot): slot is { time: string; court: Court } => slot.court !== null)
}
