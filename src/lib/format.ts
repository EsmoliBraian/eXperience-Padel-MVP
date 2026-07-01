export function formatCurrency(amount: number): string {
  return `$ ${amount.toLocaleString('es-AR')}`
}

const WEEKDAYS_SHORT = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB']
const WEEKDAYS_LONG = [
  'domingo',
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
]
const MONTHS_LONG = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
]

export function toDateKey(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function fromDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function todayKey(): string {
  return toDateKey(new Date())
}

export function weekdayShort(d: Date): string {
  return WEEKDAYS_SHORT[d.getDay()]
}

export function formatLongDate(d: Date): string {
  const weekday = WEEKDAYS_LONG[d.getDay()]
  const month = MONTHS_LONG[d.getMonth()]
  const capitalized = weekday.charAt(0).toUpperCase() + weekday.slice(1)
  return `${capitalized} ${d.getDate()} de ${month.charAt(0).toUpperCase() + month.slice(1)}`
}

export function nextDays(count: number, from: Date = new Date()): Date[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(from)
    d.setDate(d.getDate() + i)
    return d
  })
}
