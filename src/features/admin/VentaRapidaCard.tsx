import { useMemo, useState } from 'react'
import { useReservationsStore } from '@/store/reservationsStore'
import { todayKey } from '@/lib/format'
import { SaleCheckoutForm } from '@/components/admin/SaleCheckoutForm'
import { TurnoCheckoutGroup } from '@/components/admin/TurnoCheckoutGroup'

export function VentaRapidaCard() {
  const reservations = useReservationsStore((s) => s.reservations)
  const [linkedReservationId, setLinkedReservationId] = useState('')

  const today = todayKey()
  const todayReservations = useMemo(
    () =>
      reservations
        .filter((r) => r.date === today && r.status !== 'cancelado')
        .sort((a, b) => a.time.localeCompare(b.time)),
    [reservations, today],
  )

  const linkedReservation = todayReservations.find((r) => r.id === linkedReservationId)
  const turnoConfirmed = linkedReservation?.status === 'confirmado'

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
      <p className="mb-3 text-sm font-medium text-gray-300">Venta rapida</p>

      <label className="block text-xs text-gray-400">
        Vincular al turno
        <select
          value={linkedReservationId}
          onChange={(e) => setLinkedReservationId(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-2 py-1.5 text-sm text-gray-100"
        >
          <option value="">No vincular</option>
          {todayReservations.map((r) => (
            <option key={r.id} value={r.id}>
              Vincular al turno: {r.time}hs{r.customerName ? ` - ${r.customerName}` : ''}
              {r.status === 'confirmado' ? '' : ' (sin confirmar)'}
            </option>
          ))}
        </select>
      </label>

      {linkedReservation && !turnoConfirmed && (
        <p className="mt-1 text-xs text-gray-500">
          Este turno no esta confirmado todavia, no se incluye el precio de cancha ni se
          divide por persona.
        </p>
      )}

      <div className="mt-3">
        {turnoConfirmed && linkedReservation ? (
          <TurnoCheckoutGroup key={linkedReservation.id} reservation={linkedReservation} />
        ) : (
          <SaleCheckoutForm
            reservationId={linkedReservationId || undefined}
            showSplitCalculator
          />
        )}
      </div>
    </div>
  )
}
