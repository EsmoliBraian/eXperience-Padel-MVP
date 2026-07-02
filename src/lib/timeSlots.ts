import type { Settings } from '@/types'

type ScheduleSettings = Pick<Settings, 'openHour' | 'closeHour' | 'slotDurationMinutes'>

export function generateTimeLabels(settings: ScheduleSettings): string[] {
  const labels: string[] = []
  const startMinutes = settings.openHour * 60
  const endMinutes = settings.closeHour * 60
  const step = settings.slotDurationMinutes > 0 ? settings.slotDurationMinutes : 60

  for (let minutes = startMinutes; minutes + step <= endMinutes; minutes += step) {
    const hour = Math.floor(minutes / 60)
    const minute = minutes % 60
    labels.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`)
  }
  return labels
}
