import type { ReservationStatus } from '@/types'

const STYLES: Record<ReservationStatus, string> = {
  reservado: 'bg-warning/20 text-warning',
  confirmado: 'bg-success/20 text-success',
  cancelado: 'bg-danger/20 text-danger',
}

const LABELS: Record<ReservationStatus, string> = {
  reservado: 'Reservado',
  confirmado: 'Confirmado',
  cancelado: 'Cancelado',
}

export function StatusBadge({ status }: { status: ReservationStatus }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  )
}
