import { useEffect, useState, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAdminAuthStore } from '@/store/adminAuthStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useCourtsStore } from '@/store/courtsStore'
import { useReservationsStore } from '@/store/reservationsStore'
import { useProductsStore } from '@/store/productsStore'
import { useSalesStore } from '@/store/salesStore'
import { useTournamentsStore } from '@/store/tournamentsStore'
import { useSlidesStore } from '@/store/slidesStore'
import { useClosedDatesStore } from '@/store/closedDatesStore'
import { useCategoriesStore } from '@/store/categoriesStore'

function AdminFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 text-gray-400">
      Cargando...
    </div>
  )
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const authInitialized = useAdminAuthStore((s) => s.initialized)
  const isAuthenticated = useAdminAuthStore((s) => s.isAuthenticated)
  const session = useAdminAuthStore((s) => s.session)
  const venueId = useSettingsStore((s) => s.id)

  const [venueResolved, setVenueResolved] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !session) return
    setVenueResolved(false)
    useSettingsStore
      .getState()
      .fetchSettingsForOwner(session.user.id)
      .then(() => setVenueResolved(true))
  }, [isAuthenticated, session])

  useEffect(() => {
    if (!venueResolved || !venueId) return
    setHydrated(false)
    Promise.all([
      useCourtsStore.getState().fetchCourts(),
      useReservationsStore.getState().fetchReservations(),
      useProductsStore.getState().fetchProducts(),
      useSalesStore.getState().fetchSales(),
      useTournamentsStore.getState().fetchTournaments(),
      useSlidesStore.getState().fetchSlides(),
      useClosedDatesStore.getState().fetchClosedDates(),
      useCategoriesStore.getState().fetchCategories(),
    ]).then(() => setHydrated(true))

    const unsubscribeReservations = useReservationsStore.getState().subscribeToChanges()
    return () => {
      unsubscribeReservations()
    }
  }, [venueResolved, venueId])

  if (!authInitialized) return <AdminFallback />
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />
  if (!venueResolved) return <AdminFallback />
  if (!venueId) return <Navigate to="/admin/setup" replace />
  if (!hydrated) return <AdminFallback />

  return <>{children}</>
}
