/**
 * Sidebar — Dayflow Design System Component
 *
 * Active Nav Item = primary-100 background + primary-700 text + left accent bar.
 * Responsive: persistent labeled sidebar on desktop (>1024px), collapsible icon rail on tablet (640-1024px), drawer on mobile (<640px).
 */
import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, Clock, CalendarCheck, DollarSign,
  Settings, LogOut, ChevronLeft, ChevronRight, X, FileText, BarChart3,
} from 'lucide-react'
import { clsx } from 'clsx'
import { useAuth } from '@/contexts/AuthContext'

const ADMIN_NAV = [
  { to: '/admin/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { to: '/admin/employees',  label: 'Employees',  icon: Users },
  { to: '/admin/attendance', label: 'Attendance', icon: Clock },
  { to: '/admin/leave',      label: 'Leave',      icon: CalendarCheck },
  { to: '/admin/payroll',    label: 'Payroll',    icon: DollarSign },
  { to: '/admin/reports',    label: 'Reports',    icon: BarChart3 },
  { to: '/admin/settings',   label: 'Settings',   icon: Settings },
]

const EMPLOYEE_NAV = [
  { to: '/employee/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { to: '/employee/attendance',label: 'Attendance', icon: Clock },
  { to: '/employee/leave',     label: 'Leave',      icon: CalendarCheck },
  { to: '/employee/payslip',   label: 'My Payslip', icon: FileText },
  { to: '/employee/profile',   label: 'Profile',    icon: Users },
]

function NavItem({ to, label, icon: Icon, collapsed }) {
  return (
    <NavLink
      to={to}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        clsx(
          'flex items-center gap-3 px-3 py-2.5 rounded-btn font-medium transition-all duration-200 group relative',
          isActive
            ? 'bg-primary-100 text-primary-700 shadow-sm font-semibold'
            : 'text-slate-300 hover:bg-white/10 hover:text-white',
          collapsed && 'justify-center px-2',
        )
      }
    >
      {({ isActive }) => (
        <>
          {/* Active Accent Bar */}
          {isActive && (
            <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-primary-700 rounded-r" />
          )}

          <Icon
            size={18}
            strokeWidth={isActive ? 2.5 : 2}
            className={clsx(
              'shrink-0 transition-transform duration-200 group-hover:scale-105',
              isActive ? 'text-primary-700' : 'text-slate-300',
            )}
          />
          {!collapsed && (
            <span className="truncate animate-fade-in text-sm">{label}</span>
          )}
          {collapsed && (
            <span className={clsx(
              'absolute left-full ml-2 px-2.5 py-1 text-xs bg-primary-900 text-white rounded-btn',
              'opacity-0 pointer-events-none group-hover:opacity-100 whitespace-nowrap z-50',
              'transition-opacity duration-150 shadow-lg border border-slate-700',
            )}>
              {label}
            </span>
          )}
        </>
      )}
    </NavLink>
  )
}

export function Sidebar({ role: roleProp, mobileOpen, setMobileOpen }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const role = roleProp ?? user?.role ?? 'employee'
  const navItems = role === 'admin' ? ADMIN_NAV : EMPLOYEE_NAV

  const [collapsed, setCollapsed] = useState(false)

  // Auto-collapse on tablet
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px) and (max-width: 1023px)')
    const handler = (e) => { if (e.matches) setCollapsed(true) }
    mq.addEventListener('change', handler)
    if (mq.matches) setCollapsed(true)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Close mobile drawer on navigation
  useEffect(() => { setMobileOpen?.(false) }, [navigate, setMobileOpen])

  const handleLogout = () => { logout(); navigate('/login') }

  const sidebarContent = (
    <aside
      className={clsx(
        'flex flex-col h-full bg-primary-900 transition-all duration-300 select-none border-r border-slate-800',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Brand Header */}
      <div className={clsx(
        'flex items-center gap-3 px-4 py-4 border-b border-white/10 shrink-0 h-16',
        collapsed && 'justify-center px-2',
      )}>
        <div className="w-8 h-8 rounded-btn bg-primary-700 flex items-center justify-center shrink-0 shadow-md">
          <span className="text-white font-bold text-base select-none">D</span>
        </div>
        {!collapsed && (
          <div className="animate-fade-in min-w-0">
            <p className="text-white font-bold text-base leading-none truncate">Dayflow</p>
            <p className="text-slate-400 text-[11px] truncate mt-0.5 font-medium">HRMS Platform</p>
          </div>
        )}
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} collapsed={collapsed} />
        ))}
      </nav>

      {/* Footer controls */}
      <div className="shrink-0 border-t border-white/10 px-2 py-3 space-y-1">
        <button
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={clsx(
            'hidden lg:flex items-center gap-2 w-full px-3 py-2 rounded-btn',
            'text-slate-400 hover:text-white hover:bg-white/10 transition-colors text-xs font-medium',
            collapsed && 'justify-center',
          )}
        >
          {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span>Collapse</span></>}
        </button>

        <button
          onClick={handleLogout}
          title="Sign out"
          className={clsx(
            'flex items-center gap-3 w-full px-3 py-2 rounded-btn',
            'text-slate-400 hover:text-danger hover:bg-danger/10 transition-colors text-xs font-medium',
            collapsed && 'justify-center px-2',
          )}
        >
          <LogOut size={16} className="shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  )

  return (
    <>
      {/* Desktop / Tablet persistent sidebar */}
      <div className="hidden sm:flex h-screen sticky top-0 z-30">
        {sidebarContent}
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="sm:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 flex h-full animate-slide-in">
            <aside className="flex flex-col h-full bg-primary-900 w-64">
              <div className="flex items-center justify-between px-4 py-4 border-b border-white/10 h-16">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-btn bg-primary-700 flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-base">D</span>
                  </div>
                  <div>
                    <p className="text-white font-bold text-base leading-none">Dayflow</p>
                    <p className="text-slate-400 text-xs mt-0.5">HRMS Platform</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-btn hover:bg-white/10"
                >
                  <X size={18} />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
                {navItems.map((item) => (
                  <NavItem key={item.to} {...item} collapsed={false} />
                ))}
              </nav>
              <div className="border-t border-white/10 px-2 py-3">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-3 py-2 rounded-btn text-slate-400 hover:text-danger hover:bg-danger/10 transition-colors text-xs font-medium"
                >
                  <LogOut size={16} />
                  <span>Sign out</span>
                </button>
              </div>
            </aside>
          </div>
        </div>
      )}
    </>
  )
}

export default Sidebar
