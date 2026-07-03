import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useSettingsStore } from '@/store/settingsStore'
import { useCourtsStore } from '@/store/courtsStore'
import { useReservationsStore } from '@/store/reservationsStore'
import { useClosedDatesStore } from '@/store/closedDatesStore'
import { getCourtTimeSlots } from '@/lib/availability'
import { formatCurrency, formatLongDate, fromDateKey, nextDays, toDateKey, weekdayShort } from '@/lib/format'
import { buildReservationMessage, buildWhatsAppLink } from '@/lib/whatsapp'
import type { Court } from '@/types'

type Step = 'slot' | 'summary' | 'confirm'

interface SelectedSlot {
  time: string
  court: Court
}

export function BookingFlowPage() {
  const { venueSlug } = useParams()
  const settings = useSettingsStore()
  const courts = useCourtsStore((s) => s.courts)
  const reservations = useReservationsStore((s) => s.reservations)
  const addReservation = useReservationsStore((s) => s.addReservation)
  const closedDates = useClosedDatesStore((s) => s.closedDates)

  const days = useMemo(() => nextDays(5), [])
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(days[0]))
  const [selectedCourtId, setSelectedCourtId] = useState(() => courts[0]?.id ?? '')
  const [step, setStep] = useState<Step>('slot')
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null)

  const selectedCourt = courts.find((c) => c.id === selectedCourtId) ?? courts[0]

  const isClosed = closedDates.some((c) => c.date === selectedDate)
  const timeSlots = useMemo(
    () =>
      selectedCourt
        ? getCourtTimeSlots(settings, selectedCourt, reservations, selectedDate, closedDates)
        : [],
    [settings, selectedCourt, reservations, selectedDate, closedDates],
  )

  const total = selectedSlot ? selectedSlot.court.price : 0

  function handlePickSlot(time: string) {
    if (!selectedCourt) return
    setSelectedSlot({ time, court: selectedCourt })
    setStep('summary')
  }

  async function handleConfirmReservation() {
    if (!selectedSlot) return
    await addReservation({
      courtId: selectedSlot.court.id,
      date: selectedDate,
      time: selectedSlot.time,
      players: 4,
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
    })
    window.open(buildWhatsAppLink(settings.whatsappPhone, message), '_blank')
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col p-5">
      <Link to={`/${venueSlug}`} className="mb-4 text-sm text-gray-400">
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

          {courts.length > 1 && (
            <>
              <h2 className="mb-2 text-sm font-medium text-gray-300">Cancha</h2>
              <div className="mb-4 flex flex-wrap gap-2">
                {courts.map((c) => {
                  const active = c.id === selectedCourtId
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCourtId(c.id)}
                      className={`rounded-lg border px-3 py-1.5 text-xs ${
                        active
                          ? 'border-primary-500 bg-primary-500/10 text-primary-500'
                          : 'border-gray-800 text-gray-400'
                      }`}
                    >
                      {c.name}
                    </button>
                  )
                })}
              </div>
            </>
          )}

          <h2 className="mb-2 text-sm font-medium text-gray-300">Horarios disponibles</h2>
          <div className="space-y-2">
            {timeSlots.map((slot) => (
              <button
                key={slot.time}
                type="button"
                disabled={!slot.available}
                onClick={() => handlePickSlot(slot.time)}
                className={`w-full rounded-lg border py-3 text-sm ${
                  slot.available
                    ? 'border-gray-800 bg-gray-900 text-gray-100 hover:border-primary-500'
                    : 'cursor-not-allowed border-gray-800 bg-gray-900/40 text-gray-600'
                }`}
              >
                {slot.time}
                {!slot.available && <span className="ml-2 text-xs">Reservado</span>}
              </button>
            ))}
            {timeSlots.length === 0 && (
              <p className="text-sm text-gray-500">
                {isClosed ? 'Cerrado ese dia.' : 'No hay horarios disponibles para este dia.'}
              </p>
            )}
          </div>
        </>
      )}

      {step === 'summary' && selectedSlot && (
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
