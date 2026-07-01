import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AdminAuthState {
  isAuthenticated: boolean
  login: (user: string, pass: string) => boolean
  logout: () => void
}

const ADMIN_USER = import.meta.env.VITE_ADMIN_USER ?? 'admin'
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? 'admin123'

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      login: (user, pass) => {
        const ok = user === ADMIN_USER && pass === ADMIN_PASSWORD
        if (ok) set({ isAuthenticated: true })
        return ok
      },
      logout: () => set({ isAuthenticated: false }),
    }),
    { name: 'padel-admin-auth' },
  ),
)
