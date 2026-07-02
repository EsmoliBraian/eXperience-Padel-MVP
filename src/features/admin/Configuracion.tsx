import { useState } from 'react'
import { useSettingsStore } from '@/store/settingsStore'
import { useCourtsStore } from '@/store/courtsStore'

export function Configuracion() {
  const settings = useSettingsStore()
  const updateSettings = useSettingsStore((s) => s.updateSettings)
  const courts = useCourtsStore((s) => s.courts)
  const addCourt = useCourtsStore((s) => s.addCourt)
  const updateCourt = useCourtsStore((s) => s.updateCourt)
  const deleteCourt = useCourtsStore((s) => s.deleteCourt)

  const [venueName, setVenueName] = useState(settings.venueName)
  const [whatsappPhone, setWhatsappPhone] = useState(settings.whatsappPhone)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    await updateSettings({ venueName, whatsappPhone })
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
      </div>

      <div className="space-y-3 rounded-xl border border-gray-800 bg-gray-900 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-300">Canchas</p>
          <button
            type="button"
            onClick={() => addCourt(`Cancha ${courts.length + 1}`)}
            className="text-xs text-primary-500 hover:underline"
          >
            + Agregar cancha
          </button>
        </div>

        {courts.map((court) => (
          <div key={court.id} className="flex items-center gap-2">
            <input
              value={court.name}
              onChange={(e) => updateCourt(court.id, { name: e.target.value })}
              className="flex-1 rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-gray-100"
            />
            <button
              type="button"
              onClick={() => deleteCourt(court.id)}
              className="text-xs text-danger hover:underline"
            >
              Eliminar
            </button>
          </div>
        ))}
        {courts.length === 0 && <p className="text-sm text-gray-500">No hay canchas cargadas.</p>}
        <p className="text-xs text-gray-500">
          El precio de cada cancha se configura en la seccion Reservas.
        </p>
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
