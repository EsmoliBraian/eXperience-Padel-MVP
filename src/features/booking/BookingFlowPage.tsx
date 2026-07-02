import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSettingsStore } from '@/store/settingsStore'
import { useCourtsStore } from '@/store/courtsStore'
import { useReservationsStore } from '@/store/reservationsStore'
import { useClosedDatesStore } from '@/store/closedDatesStore'
import { getAvailableSlots, type TimeSlot } from '@/lib/availability'
import { getTurnoPrice } from '@/lib/pricing'
import { formatCurrency, formatLongDate, fromDateKey, nextDays, toDateKey, weekdayShort } from '@/lib/format'
import { buildReservationMessage, buildWhatsAppLink } from '@/lib/whatsapp'

type Step = 'slot' | 'players' | 'confirm'

export function BookingFlowPage() {
  const settings = useSettingsStore()
  const courts = useCourtsStore((s) => s.courts)
  const reservations = useReservationsStore((s) => s.reservations)
  const addReservation = useReservationsStore((s) => s.addReservation)
  const closedDates = useClosedDatesStore((s) => s.closedDates)

  const days = useMemo(() => nextDays(5), [])
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(days[0]))
  const [step, setStep] = useState<Step>('slot')
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [players, setPlayers] = useState(4)

  const isClosed = closedDates.some((c) => c.date === selectedDate)
  const availableSlots = useMemo(
    () => getAvailableSlots(settings, courts, reservations, selectedDate, closedDates),
    [settings, courts, reservations, selectedDate, closedDates],
  )

  const total = selectedSlot ? getTurnoPrice(selectedSlot.court, settings) : 0

  function handlePickSlot(slot: TimeSlot) {
    setSelectedSlot(slot)
    setStep('players')
  }

  async function handleConfirmReservation() {
    if (!selectedSlot) return
    await addReservation({
      courtId: selectedSlot.court.id,
      date: selectedDate,
      time: selectedSlot.time,
      players,
      status: 'reservado',
      createdVia: 'user',
      priceTotal: total,
    })
    setStep('confirm')
  }

  function handleWhatsAppRedirect() {
    if (!selectedSlot) return
    const message = buildReservationMessage({
      date: selectedDate,
      time: selectedSlot.time,
      courtName: selectedSlot.court.name,
      players,
    })
    window.open(buildWhatsAppLink(settings.whatsappPhone, message), '_blank')
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col bg-gray-950 p-5">
      <Link to="/" className="mb-4 text-sm text-gray-400">
        &larr; Volver
      </Link>

      {step === 'slot' && (
        <>
          <h1 className="mb-4 text-lg font-semibold text-gray-50">Elegi fecha</h1>
          <div className="mb-4 flex gap-2">
            {days.map((d) => {
              const key = toDateKey(d)
              const active = key === selectedDate
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedDate(key)}
                  className={`flex flex-1 flex-col items-center rounded-lg border py-2 text-xs ${
                    active
                      ? 'border-primary-500 bg-primary-500/10 text-primary-500'
                      : 'border-gray-800 text-gray-400'
                  }`}
                >
                  <span>{weekdayShort(d)}</span>
                  <span className="text-sm font-semibold">{d.getDate()}</span>
                </button>
              )
            })}
          </div>

          <h2 className="mb-2 text-sm font-medium text-gray-300">Horarios disponibles</h2>
          <div className="space-y-2">
            {availableSlots.map((slot) => (
              <button
                key={slot.time}
                type="button"
                onClick={() => handlePickSlot(slot)}
                className="w-full rounded-lg border border-gray-800 bg-gray-900 py-3 text-sm text-gray-100 hover:border-primary-500"
              >
                {slot.time}
              </button>
            ))}
            {availableSlots.length === 0 && (
              <p className="text-sm text-gray-500">
                {isClosed ? 'Cerrado ese dia.' : 'No hay horarios disponibles para este dia.'}
              </p>
            )}
          </div>
        </>
      )}

      {step === 'players' && selectedSlot && (
        <>
          <h1 className="mb-4 text-lg font-semibold text-gray-50">Tu reserva</h1>
          <div className="mb-4 space-y-1 rounded-lg border border-gray-800 bg-gray-900 p-3 text-sm">
            <p className="text-gray-400">
              Fecha <span className="float-right text-gray-100">{formatLongDate(fromDateKey(selectedDate))}</span>
            </p>
            <p className="text-gray-400">
              Horario <span className="float-right text-gray-100">{selectedSlot.time} hs</span>
            </p>
            <p className="text-gray-400">
              Cancha <span className="float-right text-gray-100">{selectedSlot.court.name}</span>
            </p>
          </div>

          <h2 className="mb-2 text-sm font-medium text-gray-300">Cuantos jugadores?</h2>
          <div className="mb-4 grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPlayers(n)}
                className={`rounded-lg border py-2 text-sm ${
                  players === n
                    ? 'border-primary-500 bg-primary-500/10 text-primary-500'
                    : 'border-gray-800 text-gray-400'
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          <p className="mb-4 text-sm text-gray-400">
            Precio total
            <span className="ml-2 text-lg font-semibold text-gray-50">
              {formatCurrency(total)}
            </span>
          </p>

          <button
            type="button"
            onClick={handleConfirmReservation}
            className="rounded-lg bg-primary-500 py-3 font-medium text-gray-950 hover:bg-primary-400"
          >
            RESERVAR Y CONFIRMAR
          </button>
        </>
      )}

      {step === 'confirm' && selectedSlot && (
        <>
          <h1 className="mb-4 text-lg font-semibold text-gray-50">Confirma tu reserva</h1>
          <div className="mb-4 rounded-lg border border-success/40 bg-success/10 p-4 text-sm text-gray-200">
            <p className="mb-2 font-medium text-success">
              Seras redirigido a WhatsApp para confirmar tu reserva con la cancha.
            </p>
            <p className="text-gray-400">Tu mensaje incluira:</p>
            <ul className="mt-1 list-disc pl-5 text-gray-300">
              <li>Fecha y horario</li>
              <li>Cancha</li>
              <li>Cantidad de jugadores</li>
            </ul>
          </div>

          <button
            type="button"
            onClick={handleWhatsAppRedirect}
            className="rounded-lg bg-success py-3 font-medium text-gray-950 hover:bg-success/90"
          >
            CONTINUAR A WHATSAPP
          </button>
        </>
      )}
    </div>
  )
}
