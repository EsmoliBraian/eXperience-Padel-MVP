import type { ClosedDate, Court, FixedSlot, Reservation, Settings } from '@/types'
import { generateTimeLabels } from '@/lib/timeSlots'
import { fromDateKey } from '@/lib/format'

export interface TimeSlot {
  time: string
  court: Court
}

export interface TimeSlotStatus {
  time: string
  court: Court | null
}

type ScheduleSettings = Pick<Settings, 'openHour' | 'closeHour' | 'slotDurationMinutes'>

export function getTimeSlotsWithStatus(
  settings: ScheduleSettings,
  courts: Court[],
  reservations: Reservation[],
  date: string,
  closedDates: ClosedDate[] = [],
  fixedSlots: FixedSlot[] = [],
): TimeSlotStatus[] {
  if (closedDates.some((c) => c.date === date)) return []

  const dayReservations = reservations.filter(
    (r) => r.date === date && r.status !== 'cancelado',
  )
  const weekday = fromDateKey(date).getDay()
  const dayFixedSlots = fixedSlots.filter((f) => f.weekday === weekday)

  return generateTimeLabels(settings).map((time) => {
    const takenCourtIds = new Set(
      dayReservations.filter((r) => r.time === time).map((r) => r.courtId),
    )
    for (const f of dayFixedSlots) {
      if (f.time === time) takenCourtIds.add(f.courtId)
    }
    const court = courts.find((c) => !takenCourtIds.has(c.id)) ?? null
    return { time, court }
  })
}

export function getAvailableSlots(
  settings: ScheduleSettings,
  courts: Court[],
  reservations: Reservation[],
  date: string,
  closedDates: ClosedDate[] = [],
  fixedSlots: FixedSlot[] = [],
): TimeSlot[] {
  return getTimeSlotsWithStatus(settings, courts, reservations, date, closedDates, fixedSlots)
    .filter((slot): slot is { time: string; court: Court } => slot.court !== null)
}

export interface CourtTimeSlot {
  time: string
  available: boolean
}

export function getCourtTimeSlots(
  settings: ScheduleSettings,
  court: Court,
  reservations: Reservation[],
  date: string,
  closedDates: ClosedDate[] = [],
  fixedSlots: FixedSlot[] = [],
): CourtTimeSlot[] {
  if (closedDates.some((c) => c.date === date)) return []

  const weekday = fromDateKey(date).getDay()
  const takenTimes = new Set(
    reservations
      .filter((r) => r.date === date && r.status !== 'cancelado' && r.courtId === court.id)
      .map((r) => r.time),
  )
  for (const f of fixedSlots) {
    if (f.courtId === court.id && f.weekday === weekday) takenTimes.add(f.time)
  }

  return generateTimeLabels(settings).map((time) => ({ time, available: !takenTimes.has(time) }))
}
