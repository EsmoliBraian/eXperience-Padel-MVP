import type { Court, Reservation, Settings } from '@/types'

export interface TimeSlot {
  time: string
  court: Court
}

export function getAvailableSlots(
  settings: Settings,
  courts: Court[],
  reservations: Reservation[],
  date: string,
): TimeSlot[] {
  const dayReservations = reservations.filter(
    (r) => r.date === date && r.status !== 'cancelado',
  )

  const slots: TimeSlot[] = []
  for (let hour = settings.openHour; hour < settings.closeHour; hour++) {
    const time = `${String(hour).padStart(2, '0')}:00`
    const takenCourtIds = new Set(
      dayReservations.filter((r) => r.time === time).map((r) => r.courtId),
    )
    const court = courts.find((c) => !takenCourtIds.has(c.id))
    if (court) slots.push({ time, court })
  }
  return slots
}
