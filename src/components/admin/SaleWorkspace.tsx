import { useEffect, useRef } from 'react'
import { useReservationsStore } from '@/store/reservationsStore'
import { SaleCheckoutForm } from '@/components/admin/SaleCheckoutForm'
import { TurnoCheckoutGroup } from '@/components/admin/TurnoCheckoutGroup'

interface SaleWorkspaceProps {
  reservationId?: string
  onLabelChange?: (label: string) => void
}

export function SaleWorkspace({ reservationId, onLabelChange }: SaleWorkspaceProps) {
  const reservations = useReservationsStore((s) => s.reservations)
  const linkedReservation = reservationId
    ? reservations.find((r) => r.id === reservationId)
    : undefined
  const turnoConfirmed = linkedReservation?.status === 'confirmado'

  const label = linkedReservation ? `${linkedReservation.time}hs` : 'Cuenta libre'
  const onLabelChangeRef = useRef(onLabelChange)
  useEffect(() => {
    onLabelChangeRef.current = onLabelChange
  })
  useEffect(() => {
    onLabelChangeRef.current?.(label)
  }, [label])

  return (
    <div>
      {linkedReservation && !turnoConfirmed && (
        <p className="mb-2 text-xs text-gray-500">
          Este turno no esta confirmado todavia, no se incluye el precio de cancha ni se
          divide por persona.
        </p>
      )}

      {turnoConfirmed && linkedReservation ? (
        <TurnoCheckoutGroup key={linkedReservation.id} reservation={linkedReservation} />
      ) : (
        <SaleCheckoutForm reservationId={reservationId} showSplitCalculator={!!reservationId} />
      )}
    </div>
  )
}
