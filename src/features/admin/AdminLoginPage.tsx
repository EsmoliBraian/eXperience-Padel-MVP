import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAdminAuthStore } from '@/store/adminAuthStore'

export function AdminLoginPage() {
  const isAuthenticated = useAdminAuthStore((s) => s.isAuthenticated)
  const login = useAdminAuthStore((s) => s.login)
  const navigate = useNavigate()
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState(false)

  if (isAuthenticated) return <Navigate to="/admin" replace />

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (login(user, pass)) {
      navigate('/admin')
    } else {
      setError(true)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl border border-gray-800 bg-gray-900 p-6"
      >
        <h1 className="mb-6 text-lg font-semibold text-gray-50">Panel de administracion</h1>

        <label className="mb-3 block text-sm text-gray-400">
          Usuario
          <input
            value={user}
            onChange={(e) => setUser(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-gray-100 outline-none focus:border-primary-500"
          />
        </label>

        <label className="mb-4 block text-sm text-gray-400">
          Contrasena
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-gray-100 outline-none focus:border-primary-500"
          />
        </label>

        {error && <p className="mb-4 text-sm text-danger">Usuario o contrasena incorrectos.</p>}

        <button
          type="submit"
          className="w-full rounded-lg bg-primary-500 py-2 font-medium text-gray-950 hover:bg-primary-400"
        >
          Ingresar
        </button>
      </form>
    </div>
  )
}
