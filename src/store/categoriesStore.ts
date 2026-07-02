import { create } from 'zustand'
import { supabase } from '@/lib/supabaseClient'
import type { Category } from '@/types'

interface CategoriesState {
  categories: Category[]
  loading: boolean
  fetchCategories: () => Promise<void>
  addCategory: (name: string) => Promise<string | null>
  updateCategory: (id: string, name: string) => Promise<string | null>
  deleteCategory: (id: string) => Promise<string | null>
}

export const useCategoriesStore = create<CategoriesState>()((set, get) => ({
  categories: [],
  loading: false,
  fetchCategories: async () => {
    set({ loading: true })
    const { data, error } = await supabase.from('categories').select('id, name').order('name')
    if (!error && data) set({ categories: data })
    set({ loading: false })
  },
  addCategory: async (name) => {
    const { data, error } = await supabase.from('categories').insert({ name }).select().single()
    if (error) return error.message
    set({ categories: [...get().categories, data].sort((a, b) => a.name.localeCompare(b.name)) })
    return null
  },
  updateCategory: async (id, name) => {
    const { error } = await supabase.from('categories').update({ name }).eq('id', id)
    if (error) return error.message
    set({
      categories: get()
        .categories.map((c) => (c.id === id ? { ...c, name } : c))
        .sort((a, b) => a.name.localeCompare(b.name)),
    })
    return null
  },
  deleteCategory: async (id) => {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) return error.message
    set({ categories: get().categories.filter((c) => c.id !== id) })
    return null
  },
}))
