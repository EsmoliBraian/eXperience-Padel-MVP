import { useMemo, useState } from 'react'
import { useProductsStore } from '@/store/productsStore'
import { useSalesStore } from '@/store/salesStore'
import { formatCurrency } from '@/lib/format'
import { ErrorText } from '@/components/ErrorText'
import { PaymentBreakdown } from '@/components/admin/PaymentBreakdown'
import { SplitBillCalculator } from '@/components/admin/SplitBillCalculator'
import type { PaymentMethod, SalePayment } from '@/types'

type SaleMode = PaymentMethod | 'adeuda'

const MODE_LABELS: Record<SaleMode, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  mixto: 'Mixto',
  adeuda: 'Adeuda',
}

interface SaleCheckoutFormProps {
  reservationId?: string
  extraFee?: number
  extraFeeLabel?: string
  defaultDebtorName?: string
  confirmLabel?: string
  showSplitCalculator?: boolean
  onConfirmed?: (total: number) => void
}

export function SaleCheckoutForm({
  reservationId,
  extraFee = 0,
  extraFeeLabel = 'Cancha',
  defaultDebtorName,
  confirmLabel = 'Confirmar venta',
  showSplitCalculator = false,
  onConfirmed,
}: SaleCheckoutFormProps) {
  const products = useProductsStore((s) => s.products)
  const addSale = useSalesStore((s) => s.addSale)

  const [searchQuery, setSearchQuery] = useState('')
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [mode, setMode] = useState<SaleMode>('efectivo')
  const [splitPayments, setSplitPayments] = useState<SalePayment[]>([])
  const [debtorName, setDebtorName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)

  const searchMatches = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.trim().toLowerCase()
    return products.filter((p) => p.name.toLowerCase().includes(q))
  }, [products, searchQuery])

  const cartProducts = products.filter((p) => (quantities[p.id] ?? 0) > 0)
  const productsTotal = cartProducts.reduce((sum, p) => sum + quantities[p.id] * p.price, 0)
  const grandTotal = productsTotal + extraFee

  function handleAddProduct(productId: string) {
    setQuantities((prev) => ({ ...prev, [productId]: (prev[productId] ?? 0) + 1 }))
    setSearchQuery('')
  }

  function handleQtyChange(productId: string, delta: number) {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] ?? 0) + delta),
    }))
  }

  function handleSelectMode(next: SaleMode) {
    setMode(next)
    if (next === 'mixto' && splitPayments.length === 0) {
      setSplitPayments([{ method: 'efectivo', amount: 0 }])
    }
    if (next === 'adeuda' && !debtorName && defaultDebtorName) {
      setDebtorName(defaultDebtorName)
    }
  }

  async function handleConfirmSale() {
    const items = cartProducts.map((p) => ({
      productId: p.id,
      qty: quantities[p.id],
      unitPrice: p.price,
    }))
    if (items.length === 0 && extraFee <= 0) {
      setError('Agregá al menos un producto.')
      return
    }
    if (mode === 'adeuda' && !debtorName.trim()) {
      setError('Ingresá el nombre del deudor.')
      return
    }

    setConfirming(true)
    const payments = mode === 'mixto' ? splitPayments.filter((p) => p.amount > 0) : []
    const saleError =
      mode === 'adeuda'
        ? await addSale(items, null, [], reservationId, debtorName.trim(), extraFee)
        : await addSale(items, mode, payments, reservationId, undefined, extraFee)
    setConfirming(false)

    if (saleError) {
      setError(saleError)
      return
    }

    setError(null)
    onConfirmed?.(grandTotal)
  }

  return (
    <div>
      <div className="relative">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar producto..."
          className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-gray-100"
        />
        {searchMatches.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 shadow-lg">
            {searchMatches.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleAddProduct(p.id)}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-gray-200 hover:bg-gray-800"
              >
                <span>{p.name}</span>
                <span className="text-gray-500">{formatCurrency(p.price)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-3 space-y-2">
        {cartProducts.map((p) => (
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
              <span className="w-4 text-center text-gray-100">{quantities[p.id]}</span>
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
        {cartProducts.length === 0 && (
          <p className="text-sm text-gray-500">Busca un producto para agregarlo (opcional).</p>
        )}
      </div>

      {extraFee > 0 && (
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
          <span>{extraFeeLabel}</span>
          <span>{formatCurrency(extraFee)} — incluido</span>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-gray-400">Total</span>
        <span className="font-semibold text-gray-50">{formatCurrency(grandTotal)}</span>
      </div>

      {showSplitCalculator && (
        <div className="mt-3">
          <SplitBillCalculator total={grandTotal} />
        </div>
      )}

      <div className="mt-3 grid grid-cols-4 gap-2">
        {(['efectivo', 'transferencia', 'mixto', 'adeuda'] as SaleMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => handleSelectMode(m)}
            className={`rounded-lg border py-1.5 text-xs ${
              mode === m
                ? 'border-primary-500 bg-primary-500/10 text-primary-500'
                : 'border-gray-800 text-gray-400'
            }`}
          >
            {MODE_LABELS[m]}
          </button>
        ))}
      </div>

      {mode === 'mixto' && (
        <div className="mt-3">
          <PaymentBreakdown payments={splitPayments} onChange={setSplitPayments} total={grandTotal} />
        </div>
      )}

      {mode === 'adeuda' && (
        <label className="mt-3 block text-xs text-gray-400">
          Nombre del deudor
          <input
            value={debtorName}
            onChange={(e) => setDebtorName(e.target.value)}
            placeholder="Quien se lo lleva fiado"
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-gray-100"
          />
        </label>
      )}

      <ErrorText error={error} />

      <button
        type="button"
        onClick={handleConfirmSale}
        disabled={confirming}
        className="mt-3 w-full rounded-lg bg-primary-500 py-2 text-sm font-medium text-gray-950 hover:bg-primary-400 disabled:opacity-50"
      >
        {confirming ? 'Confirmando...' : confirmLabel}
      </button>
    </div>
  )
}
