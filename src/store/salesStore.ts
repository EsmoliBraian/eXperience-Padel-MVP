import { create } from 'zustand'
import { supabase } from '@/lib/supabaseClient'
import type { PaymentMethod, Sale, SaleItem, SalePayment } from '@/types'
import { toDateKey } from '@/lib/format'

interface SaleItemRow {
  product_id: string
  qty: number
  unit_price: number
}

interface SalePaymentRow {
  method: SalePayment['method']
  amount: number
}

interface SaleRow {
  id: string
  date: string
  total: number
  payment_method: PaymentMethod
  reservation_id: string | null
  sale_items: SaleItemRow[]
  sale_payments: SalePaymentRow[]
}

function fromRow(row: SaleRow): Sale {
  return {
    id: row.id,
    date: row.date,
    total: row.total,
    paymentMethod: row.payment_method,
    reservationId: row.reservation_id ?? undefined,
    items: row.sale_items.map((item) => ({
      productId: item.product_id,
      qty: item.qty,
      unitPrice: item.unit_price,
    })),
    payments: row.sale_payments.map((p) => ({ method: p.method, amount: p.amount })),
  }
}

interface SalesState {
  sales: Sale[]
  loading: boolean
  fetchSales: () => Promise<void>
  addSale: (
    items: SaleItem[],
    paymentMethod: PaymentMethod,
    payments: SalePayment[],
    reservationId?: string,
  ) => Promise<string | null>
}

export const useSalesStore = create<SalesState>()((set, get) => ({
  sales: [],
  loading: false,
  fetchSales: async () => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('sales')
      .select('*, sale_items(*), sale_payments(*)')
      .order('date')
    if (!error && data) set({ sales: data.map(fromRow) })
    set({ loading: false })
  },
  addSale: async (items, paymentMethod, payments, reservationId) => {
    const total = items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0)
    const date = toDateKey(new Date())

    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert({
        date,
        total,
        payment_method: paymentMethod,
        reservation_id: reservationId ?? null,
      })
      .select()
      .single()
    if (saleError || !sale) return saleError?.message ?? 'No se pudo registrar la venta.'

    const { error: itemsError } = await supabase.from('sale_items').insert(
      items.map((item) => ({
        sale_id: sale.id,
        product_id: item.productId,
        qty: item.qty,
        unit_price: item.unitPrice,
      })),
    )
    if (itemsError) return itemsError.message

    if (paymentMethod === 'mixto' && payments.length > 0) {
      const { error: paymentsError } = await supabase.from('sale_payments').insert(
        payments.map((p) => ({ sale_id: sale.id, method: p.method, amount: p.amount })),
      )
      if (paymentsError) return paymentsError.message
    }

    set({
      sales: [
        ...get().sales,
        {
          id: sale.id,
          date,
          total,
          paymentMethod,
          reservationId,
          items,
          payments: paymentMethod === 'mixto' ? payments : [],
        },
      ],
    })
    return null
  },
}))
