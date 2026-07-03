import { useMemo, useState } from 'react'
import { useSalesStore } from '@/store/salesStore'
import { PersonaTab } from '@/components/admin/PersonaTab'
import { formatCurrency } from '@/lib/format'
import { saleIncludesReservationFee } from '@/lib/salesRevenue'
import type { Reservation } from '@/types'

interface TurnoCheckoutGroupProps {
  reservation: Reservation
}

export function TurnoCheckoutGroup({ reservation }: TurnoCheckoutGroupProps) {
  const sales = useSalesStore((s) => s.sales)
  const [personaCount, setPersonaCount] = useState(Math.max(1, reservation.players))
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [courtFeeAssignedIndex, setCourtFeeAssignedIndex] = useState<number | null>(null)
  const [closedMap, setClosedMap] = useState<Record<number, boolean>>({})

  const linkedSales = useMemo(
    () => sales.filter((s) => s.reservationId === reservation.id),
    [sales, reservation.id],
  )
  const courtFeeAlreadyCharged = linkedSales.some(saleIncludesReservationFee)

  function handlePersonaCount(next: number) {
    const clamped = Math.max(1, next)
    setPersonaCount(clamped)
    if (selectedIndex >= clamped) setSelectedIndex(clamped - 1)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">Personas en este turno</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handlePersonaCount(personaCount - 1)}
            className="h-6 w-6 rounded bg-gray-800 text-gray-300"
          >
            -
          </button>
          <span className="w-4 text-center text-sm text-gray-100">{personaCount}</span>
          <button
            type="button"
            onClick={() => handlePersonaCount(personaCount + 1)}
            className="h-6 w-6 rounded bg-gray-800 text-gray-300"
          >
            +
          </button>
        </div>
      </div>

      {courtFeeAlreadyCharged && (
        <p className="text-xs text-success">
          Cancha ({formatCurrency(reservation.priceTotal)}) ya cobrada en este turno.
        </p>
      )}

      {linkedSales.length > 0 && (
        <div className="space-y-1 rounded-lg border border-gray-800 p-2">
          <p className="text-xs font-medium text-gray-400">Ya cobrado en este turno</p>
          {linkedSales.map((sale) => (
            <div key={sale.id} className="flex items-center justify-between text-xs text-gray-300">
              <span>{sale.customerName ?? 'Cliente'}</span>
              <span className={sale.paymentStatus === 'pagado' ? 'text-success' : 'text-warning'}>
                {sale.paymentStatus === 'pagado' ? 'Pagado' : 'Adeuda'} — {formatCurrency(sale.total)}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        {Array.from({ length: personaCount }, (_, i) => (
          <span
            key={i}
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              closedMap[i] ? 'bg-success/20 text-success' : 'bg-gray-800 text-gray-400'
            }`}
          >
            Persona {i + 1}: {closedMap[i] ? 'Cerrada' : 'Abierta'}
          </span>
        ))}
      </div>

      <label className="block text-xs text-gray-400">
        Ver persona
        <select
          value={selectedIndex}
          onChange={(e) => setSelectedIndex(Number(e.target.value))}
          className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-925 px-2 py-1.5 text-sm text-gray-100"
        >
          {Array.from({ length: personaCount }, (_, i) => (
            <option key={i} value={i}>
              Persona {i + 1}
              {closedMap[i] ? ' — Cerrada' : ''}
            </option>
          ))}
        </select>
      </label>

      {Array.from({ length: personaCount }, (_, i) => (
        <div key={i} className={selectedIndex === i ? '' : 'hidden'}>
          <PersonaTab
            index={i}
            reservationId={reservation.id}
            courtFee={reservation.priceTotal}
            isCourtFeeAssigned={courtFeeAssignedIndex === i}
            courtFeeAlreadyCharged={courtFeeAlreadyCharged}
            onToggleCourtFee={() => setCourtFeeAssignedIndex((prev) => (prev === i ? null : i))}
            onStatusChange={(closed) => setClosedMap((prev) => ({ ...prev, [i]: closed }))}
          />
        </div>
      ))}
    </div>
  )
}
