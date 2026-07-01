import { create } from 'zustand'
import { supabase } from '@/lib/supabaseClient'
import type { Debtor } from '@/types'

interface DebtorRow {
  id: string
  customer_name: string
  amount: number
  detail: string
  paid: boolean
}

function fromRow(row: DebtorRow): Debtor {
  return {
    id: row.id,
    customerName: row.customer_name,
    amount: row.amount,
    detail: row.detail,
    paid: row.paid,
  }
}

interface DebtorsState {
  debtors: Debtor[]
  loading: boolean
  fetchDebtors: () => Promise<void>
  addDebtor: (debtor: Omit<Debtor, 'id' | 'paid'>) => Promise<string | null>
  markPaid: (id: string) => Promise<string | null>
  deleteDebtor: (id: string) => Promise<string | null>
}

export const useDebtorsStore = create<DebtorsState>()((set, get) => ({
  debtors: [],
  loading: false,
  fetchDebtors: async () => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('debtors')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) set({ debtors: data.map(fromRow) })
    set({ loading: false })
  },
  addDebtor: async (debtor) => {
    const { data, error } = await supabase
      .from('debtors')
      .insert({
        customer_name: debtor.customerName,
        amount: debtor.amount,
        detail: debtor.detail,
      })
      .select()
      .single()
    if (error) return error.message
    set({ debtors: [fromRow(data), ...get().debtors] })
    return null
  },
  markPaid: async (id) => {
    const { error } = await supabase.from('debtors').update({ paid: true }).eq('id', id)
    if (error) return error.message
    set({ debtors: get().debtors.map((d) => (d.id === id ? { ...d, paid: true } : d)) })
    return null
  },
  deleteDebtor: async (id) => {
    const { error } = await supabase.from('debtors').delete().eq('id', id)
    if (error) return error.message
    set({ debtors: get().debtors.filter((d) => d.id !== id) })
    return null
  },
}))
