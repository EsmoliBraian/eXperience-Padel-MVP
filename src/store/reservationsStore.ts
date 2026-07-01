import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Reservation, ReservationStatus } from '@/types'
import { generateId, toDateKey } from '@/lib/format'

interface ReservationsState {
  reservations: Reservation[]
  addReservation: (reservation: Omit<Reservation, 'id'>) => void
  updateStatus: (id: string, status: ReservationStatus) => void
  deleteReservation: (id: string) => void
}

const SEED_COURT_IDS = ['c1', 'c2', 'c3', 'c4']
const SEED_CUSTOMER_NAMES = ['Juan S.', 'Pablo R.', 'Matias G.', 'Lucia F.', 'Carla M.', 'Diego P.']
const SEED_FULL_COURT_PRICE = 8000

function dateKeyDaysAgo(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return toDateKey(d)
}

function buildSeedReservations(): Reservation[] {
  const reservations: Reservation[] = []
  let nameIndex = 0

  const today = dateKeyDaysAgo(0)
  for (let hour = 9; hour <= 20; hour++) {
    const time = `${String(hour).padStart(2, '0')}:00`
    const courtA = SEED_COURT_IDS[hour % SEED_COURT_IDS.length]
    const courtB = SEED_COURT_IDS[(hour + 2) % SEED_COURT_IDS.length]

    reservations.push({
      id: generateId(),
      courtId: courtA,
      date: today,
      time,
      players: 4,
      status: 'reservado',
      customerName: SEED_CUSTOMER_NAMES[nameIndex++ % SEED_CUSTOMER_NAMES.length],
      createdVia: 'admin',
      priceTotal: SEED_FULL_COURT_PRICE,
    })
    reservations.push({
      id: generateId(),
      courtId: courtB,
      date: today,
      time,
      players: 4,
      status: 'confirmado',
      customerName: SEED_CUSTOMER_NAMES[nameIndex++ % SEED_CUSTOMER_NAMES.length],
      createdVia: 'admin',
      priceTotal: SEED_FULL_COURT_PRICE,
    })
  }

  // Light historical seed for the last 6 days so the 7-day revenue chart has data.
  for (let daysAgo = 1; daysAgo <= 6; daysAgo++) {
    const date = dateKeyDaysAgo(daysAgo)
    const hours = [10, 12, 14, 16, 18, 20]
    for (const hour of hours) {
      const time = `${String(hour).padStart(2, '0')}:00`
      const court = SEED_COURT_IDS[(hour + daysAgo) % SEED_COURT_IDS.length]
      reservations.push({
        id: generateId(),
        courtId: court,
        date,
        time,
        players: 4,
        status: 'confirmado',
        customerName: SEED_CUSTOMER_NAMES[nameIndex++ % SEED_CUSTOMER_NAMES.length],
        createdVia: 'admin',
        priceTotal: SEED_FULL_COURT_PRICE,
      })
    }
  }

  return reservations
}

export const useReservationsStore = create<ReservationsState>()(
  persist(
    (set) => ({
      reservations: buildSeedReservations(),
      addReservation: (reservation) =>
        set((state) => ({
          reservations: [...state.reservations, { ...reservation, id: generateId() }],
        })),
      updateStatus: (id, status) =>
        set((state) => ({
          reservations: state.reservations.map((r) => (r.id === id ? { ...r, status } : r)),
        })),
      deleteReservation: (id) =>
        set((state) => ({
          reservations: state.reservations.filter((r) => r.id !== id),
        })),
    }),
    { name: 'padel-reservations' },
  ),
)
