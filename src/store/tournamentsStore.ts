import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Tournament } from '@/types'
import { generateId, nextDays, toDateKey } from '@/lib/format'

interface TournamentsState {
  tournaments: Tournament[]
  addTournament: (tournament: Omit<Tournament, 'id'>) => void
  updateTournament: (id: string, patch: Partial<Omit<Tournament, 'id'>>) => void
  deleteTournament: (id: string) => void
}

const days = nextDays(60)

const initialTournaments: Tournament[] = [
  {
    id: generateId(),
    name: 'Torneo Express',
    date: toDateKey(days[4]),
    description: 'Torneo relámpago de un día, formato eliminación directa.',
  },
  {
    id: generateId(),
    name: 'Torneo Nocturno',
    date: toDateKey(days[10]),
    description: 'Partidos bajo las luces, categorías mixtas.',
  },
  {
    id: generateId(),
    name: 'Torneo Aniversario',
    date: toDateKey(days[18]),
    description: 'Torneo especial por el aniversario del club, con premios.',
  },
]

export const useTournamentsStore = create<TournamentsState>()(
  persist(
    (set) => ({
      tournaments: initialTournaments,
      addTournament: (tournament) =>
        set((state) => ({
          tournaments: [...state.tournaments, { ...tournament, id: generateId() }],
        })),
      updateTournament: (id, patch) =>
        set((state) => ({
          tournaments: state.tournaments.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      deleteTournament: (id) =>
        set((state) => ({ tournaments: state.tournaments.filter((t) => t.id !== id) })),
    }),
    { name: 'padel-tournaments' },
  ),
)
