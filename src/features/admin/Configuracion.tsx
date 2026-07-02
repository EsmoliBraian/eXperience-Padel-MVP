import { useState } from 'react'
import { useSettingsStore } from '@/store/settingsStore'
import { ErrorText } from '@/components/ErrorText'

export function Configuracion() {
  const settings = useSettingsStore()
  const updateSettings = useSettingsStore((s) => s.updateSettings)

  const [venueName, setVenueName] = useState(settings.venueName)
  const [whatsappPhone, setWhatsappPhone] = useState(settings.whatsappPhone)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const dirty = venueName !== settings.venueName || whatsappPhone !== settings.whatsappPhone

  async function handleSave() {
    setSaving(true)
    const saveError = await updateSettings({ venueName, whatsappPhone })
    setSaving(false)
    if (saveError) {
      setError(saveError)
      return
    }
    setError(null)
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

        <p className="text-xs text-gray-500">
          Las canchas y su precio se administran en la seccion Reservas.
        </p>
      </div>

      <ErrorText error={error} />

      <button
        type="button"
        onClick={handleSave}
        disabled={!dirty || saving}
        className="w-full rounded-lg bg-primary-500 py-2 text-sm font-medium text-gray-950 hover:bg-primary-400 disabled:opacity-50"
      >
        {saving ? 'Guardando...' : 'Guardar configuracion'}
      </button>
      {saved && <p className="text-sm text-success">Configuracion guardada.</p>}
    </div>
  )
}
