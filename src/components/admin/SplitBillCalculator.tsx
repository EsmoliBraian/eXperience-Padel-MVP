import { useState } from 'react'
import { formatCurrency } from '@/lib/format'

interface SplitBillCalculatorProps {
  total: number
}

const QUICK_COUNTS = [1, 2, 3, 4]

function evenSplit(n: number): number[] {
  const base = Math.floor(100 / n)
  const remainder = 100 - base * n
  return Array.from({ length: n }, (_, i) => base + (i < remainder ? 1 : 0))
}

export function SplitBillCalculator({ total }: SplitBillCalculatorProps) {
  const [count, setCount] = useState(1)
  const [customCount, setCustomCount] = useState('')
  const [mode, setMode] = useState<'igual' | 'porcentaje'>('igual')
  const [percentages, setPercentages] = useState<number[]>([100])

  function handleSetCount(n: number) {
    if (n < 1) return
    setCount(n)
    setMode('igual')
    setPercentages(evenSplit(n))
  }

  function handleQuickCount(n: number) {
    setCustomCount('')
    handleSetCount(n)
  }

  function handleCustomCountChange(value: string) {
    setCustomCount(value)
    const n = Math.floor(Number(value))
    if (Number.isFinite(n) && n >= 1) handleSetCount(n)
  }

  function updatePercentage(index: number, value: number) {
    setPercentages((prev) => prev.map((p, i) => (i === index ? value : p)))
  }

  if (total <= 0) return null

  const percentageSum = percentages.reduce((sum, p) => sum + p, 0)

  return (
    <div className="rounded-lg border border-gray-800 p-3">
      <p className="mb-2 text-xs font-medium text-gray-400">Dividir entre</p>

      <div className="flex flex-wrap items-center gap-2">
        {QUICK_COUNTS.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => handleQuickCount(n)}
            className={`h-8 w-8 rounded-lg border text-sm ${
              count === n && !customCount
                ? 'border-primary-500 bg-primary-500/10 text-primary-500'
                : 'border-gray-700 text-gray-300'
            }`}
          >
            {n}
          </button>
        ))}
        <input
          value={customCount}
          onChange={(e) => handleCustomCountChange(e.target.value)}
          placeholder="Otra cantidad"
          className="w-28 rounded-lg border border-gray-700 bg-gray-925 px-2 py-1.5 text-sm text-gray-100"
        />
      </div>

      {count > 1 && (
        <>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMode('igual')}
              className={`rounded-lg border py-1.5 text-xs ${
                mode === 'igual'
                  ? 'border-primary-500 bg-primary-500/10 text-primary-500'
                  : 'border-gray-700 text-gray-300'
              }`}
            >
              Partes iguales
            </button>
            <button
              type="button"
              onClick={() => setMode('porcentaje')}
              className={`rounded-lg border py-1.5 text-xs ${
                mode === 'porcentaje'
                  ? 'border-primary-500 bg-primary-500/10 text-primary-500'
                  : 'border-gray-700 text-gray-300'
              }`}
            >
              Por porcentaje
            </button>
          </div>

          <div className="mt-2 space-y-1.5">
            {Array.from({ length: count }, (_, i) => {
              const amount = mode === 'igual' ? total / count : (total * (percentages[i] ?? 0)) / 100
              return (
                <div key={i} className="flex items-center justify-between text-xs text-gray-300">
                  <span>Persona {i + 1}</span>
                  <div className="flex items-center gap-2">
                    {mode === 'porcentaje' && (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={percentages[i] ?? 0}
                          onChange={(e) => updatePercentage(i, Number(e.target.value))}
                          className="w-14 rounded border border-gray-700 bg-gray-925 px-1 py-0.5 text-right text-gray-100"
                        />
                        <span>%</span>
                      </div>
                    )}
                    <span className="font-medium text-gray-100">{formatCurrency(amount)}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {mode === 'porcentaje' && (
            <p className={`mt-1 text-xs ${percentageSum === 100 ? 'text-gray-500' : 'text-warning'}`}>
              Asignado: {percentageSum}% de 100%
            </p>
          )}
        </>
      )}
    </div>
  )
}
