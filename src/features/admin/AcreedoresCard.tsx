import { useMemo, useState } from 'react'
import { useSalesStore } from '@/store/salesStore'
import { useProductsStore } from '@/store/productsStore'
import { formatCurrency } from '@/lib/format'
import { Modal } from '@/components/Modal'
import { ErrorText } from '@/components/ErrorText'
import { PaymentBreakdown } from '@/components/admin/PaymentBreakdown'
import type { PaymentMethod, Sale, SalePayment } from '@/types'

function productName(products: { id: string; name: string }[], productId: string) {
  return products.find((p) => p.id === productId)?.name ?? productId
}

function CobrarModal({ sale, onClose }: { sale: Sale; onClose: () => void }) {
  const settleSale = useSalesStore((s) => s.settleSale)
  const products = useProductsStore((s) => s.products)

  const [method, setMethod] = useState<PaymentMethod>('efectivo')
  const [splitPayments, setSplitPayments] = useState<SalePayment[]>([])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  function handleSelectMethod(m: PaymentMethod) {
    setMethod(m)
    if (m === 'mixto' && splitPayments.length === 0) {
      setSplitPayments([{ method: 'efectivo', amount: 0 }])
    }
  }

  async function handleConfirm() {
    setSaving(true)
    const payments = method === 'mixto' ? splitPayments.filter((p) => p.amount > 0) : []
    const settleError = await settleSale(sale.id, method, payments)
    setSaving(false)
    if (settleError) {
      setError(settleError)
      return
    }
    onClose()
  }

  return (
    <Modal title="Cobrar deuda" onClose={onClose}>
      <div className="space-y-3 text-sm">
        <p className="font-medium text-gray-100">{sale.customerName}</p>
        <p className="text-xs text-gray-500">
          {sale.items.map((item) => `${item.qty}x ${productName(products, item.productId)}`).join(', ')}
        </p>
        <p className="text-lg font-semibold text-gray-50">{formatCurrency(sale.total)}</p>

        <div className="grid grid-cols-3 gap-2">
          {(['efectivo', 'transferencia', 'mixto'] as PaymentMethod[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => handleSelectMethod(m)}
              className={`rounded-lg border py-1.5 text-xs capitalize ${
                method === m
                  ? 'border-primary-500 bg-primary-500/10 text-primary-500'
                  : 'border-gray-800 text-gray-400'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {method === 'mixto' && (
          <PaymentBreakdown payments={splitPayments} onChange={setSplitPayments} total={sale.total} />
        )}

        <ErrorText error={error} />

        <button
          type="button"
          onClick={handleConfirm}
          disabled={saving}
          className="w-full rounded-lg bg-primary-500 py-2 font-medium text-gray-950 hover:bg-primary-400 disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Confirmar cobro'}
        </button>
      </div>
    </Modal>
  )
}

export function AcreedoresCard() {
  const sales = useSalesStore((s) => s.sales)
  const products = useProductsStore((s) => s.products)
  const [cobrarSale, setCobrarSale] = useState<Sale | null>(null)

  const pendingSales = useMemo(
    () =>
      sales
        .filter((s) => s.paymentStatus === 'adeuda')
        .sort((a, b) => b.date.localeCompare(a.date)),
    [sales],
  )

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
      <p className="mb-3 text-sm font-medium text-gray-300">Acreedores</p>

      <div className="space-y-2">
        {pendingSales.map((sale) => (
          <div key={sale.id} className="rounded-lg border border-gray-800 p-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-100">{sale.customerName}</span>
              <span className="text-gray-100">{formatCurrency(sale.total)}</span>
            </div>
            <p className="text-xs text-gray-500">
              {sale.items
                .map((item) => `${item.qty}x ${productName(products, item.productId)}`)
                .join(', ')}
            </p>
            <button
              type="button"
              onClick={() => setCobrarSale(sale)}
              className="mt-1 text-xs text-primary-500 hover:underline"
            >
              Cobrar
            </button>
          </div>
        ))}
        {pendingSales.length === 0 && (
          <p className="text-sm text-gray-500">No hay deudas pendientes.</p>
        )}
      </div>

      {cobrarSale && <CobrarModal sale={cobrarSale} onClose={() => setCobrarSale(null)} />}
    </div>
  )
}
