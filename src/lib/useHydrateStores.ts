import { useEffect } from 'react'
import { useSettingsStore } from '@/store/settingsStore'
import { useCourtsStore } from '@/store/courtsStore'
import { useReservationsStore } from '@/store/reservationsStore'
import { useProductsStore } from '@/store/productsStore'
import { useSalesStore } from '@/store/salesStore'
import { useTournamentsStore } from '@/store/tournamentsStore'
import { useSlidesStore } from '@/store/slidesStore'
import { useClosedDatesStore } from '@/store/closedDatesStore'
import { useAdminAuthStore } from '@/store/adminAuthStore'

export function useHydrateStores() {
  useEffect(() => {
    useSettingsStore.getState().fetchSettings()
    useCourtsStore.getState().fetchCourts()
    useReservationsStore.getState().fetchReservations()
    useProductsStore.getState().fetchProducts()
    useSalesStore.getState().fetchSales()
    useTournamentsStore.getState().fetchTournaments()
    useSlidesStore.getState().fetchSlides()
    useClosedDatesStore.getState().fetchClosedDates()
    useAdminAuthStore.getState().init()

    const unsubscribeReservations = useReservationsStore.getState().subscribeToChanges()
    return () => {
      unsubscribeReservations()
    }
  }, [])
}
