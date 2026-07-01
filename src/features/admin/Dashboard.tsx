import { useMemo, useState } from 'react'
import { useSettingsStore } from '@/store/settingsStore'
import { useCourtsStore } from '@/store/courtsStore'
import { useReservationsStore } from '@/store/reservationsStore'
import { useSalesStore } from '@/store/salesStore'
import { useTournamentsStore } from '@/store/tournamentsStore'
import { useProductsStore } from '@/store/productsStore'
import { getAvailableSlots } from '@/lib/availability'
import { formatCurrency, todayKey } from '@/lib/format'
import { KpiCard } from '@/components/KpiCard'
import { StatusBadge } from '@/components/StatusBadge'
import { NuevaReservaModal } from './NuevaReservaModal'
import type { PaymentMethod } from '@/types'

export function Dashboard() {
  const settings = useSettingsStore()
  const courts = useCourtsStore((s) => s.courts)
  const reservations = useReservationsStore((s) => s.reservations)
  const sales = useSalesStore((s) => s.sales)
  const addSale = useSalesStore((s) => s.addSale)
  const tournaments = useTournamentsStore((s) => s.tournaments)
  const products = useProductsStore((s) => s.products)

  const [showModal, setShowModal] = useState(false)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo')

  const today = todayKey()
  const todayReservations = useMemo(
    () => reservations.filter((r) => r.date === today && r.status !== 'cancelado'),
    [reservations, today],
  )
  const todaySales = useMemo(() => sales.filter((s) => s.date === today), [sales, today])

  const ingresosHoy =
    todayReservations.reduce((sum, r) => sum + r.priceTotal, 0) +
    todaySales.reduce((sum, s) => sum + s.total, 0)
  const productosVendidosHoy = todaySales.reduce(
    (sum, s) => sum + s.items.reduce((itemSum, item) => itemSum + item.qty, 0),
    0,
  )
  const turnosDisponiblesHoy = getAvailableSlots(settings, courts, reservations, today).length

  const hours = Array.from(
    { length: settings.closeHour - settings.openHour },
    (_, i) => settings.openHour + i,
  )

  const cartTotal = products.reduce(
    (sum, p) => sum + (quantities[p.id] ?? 0) * p.price,
    0,
  )

  function handleQtyChange(productId: string, delta: number) {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] ?? 0) + delta),
    }))
  }

  async function handleConfirmSale() {
    const items = products
      .filter((p) => (quantities[p.id] ?? 0) > 0)
      .map((p) => ({ productId: p.id, qty: quantities[p.id], unitPrice: p.price }))
    if (items.length === 0) return
    await addSale(items, paymentMethod)
    setQuantities({})
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-50">Dashboard</h1>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-gray-950 hover:bg-primary-400"
        >
          + Nueva reserva
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Reservas hoy" value={String(todayReservations.length)} />
        <KpiCard label="Ingresos hoy" value={formatCurrency(ingresosHoy)} />
        <KpiCard label="Productos vendidos" value={String(productosVendidosHoy)} />
        <KpiCard label="Turnos disponibles hoy" value={String(turnosDisponiblesHoy)} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-900 p-4 lg:col-span-2">
          <p className="mb-3 text-sm font-medium text-gray-300">Reservas del dia</p>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="pb-2 pr-2">Hora</th>
                {courts.map((c) => (
                  <th key={c.id} className="pb-2 pr-2">
                    {c.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hours.map((hour) => {
                const time = `${String(hour).padStart(2, '0')}:00`
                return (
                  <tr key={time} className="border-t border-gray-800">
                    <td className="py-2 pr-2 text-gray-500">{time}</td>
                    {courts.map((court) => {
                      const reservation = todayReservations.find(
                        (r) => r.courtId === court.id && r.time === time,
                      )
                      return (
                        <td key={court.id} className="py-2 pr-2">
                          {reservation ? (
                            <div className="space-y-0.5">
                              <StatusBadge status={reservation.status} />
                              {reservation.customerName && (
                                <p className="text-gray-400">{reservation.customerName}</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-700">Disponible</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <p className="mb-3 text-sm font-medium text-gray-300">Proximos torneos</p>
            <div className="space-y-2">
              {tournaments.slice(0, 3).map((t) => (
                <p key={t.id} className="text-sm text-gray-100">
                  {t.name}
                </p>
              ))}
              {tournaments.length === 0 && (
                <p className="text-sm text-gray-500">Sin torneos.</p>
              )}
            </div>
          </div>

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
                    <span className="w-4 text-center text-gray-100">
                      {quantities[p.id] ?? 0}
                    </span>
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
            </div>

            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-gray-400">Total</span>
              <span className="font-semibold text-gray-50">{formatCurrency(cartTotal)}</span>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              {(['efectivo', 'transferencia', 'mixto'] as PaymentMethod[]).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
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

            <button
              type="button"
              onClick={handleConfirmSale}
              className="mt-3 w-full rounded-lg bg-primary-500 py-2 text-sm font-medium text-gray-950 hover:bg-primary-400"
            >
              Confirmar venta
            </button>
          </div>
        </div>
      </div>

      {showModal && <NuevaReservaModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
