import { create } from 'zustand'
import { supabase } from '@/lib/supabaseClient'
import type { PaymentMethod, PaymentStatus, Sale, SaleItem, SalePayment } from '@/types'
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
  payment_method: PaymentMethod | null
  payment_status: PaymentStatus
  customer_name: string | null
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
    paymentStatus: row.payment_status,
    customerName: row.customer_name ?? undefined,
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
    paymentMethod: PaymentMethod | null,
    payments: SalePayment[],
    reservationId?: string,
    customerName?: string,
    reservationFee?: number,
  ) => Promise<string | null>
  settleSale: (
    id: string,
    paymentMethod: PaymentMethod,
    payments: SalePayment[],
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
  addSale: async (items, paymentMethod, payments, reservationId, customerName, reservationFee = 0) => {
    const itemsTotal = items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0)
    const total = itemsTotal + reservationFee
    const date = toDateKey(new Date())
    const paymentStatus: PaymentStatus = paymentMethod ? 'pagado' : 'adeuda'

    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert({
        date,
        total,
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        customer_name: customerName ?? null,
        reservation_id: reservationId ?? null,
      })
      .select()
      .single()
    if (saleError || !sale) return saleError?.message ?? 'No se pudo registrar la venta.'

    if (items.length > 0) {
      const { error: itemsError } = await supabase.from('sale_items').insert(
        items.map((item) => ({
          sale_id: sale.id,
          product_id: item.productId,
          qty: item.qty,
          unit_price: item.unitPrice,
        })),
      )
      if (itemsError) return itemsError.message
    }

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
          paymentStatus,
          customerName,
          reservationId,
          items,
          payments: paymentMethod === 'mixto' ? payments : [],
        },
      ],
    })
    return null
  },
  settleSale: async (id, paymentMethod, payments) => {
    const { error } = await supabase
      .from('sales')
      .update({ payment_status: 'pagado', payment_method: paymentMethod })
      .eq('id', id)
    if (error) return error.message

    if (paymentMethod === 'mixto' && payments.length > 0) {
      const { error: paymentsError } = await supabase.from('sale_payments').insert(
        payments.map((p) => ({ sale_id: id, method: p.method, amount: p.amount })),
      )
      if (paymentsError) return paymentsError.message
    }

    set({
      sales: get().sales.map((s) =>
        s.id === id
          ? {
              ...s,
              paymentStatus: 'pagado',
              paymentMethod,
              payments: paymentMethod === 'mixto' ? payments : [],
            }
          : s,
      ),
    })
    return null
  },
}))
