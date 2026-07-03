import { formatCurrency } from '@/lib/format'
import type { SalePayment } from '@/types'

interface PaymentBreakdownProps {
  payments: SalePayment[]
  onChange: (payments: SalePayment[]) => void
  total: number
}

export function PaymentBreakdown({ payments, onChange, total }: PaymentBreakdownProps) {
  const splitTotal = payments.reduce((sum, p) => sum + p.amount, 0)

  function updateRow(index: number, patch: Partial<SalePayment>) {
    onChange(payments.map((p, i) => (i === index ? { ...p, ...patch } : p)))
  }

  function addRow() {
    onChange([...payments, { method: 'efectivo', amount: 0 }])
  }

  function removeRow(index: number) {
    onChange(payments.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-2 rounded-lg border border-gray-800 p-3">
      {payments.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="number"
            value={p.amount}
            onChange={(e) => updateRow(i, { amount: Number(e.target.value) })}
            placeholder="Monto"
            className="w-full min-w-0 flex-1 rounded-lg border border-gray-700 bg-gray-925 px-2 py-1.5 text-sm text-gray-100"
          />
          <select
            value={p.method}
            onChange={(e) => updateRow(i, { method: e.target.value as SalePayment['method'] })}
            className="rounded-lg border border-gray-700 bg-gray-925 px-2 py-1.5 text-sm text-gray-100"
          >
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
          </select>
          <button
            type="button"
            onClick={() => removeRow(i)}
            className="text-xs text-danger hover:underline"
          >
            Quitar
          </button>
        </div>
      ))}
      <button type="button" onClick={addRow} className="text-xs text-primary-500 hover:underline">
        + Agregar otro pago
      </button>
      <p className="text-xs text-gray-500">
        Cargado: {formatCurrency(splitTotal)} de {formatCurrency(total)}
      </p>
    </div>
  )
}
