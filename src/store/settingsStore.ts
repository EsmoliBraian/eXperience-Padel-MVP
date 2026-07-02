import { create } from 'zustand'
import { supabase } from '@/lib/supabaseClient'
import type { Settings } from '@/types'

interface SettingsRow {
  id: string
  venue_name: string
  whatsapp_phone: string
  default_price: number
  slot_duration_minutes: number
  open_hour: number
  close_hour: number
}

function fromRow(row: SettingsRow): Settings {
  return {
    venueName: row.venue_name,
    whatsappPhone: row.whatsapp_phone,
    defaultPrice: row.default_price,
    slotDurationMinutes: row.slot_duration_minutes,
    openHour: row.open_hour,
    closeHour: row.close_hour,
  }
}

const defaultSettings: Settings = {
  venueName: '',
  whatsappPhone: '',
  defaultPrice: 0,
  slotDurationMinutes: 60,
  openHour: 8,
  closeHour: 23,
}

interface SettingsState extends Settings {
  id: string | null
  loading: boolean
  fetchSettings: () => Promise<void>
  updateSettings: (patch: Partial<Settings>) => Promise<string | null>
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
    if (!id) return 'No se encontro la configuracion.'
    const row: Partial<SettingsRow> = {}
    if (patch.venueName !== undefined) row.venue_name = patch.venueName
    if (patch.whatsappPhone !== undefined) row.whatsapp_phone = patch.whatsappPhone
    if (patch.defaultPrice !== undefined) row.default_price = patch.defaultPrice
    if (patch.slotDurationMinutes !== undefined) row.slot_duration_minutes = patch.slotDurationMinutes
    if (patch.openHour !== undefined) row.open_hour = patch.openHour
    if (patch.closeHour !== undefined) row.close_hour = patch.closeHour

    const { error } = await supabase.from('settings').update(row).eq('id', id)
    if (error) return error.message
    set({ ...patch })
    return null
  },
}))
