import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useSettingsStore } from '@/store/settingsStore'
import { useRankingCategoriesStore } from '@/store/rankingCategoriesStore'
import { useRankingStore } from '@/store/rankingStore'
import type { RankingEntry } from '@/types'

const MEDAL_COLORS = ['#FFD700', '#C7CBD1', '#CD7F32']

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function PodiumCard({ entry, place }: { entry: RankingEntry; place: number }) {
  const color = MEDAL_COLORS[place - 1]
  const isFirst = place === 1
  return (
    <div
      className={`flex flex-col items-center rounded-xl border bg-gray-900 p-3 ${
        isFirst ? 'border-primary-500/50 shadow-glow-sm' : 'border-gray-800'
      }`}
      style={isFirst ? { order: 0 } : { order: place === 2 ? -1 : 1 }}
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
}

export function RankingPage() {
  const { venueSlug } = useParams()
  const venueName = useSettingsStore((s) => s.venueName)
  const logoUrl = useSettingsStore((s) => s.logoUrl)
  const categories = useRankingCategoriesStore((s) => s.categories)
  const entries = useRankingStore((s) => s.entries)
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [shared, setShared] = useState(false)

  const activeCategoryId = selectedCategoryId || categories[0]?.id || ''
  const activeCategoryName = categories.find((c) => c.id === activeCategoryId)?.name ?? ''
  const categoryEntries = useMemo(
    () =>
      entries
        .filter((e) => e.categoryId === activeCategoryId)
        .sort((a, b) => b.totalPoints - a.totalPoints),
    [entries, activeCategoryId],
  )
  const podium = categoryEntries.slice(0, 3)
  const rest = categoryEntries.slice(3)

  async function handleShare() {
    const url = window.location.href
    const text = `Ranking${activeCategoryName ? ` - ${activeCategoryName}` : ''} de ${venueName}`
    if (navigator.share) {
      try {
        await navigator.share({ title: text, url })
      } catch {
        // user cancelled the native share sheet, nothing to do
      }
      return
    }
    await navigator.clipboard.writeText(url)
    setShared(true)
    setTimeout(() => setShared(false), 2000)
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col p-5">
      <Link to={`/${venueSlug}`} className="mb-4 text-sm text-gray-400">
        &larr; Volver
      </Link>

      <div className="mb-5 flex items-center gap-3">
        {logoUrl ? (
          <img src={logoUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
        ) : (
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500/10">
            <i className="fa-solid fa-ranking-star text-primary-500" />
          </span>
        )}
        <div>
          <h1 className="text-[22px] font-bold leading-tight text-gray-50">RANKING</h1>
          <p className="text-xs text-gray-400">{venueName}</p>
        </div>
      </div>

      {categories.length === 0 && (
        <p className="text-sm text-gray-500">Todavia no hay ranking cargado.</p>
      )}

      {categories.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCategoryId(c.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                c.id === activeCategoryId
                  ? 'bg-primary-500 text-gray-950'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {categories.length > 0 && (
        <>
          {podium.length > 0 && (
            <div className="mb-4 grid grid-cols-3 items-end gap-2">
              {podium.map((entry, i) => (
                <PodiumCard key={entry.id} entry={entry} place={i + 1} />
              ))}
            </div>
          )}

          <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-900 p-4 shadow-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-gray-400">
                  <th className="pb-3 pr-3">Pos.</th>
                  <th className="pb-3 pr-3">Jugador</th>
                  <th className="pb-3 pr-3 text-right">Puntos</th>
                </tr>
              </thead>
              <tbody>
                {rest.map((entry, i) => (
                  <tr key={entry.id} className="border-t border-gray-800/60">
                    <td className="py-3 pr-3 font-semibold text-gray-500">{i + 4}</td>
                    <td className="py-3 pr-3 text-gray-100">{entry.playerName}</td>
                    <td className="py-3 pr-3 text-right font-semibold text-primary-500">
                      {entry.totalPoints}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {categoryEntries.length === 0 && (
              <p className="text-sm text-gray-500">Todavia no hay resultados en esta categoria.</p>
            )}
          </div>

          {categoryEntries.length > 0 && (
            <button
              type="button"
              onClick={handleShare}
              className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-primary-500 py-3 text-sm font-medium text-gray-950 hover:bg-primary-400"
            >
              <i className="fa-solid fa-share-nodes" />
              {shared ? 'Link copiado!' : 'Compartir ranking'}
            </button>
          )}
        </>
      )}
    </div>
  )
}
