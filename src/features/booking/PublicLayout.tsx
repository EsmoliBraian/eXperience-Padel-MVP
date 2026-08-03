import { useEffect, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useSettingsStore } from '@/store/settingsStore'
import { useCourtsStore } from '@/store/courtsStore'
import { useReservationsStore } from '@/store/reservationsStore'
import { useTournamentsStore } from '@/store/tournamentsStore'
import { useSlidesStore } from '@/store/slidesStore'
import { useClosedDatesStore } from '@/store/closedDatesStore'
import { useRankingCategoriesStore } from '@/store/rankingCategoriesStore'
import { useRankingStore } from '@/store/rankingStore'
import { SiteHeader } from '@/components/site/SiteHeader'
import { SiteFooter } from '@/components/site/SiteFooter'

export function PublicLayout() {
  const [status, setStatus] = useState<'loading' | 'found' | 'not-found'>('loading')
  const unsubscribeRef = useRef<() => void>(() => {})

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    useSettingsStore.getState().reset()

    useSettingsStore
      .getState()
      .fetchDefaultSettings()
      .then((found) => {
        if (cancelled) return
        if (!found) {
          setStatus('not-found')
          return
        }
        Promise.all([
          useCourtsStore.getState().fetchCourts(),
          useReservationsStore.getState().fetchReservations(),
          useTournamentsStore.getState().fetchTournaments(),
          useSlidesStore.getState().fetchSlides(),
          useClosedDatesStore.getState().fetchClosedDates(),
          useRankingCategoriesStore.getState().fetchCategories(),
          useRankingStore.getState().fetchEntries(),
        ]).then(() => {
          if (cancelled) return
          unsubscribeRef.current = useReservationsStore.getState().subscribeToChanges()
          setStatus('found')
        })
      })

    return () => {
      cancelled = true
      unsubscribeRef.current()
      unsubscribeRef.current = () => {}
    }
  }, [])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-400">
        Cargando...
      </div>
    )
  }
  if (status === 'not-found') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 text-gray-400">
        <p className="text-lg text-gray-200">El club todavia no esta configurado</p>
        <p className="text-sm">Volve a intentarlo en unos minutos.</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="flex-1">
        <Outlet />
      </div>
      <SiteFooter />
    </div>
  )
}
