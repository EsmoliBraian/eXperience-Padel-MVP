import { formatLongDate, fromDateKey } from './format'

export interface ReservationSummary {
  date: string // YYYY-MM-DD
  time: string
  courtName: string
  players: number
}

export function buildReservationMessage(r: ReservationSummary): string {
  const longDate = formatLongDate(fromDateKey(r.date))
  return [
    'Hola! Quiero confirmar mi reserva:',
    `Fecha: ${longDate}`,
    `Horario: ${r.time} hs`,
    `Cancha: ${r.courtName}`,
    `Jugadores: ${r.players}`,
    'Gracias!',
  ].join('\n')
}

export function buildWhatsAppLink(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
