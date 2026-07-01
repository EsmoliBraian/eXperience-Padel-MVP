import { useState } from 'react'
import { useDebtorsStore } from '@/store/debtorsStore'
import { formatCurrency } from '@/lib/format'

export function AcreedoresCard() {
  const debtors = useDebtorsStore((s) => s.debtors)
  const addDebtor = useDebtorsStore((s) => s.addDebtor)
  const markPaid = useDebtorsStore((s) => s.markPaid)
  const deleteDebtor = useDebtorsStore((s) => s.deleteDebtor)

  const [customerName, setCustomerName] = useState('')
  const [amount, setAmount] = useState(0)
  const [detail, setDetail] = useState('')

  async function handleAdd() {
    if (!customerName || amount <= 0) return
    await addDebtor({ customerName, amount, detail })
    setCustomerName('')
    setAmount(0)
    setDetail('')
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
      <p className="mb-3 text-sm font-medium text-gray-300">Acreedores</p>

      <div className="space-y-2">
        {debtors.map((d) => (
          <div
            key={d.id}
            className={`rounded-lg border border-gray-800 p-2 text-sm ${d.paid ? 'opacity-50' : ''}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-gray-100">{d.customerName}</span>
              <span className="text-gray-100">{formatCurrency(d.amount)}</span>
            </div>
            {d.detail && <p className="text-xs text-gray-500">{d.detail}</p>}
            <div className="mt-1 flex items-center gap-3 text-xs">
              {d.paid ? (
                <span className="text-success">Pagado</span>
              ) : (
                <button
                  type="button"
                  onClick={() => markPaid(d.id)}
                  className="text-primary-500 hover:underline"
                >
                  Marcar pagado
                </button>
              )}
              <button
                type="button"
                onClick={() => deleteDebtor(d.id)}
                className="text-danger hover:underline"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
        {debtors.length === 0 && <p className="text-sm text-gray-500">No hay deudas registradas.</p>}
      </div>

      <div className="mt-3 space-y-2 border-t border-gray-800 pt-3">
        <input
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Nombre"
          className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-1.5 text-sm text-gray-100"
        />
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          placeholder="Monto"
          className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-1.5 text-sm text-gray-100"
        />
        <input
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          placeholder="Detalle (opcional)"
          className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-1.5 text-sm text-gray-100"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="w-full rounded-lg bg-primary-500 py-2 text-sm font-medium text-gray-950 hover:bg-primary-400"
        >
          + Agregar
        </button>
      </div>
    </div>
  )
}
