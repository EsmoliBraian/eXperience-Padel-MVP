import type { Court, Settings } from '@/types'

export function getTurnoPrice(court: Court, settings: Settings): number {
  return court.price ?? settings.defaultPrice
}
