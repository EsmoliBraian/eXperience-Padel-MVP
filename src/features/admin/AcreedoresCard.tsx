import { useState } from 'react'
import { useDebtorsStore } from '@/store/debtorsStore'
import { formatCurrency } from '@/lib/format'
import { ErrorText } from '@/components/ErrorText'

export function AcreedoresCard() {
  const debtors = useDebtorsStore((s) => s.debtors)
  const addDebtor = useDebtorsStore((s) => s.addDebtor)
  const markPaid = useDebtorsStore((s) => s.markPaid)
  const deleteDebtor = useDebtorsStore((s) => s.deleteDebtor)

  const [customerName, setCustomerName] = useState('')
  const [amount, setAmount] = useState(0)
  const [detail, setDetail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)

  async function handleAdd() {
    if (!customerName || amount <= 0) {
      setError('Completa el nombre y un monto mayor a cero.')
      return
    }
    setAdding(true)
    const addError = await addDebtor({ customerName, amount, detail })
    setAdding(false)
    if (addError) {
      setError(addError)
      return
    }
    setError(null)
    setCustomerName('')
    setAmount(0)
    setDetail('')
  }

  async function handleMarkPaid(id: string) {
    setError(await markPaid(id))
  }

  async function handleDelete(id: string) {
    setError(await deleteDebtor(id))
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
      <p className="mb-3 text-sm font-medium text-gray-300">Acreedores</p>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-2 lg:col-span-2">
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
                    onClick={() => handleMarkPaid(d.id)}
                    className="text-primary-500 hover:underline"
                  >
                    Marcar pagado
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(d.id)}
                  className="text-danger hover:underline"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
          {debtors.length === 0 && (
            <p className="text-sm text-gray-500">No hay deudas registradas.</p>
          )}
        </div>

        <div className="space-y-2 border-t border-gray-800 pt-3 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
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
          <ErrorText error={error} />
          <button
            type="button"
            onClick={handleAdd}
            disabled={adding}
            className="w-full rounded-lg bg-primary-500 py-2 text-sm font-medium text-gray-950 hover:bg-primary-400 disabled:opacity-50"
          >
            {adding ? 'Agregando...' : '+ Agregar'}
          </button>
        </div>
      </div>
    </div>
  )
}
