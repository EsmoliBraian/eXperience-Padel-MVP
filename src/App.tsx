import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { UserHomePage } from '@/features/booking/UserHomePage'
import { BookingFlowPage } from '@/features/booking/BookingFlowPage'
import { AdminLoginPage } from '@/features/admin/AdminLoginPage'
import { AdminLayout } from '@/features/admin/AdminLayout'
import { ProtectedRoute } from '@/features/admin/ProtectedRoute'
import { Dashboard } from '@/features/admin/Dashboard'
import { Reservas } from '@/features/admin/Reservas'
import { Horarios } from '@/features/admin/Horarios'
import { Slides } from '@/features/admin/Slides'
import { Torneos } from '@/features/admin/Torneos'
import { Productos } from '@/features/admin/Productos'
import { VentasDelDia } from '@/features/admin/VentasDelDia'
import { Metricas } from '@/features/admin/Metricas'
import { Configuracion } from '@/features/admin/Configuracion'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserHomePage />} />
        <Route path="/reservar" element={<BookingFlowPage />} />

        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="reservas" element={<Reservas />} />
          <Route path="horarios" element={<Horarios />} />
          <Route path="slides" element={<Slides />} />
          <Route path="torneos" element={<Torneos />} />
          <Route path="productos" element={<Productos />} />
          <Route path="ventas" element={<VentasDelDia />} />
          <Route path="metricas" element={<Metricas />} />
          <Route path="configuracion" element={<Configuracion />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
