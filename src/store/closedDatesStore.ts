import { create } from 'zustand'
import { supabase } from '@/lib/supabaseClient'
import type { ClosedDate } from '@/types'

interface ClosedDateRow {
  id: string
  date: string
  reason: string | null
}

function fromRow(row: ClosedDateRow): ClosedDate {
  return { id: row.id, date: row.date, reason: row.reason ?? undefined }
}

interface ClosedDatesState {
  closedDates: ClosedDate[]
  loading: boolean
  fetchClosedDates: () => Promise<void>
  addClosedDate: (date: string, reason?: string) => Promise<string | null>
  deleteClosedDate: (id: string) => Promise<string | null>
}

export const useClosedDatesStore = create<ClosedDatesState>()((set, get) => ({
  closedDates: [],
  loading: false,
  fetchClosedDates: async () => {
    set({ loading: true })
    const { data, error } = await supabase.from('closed_dates').select('*').order('date')
    if (!error && data) set({ closedDates: data.map(fromRow) })
    set({ loading: false })
  },
  addClosedDate: async (date, reason) => {
    const { data, error } = await supabase
      .from('closed_dates')
      .insert({ date, reason: reason || null })
      .select()
      .single()
    if (error) return error.message
    set({ closedDates: [...get().closedDates, fromRow(data)].sort((a, b) => a.date.localeCompare(b.date)) })
    return null
  },
  deleteClosedDate: async (id) => {
    const { error } = await supabase.from('closed_dates').delete().eq('id', id)
    if (error) return error.message
    set({ closedDates: get().closedDates.filter((c) => c.id !== id) })
    return null
  },
}))
