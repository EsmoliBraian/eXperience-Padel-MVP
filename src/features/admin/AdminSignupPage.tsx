import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAdminAuthStore } from '@/store/adminAuthStore'

export function AdminSignupPage() {
  const isAuthenticated = useAdminAuthStore((s) => s.isAuthenticated)
  const signUp = useAdminAuthStore((s) => s.signUp)
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false)

  if (isAuthenticated) return <Navigate to="/admin/setup" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Las contrasenas no coinciden.')
      return
    }
    if (password.length < 6) {
      setError('La contrasena debe tener al menos 6 caracteres.')
      return
    }

    setSubmitting(true)
    const { error: signUpError, hasSession } = await signUp(email, password)
    setSubmitting(false)

    if (signUpError) {
      setError(signUpError)
      return
    }
    if (hasSession) {
      navigate('/admin/setup')
    } else {
      setAwaitingConfirmation(true)
    }
  }

  if (awaitingConfirmation) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-xl border border-gray-800 bg-gray-900 p-6 text-center">
          <h1 className="mb-3 text-lg font-semibold text-gray-50">Confirma tu email</h1>
          <p className="text-sm text-gray-400">
            Te enviamos un link de confirmacion a {email}. Una vez confirmado, iniciá sesión para
            configurar tu club.
          </p>
          <Link to="/admin/login" className="mt-4 inline-block text-sm text-primary-500 hover:underline">
            Ir a iniciar sesion
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl border border-gray-800 bg-gray-900 p-6"
      >
        <h1 className="mb-6 text-lg font-semibold text-gray-50">Crear cuenta de club</h1>

        <label className="mb-3 block text-sm text-gray-400">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-925 px-3 py-2 text-gray-100 outline-none focus:border-primary-500"
          />
        </label>

        <label className="mb-3 block text-sm text-gray-400">
          Contrasena
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-925 px-3 py-2 text-gray-100 outline-none focus:border-primary-500"
          />
        </label>

        <label className="mb-4 block text-sm text-gray-400">
          Repetir contrasena
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-925 px-3 py-2 text-gray-100 outline-none focus:border-primary-500"
          />
        </label>

        {error && <p className="mb-4 text-sm text-danger">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-primary-500 py-2 font-medium text-gray-950 hover:bg-primary-400 disabled:opacity-60"
        >
          {submitting ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>

        <p className="mt-4 text-center text-sm text-gray-500">
          Ya tenes cuenta?{' '}
          <Link to="/admin/login" className="text-primary-500 hover:underline">
            Iniciar sesion
          </Link>
        </p>
      </form>
    </div>
  )
}
