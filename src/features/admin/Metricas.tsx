import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useSettingsStore } from '@/store/settingsStore'
import { useCourtsStore } from '@/store/courtsStore'
import { useReservationsStore } from '@/store/reservationsStore'
import { useSalesStore } from '@/store/salesStore'
import { useProductsStore } from '@/store/productsStore'
import { ChartCard } from '@/components/ChartCard'
import { formatCurrency, toDateKey, weekdayShort } from '@/lib/format'
import type { PaymentMethod } from '@/types'

const PAYMENT_COLORS: Record<PaymentMethod, string> = {
  efectivo: '#15F5BA',
  transferencia: '#38BDF8',
  mixto: '#FB923C',
}
const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  mixto: 'Mixto',
}
const OCCUPANCY_COLORS = ['#15F5BA', '#363636']

export function Metricas() {
  const settings = useSettingsStore()
  const courts = useCourtsStore((s) => s.courts)
  const reservations = useReservationsStore((s) => s.reservations)
  const sales = useSalesStore((s) => s.sales)
  const products = useProductsStore((s) => s.products)

  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      const date = toDateKey(d)
      const reservationsTotal = reservations
        .filter((r) => r.date === date && r.status !== 'cancelado')
        .reduce((sum, r) => sum + r.priceTotal, 0)
      const salesTotal = sales
        .filter((s) => s.date === date)
        .reduce((sum, s) => sum + s.total, 0)
      return { label: weekdayShort(d), total: reservationsTotal + salesTotal }
    })
  }, [reservations, sales])

  const ingresos7dias = last7Days.reduce((sum, d) => sum + d.total, 0)

  const today = toDateKey(new Date())
  const occupancyData = useMemo(() => {
    const totalSlots = courts.length * (settings.closeHour - settings.openHour)
    const bookedSlots = reservations.filter(
      (r) => r.date === today && r.status !== 'cancelado',
    ).length
    const pct = totalSlots === 0 ? 0 : Math.round((bookedSlots / totalSlots) * 100)
    return { pct, data: [{ name: 'Ocupado', value: pct }, { name: 'Libre', value: 100 - pct }] }
  }, [settings, courts, reservations, today])

  const topProducts = useMemo(() => {
    const qtyByProduct = new Map<string, number>()
    for (const sale of sales) {
      for (const item of sale.items) {
        qtyByProduct.set(item.productId, (qtyByProduct.get(item.productId) ?? 0) + item.qty)
      }
    }
    return products
      .map((p) => ({ name: p.name, qty: qtyByProduct.get(p.id) ?? 0 }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 4)
  }, [sales, products])

  const paymentBreakdown = useMemo(() => {
    const totals: Record<PaymentMethod, number> = { efectivo: 0, transferencia: 0, mixto: 0 }
    for (const sale of sales) totals[sale.paymentMethod] += sale.total
    const grandTotal = totals.efectivo + totals.transferencia + totals.mixto
    return (Object.keys(totals) as PaymentMethod[])
      .filter((method) => totals[method] > 0)
      .map((method) => ({
        method,
        value: totals[method],
        pct: grandTotal === 0 ? 0 : Math.round((totals[method] / grandTotal) * 100),
      }))
  }, [sales])

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-50">Metricas y reportes</h1>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title={`Ingresos (ultimos 7 dias) — ${formatCurrency(ingresos7dias)}`}>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" stroke="#252525" />
              <XAxis dataKey="label" stroke="#777777" fontSize={12} />
              <YAxis stroke="#777777" fontSize={12} />
              <Tooltip
                contentStyle={{ background: '#1A1A1A', border: '1px solid #363636' }}
                formatter={(value) => formatCurrency(Number(value))}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#15F5BA"
                fill="#15F5BA"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={`Ocupacion — ${occupancyData.pct}%`}>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={occupancyData.data}
                dataKey="value"
                innerRadius={50}
                outerRadius={80}
                startAngle={90}
                endAngle={-270}
              >
                {occupancyData.data.map((entry, index) => (
                  <Cell key={entry.name} fill={OCCUPANCY_COLORS[index]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1A1A1A', border: '1px solid #363636' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Productos mas vendidos">
          <div className="space-y-2">
            {topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center justify-between text-sm">
                <span className="text-gray-300">
                  {i + 1}. {p.name}
                </span>
                <span className="text-gray-100">{p.qty}</span>
              </div>
            ))}
            {topProducts.every((p) => p.qty === 0) && (
              <p className="text-sm text-gray-500">Sin ventas registradas todavia.</p>
            )}
          </div>
        </ChartCard>

        <ChartCard title="Metodos de pago">
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={160}>
              <PieChart>
                <Pie data={paymentBreakdown} dataKey="value" innerRadius={40} outerRadius={70}>
                  {paymentBreakdown.map((entry) => (
                    <Cell key={entry.method} fill={PAYMENT_COLORS[entry.method]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1A1A1A', border: '1px solid #363636' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1 text-sm">
              {paymentBreakdown.map((entry) => (
                <div key={entry.method} className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: PAYMENT_COLORS[entry.method] }}
                  />
                  <span className="text-gray-300">{PAYMENT_LABELS[entry.method]}</span>
                  <span className="text-gray-500">{entry.pct}%</span>
                </div>
              ))}
              {paymentBreakdown.length === 0 && (
                <p className="text-gray-500">Sin ventas registradas todavia.</p>
              )}
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  )
}
