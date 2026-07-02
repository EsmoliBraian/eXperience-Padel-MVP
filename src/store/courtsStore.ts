import { create } from 'zustand'
import { supabase } from '@/lib/supabaseClient'
import type { Court } from '@/types'

interface CourtsState {
  courts: Court[]
  loading: boolean
  fetchCourts: () => Promise<void>
  addCourt: (name: string, price: number) => Promise<string | null>
  updateCourt: (id: string, patch: Partial<Omit<Court, 'id'>>) => Promise<string | null>
  deleteCourt: (id: string) => Promise<string | null>
}

export const useCourtsStore = create<CourtsState>()((set, get) => ({
  courts: [],
  loading: false,
  fetchCourts: async () => {
    set({ loading: true })
    const { data, error } = await supabase.from('courts').select('id, name, price').order('name')
    if (!error && data) set({ courts: data })
    set({ loading: false })
  },
  addCourt: async (name, price) => {
    const { data, error } = await supabase.from('courts').insert({ name, price }).select().single()
    if (error) return error.message
    set({ courts: [...get().courts, data] })
    return null
  },
  updateCourt: async (id, patch) => {
    const row: { name?: string; price?: number } = {}
    if (patch.name !== undefined) row.name = patch.name
    if (patch.price !== undefined) row.price = patch.price

    const { error } = await supabase.from('courts').update(row).eq('id', id)
    if (error) return error.message
    set({ courts: get().courts.map((c) => (c.id === id ? { ...c, ...patch } : c)) })
    return null
  },
  deleteCourt: async (id) => {
    const { error } = await supabase.from('courts').delete().eq('id', id)
    if (error) return error.message
    set({ courts: get().courts.filter((c) => c.id !== id) })
    return null
  },
}))
