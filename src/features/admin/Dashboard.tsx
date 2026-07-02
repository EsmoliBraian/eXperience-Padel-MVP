import { useMemo, useState } from 'react'
import { useSettingsStore } from '@/store/settingsStore'
import { useCourtsStore } from '@/store/courtsStore'
import { useReservationsStore } from '@/store/reservationsStore'
import { useSalesStore } from '@/store/salesStore'
import { useTournamentsStore } from '@/store/tournamentsStore'
import { getAvailableSlots } from '@/lib/availability'
import { formatCurrency, todayKey } from '@/lib/format'
import { KpiCard } from '@/components/KpiCard'
import { StatusBadge } from '@/components/StatusBadge'
import { NuevaReservaModal } from './NuevaReservaModal'
import { VentaRapidaCard } from './VentaRapidaCard'
import { AcreedoresCard } from './AcreedoresCard'

export function Dashboard() {
  const settings = useSettingsStore()
  const courts = useCourtsStore((s) => s.courts)
  const reservations = useReservationsStore((s) => s.reservations)
  const sales = useSalesStore((s) => s.sales)
  const tournaments = useTournamentsStore((s) => s.tournaments)

  const [showModal, setShowModal] = useState(false)

  const today = todayKey()
  const todayReservations = useMemo(
    () => reservations.filter((r) => r.date === today && r.status !== 'cancelado'),
    [reservations, today],
  )
  const todaySales = useMemo(() => sales.filter((s) => s.date === today), [sales, today])

  const ingresosHoy =
    todayReservations.reduce((sum, r) => sum + r.priceTotal, 0) +
    todaySales
      .filter((s) => s.paymentStatus === 'pagado')
      .reduce((sum, s) => sum + s.total, 0)
  const productosVendidosHoy = todaySales.reduce(
    (sum, s) => sum + s.items.reduce((itemSum, item) => itemSum + item.qty, 0),
    0,
  )
  const turnosDisponiblesHoy = getAvailableSlots(settings, courts, reservations, today).length

  const hours = Array.from(
    { length: settings.closeHour - settings.openHour },
    (_, i) => settings.openHour + i,
  )

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

          <VentaRapidaCard />
        </div>
      </div>

      <AcreedoresCard />

      {showModal && <NuevaReservaModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
