import type { Sale } from '@/types'

// A sale linked to a reservation may have folded the turno's price into its
// total (see VentaRapidaCard). We detect that by comparing the sale total to
// what its line items alone add up to, instead of re-deriving it from the
// reservation's current status, which could change after the sale was made.
export function saleIncludesReservationFee(sale: Sale): boolean {
  if (!sale.reservationId) return false
  const itemsSubtotal = sale.items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0)
  return sale.total > itemsSubtotal
}

export function reservationIdsWithAbsorbedFee(sales: Sale[]): Set<string> {
  const ids = new Set<string>()
  for (const sale of sales) {
    if (sale.reservationId && saleIncludesReservationFee(sale)) ids.add(sale.reservationId)
  }
  return ids
}
