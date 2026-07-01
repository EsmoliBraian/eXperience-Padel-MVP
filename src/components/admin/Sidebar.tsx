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

  return (
    <aside className="flex h-screen w-56 shrink-0 flex-col border-r border-gray-800 bg-gray-900 p-4">
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
    </aside>
  )
}
