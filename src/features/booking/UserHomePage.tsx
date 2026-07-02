import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSettingsStore } from '@/store/settingsStore'
import { useTournamentsStore } from '@/store/tournamentsStore'
import { useSlidesStore } from '@/store/slidesStore'
import { TournamentListItem } from '@/components/TournamentListItem'

const HERO_ROTATE_MS = 5000

export function UserHomePage() {
  const venueName = useSettingsStore((s) => s.venueName)
  const whatsappPhone = useSettingsStore((s) => s.whatsappPhone)
  const tournaments = useTournamentsStore((s) => s.tournaments).filter((t) => t.published)
  const slides = useSlidesStore((s) => s.slides).filter((s) => s.published)

  const sortedSlides = useMemo(() => [...slides].sort((a, b) => a.order - b.order), [slides])
  const [heroIndex, setHeroIndex] = useState(0)

  useEffect(() => {
    if (sortedSlides.length <= 1) return
    const interval = setInterval(() => {
      setHeroIndex((i) => (i + 1) % sortedSlides.length)
    }, HERO_ROTATE_MS)
    return () => clearInterval(interval)
  }, [sortedSlides.length])

  const hero = sortedSlides.length > 0 ? sortedSlides[heroIndex % sortedSlides.length] : undefined

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col bg-gray-950 p-5">
      <div className="mb-1 flex items-center gap-2 text-sm text-gray-400">
        <span className="h-2 w-2 rounded-full bg-primary-500" />
        {venueName}
      </div>

      {hero?.imageUrl ? (
        <div className="relative mt-4 h-40 w-full overflow-hidden rounded-xl">
          <img src={hero.imageUrl} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4">
            <h1 className="text-2xl font-semibold text-white">{hero.title}</h1>
            <p className="mt-1 text-sm text-white/90">{hero.subtitle}</p>
          </div>
        </div>
      ) : (
        <>
          <h1 className="mt-4 text-2xl font-semibold text-gray-50">
            {hero?.title ?? 'Play Padel'}
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            {hero?.subtitle ?? 'Reserva tu turno facil y rapido'}
          </p>
        </>
      )}

      {sortedSlides.length > 1 && (
        <div className="mt-2 flex justify-center gap-1.5">
          {sortedSlides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setHeroIndex(i)}
              aria-label={`Slide ${i + 1}`}
              className={`h-1.5 w-1.5 rounded-full ${
                i === heroIndex % sortedSlides.length ? 'bg-primary-500' : 'bg-gray-700'
              }`}
            />
          ))}
        </div>
      )}

      <Link
        to="/reservar"
        className="mt-6 rounded-lg bg-primary-500 py-3 text-center font-medium text-gray-950 shadow-glow-primary hover:bg-primary-400"
      >
        VER HORARIOS
      </Link>

      <div className="mt-8">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-300">Proximos torneos</h2>
          <Link to="/torneos" className="text-xs text-primary-500 hover:underline">
            VER TODOS
          </Link>
        </div>

        <div className="space-y-2">
          {tournaments.slice(0, 3).map((t) => (
            <TournamentListItem key={t.id} tournament={t} whatsappPhone={whatsappPhone} />
          ))}
          {tournaments.length === 0 && (
            <p className="text-sm text-gray-500">No hay torneos programados.</p>
          )}
        </div>
      </div>
    </div>
  )
}
