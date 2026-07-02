export interface Court {
  id: string
  name: string
  price?: number
}

export interface Settings {
  venueName: string
  whatsappPhone: string
  defaultPrice: number
  slotDurationMinutes: number
  openHour: number
  closeHour: number
}

export interface ClosedDate {
  id: string
  date: string // YYYY-MM-DD
  reason?: string
}

export type ReservationStatus = 'reservado' | 'confirmado' | 'cancelado'

export interface Reservation {
  id: string
  courtId: string
  date: string // YYYY-MM-DD
  time: string // HH:00
  players: number
  status: ReservationStatus
  customerName?: string
  createdVia: 'user' | 'admin'
  priceTotal: number
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
}

export type PaymentMethod = 'efectivo' | 'transferencia' | 'mixto'
export type SplitPaymentMethod = 'efectivo' | 'transferencia'

export interface SaleItem {
  productId: string
  qty: number
  unitPrice: number
}

export interface SalePayment {
  method: SplitPaymentMethod
  amount: number
}

export type PaymentStatus = 'pagado' | 'adeuda'

export interface Sale {
  id: string
  date: string // YYYY-MM-DD
  items: SaleItem[]
  total: number
  paymentMethod: PaymentMethod | null
  paymentStatus: PaymentStatus
  customerName?: string
  reservationId?: string
  payments: SalePayment[]
}

export interface Tournament {
  id: string
  name: string
  date: string // YYYY-MM-DD
  description: string
  imageUrl?: string
  published: boolean
}

export interface HeroSlide {
  id: string
  imageUrl: string
  title: string
  subtitle: string
  order: number
  published: boolean
}
