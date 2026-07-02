import { useMemo, useState } from 'react'
import { useSalesStore } from '@/store/salesStore'
import { PersonaTab } from '@/components/admin/PersonaTab'
import { formatCurrency } from '@/lib/format'
import type { Reservation } from '@/types'

interface TurnoCheckoutGroupProps {
  reservation: Reservation
}

export function TurnoCheckoutGroup({ reservation }: TurnoCheckoutGroupProps) {
  const sales = useSalesStore((s) => s.sales)
  const [personaCount, setPersonaCount] = useState(Math.max(1, reservation.players))
  const [courtFeeAssignedIndex, setCourtFeeAssignedIndex] = useState<number | null>(null)

  const linkedSales = useMemo(
    () => sales.filter((s) => s.reservationId === reservation.id),
    [sales, reservation.id],
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">Personas en este turno</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPersonaCount((c) => Math.max(1, c - 1))}
            className="h-6 w-6 rounded bg-gray-800 text-gray-300"
          >
            -
          </button>
          <span className="w-4 text-center text-sm text-gray-100">{personaCount}</span>
          <button
            type="button"
            onClick={() => setPersonaCount((c) => c + 1)}
            className="h-6 w-6 rounded bg-gray-800 text-gray-300"
          >
            +
          </button>
        </div>
      </div>

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

      <div className="space-y-3">
        {Array.from({ length: personaCount }, (_, i) => (
          <PersonaTab
            key={i}
            index={i}
            reservationId={reservation.id}
            courtFee={reservation.priceTotal}
            isCourtFeeAssigned={courtFeeAssignedIndex === i}
            onToggleCourtFee={() => setCourtFeeAssignedIndex((prev) => (prev === i ? null : i))}
          />
        ))}
      </div>
    </div>
  )
}
