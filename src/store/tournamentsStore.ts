import { create } from 'zustand'
import { supabase } from '@/lib/supabaseClient'
import type { Tournament } from '@/types'

interface TournamentRow {
  id: string
  name: string
  date: string
  description: string
  image_url: string | null
}

function fromRow(row: TournamentRow): Tournament {
  return {
    id: row.id,
    name: row.name,
    date: row.date,
    description: row.description,
    imageUrl: row.image_url ?? undefined,
  }
}

interface TournamentsState {
  tournaments: Tournament[]
  loading: boolean
  fetchTournaments: () => Promise<void>
  addTournament: (tournament: Omit<Tournament, 'id'>) => Promise<void>
  updateTournament: (id: string, patch: Partial<Omit<Tournament, 'id'>>) => Promise<void>
  deleteTournament: (id: string) => Promise<void>
}

export const useTournamentsStore = create<TournamentsState>()((set, get) => ({
  tournaments: [],
  loading: false,
  fetchTournaments: async () => {
    set({ loading: true })
    const { data, error } = await supabase.from('tournaments').select('*').order('date')
    if (!error && data) set({ tournaments: data.map(fromRow) })
    set({ loading: false })
  },
  addTournament: async (tournament) => {
    const { data, error } = await supabase
      .from('tournaments')
      .insert({
        name: tournament.name,
        date: tournament.date,
        description: tournament.description,
        image_url: tournament.imageUrl ?? null,
      })
      .select()
      .single()
    if (!error && data) set({ tournaments: [...get().tournaments, fromRow(data)] })
  },
  updateTournament: async (id, patch) => {
    const row: Partial<TournamentRow> = {}
    if (patch.name !== undefined) row.name = patch.name
    if (patch.date !== undefined) row.date = patch.date
    if (patch.description !== undefined) row.description = patch.description
    if (patch.imageUrl !== undefined) row.image_url = patch.imageUrl ?? null

    const { error } = await supabase.from('tournaments').update(row).eq('id', id)
    if (!error) {
      set({
        tournaments: get().tournaments.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      })
    }
  },
  deleteTournament: async (id) => {
    const { error } = await supabase.from('tournaments').delete().eq('id', id)
    if (!error) set({ tournaments: get().tournaments.filter((t) => t.id !== id) })
  },
}))
