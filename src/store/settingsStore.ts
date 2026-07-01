import { create } from 'zustand'
import { supabase } from '@/lib/supabaseClient'
import type { Settings } from '@/types'

interface SettingsRow {
  id: string
  venue_name: string
  whatsapp_phone: string
  price_per_player: number
  price_full_court: number
  open_hour: number
  close_hour: number
}

function fromRow(row: SettingsRow): Settings {
  return {
    venueName: row.venue_name,
    whatsappPhone: row.whatsapp_phone,
    pricePerPlayer: row.price_per_player,
    priceFullCourt: row.price_full_court,
    openHour: row.open_hour,
    closeHour: row.close_hour,
  }
}

const defaultSettings: Settings = {
  venueName: '',
  whatsappPhone: '',
  pricePerPlayer: 0,
  priceFullCourt: 0,
  openHour: 8,
  closeHour: 23,
}

interface SettingsState extends Settings {
  id: string | null
  loading: boolean
  fetchSettings: () => Promise<void>
  updateSettings: (patch: Partial<Settings>) => Promise<void>
}

export const useSettingsStore = create<SettingsState>()((set, get) => ({
  ...defaultSettings,
  id: null,
  loading: false,
  fetchSettings: async () => {
    set({ loading: true })
    const { data, error } = await supabase.from('settings').select('*').limit(1).single()
    if (!error && data) set({ ...fromRow(data), id: data.id })
    set({ loading: false })
  },
  updateSettings: async (patch) => {
    const { id } = get()
    if (!id) return
    const row: Partial<SettingsRow> = {}
    if (patch.venueName !== undefined) row.venue_name = patch.venueName
    if (patch.whatsappPhone !== undefined) row.whatsapp_phone = patch.whatsappPhone
    if (patch.pricePerPlayer !== undefined) row.price_per_player = patch.pricePerPlayer
    if (patch.priceFullCourt !== undefined) row.price_full_court = patch.priceFullCourt
    if (patch.openHour !== undefined) row.open_hour = patch.openHour
    if (patch.closeHour !== undefined) row.close_hour = patch.closeHour

    const { error } = await supabase.from('settings').update(row).eq('id', id)
    if (!error) set({ ...patch })
  },
}))
