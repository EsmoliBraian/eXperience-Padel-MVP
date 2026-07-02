import { Link } from 'react-router-dom'
import { useSettingsStore } from '@/store/settingsStore'
import { useTournamentsStore } from '@/store/tournamentsStore'
import { useSlidesStore } from '@/store/slidesStore'
import { formatLongDate, fromDateKey } from '@/lib/format'

export function UserHomePage() {
  const venueName = useSettingsStore((s) => s.venueName)
  const tournaments = useTournamentsStore((s) => s.tournaments).filter((t) => t.published)
  const slides = useSlidesStore((s) => s.slides).filter((s) => s.published)
  const hero = [...slides].sort((a, b) => a.order - b.order)[0]

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col bg-gray-950 p-5">
      <div className="mb-1 flex items-center gap-2 text-sm text-gray-400">
        <span className="h-2 w-2 rounded-full bg-primary-500" />
        {venueName}
      </div>

      {hero?.imageUrl && (
        <img
          src={hero.imageUrl}
          alt=""
          className="mt-4 h-40 w-full rounded-xl object-cover"
        />
      )}

      <h1 className="mt-4 text-2xl font-semibold text-gray-50">
        {hero?.title ?? 'Play Padel'}
      </h1>
      <p className="mt-2 text-sm text-gray-400">
        {hero?.subtitle ?? 'Reserva tu turno facil y rapido'}
      </p>

      <Link
        to="/reservar"
        className="mt-6 rounded-lg bg-primary-500 py-3 text-center font-medium text-gray-950 shadow-glow-primary hover:bg-primary-400"
      >
        VER HORARIOS
      </Link>

      <div className="mt-8">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-300">Proximos torneos</h2>
          <span className="text-xs text-primary-500">VER TODOS</span>
        </div>

        <div className="space-y-2">
          {tournaments.slice(0, 3).map((t) => (
            <div
              key={t.id}
              className="rounded-lg border border-gray-800 bg-gray-900 p-3"
            >
              <p className="text-sm font-medium text-gray-100">{t.name}</p>
              <p className="text-xs text-gray-400">{formatLongDate(fromDateKey(t.date))}</p>
            </div>
          ))}
          {tournaments.length === 0 && (
            <p className="text-sm text-gray-500">No hay torneos programados.</p>
          )}
        </div>
      </div>
    </div>
  )
}
