import { create } from 'zustand'
import { supabase } from '@/lib/supabaseClient'
import type { Court } from '@/types'

interface CourtsState {
  courts: Court[]
  loading: boolean
  fetchCourts: () => Promise<void>
  addCourt: (name: string) => Promise<void>
  updateCourt: (id: string, name: string) => Promise<void>
  deleteCourt: (id: string) => Promise<void>
}

export const useCourtsStore = create<CourtsState>()((set, get) => ({
  courts: [],
  loading: false,
  fetchCourts: async () => {
    set({ loading: true })
    const { data, error } = await supabase.from('courts').select('id, name').order('name')
    if (!error && data) set({ courts: data })
    set({ loading: false })
  },
  addCourt: async (name) => {
    const { data, error } = await supabase.from('courts').insert({ name }).select().single()
    if (!error && data) set({ courts: [...get().courts, data] })
  },
  updateCourt: async (id, name) => {
    const { error } = await supabase.from('courts').update({ name }).eq('id', id)
    if (!error) {
      set({ courts: get().courts.map((c) => (c.id === id ? { ...c, name } : c)) })
    }
  },
  deleteCourt: async (id) => {
    const { error } = await supabase.from('courts').delete().eq('id', id)
    if (!error) set({ courts: get().courts.filter((c) => c.id !== id) })
  },
}))
