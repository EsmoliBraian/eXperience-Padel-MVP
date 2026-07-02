import type { ClosedDate, Court, Reservation, Settings } from '@/types'
import { generateTimeLabels } from '@/lib/timeSlots'

export interface TimeSlot {
  time: string
  court: Court
}

export function getAvailableSlots(
  settings: Settings,
  courts: Court[],
  reservations: Reservation[],
  date: string,
  closedDates: ClosedDate[] = [],
): TimeSlot[] {
  if (closedDates.some((c) => c.date === date)) return []

  const dayReservations = reservations.filter(
    (r) => r.date === date && r.status !== 'cancelado',
  )

  const slots: TimeSlot[] = []
  for (const time of generateTimeLabels(settings)) {
    const takenCourtIds = new Set(
      dayReservations.filter((r) => r.time === time).map((r) => r.courtId),
    )
    const court = courts.find((c) => !takenCourtIds.has(c.id))
    if (court) slots.push({ time, court })
  }
  return slots
}
