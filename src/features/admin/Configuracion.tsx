import { useState } from 'react'
import { useSettingsStore } from '@/store/settingsStore'
import { generateId } from '@/lib/format'

export function Configuracion() {
  const settings = useSettingsStore()
  const updateSettings = useSettingsStore((s) => s.updateSettings)

  const [venueName, setVenueName] = useState(settings.venueName)
  const [whatsappPhone, setWhatsappPhone] = useState(settings.whatsappPhone)
  const [pricePerPlayer, setPricePerPlayer] = useState(settings.pricePerPlayer)
  const [priceFullCourt, setPriceFullCourt] = useState(settings.priceFullCourt)
  const [courts, setCourts] = useState(settings.courts)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    updateSettings({ venueName, whatsappPhone, pricePerPlayer, priceFullCourt, courts })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-xl font-semibold text-gray-50">Configuracion</h1>

      <div className="space-y-3 rounded-xl border border-gray-800 bg-gray-900 p-4">
        <label className="block text-sm text-gray-400">
          Nombre del club
          <input
            value={venueName}
            onChange={(e) => setVenueName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-gray-100"
          />
        </label>

        <label className="block text-sm text-gray-400">
          Telefono de WhatsApp (con codigo de pais, sin +)
          <input
            value={whatsappPhone}
            onChange={(e) => setWhatsappPhone(e.target.value)}
            placeholder="5491122334455"
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-gray-100"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm text-gray-400">
            Precio por jugador
            <input
              type="number"
              value={pricePerPlayer}
              onChange={(e) => setPricePerPlayer(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-gray-100"
            />
          </label>
          <label className="block text-sm text-gray-400">
            Precio cancha completa (4 jugadores)
            <input
              type="number"
              value={priceFullCourt}
              onChange={(e) => setPriceFullCourt(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-gray-100"
            />
          </label>
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-gray-800 bg-gray-900 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-300">Canchas</p>
          <button
            type="button"
            onClick={() => setCourts([...courts, { id: generateId(), name: `Cancha ${courts.length + 1}` }])}
            className="text-xs text-primary-500 hover:underline"
          >
            + Agregar cancha
          </button>
        </div>

        {courts.map((court, i) => (
          <div key={court.id} className="flex items-center gap-2">
            <input
              value={court.name}
              onChange={(e) =>
                setCourts(courts.map((c, idx) => (idx === i ? { ...c, name: e.target.value } : c)))
              }
              className="flex-1 rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-gray-100"
            />
            <button
              type="button"
              onClick={() => setCourts(courts.filter((_, idx) => idx !== i))}
              className="text-xs text-danger hover:underline"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleSave}
        className="w-full rounded-lg bg-primary-500 py-2 text-sm font-medium text-gray-950 hover:bg-primary-400"
      >
        Guardar configuracion
      </button>
      {saved && <p className="text-sm text-success">Configuracion guardada.</p>}
    </div>
  )
}
