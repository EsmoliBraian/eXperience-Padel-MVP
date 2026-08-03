import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSettingsStore } from '@/store/settingsStore'
import { useCourtsStore } from '@/store/courtsStore'
import { useTournamentsStore } from '@/store/tournamentsStore'
import { useSlidesStore } from '@/store/slidesStore'
import { useRankingCategoriesStore } from '@/store/rankingCategoriesStore'
import { useRankingStore } from '@/store/rankingStore'
import { TournamentCard } from '@/components/TournamentCard'
import { buildWhatsAppLink } from '@/lib/whatsapp'

const HERO_ROTATE_MS = 6000
const MEDAL_COLORS = ['#FFD700', '#C7CBD1', '#CD7F32']

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.06-1.36A10 10 0 1 0 12 2Zm0 18.2a8.17 8.17 0 0 1-4.17-1.14l-.3-.18-3 .8.8-2.93-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.13c-.24-.12-1.44-.71-1.67-.8-.22-.08-.38-.12-.55.12-.16.24-.63.8-.77.96-.14.16-.28.18-.52.06-.24-.12-1-.37-1.92-1.18-.71-.63-1.19-1.42-1.33-1.66-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.32-.75-1.8-.2-.48-.4-.42-.55-.42h-.47c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.13 3.64.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.44-.59 1.64-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.3" />
    </svg>
  )
}

function SectionHeading({
  eyebrow,
  title,
  cta,
}: {
  eyebrow: string
  title: string
  cta?: { to: string; label: string }
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary-500">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-gray-50 sm:text-3xl">{title}</h2>
      </div>
      {cta && (
        <Link
          to={cta.to}
          className="hidden shrink-0 items-center gap-1 text-sm font-medium text-primary-500 hover:underline sm:flex"
        >
          {cta.label} <ArrowIcon />
        </Link>
      )}
    </div>
  )
}

