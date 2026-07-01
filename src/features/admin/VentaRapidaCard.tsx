import { useMemo, useState } from 'react'
import { useProductsStore } from '@/store/productsStore'
import { useSalesStore } from '@/store/salesStore'
import { useReservationsStore } from '@/store/reservationsStore'
import { formatCurrency, todayKey } from '@/lib/format'
import type { PaymentMethod, SalePayment } from '@/types'

export function VentaRapidaCard() {
  const products = useProductsStore((s) => s.products)
  const addSale = useSalesStore((s) => s.addSale)
  const reservations = useReservationsStore((s) => s.reservations)

  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo')
  const [splitPayments, setSplitPayments] = useState<SalePayment[]>([])
  const [linkedReservationId, setLinkedReservationId] = useState('')

  const today = todayKey()
  const todayReservations = useMemo(
    () =>
      reservations
        .filter((r) => r.date === today && r.status !== 'cancelado')
        .sort((a, b) => a.time.localeCompare(b.time)),
    [reservations, today],
  )

  const cartTotal = products.reduce((sum, p) => sum + (quantities[p.id] ?? 0) * p.price, 0)
  const splitTotal = splitPayments.reduce((sum, p) => sum + p.amount, 0)

  function handleQtyChange(productId: string, delta: number) {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] ?? 0) + delta),
    }))
  }

  function handleSelectPaymentMethod(method: PaymentMethod) {
    setPaymentMethod(method)
    if (method === 'mixto' && splitPayments.length === 0) {
      setSplitPayments([{ method: 'efectivo', amount: 0 }])
    }
  }

  function updateSplitPayment(index: number, patch: Partial<SalePayment>) {
    setSplitPayments((prev) => prev.map((p, i) => (i === index ? { ...p, ...patch } : p)))
  }

  function addSplitPayment() {
    setSplitPayments((prev) => [...prev, { method: 'efectivo', amount: 0 }])
  }

  function removeSplitPayment(index: number) {
    setSplitPayments((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleConfirmSale() {
    const items = products
      .filter((p) => (quantities[p.id] ?? 0) > 0)
      .map((p) => ({ productId: p.id, qty: quantities[p.id], unitPrice: p.price }))
    if (items.length === 0) return

    const payments = paymentMethod === 'mixto' ? splitPayments.filter((p) => p.amount > 0) : []
    await addSale(items, paymentMethod, payments, linkedReservationId || undefined)

    setQuantities({})
    setSplitPayments([])
    setLinkedReservationId('')
    setPaymentMethod('efectivo')
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
      <p className="mb-3 text-sm font-medium text-gray-300">Venta rapida</p>
      <div className="space-y-2">
        {products.map((p) => (
          <div key={p.id} className="flex items-center justify-between text-sm">
            <span className="text-gray-300">
              {p.name} <span className="text-gray-500">{formatCurrency(p.price)}</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleQtyChange(p.id, -1)}
                className="h-6 w-6 rounded bg-gray-800 text-gray-300"
              >
                -
              </button>
              <span className="w-4 text-center text-gray-100">{quantities[p.id] ?? 0}</span>
              <button
                type="button"
                onClick={() => handleQtyChange(p.id, 1)}
                className="h-6 w-6 rounded bg-gray-800 text-gray-300"
              >
                +
              </button>
            </div>
          </div>
        ))}
        {products.length === 0 && <p className="text-sm text-gray-500">No hay productos cargados.</p>}
      </div>

      <label className="mt-3 block text-xs text-gray-400">
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
            </option>
          ))}
        </select>
      </label>

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-gray-400">Total</span>
        <span className="font-semibold text-gray-50">{formatCurrency(cartTotal)}</span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {(['efectivo', 'transferencia', 'mixto'] as PaymentMethod[]).map((method) => (
          <button
            key={method}
            type="button"
            onClick={() => handleSelectPaymentMethod(method)}
            className={`rounded-lg border py-1.5 text-xs capitalize ${
              paymentMethod === method
                ? 'border-primary-500 bg-primary-500/10 text-primary-500'
                : 'border-gray-800 text-gray-400'
            }`}
          >
            {method}
          </button>
        ))}
      </div>

      {paymentMethod === 'mixto' && (
        <div className="mt-3 space-y-2 rounded-lg border border-gray-800 p-3">
          {splitPayments.map((p, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="number"
                value={p.amount}
                onChange={(e) => updateSplitPayment(i, { amount: Number(e.target.value) })}
                placeholder="Monto"
                className="w-full min-w-0 flex-1 rounded-lg border border-gray-700 bg-gray-950 px-2 py-1.5 text-sm text-gray-100"
              />
              <select
                value={p.method}
                onChange={(e) =>
                  updateSplitPayment(i, { method: e.target.value as SalePayment['method'] })
                }
                className="rounded-lg border border-gray-700 bg-gray-950 px-2 py-1.5 text-sm text-gray-100"
              >
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
              </select>
              <button
                type="button"
                onClick={() => removeSplitPayment(i)}
                className="text-xs text-danger hover:underline"
              >
                Quitar
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addSplitPayment}
            className="text-xs text-primary-500 hover:underline"
          >
            + Agregar otro pago
          </button>
          <p className="text-xs text-gray-500">
            Cargado: {formatCurrency(splitTotal)} de {formatCurrency(cartTotal)}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={handleConfirmSale}
        className="mt-3 w-full rounded-lg bg-primary-500 py-2 text-sm font-medium text-gray-950 hover:bg-primary-400"
      >
        Confirmar venta
      </button>
    </div>
  )
}
