interface KpiCardProps {
  label: string
  value: string
  delta?: string
}

export function KpiCard({ label, value, delta }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
      <p className="text-sm text-gray-400">{label}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-gray-50">{value}</span>
        {delta && <span className="text-xs font-medium text-primary-500">{delta}</span>}
      </div>
    </div>
  )
}
