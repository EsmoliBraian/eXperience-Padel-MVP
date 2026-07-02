import { useMemo, useState } from 'react'
import { useCourtsStore } from '@/store/courtsStore'
import { useReservationsStore } from '@/store/reservationsStore'
import { useSettingsStore } from '@/store/settingsStore'
import { StatusBadge } from '@/components/StatusBadge'
import { ErrorText } from '@/components/ErrorText'
import { formatCurrency, todayKey } from '@/lib/format'
import type { ReservationStatus } from '@/types'

function TurnoSettingsPanel() {
  const defaultPrice = useSettingsStore((s) => s.defaultPrice)
  const slotDurationMinutes = useSettingsStore((s) => s.slotDurationMinutes)
  const updateSettings = useSettingsStore((s) => s.updateSettings)
  const courts = useCourtsStore((s) => s.courts)
  const updateCourt = useCourtsStore((s) => s.updateCourt)

  const [price, setPrice] = useState(defaultPrice)
  const [duration, setDuration] = useState(slotDurationMinutes)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    const saveError = await updateSettings({ defaultPrice: price, slotDurationMinutes: duration })
    setSaving(false)
    if (saveError) {
      setError(saveError)
      return
    }
    setError(null)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleCourtPriceChange(courtId: string, value: string) {
    const price = value === '' ? null : Number(value)
    const saveError = await updateCourt(courtId, { price: price ?? undefined })
    if (saveError) setError(saveError)
  }

  return (
    <div className="space-y-3 rounded-xl border border-gray-800 bg-gray-900 p-4">
      <p className="text-sm font-medium text-gray-300">Configuracion de turnos</p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block text-sm text-gray-400">
          Duracion de cada turno (minutos)
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-gray-100"
          />
        </label>
        <label className="block text-sm text-gray-400">
          Precio por turno (default)
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-gray-100"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-gray-950 hover:bg-primary-400 disabled:opacity-50"
      >
        {saving ? 'Guardando...' : 'Guardar'}
      </button>
      {saved && <p className="text-sm text-success">Configuracion guardada.</p>}

      <div className="border-t border-gray-800 pt-3">
        <p className="mb-2 text-xs text-gray-400">
          Precio por cancha (opcional — si lo dejas vacio se usa el precio por defecto)
        </p>
        <div className="space-y-2">
          {courts.map((court) => (
            <div key={court.id} className="flex items-center gap-2">
              <span className="flex-1 text-sm text-gray-300">{court.name}</span>
              <input
                type="number"
                defaultValue={court.price ?? ''}
                onBlur={(e) => handleCourtPriceChange(court.id, e.target.value)}
                placeholder={`Default: ${formatCurrency(defaultPrice)}`}
                className="w-40 rounded-lg border border-gray-700 bg-gray-950 px-3 py-1.5 text-sm text-gray-100"
              />
            </div>
          ))}
          {courts.length === 0 && <p className="text-sm text-gray-500">No hay canchas cargadas.</p>}
        </div>
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

      <TurnoSettingsPanel />

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
