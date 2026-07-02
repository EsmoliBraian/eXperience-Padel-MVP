import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'

interface AdminAuthState {
  session: Session | null
  initialized: boolean
  isAuthenticated: boolean
  init: () => void
  login: (email: string, password: string) => Promise<string | null>
  signUp: (email: string, password: string) => Promise<{ error: string | null; hasSession: boolean }>
  logout: () => Promise<void>
}

export const useAdminAuthStore = create<AdminAuthState>()((set) => ({
  session: null,
  initialized: false,
  isAuthenticated: false,
  init: () => {
    supabase.auth.getSession().then(({ data }) => {
      set({ session: data.session, isAuthenticated: !!data.session, initialized: true })
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, isAuthenticated: !!session })
    })
  },
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return error.message
    set({ session: data.session, isAuthenticated: !!data.session })
    return null
  },
  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { error: error.message, hasSession: false }
    const hasSession = !!data.session
    if (hasSession) set({ session: data.session, isAuthenticated: true })
    return { error: null, hasSession }
  },
  logout: async () => {
    await supabase.auth.signOut()
    set({ session: null, isAuthenticated: false })
  },
}))
