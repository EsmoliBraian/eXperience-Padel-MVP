import { create } from 'zustand'
import { supabase } from '@/lib/supabaseClient'
import type { Product } from '@/types'

interface ProductsState {
  products: Product[]
  loading: boolean
  fetchProducts: () => Promise<void>
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>
  updateProduct: (id: string, patch: Partial<Omit<Product, 'id'>>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
}

export const useProductsStore = create<ProductsState>()((set, get) => ({
  products: [],
  loading: false,
  fetchProducts: async () => {
    set({ loading: true })
    const { data, error } = await supabase.from('products').select('id, name, price').order('name')
    if (!error && data) set({ products: data })
    set({ loading: false })
  },
  addProduct: async (product) => {
    const { data, error } = await supabase.from('products').insert(product).select().single()
    if (!error && data) set({ products: [...get().products, data] })
  },
  updateProduct: async (id, patch) => {
    const { error } = await supabase.from('products').update(patch).eq('id', id)
    if (!error) {
      set({ products: get().products.map((p) => (p.id === id ? { ...p, ...patch } : p)) })
    }
  },
  deleteProduct: async (id) => {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (!error) set({ products: get().products.filter((p) => p.id !== id) })
  },
}))
