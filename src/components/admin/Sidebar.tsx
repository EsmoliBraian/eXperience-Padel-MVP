import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useSettingsStore } from '@/store/settingsStore'
import { useAdminAuthStore } from '@/store/adminAuthStore'

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/reservas', label: 'Reservas' },
  { to: '/admin/horarios', label: 'Horarios' },
  { to: '/admin/slides', label: 'Slides / Hero' },
  { to: '/admin/torneos', label: 'Torneos' },
  { to: '/admin/productos', label: 'Productos' },
  { to: '/admin/ventas', label: 'Ventas del dia' },
  { to: '/admin/metricas', label: 'Metricas' },
  { to: '/admin/configuracion', label: 'Configuracion' },
]

export function Sidebar() {
  const venueName = useSettingsStore((s) => s.venueName)
  const logout = useAdminAuthStore((s) => s.logout)
  const [mobileOpen, setMobileOpen] = useState(false)

  const navContent = (
    <>
      <div className="mb-6 flex items-center gap-2 px-2">
        <span className="h-8 w-8 rounded-full bg-primary-500" />
        <span className="font-semibold text-gray-50">{venueName}</span>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `block rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-primary-500/10 text-primary-500'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        onClick={logout}
        className="rounded-lg px-3 py-2 text-left text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-100"
      >
        Cerrar sesion
      </button>
    </>
  )

  return (
    <>
      <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900 p-4 lg:hidden">
        <div className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-full bg-primary-500" />
          <span className="font-semibold text-gray-50">{venueName}</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menu"
          className="rounded-lg p-2 text-gray-300 hover:bg-gray-800"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="flex w-64 flex-col bg-gray-900 p-4">{navContent}</div>
          <button
            type="button"
            aria-label="Cerrar menu"
            onClick={() => setMobileOpen(false)}
            className="flex-1 bg-black/60"
          />
        </div>
      )}

      <aside className="hidden h-screen w-56 shrink-0 flex-col border-r border-gray-800 bg-gray-900 p-4 lg:flex">
        {navContent}
      </aside>
    </>
  )
}
