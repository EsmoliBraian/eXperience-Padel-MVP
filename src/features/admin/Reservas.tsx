import { useMemo, useState } from 'react'
import { useCourtsStore } from '@/store/courtsStore'
import { useReservationsStore } from '@/store/reservationsStore'
import { StatusBadge } from '@/components/StatusBadge'
import { formatCurrency, todayKey } from '@/lib/format'
import type { ReservationStatus } from '@/types'

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
