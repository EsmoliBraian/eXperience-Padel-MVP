import { useMemo, useState } from 'react'
import { useCourtsStore } from '@/store/courtsStore'
import { useReservationsStore } from '@/store/reservationsStore'
import { useSettingsStore } from '@/store/settingsStore'
import { StatusBadge } from '@/components/StatusBadge'
import { ErrorText } from '@/components/ErrorText'
import { formatCurrency, todayKey } from '@/lib/format'
import type { Court, ReservationStatus } from '@/types'

function DuracionTurnoPanel() {
  const slotDurationMinutes = useSettingsStore((s) => s.slotDurationMinutes)
  const updateSettings = useSettingsStore((s) => s.updateSettings)

  const [duration, setDuration] = useState(slotDurationMinutes)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const dirty = duration !== slotDurationMinutes

  async function handleSave() {
    setSaving(true)
    const saveError = await updateSettings({ slotDurationMinutes: duration })
    setSaving(false)
    if (saveError) {
      setError(saveError)
      return
    }
    setError(null)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
      <p className="mb-3 text-sm font-medium text-gray-300">Duracion de turno</p>
      <label className="block text-sm text-gray-400">
        Minutos por turno
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-gray-100"
        />
      </label>

      <ErrorText error={error} />

      <button
        type="button"
        onClick={handleSave}
        disabled={!dirty || saving}
        className="mt-3 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-gray-950 hover:bg-primary-400 disabled:opacity-50"
      >
        {saving ? 'Guardando...' : 'Guardar'}
      </button>
      {saved && <p className="mt-2 text-sm text-success">Guardado.</p>}
    </div>
  )
}

function CanchaRow({ court }: { court: Court }) {
  const updateCourt = useCourtsStore((s) => s.updateCourt)
  const deleteCourt = useCourtsStore((s) => s.deleteCourt)

  const [name, setName] = useState(court.name)
  const [price, setPrice] = useState(court.price)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const dirty = name !== court.name || price !== court.price

  async function handleSave() {
    setSaving(true)
    const saveError = await updateCourt(court.id, { name, price })
    setSaving(false)
    setError(saveError)
  }

  async function handleDelete() {
    const deleteError = await deleteCourt(court.id)
    if (deleteError) setError(deleteError)
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-lg border border-gray-700 bg-gray-950 px-3 py-1.5 text-sm text-gray-100"
        />
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          className="w-32 rounded-lg border border-gray-700 bg-gray-950 px-3 py-1.5 text-sm text-gray-100"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || saving}
          className="rounded-lg bg-primary-500 px-3 py-1.5 text-xs font-medium text-gray-950 hover:bg-primary-400 disabled:opacity-50"
        >
          {saving ? '...' : 'Guardar'}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="text-xs text-danger hover:underline"
        >
          Eliminar
        </button>
      </div>
      <ErrorText error={error} />
    </div>
  )
}

function CanchasPanel() {
  const courts = useCourtsStore((s) => s.courts)
  const addCourt = useCourtsStore((s) => s.addCourt)

  const [newName, setNewName] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)

  const canAdd = newName.trim() !== '' && Number(newPrice) > 0

  async function handleAdd() {
    if (!canAdd) return
    setAdding(true)
    const addError = await addCourt(newName.trim(), Number(newPrice))
    setAdding(false)
    if (addError) {
      setError(addError)
      return
    }
    setError(null)
    setNewName('')
    setNewPrice('')
  }

  return (
    <div className="space-y-3 rounded-xl border border-gray-800 bg-gray-900 p-4">
      <p className="text-sm font-medium text-gray-300">Canchas</p>
      <p className="text-xs text-gray-500">Cada cancha tiene su propio precio por turno.</p>

      <div className="space-y-3">
        {courts.map((court) => (
          <CanchaRow key={court.id} court={court} />
        ))}
        {courts.length === 0 && <p className="text-sm text-gray-500">No hay canchas cargadas.</p>}
      </div>

      <div className="flex items-center gap-2 border-t border-gray-800 pt-3">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nombre de la cancha"
          className="flex-1 rounded-lg border border-gray-700 bg-gray-950 px-3 py-1.5 text-sm text-gray-100"
        />
        <input
          type="number"
          value={newPrice}
          onChange={(e) => setNewPrice(e.target.value)}
          placeholder="Precio"
          className="w-32 rounded-lg border border-gray-700 bg-gray-950 px-3 py-1.5 text-sm text-gray-100"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!canAdd || adding}
          className="rounded-lg bg-primary-500 px-3 py-1.5 text-sm font-medium text-gray-950 hover:bg-primary-400 disabled:opacity-50"
        >
          + Agregar
        </button>
      </div>
      <ErrorText error={error} />
    </div>
  )
}

export function Reservas() {
  const courts = useCourtsStore((s) => s.courts)
  const reservations = useReservationsStore((s) => s.reservations)
  const updateStatus = useReservationsStore((s) => s.updateStatus)
  const deleteReservation = useReservationsStore((s) => s.deleteReservation)

  const [dateFilter, setDateFilter] = useState(todayKey())
  const [courtFilter, setCourtFilter] = useState('all')

  const filtered = useMemo(
    () =>
      reservations
        .filter((r) => (dateFilter ? r.date === dateFilter : true))
        .filter((r) => (courtFilter === 'all' ? true : r.courtId === courtFilter))
        .sort((a, b) => a.time.localeCompare(b.time)),
    [reservations, dateFilter, courtFilter],
  )

  function courtName(courtId: string) {
    return courts.find((c) => c.id === courtId)?.name ?? courtId
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-50">Reservas</h1>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DuracionTurnoPanel />
        <CanchasPanel />
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100"
        />
        <select
          value={courtFilter}
          onChange={(e) => setCourtFilter(e.target.value)}
          className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100"
        >
          <option value="all">Todas las canchas</option>
          {courts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left text-gray-500">
              <th className="p-3">Hora</th>
              <th className="p-3">Cancha</th>
              <th className="p-3">Jugadores</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Total</th>
              <th className="p-3">Estado</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-gray-800 last:border-0">
                <td className="p-3 text-gray-100">{r.time}</td>
                <td className="p-3 text-gray-300">{courtName(r.courtId)}</td>
                <td className="p-3 text-gray-300">{r.players}</td>
                <td className="p-3 text-gray-300">{r.customerName ?? '-'}</td>
                <td className="p-3 text-gray-300">{formatCurrency(r.priceTotal)}</td>
                <td className="p-3">
                  <select
                    value={r.status}
                    onChange={(e) => updateStatus(r.id, e.target.value as ReservationStatus)}
                    className="rounded-lg border border-gray-700 bg-gray-950 px-2 py-1 text-xs text-gray-100"
                  >
                    <option value="reservado">Reservado</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </td>
                <td className="p-3">
                  <button
                    type="button"
                    onClick={() => deleteReservation(r.id)}
                    className="text-xs text-danger hover:underline"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  No hay reservas para este filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500">
        {filtered.length} reserva(s) — <StatusBadge status="reservado" /> pendientes de confirmar por el cliente,{' '}
        <StatusBadge status="confirmado" /> confirmadas.
      </p>
    </div>
  )
}
