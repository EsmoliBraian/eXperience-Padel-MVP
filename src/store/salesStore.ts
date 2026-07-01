import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PaymentMethod, Sale, SaleItem } from '@/types'
import { generateId, toDateKey } from '@/lib/format'
import { useProductsStore } from './productsStore'

interface SalesState {
  sales: Sale[]
  addSale: (items: SaleItem[], paymentMethod: PaymentMethod) => void
}

function dateKeyDaysAgo(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return toDateKey(d)
}

const SEED_PAYMENT_METHODS: PaymentMethod[] = ['efectivo', 'transferencia', 'mixto']

function buildSeedSales(): Sale[] {
  const products = useProductsStore.getState().products
  if (products.length === 0) return []

  const sales: Sale[] = []
  for (let daysAgo = 0; daysAgo <= 6; daysAgo++) {
    const date = dateKeyDaysAgo(daysAgo)
    const saleCount = 2 + (daysAgo % 3)

    for (let i = 0; i < saleCount; i++) {
      const product = products[(daysAgo + i) % products.length]
      const qty = 1 + ((daysAgo + i) % 3)
      const items: SaleItem[] = [{ productId: product.id, qty, unitPrice: product.price }]
      sales.push({
        id: generateId(),
        date,
        items,
        total: product.price * qty,
        paymentMethod: SEED_PAYMENT_METHODS[(daysAgo + i) % SEED_PAYMENT_METHODS.length],
      })
    }
  }
  return sales
}

export const useSalesStore = create<SalesState>()(
  persist(
    (set) => ({
      sales: buildSeedSales(),
      addSale: (items, paymentMethod) =>
        set((state) => ({
          sales: [
            ...state.sales,
            {
              id: generateId(),
              date: toDateKey(new Date()),
              items,
              total: items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0),
              paymentMethod,
            },
          ],
        })),
    }),
    { name: 'padel-sales' },
  ),
)
