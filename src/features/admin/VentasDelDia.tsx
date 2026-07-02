import { useMemo } from 'react'
import { useSalesStore } from '@/store/salesStore'
import { useProductsStore } from '@/store/productsStore'
import { useReservationsStore } from '@/store/reservationsStore'
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
  const reservations = useReservationsStore((s) => s.reservations)

  const today = todayKey()
  const todaySales = useMemo(() => sales.filter((s) => s.date === today), [sales, today])
  const paidSales = useMemo(
    () => todaySales.filter((s) => s.paymentStatus === 'pagado'),
    [todaySales],
  )

  const total = paidSales.reduce((sum, s) => sum + s.total, 0)
  const totalsByMethod = useMemo(() => {
    const map: Record<PaymentMethod, number> = { efectivo: 0, transferencia: 0, mixto: 0 }
    for (const s of paidSales) {
      if (s.paymentMethod) map[s.paymentMethod] += s.total
    }
    return map
  }, [paidSales])

  function productName(productId: string) {
    return products.find((p) => p.id === productId)?.name ?? productId
  }

  function linkedTurno(reservationId?: string) {
    if (!reservationId) return null
    const reservation = reservations.find((r) => r.id === reservationId)
    return reservation ? `${reservation.time}hs` : null
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
              <th className="p-3">Turno</th>
              <th className="p-3">Estado</th>
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
                <td className="p-3 text-gray-300">{linkedTurno(sale.reservationId) ?? '-'}</td>
                <td className="p-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      sale.paymentStatus === 'pagado'
                        ? 'bg-success/20 text-success'
                        : 'bg-warning/20 text-warning'
                    }`}
                  >
                    {sale.paymentStatus === 'pagado' ? 'Pagado' : `Adeuda${sale.customerName ? ` - ${sale.customerName}` : ''}`}
                  </span>
                </td>
                <td className="p-3 text-gray-300">
                  {sale.paymentMethod ? PAYMENT_LABELS[sale.paymentMethod] : '-'}
                  {sale.paymentMethod === 'mixto' && sale.payments.length > 0 && (
                    <ul className="mt-1 text-xs text-gray-500">
                      {sale.payments.map((p, i) => (
                        <li key={i}>
                          {PAYMENT_LABELS[p.method]}: {formatCurrency(p.amount)}
                        </li>
                      ))}
                    </ul>
                  )}
                </td>
                <td className="p-3 text-gray-100">{formatCurrency(sale.total)}</td>
              </tr>
            ))}
            {todaySales.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
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
