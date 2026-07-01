import { useState } from 'react'
import { Modal } from '@/components/Modal'
import { useSettingsStore } from '@/store/settingsStore'
import { useCourtsStore } from '@/store/courtsStore'
import { useReservationsStore } from '@/store/reservationsStore'
import type { ReservationStatus } from '@/types'
import { todayKey } from '@/lib/format'

export function NuevaReservaModal({ onClose }: { onClose: () => void }) {
  const settings = useSettingsStore()
  const courts = useCourtsStore((s) => s.courts)
  const addReservation = useReservationsStore((s) => s.addReservation)

  const hours = Array.from(
    { length: settings.closeHour - settings.openHour },
    (_, i) => settings.openHour + i,
  )

  const [date, setDate] = useState(todayKey())
  const [time, setTime] = useState(`${String(hours[0]).padStart(2, '0')}:00`)
  const [courtId, setCourtId] = useState(courts[0]?.id ?? '')
  const [players, setPlayers] = useState(4)
  const [customerName, setCustomerName] = useState('')
  const [status, setStatus] = useState<ReservationStatus>('confirmado')

  async function handleSubmit() {
    if (!courtId) return
    const priceTotal = players === 4 ? settings.priceFullCourt : players * settings.pricePerPlayer
    await addReservation({
      courtId,
      date,
      time,
      players,
      status,
      customerName: customerName || undefined,
      createdVia: 'admin',
      priceTotal,
    })
    onClose()
  }

  return (
    <Modal title="Nueva reserva" onClose={onClose}>
      <div className="space-y-3 text-sm">
        <label className="block text-gray-400">
          Fecha
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-gray-100"
          />
        </label>

        <label className="block text-gray-400">
          Horario
          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-gray-100"
          >
            {hours.map((h) => {
              const value = `${String(h).padStart(2, '0')}:00`
              return (
                <option key={value} value={value}>
                  {value}
                </option>
              )
            })}
          </select>
        </label>

        <label className="block text-gray-400">
          Cancha
          <select
            value={courtId}
            onChange={(e) => setCourtId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-gray-100"
          >
            {courts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-gray-400">
          Jugadores
          <select
            value={players}
            onChange={(e) => setPlayers(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-gray-100"
          >
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-gray-400">
          Cliente (opcional)
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-gray-100"
          />
        </label>

        <label className="block text-gray-400">
          Estado
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ReservationStatus)}
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-gray-100"
          >
            <option value="reservado">Reservado</option>
            <option value="confirmado">Confirmado</option>
          </select>
        </label>

        <button
          type="button"
          onClick={handleSubmit}
          className="w-full rounded-lg bg-primary-500 py-2 font-medium text-gray-950 hover:bg-primary-400"
        >
          Guardar reserva
        </button>
      </div>
    </Modal>
  )
}
