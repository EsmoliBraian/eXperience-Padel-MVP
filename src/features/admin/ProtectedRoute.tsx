import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAdminAuthStore } from '@/store/adminAuthStore'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const initialized = useAdminAuthStore((s) => s.initialized)
  const isAuthenticated = useAdminAuthStore((s) => s.isAuthenticated)

  if (!initialized) {
    return <div className="flex min-h-screen items-center justify-center bg-gray-950 text-gray-400">Cargando...</div>
  }
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />
  return <>{children}</>
}
