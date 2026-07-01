import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '@/types'
import { generateId } from '@/lib/format'

interface ProductsState {
  products: Product[]
  addProduct: (product: Omit<Product, 'id'>) => void
  updateProduct: (id: string, patch: Partial<Omit<Product, 'id'>>) => void
  deleteProduct: (id: string) => void
}

const initialProducts: Product[] = [
  { id: generateId(), name: 'Agua mineral', price: 1500 },
  { id: generateId(), name: 'Gatorade', price: 2000 },
  { id: generateId(), name: 'Grip Wilson', price: 2500 },
  { id: generateId(), name: 'Overgrip Pro', price: 1800 },
]

export const useProductsStore = create<ProductsState>()(
  persist(
    (set) => ({
      products: initialProducts,
      addProduct: (product) =>
        set((state) => ({
          products: [...state.products, { ...product, id: generateId() }],
        })),
      updateProduct: (id, patch) =>
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),
      deleteProduct: (id) =>
        set((state) => ({ products: state.products.filter((p) => p.id !== id) })),
    }),
    { name: 'padel-products' },
  ),
)
