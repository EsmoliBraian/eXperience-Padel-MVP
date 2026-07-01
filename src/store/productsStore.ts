import { create } from 'zustand'
import { supabase } from '@/lib/supabaseClient'
import type { Product } from '@/types'

interface ProductsState {
  products: Product[]
  loading: boolean
  fetchProducts: () => Promise<void>
  addProduct: (product: Omit<Product, 'id'>) => Promise<string | null>
  updateProduct: (id: string, patch: Partial<Omit<Product, 'id'>>) => Promise<string | null>
  deleteProduct: (id: string) => Promise<string | null>
}

export const useProductsStore = create<ProductsState>()((set, get) => ({
  products: [],
  loading: false,
  fetchProducts: async () => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('products')
      .select('id, name, description, price')
      .order('name')
    if (!error && data) set({ products: data })
    set({ loading: false })
  },
  addProduct: async (product) => {
    const { data, error } = await supabase.from('products').insert(product).select().single()
    if (error) return error.message
    set({ products: [...get().products, data] })
    return null
  },
  updateProduct: async (id, patch) => {
    const { error } = await supabase.from('products').update(patch).eq('id', id)
    if (error) return error.message
    set({ products: get().products.map((p) => (p.id === id ? { ...p, ...patch } : p)) })
    return null
  },
  deleteProduct: async (id) => {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) return error.message
    set({ products: get().products.filter((p) => p.id !== id) })
    return null
  },
}))
