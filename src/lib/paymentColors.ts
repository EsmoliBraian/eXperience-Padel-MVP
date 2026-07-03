import type { PaymentMethod } from '@/types'

type PaymentColorKey = PaymentMethod | 'adeuda'

export const PAYMENT_COLORS: Record<PaymentColorKey, string> = {
  efectivo: '#22E6B8',
  transferencia: '#4CA8FF',
  mixto: '#B68CFF',
  adeuda: '#FFC857',
}
