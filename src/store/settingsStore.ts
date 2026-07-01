import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Settings } from '@/types'

interface SettingsState extends Settings {
  updateSettings: (patch: Partial<Settings>) => void
}

const initialSettings: Settings = {
  venueName: 'Padel Center',
  whatsappPhone: '5491122334455',
  pricePerPlayer: 2200,
  priceFullCourt: 8000,
  openHour: 8,
  closeHour: 23,
  courts: [
    { id: 'c1', name: 'Cancha 1' },
    { id: 'c2', name: 'Cancha 2' },
    { id: 'c3', name: 'Cancha 3' },
    { id: 'c4', name: 'Cancha 4' },
  ],
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...initialSettings,
      updateSettings: (patch) => set((state) => ({ ...state, ...patch })),
    }),
    { name: 'padel-settings' },
  ),
)
