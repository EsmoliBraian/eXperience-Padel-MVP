import { useTournamentsStore } from '@/store/tournamentsStore'
import { todayKey } from '@/lib/format'

export function Torneos() {
  const tournaments = useTournamentsStore((s) => s.tournaments)
  const addTournament = useTournamentsStore((s) => s.addTournament)
  const updateTournament = useTournamentsStore((s) => s.updateTournament)
  const deleteTournament = useTournamentsStore((s) => s.deleteTournament)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-50">Torneos</h1>
        <button
          type="button"
          onClick={() =>
            addTournament({ name: 'Nuevo torneo', date: todayKey(), description: '' })
          }
          className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-gray-950 hover:bg-primary-400"
        >
          + Nuevo torneo
        </button>
      </div>

      <div className="space-y-3">
        {tournaments
          .sort((a, b) => a.date.localeCompare(b.date))
          .map((t) => (
            <div key={t.id} className="rounded-xl border border-gray-800 bg-gray-900 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm text-gray-400">
                  Nombre
                  <input
                    value={t.name}
                    onChange={(e) => updateTournament(t.id, { name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-gray-100"
                  />
                </label>
                <label className="block text-sm text-gray-400">
                  Fecha
                  <input
                    type="date"
                    value={t.date}
                    onChange={(e) => updateTournament(t.id, { date: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-gray-100"
                  />
                </label>
                <label className="block text-sm text-gray-400 sm:col-span-2">
                  Descripcion
                  <textarea
                    value={t.description}
                    onChange={(e) => updateTournament(t.id, { description: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-gray-100"
                    rows={2}
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={() => deleteTournament(t.id)}
                className="mt-3 text-xs text-danger hover:underline"
              >
                Eliminar torneo
              </button>
            </div>
          ))}
        {tournaments.length === 0 && (
          <p className="text-sm text-gray-500">No hay torneos cargados.</p>
        )}
      </div>
    </div>
  )
}
