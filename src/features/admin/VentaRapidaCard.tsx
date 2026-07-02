import { useRef, useState } from 'react'
import { SaleWorkspace } from '@/components/admin/SaleWorkspace'

interface Tab {
  id: string
  label: string
}

export function VentaRapidaCard() {
  const [tabs, setTabs] = useState<Tab[]>([{ id: 'tab-1', label: 'Cuenta 1' }])
  const [activeTabId, setActiveTabId] = useState('tab-1')
  const nextIdRef = useRef(2)

  function handleAddTab() {
    const id = `tab-${nextIdRef.current++}`
    setTabs((prev) => [...prev, { id, label: `Cuenta ${prev.length + 1}` }])
    setActiveTabId(id)
  }

  function handleCloseTab(id: string) {
    if (tabs.length === 1) return
    if (!window.confirm('¿Cerrar esta cuenta? Se pierde lo que no se haya cobrado todavia.')) {
      return
    }
    const remaining = tabs.filter((t) => t.id !== id)
    setTabs(remaining)
    if (activeTabId === id) setActiveTabId(remaining[0].id)
  }

  function handleLabelChange(id: string, label: string) {
    setTabs((prev) => prev.map((t) => (t.id === id ? { ...t, label } : t)))
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
      <p className="mb-3 text-sm font-medium text-gray-300">Venta rapida</p>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-xs ${
              activeTabId === tab.id
                ? 'border-primary-500 bg-primary-500/10 text-primary-500'
                : 'border-gray-700 text-gray-400'
            }`}
          >
            <button type="button" onClick={() => setActiveTabId(tab.id)}>
              {tab.label}
            </button>
            {tabs.length > 1 && (
              <button
                type="button"
                onClick={() => handleCloseTab(tab.id)}
                aria-label={`Cerrar ${tab.label}`}
                className="text-gray-500 hover:text-danger"
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddTab}
          className="rounded-lg border border-gray-700 px-2 py-1 text-xs text-primary-500 hover:bg-gray-800"
        >
          + Abrir otra cuenta
        </button>
      </div>

      {tabs.map((tab) => (
        <div key={tab.id} className={activeTabId === tab.id ? '' : 'hidden'}>
          <SaleWorkspace onLabelChange={(label) => handleLabelChange(tab.id, label)} />
        </div>
      ))}
    </div>
  )
}
