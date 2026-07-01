import { useState } from 'react'
import { useSettingsStore } from '@/store/settingsStore'

export function Horarios() {
  const openHour = useSettingsStore((s) => s.openHour)
  const closeHour = useSettingsStore((s) => s.closeHour)
  const updateSettings = useSettingsStore((s) => s.updateSettings)

  const [open, setOpen] = useState(openHour)
  const [close, setClose] = useState(closeHour)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    if (open >= close) return
    updateSettings({ openHour: open, closeHour: close })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-xl font-semibold text-gray-50">Horarios</h1>
      <p className="text-sm text-gray-400">
        Define el rango horario en el que se pueden reservar turnos.
      </p>

      <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
        <label className="mb-3 block text-sm text-gray-400">
          Hora de apertura
          <select
            value={open}
            onChange={(e) => setOpen(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-gray-100"
          >
            {Array.from({ length: 24 }, (_, h) => h).map((h) => (
              <option key={h} value={h}>
                {String(h).padStart(2, '0')}:00
              </option>
            ))}
          </select>
        </label>

        <label className="mb-4 block text-sm text-gray-400">
          Hora de cierre
          <select
            value={close}
            onChange={(e) => setClose(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-gray-100"
          >
            {Array.from({ length: 24 }, (_, h) => h).map((h) => (
              <option key={h} value={h}>
                {String(h).padStart(2, '0')}:00
              </option>
            ))}
          </select>
        </label>

        {open >= close && (
          <p className="mb-3 text-sm text-danger">La apertura debe ser anterior al cierre.</p>
        )}

        <button
          type="button"
          onClick={handleSave}
          className="w-full rounded-lg bg-primary-500 py-2 text-sm font-medium text-gray-950 hover:bg-primary-400"
        >
          Guardar
        </button>

        {saved && <p className="mt-2 text-sm text-success">Horarios actualizados.</p>}
      </div>
    </div>
  )
}
