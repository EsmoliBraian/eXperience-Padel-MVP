import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAdminAuthStore } from '@/store/adminAuthStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useCourtsStore } from '@/store/courtsStore'
import { supabase } from '@/lib/supabaseClient'
import { slugify } from '@/lib/slug'
import { ErrorText } from '@/components/ErrorText'

type CheckStatus = 'idle' | 'checking' | 'available' | 'taken'

export function AdminSetupPage() {
  const authInitialized = useAdminAuthStore((s) => s.initialized)
  const isAuthenticated = useAdminAuthStore((s) => s.isAuthenticated)
  const session = useAdminAuthStore((s) => s.session)
  const createVenue = useSettingsStore((s) => s.createVenue)
  const navigate = useNavigate()

  const [checkingExistingVenue, setCheckingExistingVenue] = useState(true)
  const [hasVenue, setHasVenue] = useState(false)

  const [venueName, setVenueName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEditedManually, setSlugEditedManually] = useState(false)
  const [whatsappPhone, setWhatsappPhone] = useState('')
  const [slugStatus, setSlugStatus] = useState<CheckStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !session) return
    useSettingsStore
      .getState()
      .fetchSettingsForOwner(session.user.id)
      .then(() => {
        setHasVenue(!!useSettingsStore.getState().id)
        setCheckingExistingVenue(false)
      })
  }, [isAuthenticated, session])

  useEffect(() => {
    if (!slugEditedManually) setSlug(slugify(venueName))
  }, [venueName, slugEditedManually])

  useEffect(() => {
    if (!slug) {
      setSlugStatus('idle')
      return
    }
    setSlugStatus('checking')
    const timeout = setTimeout(async () => {
      const { data } = await supabase.from('settings').select('id').eq('slug', slug).maybeSingle()
      setSlugStatus(data ? 'taken' : 'available')
    }, 400)
    return () => clearTimeout(timeout)
  }, [slug])

  if (!authInitialized || checkingExistingVenue) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 text-gray-400">
        Cargando...
      </div>
    )
  }
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />
  if (hasVenue) return <Navigate to="/admin" replace />

  async function handleSubmit() {
    if (!session) return
    if (!venueName.trim() || !slug.trim()) {
      setError('Completa el nombre del club y el link.')
      return
    }
    if (slugStatus === 'taken') {
      setError('Ese link ya esta en uso, elegi otro.')
      return
    }

    setSubmitting(true)
    const createError = await createVenue({
      ownerId: session.user.id,
      slug,
      venueName: venueName.trim(),
      whatsappPhone,
    })
    if (createError) {
      setSubmitting(false)
      setError(createError)
      return
    }

    await useCourtsStore.getState().addCourt('Cancha 1', 8000)
    setSubmitting(false)
    navigate('/admin')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
      <div className="w-full max-w-sm rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h1 className="mb-2 text-lg font-semibold text-gray-50">Configura tu club</h1>
        <p className="mb-6 text-sm text-gray-400">
          Esto crea tu club y tu link publico de reservas.
        </p>

        <label className="mb-3 block text-sm text-gray-400">
          Nombre del club
          <input
            value={venueName}
            onChange={(e) => setVenueName(e.target.value)}
            placeholder="Padel Center"
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-gray-100"
          />
        </label>

        <label className="mb-1 block text-sm text-gray-400">
          Tu link
          <div className="mt-1 flex items-center rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-gray-100">
            <span className="text-gray-500">.../</span>
            <input
              value={slug}
              onChange={(e) => {
                setSlug(slugify(e.target.value))
                setSlugEditedManually(true)
              }}
              placeholder="padel-center"
              className="flex-1 bg-transparent outline-none"
            />
          </div>
        </label>
        <p className="mb-3 text-xs">
          {slugStatus === 'checking' && <span className="text-gray-500">Verificando...</span>}
          {slugStatus === 'available' && <span className="text-success">Disponible</span>}
          {slugStatus === 'taken' && <span className="text-danger">Ya esta en uso</span>}
        </p>

        <label className="mb-4 block text-sm text-gray-400">
          Telefono de WhatsApp (con codigo de pais, sin +)
          <input
            value={whatsappPhone}
            onChange={(e) => setWhatsappPhone(e.target.value)}
            placeholder="5491122334455"
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-gray-100"
          />
        </label>

        <ErrorText error={error} />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || slugStatus === 'taken' || slugStatus === 'checking'}
          className="w-full rounded-lg bg-primary-500 py-2 font-medium text-gray-950 hover:bg-primary-400 disabled:opacity-60"
        >
          {submitting ? 'Creando club...' : 'Crear club'}
        </button>
      </div>
    </div>
  )
}
