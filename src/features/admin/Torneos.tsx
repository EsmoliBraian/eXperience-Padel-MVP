import { useState } from 'react'
import { useTournamentsStore } from '@/store/tournamentsStore'
import { todayKey } from '@/lib/format'
import { ErrorText } from '@/components/ErrorText'
import type { Tournament } from '@/types'

function TournamentCard({ tournament }: { tournament: Tournament }) {
  const updateTournament = useTournamentsStore((s) => s.updateTournament)
  const deleteTournament = useTournamentsStore((s) => s.deleteTournament)

  const [name, setName] = useState(tournament.name)
  const [date, setDate] = useState(tournament.date)
  const [description, setDescription] = useState(tournament.description)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const dirty =
    name !== tournament.name || date !== tournament.date || description !== tournament.description

  async function handleSave() {
    setSaving(true)
    setError(await updateTournament(tournament.id, { name, date, description }))
    setSaving(false)
  }

  async function handlePublishToggle() {
    setError(await updateTournament(tournament.id, { published: !tournament.published }))
  }

  async function handleDelete() {
    setError(await deleteTournament(tournament.id))
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            tournament.published ? 'bg-success/20 text-success' : 'bg-gray-800 text-gray-400'
          }`}
        >
          {tournament.published ? 'Publicado' : 'Borrador'}
        </span>
        <button
          type="button"
          onClick={handlePublishToggle}
          className="text-xs text-primary-500 hover:underline"
        >
          {tournament.published ? 'Despublicar' : 'Publicar'}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm text-gray-400">
          Nombre
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-gray-100"
          />
        </label>
        <label className="block text-sm text-gray-400">
          Fecha
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-gray-100"
          />
        </label>
        <label className="block text-sm text-gray-400 sm:col-span-2">
          Descripcion
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-gray-100"
            rows={2}
          />
        </label>
      </div>

      <ErrorText error={error} />

      <div className="mt-3 flex items-center justify-between">
        <button
          type="button"
          onClick={handleDelete}
          className="text-xs text-danger hover:underline"
        >
          Eliminar torneo
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || saving}
          className="rounded-lg bg-primary-500 px-4 py-1.5 text-xs font-medium text-gray-950 hover:bg-primary-400 disabled:opacity-50"
        >
          {saving ? 'Guardando...' : dirty ? 'Guardar cambios' : 'Guardado'}
        </button>
      </div>
    </div>
  )
}

export function Torneos() {
  const tournaments = useTournamentsStore((s) => s.tournaments)
  const addTournament = useTournamentsStore((s) => s.addTournament)
  const [error, setError] = useState<string | null>(null)

  const sortedTournaments = [...tournaments].sort((a, b) => a.date.localeCompare(b.date))

  async function handleAdd() {
    setError(
      await addTournament({
        name: 'Nuevo torneo',
        date: todayKey(),
        description: '',
        published: false,
      }),
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-50">Torneos</h1>
        <button
          type="button"
          onClick={handleAdd}
          className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-gray-950 hover:bg-primary-400"
        >
          + Nuevo torneo
        </button>
      </div>

      <ErrorText error={error} />

      <div className="space-y-3">
        {sortedTournaments.map((t) => (
          <TournamentCard key={t.id} tournament={t} />
        ))}
        {tournaments.length === 0 && (
          <p className="text-sm text-gray-500">No hay torneos cargados.</p>
        )}
      </div>
    </div>
  )
}
