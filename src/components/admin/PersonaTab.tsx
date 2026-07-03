import { useState } from 'react'
import { SaleCheckoutForm } from '@/components/admin/SaleCheckoutForm'
import { formatCurrency } from '@/lib/format'

interface PersonaTabProps {
  index: number
  reservationId: string
  courtFee: number
  isCourtFeeAssigned: boolean
  courtFeeAlreadyCharged: boolean
  onToggleCourtFee: () => void
  onStatusChange?: (closed: boolean) => void
}

export function PersonaTab({
  index,
  reservationId,
  courtFee,
  isCourtFeeAssigned,
  courtFeeAlreadyCharged,
  onToggleCourtFee,
  onStatusChange,
}: PersonaTabProps) {
  const [name, setName] = useState(`Persona ${index + 1}`)
  const [confirmedCharges, setConfirmedCharges] = useState<number[]>([])
  const [showForm, setShowForm] = useState(true)
  const [formKey, setFormKey] = useState(0)

  const appliedCourtFee = !courtFeeAlreadyCharged && isCourtFeeAssigned ? courtFee : 0

  function handleConfirmed(total: number) {
    setConfirmedCharges((prev) => [...prev, total])
    setShowForm(false)
    onStatusChange?.(true)
  }

  function handleReopen() {
    setFormKey((k) => k + 1)
    setShowForm(true)
    onStatusChange?.(false)
  }

  return (
    <div className="rounded-lg border border-gray-800 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-lg border border-gray-700 bg-gray-925 px-2 py-1 text-sm font-medium text-gray-100"
        />
        {courtFee > 0 && !courtFeeAlreadyCharged && (
          <label className="flex shrink-0 items-center gap-1 text-xs text-gray-400">
            <input type="checkbox" checked={isCourtFeeAssigned} onChange={onToggleCourtFee} />
            Cancha
          </label>
        )}
      </div>

      {confirmedCharges.length > 0 && (
        <div className="mb-2 space-y-1">
          {confirmedCharges.map((total, i) => (
            <p key={i} className="text-xs text-success">
              Cobrado: {formatCurrency(total)}
            </p>
          ))}
        </div>
      )}

      {showForm ? (
        <SaleCheckoutForm
          key={formKey}
          reservationId={reservationId}
          extraFee={appliedCourtFee}
          extraFeeLabel="Cancha"
          defaultDebtorName={name}
          confirmLabel="Cobrar"
          onConfirmed={handleConfirmed}
        />
      ) : (
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-success/20 px-2 py-0.5 text-xs font-medium text-success">
            Cerrada
          </span>
          <button
            type="button"
            onClick={handleReopen}
            className="text-xs text-primary-500 hover:underline"
          >
            Reabrir
          </button>
        </div>
      )}
    </div>
  )
}