export function LandingPage() {
  const venueName = useSettingsStore((s) => s.venueName)
  const whatsappPhone = useSettingsStore((s) => s.whatsappPhone)
  const about = useSettingsStore((s) => s.about)
  const address = useSettingsStore((s) => s.address)
  const openHour = useSettingsStore((s) => s.openHour)
  const closeHour = useSettingsStore((s) => s.closeHour)
  const courts = useCourtsStore((s) => s.courts)
  const tournaments = useTournamentsStore((s) => s.tournaments).filter((t) => t.published)
  const slides = useSlidesStore((s) => s.slides).filter((s) => s.published)
  const rankingCategories = useRankingCategoriesStore((s) => s.categories)
  const rankingEntries = useRankingStore((s) => s.entries)

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

  const upcomingTournaments = useMemo(
    () => [...tournaments].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3),
    [tournaments],
  )

  const firstCategory = rankingCategories[0]
  const podium = useMemo(
    () =>
      firstCategory
        ? rankingEntries
            .filter((e) => e.categoryId === firstCategory.id)
            .sort((a, b) => b.totalPoints - a.totalPoints)
            .slice(0, 3)
        : [],
    [rankingEntries, firstCategory],
  )

  const whatsappLink = whatsappPhone
    ? buildWhatsAppLink(whatsappPhone, `Hola! Quiero mas informacion sobre ${venueName}.`)
    : null
  const mapsLink = address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    : null

  return (
    <div>
      {/* Hero */}
      <section className="relative flex min-h-[520px] items-end overflow-hidden sm:min-h-[600px]">
        <div className="absolute inset-0">
          {hero?.imageUrl ? (
            <img src={hero.imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(circle_at_top,_theme(colors.primary.900)_0%,_theme(colors.gray.950)_65%)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/70 to-gray-950/20" />
        </div>

        <div className="relative mx-auto w-full max-w-6xl px-5 pb-14 pt-24">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary-500">
            {venueName}
          </p>
          <h1 className="mt-3 max-w-2xl text-4xl font-bold leading-tight text-gray-50 sm:text-5xl">
            {hero?.title ?? 'Tu cancha de padel, lista cuando quieras'}
          </h1>
          <p className="mt-4 max-w-xl text-base text-gray-300 sm:text-lg">
            {hero?.subtitle ?? 'Reserva tu turno en segundos y confirmalo directo por WhatsApp.'}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/reservar"
              className="rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-gray-950 shadow-glow-primary hover:bg-primary-400"
            >
              Reservar cancha
            </Link>
            <Link
              to="/ranking"
              className="rounded-full border border-gray-700 bg-gray-950/40 px-6 py-3 text-sm font-medium text-gray-100 hover:bg-gray-900"
            >
              Ver ranking
            </Link>
          </div>

          {sortedSlides.length > 1 && (
            <div className="mt-10 flex gap-1.5">
              {sortedSlides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setHeroIndex(i)}
                  aria-label={`Slide ${i + 1}`}
                  className={`h-1.5 w-6 rounded-full transition-colors ${
                    i === heroIndex % sortedSlides.length ? 'bg-primary-500' : 'bg-gray-700'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Sobre el club */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <div className="grid gap-10 sm:grid-cols-[1.3fr_1fr] sm:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-500">
              Sobre el club
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-gray-50 sm:text-3xl">{venueName}</h2>
            <p className="mt-4 text-base leading-relaxed text-gray-400">
              {about ||
                'Canchas de primera calidad, buena iluminacion y el mejor ambiente para jugar al padel con amigos.'}
            </p>
            {address && (
              <p className="mt-5 flex items-center gap-2 text-sm text-gray-400">
                <PinIcon />
                {address}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 self-start sm:grid-cols-1">
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
              <p className="text-2xl font-bold text-primary-500">{courts.length}</p>
              <p className="mt-1 text-sm text-gray-400">
                {courts.length === 1 ? 'Cancha disponible' : 'Canchas disponibles'}
              </p>
            </div>
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
              <p className="text-2xl font-bold text-primary-500">
                {openHour}:00 - {closeHour}:00
              </p>
              <p className="mt-1 text-sm text-gray-400">Horario de atencion</p>
            </div>
          </div>
        </div>
      </section>

      {/* Novedades */}
      {sortedSlides.length > 0 && (
        <section className="border-t border-gray-800/60 bg-gray-925/40">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
            <SectionHeading eyebrow="Novedades" title="Lo ultimo del club" />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {sortedSlides.map((s) => (
                <div
                  key={s.id}
                  className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900 shadow-card"
                >
                  {s.imageUrl && (
                    <div className="aspect-[16/10] w-full">
                      <img src={s.imageUrl} alt="" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div className="p-4">
                    <p className="text-base font-semibold text-gray-50">{s.title}</p>
                    {s.subtitle && <p className="mt-1 text-sm text-gray-400">{s.subtitle}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Torneos */}
      {upcomingTournaments.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
          <SectionHeading
            eyebrow="Torneos"
            title="Proximos torneos"
            cta={{ to: '/torneos', label: 'Ver todos' }}
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingTournaments.map((t) => (
              <TournamentCard key={t.id} tournament={t} whatsappPhone={whatsappPhone} />
            ))}
          </div>
          <Link
            to="/torneos"
            className="mt-6 flex items-center gap-1 text-sm font-medium text-primary-500 hover:underline sm:hidden"
          >
            Ver todos los torneos <ArrowIcon />
          </Link>
        </section>
      )}

      {/* Ranking */}
      {podium.length > 0 && (
        <section className="border-t border-gray-800/60 bg-gray-925/40">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
            <SectionHeading
              eyebrow="Ranking"
              title={firstCategory ? firstCategory.name : 'Ranking del club'}
              cta={{ to: '/ranking', label: 'Ver ranking completo' }}
            />
            <div className="grid grid-cols-3 items-end gap-4 sm:max-w-md">
              {podium.map((entry, i) => {
                const place = i + 1
                const color = MEDAL_COLORS[place - 1]
                return (
                  <div
                    key={entry.id}
                    className={`flex flex-col items-center rounded-xl border bg-gray-900 p-4 ${
                      place === 1 ? 'border-primary-500/50 shadow-glow-sm' : 'border-gray-800'
                    }`}
                    style={{ order: place === 1 ? 0 : place === 2 ? -1 : 1 }}
                  >
                    <div className="relative">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-gray-950"
                        style={{ backgroundColor: color }}
                      >
                        {initials(entry.playerName)}
                      </div>
                      <span
                        className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-gray-950"
                        style={{ backgroundColor: color }}
                      >
                        {place}
                      </span>
                    </div>
                    <p className="mt-2 max-w-full truncate text-xs font-medium text-gray-100">
                      {entry.playerName}
                    </p>
                    <p className="text-sm font-bold text-primary-500">{entry.totalPoints}</p>
                  </div>
                )
              })}
            </div>
            <Link
              to="/ranking"
              className="mt-6 flex items-center gap-1 text-sm font-medium text-primary-500 hover:underline sm:hidden"
            >
              Ver ranking completo <ArrowIcon />
            </Link>
          </div>
        </section>
      )}

      {/* Contacto */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8 sm:p-12">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary-500">
                Contacto
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-gray-50 sm:text-3xl">
                Te esperamos en {venueName}
              </h2>
              {address && (
                <p className="mt-3 flex items-center gap-2 text-sm text-gray-400">
                  <PinIcon />
                  {address}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              {whatsappLink && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-full bg-success px-6 py-3 text-sm font-semibold text-gray-950 hover:bg-success/90"
                >
                  <WhatsAppIcon />
                  Escribinos
                </a>
              )}
              {mapsLink && (
                <a
                  href={mapsLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-full border border-gray-700 px-6 py-3 text-sm font-medium text-gray-100 hover:bg-gray-800"
                >
                  <PinIcon />
                  Como llegar
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
