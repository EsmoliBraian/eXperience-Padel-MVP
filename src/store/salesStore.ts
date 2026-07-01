import { create } from 'zustand'
import { supabase } from '@/lib/supabaseClient'
import type { PaymentMethod, Sale, SaleItem } from '@/types'
import { toDateKey } from '@/lib/format'

interface SaleItemRow {
  product_id: string
  qty: number
  unit_price: number
}

interface SaleRow {
  id: string
  date: string
  total: number
  payment_method: PaymentMethod
  sale_items: SaleItemRow[]
}

function fromRow(row: SaleRow): Sale {
  return {
    id: row.id,
    date: row.date,
    total: row.total,
    paymentMethod: row.payment_method,
    items: row.sale_items.map((item) => ({
      productId: item.product_id,
      qty: item.qty,
      unitPrice: item.unit_price,
    })),
  }
}

interface SalesState {
  sales: Sale[]
  loading: boolean
  fetchSales: () => Promise<void>
  addSale: (items: SaleItem[], paymentMethod: PaymentMethod) => Promise<void>
}

export const useSalesStore = create<SalesState>()((set, get) => ({
  sales: [],
  loading: false,
  fetchSales: async () => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('sales')
      .select('*, sale_items(*)')
      .order('date')
    if (!error && data) set({ sales: data.map(fromRow) })
    set({ loading: false })
  },
  addSale: async (items, paymentMethod) => {
    const total = items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0)
    const date = toDateKey(new Date())

    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert({ date, total, payment_method: paymentMethod })
      .select()
      .single()
    if (saleError || !sale) return

    const { error: itemsError } = await supabase.from('sale_items').insert(
      items.map((item) => ({
        sale_id: sale.id,
        product_id: item.productId,
        qty: item.qty,
        unit_price: item.unitPrice,
      })),
    )
    if (itemsError) return

    set({
      sales: [...get().sales, { id: sale.id, date, total, paymentMethod, items }],
    })
  },
}))
