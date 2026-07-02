import { formatLongDate, fromDateKey } from '@/lib/format'
import { buildWhatsAppLink } from '@/lib/whatsapp'
import type { Tournament } from '@/types'

interface TournamentListItemProps {
  tournament: Tournament
  whatsappPhone: string
}

export function TournamentListItem({ tournament, whatsappPhone }: TournamentListItemProps) {
  function handleInscribirse() {
    const message = `Hola! Quiero inscribirme al torneo "${tournament.name}" (${formatLongDate(fromDateKey(tournament.date))}). Quiero guardar un cupo.`
    window.open(buildWhatsAppLink(whatsappPhone, message), '_blank')
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-900 p-3">
      {tournament.imageUrl && (
        <img
          src={tournament.imageUrl}
          alt=""
          className="h-14 w-14 shrink-0 rounded-lg object-cover"
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-100">{tournament.name}</p>
        <p className="text-xs font-light text-primary-500">
          {formatLongDate(fromDateKey(tournament.date))}
        </p>
        {tournament.description && (
          <p className="mt-1 text-xs text-gray-400">{tournament.description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={handleInscribirse}
        className="shrink-0 rounded-lg bg-primary-500 px-3 py-1.5 text-xs font-medium text-gray-950 hover:bg-primary-400"
      >
        Inscribirse
      </button>
    </div>
  )
}
