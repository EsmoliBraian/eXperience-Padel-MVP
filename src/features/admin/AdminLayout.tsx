import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/admin/Sidebar'

export function AdminLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-950 lg:flex-row">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 lg:p-6">
        <Outlet />
      </main>
    </div>
  )
}
