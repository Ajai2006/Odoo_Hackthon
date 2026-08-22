import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Sidebar, TopBar } from '@/components/ui'

// ── Pages ──────────────────────────────────────────────────────
import LandingPage        from '@/pages/LandingPage'
import Login              from '@/pages/Login'
import Register           from '@/pages/Register'
import NotFound           from '@/pages/NotFound'

import EmployeeDashboard  from '@/pages/employee/EmployeeDashboard'
import PayslipViewer      from '@/pages/employee/PayslipViewer'
import LeavePage          from '@/pages/employee/LeavePage'
import AdminDashboard     from '@/pages/admin/AdminDashboard'
import PayrollTable       from '@/pages/admin/PayrollTable'

// ── Guards ─────────────────────────────────────────────────────
function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-bg-primary text-text-secondary">
        <div className="w-10 h-10 border-4 border-primary-100 border-t-primary-700 rounded-full animate-spin mb-3" />
        <span className="text-xs font-semibold">Authenticating Session…</span>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return children
}

function RequireAdmin({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user?.role !== 'admin') return <Navigate to="/employee/dashboard" replace />
  return children
}

// ── Shared Layout Shell (Sidebar + TopBar + Main Content) ───────
export function AppLayout() {
  const { user } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="page-layout">
      {/* Role-aware Sidebar */}
      <Sidebar role={user?.role} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main View Area with TopBar */}
      <div className="flex-1 flex flex-col min-w-0 bg-bg-primary min-h-screen">
        <TopBar onMenuClick={() => setMobileOpen(true)} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Navigation Shell */}
        <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
          {/* Employee Views */}
          <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
          <Route path="/employee/payslip"   element={<PayslipViewer />} />
          <Route path="/employee/leave"     element={<LeavePage />} />

          {/* Admin Views */}
          <Route path="/admin/dashboard" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
          <Route path="/admin/payroll"   element={<RequireAdmin><PayrollTable /></RequireAdmin>} />
        </Route>

        {/* 404 / Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
