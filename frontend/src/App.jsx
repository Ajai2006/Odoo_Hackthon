import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Sidebar } from '@/components/ui'

// ── Pages ──────────────────────────────────────────────────────
import Login              from '@/pages/Login'
import EmployeeDashboard  from '@/pages/employee/EmployeeDashboard'
import PayslipViewer      from '@/pages/employee/PayslipViewer'
import AdminDashboard     from '@/pages/admin/AdminDashboard'
import PayrollTable       from '@/pages/admin/PayrollTable'

// ── Guards ─────────────────────────────────────────────────────
function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen text-text-secondary">Loading…</div>
  if (!user)   return <Navigate to="/login" replace />
  return children
}

function RequireAdmin({ children }) {
  const { user, loading } = useAuth()
  if (loading)              return null
  if (user?.role !== 'admin') return <Navigate to="/employee/dashboard" replace />
  return children
}

// ── Shared layout with sidebar ──────────────────────────────────
function AppLayout() {
  const { user } = useAuth()
  return (
    <div className="page-layout">
      <Sidebar role={user?.role} />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}

// ── Root redirect based on role ─────────────────────────────────
function RootRedirect() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user)   return <Navigate to="/login" replace />
  return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard'} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected shell */}
        <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
          {/* Employee */}
          <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
          <Route path="/employee/payslip"   element={<PayslipViewer />} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
          <Route path="/admin/payroll"   element={<RequireAdmin><PayrollTable /></RequireAdmin>} />
        </Route>

        {/* Root */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
