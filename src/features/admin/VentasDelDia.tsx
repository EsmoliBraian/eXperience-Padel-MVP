import { useMemo } from 'react'
import { useSalesStore } from '@/store/salesStore'
import { useProductsStore } from '@/store/productsStore'
import { formatCurrency, todayKey } from '@/lib/format'
import type { PaymentMethod } from '@/types'

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  mixto: 'Mixto',
}

export function VentasDelDia() {
  const sales = useSalesStore((s) => s.sales)
  const products = useProductsStore((s) => s.products)

  const today = todayKey()
  const todaySales = useMemo(
    () => sales.filter((s) => s.date === today),
    [sales, today],
  )

  const total = todaySales.reduce((sum, s) => sum + s.total, 0)
  const totalsByMethod = useMemo(() => {
    const map: Record<PaymentMethod, number> = { efectivo: 0, transferencia: 0, mixto: 0 }
    for (const s of todaySales) map[s.paymentMethod] += s.total
    return map
  }, [todaySales])

  function productName(productId: string) {
    return products.find((p) => p.id === productId)?.name ?? productId
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-50">Ventas del dia</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
          <p className="text-sm text-gray-400">Total del dia</p>
          <p className="mt-1 text-xl font-semibold text-gray-50">{formatCurrency(total)}</p>
        </div>
        {(Object.keys(totalsByMethod) as PaymentMethod[]).map((method) => (
          <div key={method} className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <p className="text-sm text-gray-400">{PAYMENT_LABELS[method]}</p>
            <p className="mt-1 text-xl font-semibold text-gray-50">
              {formatCurrency(totalsByMethod[method])}
            </p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left text-gray-500">
              <th className="p-3">Productos</th>
              <th className="p-3">Metodo de pago</th>
              <th className="p-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {todaySales.map((sale) => (
              <tr key={sale.id} className="border-b border-gray-800 last:border-0">
                <td className="p-3 text-gray-300">
                  {sale.items.map((item) => `${item.qty}x ${productName(item.productId)}`).join(', ')}
                </td>
                <td className="p-3 text-gray-300">{PAYMENT_LABELS[sale.paymentMethod]}</td>
                <td className="p-3 text-gray-100">{formatCurrency(sale.total)}</td>
              </tr>
            ))}
            {todaySales.length === 0 && (
              <tr>
                <td colSpan={3} className="p-4 text-center text-gray-500">
                  Todavia no hay ventas hoy.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
