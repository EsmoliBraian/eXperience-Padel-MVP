export interface Court {
  id: string
  name: string
}

export interface Settings {
  venueName: string
  whatsappPhone: string
  pricePerPlayer: number
  priceFullCourt: number
  openHour: number
  closeHour: number
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
  price: number
}

export type PaymentMethod = 'efectivo' | 'transferencia' | 'mixto'

export interface SaleItem {
  productId: string
  qty: number
  unitPrice: number
}

export interface Sale {
  id: string
  date: string // YYYY-MM-DD
  items: SaleItem[]
  total: number
  paymentMethod: PaymentMethod
}

export interface Tournament {
  id: string
  name: string
  date: string // YYYY-MM-DD
  description: string
  imageUrl?: string
}

export interface HeroSlide {
  id: string
  imageUrl: string
  title: string
  subtitle: string
  order: number
}
