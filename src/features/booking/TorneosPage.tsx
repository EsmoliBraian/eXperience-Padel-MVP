import { Link } from 'react-router-dom'
import { useSettingsStore } from '@/store/settingsStore'
import { useTournamentsStore } from '@/store/tournamentsStore'
import { TournamentListItem } from '@/components/TournamentListItem'

export function TorneosPage() {
  const whatsappPhone = useSettingsStore((s) => s.whatsappPhone)
  const tournaments = useTournamentsStore((s) => s.tournaments)
    .filter((t) => t.published)
    .sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col bg-gray-950 p-5">
      <Link to="/" className="mb-4 text-sm text-gray-400">
        &larr; Volver
      </Link>

      <h1 className="mb-4 text-lg font-semibold text-gray-50">Torneos</h1>

      <div className="space-y-2">
        {tournaments.map((t) => (
          <TournamentListItem key={t.id} tournament={t} whatsappPhone={whatsappPhone} />
        ))}
        {tournaments.length === 0 && (
          <p className="text-sm text-gray-500">No hay torneos programados.</p>
        )}
      </div>
    </div>
  )
}
