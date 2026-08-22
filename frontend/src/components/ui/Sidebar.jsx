/**
 * Sidebar — Dayflow Design System
 *
 * Props:
 *   role  {string}  — 'admin' | 'employee'  (falls back to AuthContext)
 *
 * Behaviour:
 *   - Desktop (>1024px)  : persistent, always visible
 *   - Tablet (640-1024px): collapsible icon-only rail
 *   - Mobile (<640px)    : hidden, toggle via hamburger in TopBar
 */
import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, Clock, CalendarCheck, DollarSign,
  Settings, LogOut, ChevronLeft, ChevronRight, Menu, X,
  FileText, BarChart3,
} from 'lucide-react'
import { clsx } from 'clsx'
import { useAuth } from '@/contexts/AuthContext'

// ── Nav definitions ────────────────────────────────────────────
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

// ── NavItem ────────────────────────────────────────────────────
function NavItem({ to, label, icon: Icon, collapsed }) {
  return (
    <NavLink
      to={to}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        clsx(
          'flex items-center gap-3 px-3 py-2.5 rounded-btn',
          'text-sm font-medium transition-all duration-200 group relative',
          isActive
            ? 'bg-primary-500/15 text-primary-500'
            : 'text-slate-300 hover:bg-white/10 hover:text-white',
          collapsed && 'justify-center px-2',
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            size={18}
            strokeWidth={isActive ? 2.5 : 2}
            className={clsx(
              'shrink-0 transition-transform duration-200 group-hover:scale-110',
              isActive ? 'text-primary-500' : '',
            )}
          />
          {!collapsed && (
            <span className="truncate animate-fade-in">{label}</span>
          )}
          {/* Collapsed tooltip */}
          {collapsed && (
            <span className={clsx(
              'absolute left-full ml-2 px-2 py-1 text-xs bg-primary-900 text-white rounded-btn',
              'opacity-0 pointer-events-none group-hover:opacity-100 whitespace-nowrap z-50',
              'transition-opacity duration-150 shadow-lg',
            )}>
              {label}
            </span>
          )}
        </>
      )}
    </NavLink>
  )
}

// ── Sidebar ────────────────────────────────────────────────────
export function Sidebar({ role: roleProp }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const role = roleProp ?? user?.role ?? 'employee'
  const navItems = role === 'admin' ? ADMIN_NAV : EMPLOYEE_NAV

  const [collapsed, setCollapsed]     = useState(false)   // tablet rail
  const [mobileOpen, setMobileOpen]   = useState(false)   // mobile drawer

  // Auto-collapse on tablet
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)')
    const handler = (e) => { if (e.matches) setCollapsed(true) }
    mq.addEventListener('change', handler)
    if (mq.matches) setCollapsed(true)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false) }, [navigate])

  const handleLogout = () => { logout(); navigate('/login') }

  const sidebarContent = (
    <aside
      className={clsx(
        'flex flex-col h-full bg-primary-900 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Logo / Brand */}
      <div className={clsx(
        'flex items-center gap-3 px-4 py-5 border-b border-white/10 shrink-0',
        collapsed && 'justify-center px-2',
      )}>
        <div className="w-8 h-8 rounded-btn bg-primary-500 flex items-center justify-center shrink-0 shadow-lg">
          <span className="text-white font-bold text-sm select-none">D</span>
        </div>
        {!collapsed && (
          <div className="animate-fade-in min-w-0">
            <p className="text-white font-bold text-sm leading-tight truncate">Dayflow</p>
            <p className="text-slate-400 text-xs truncate">HRMS</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} collapsed={collapsed} />
        ))}
      </nav>

      {/* User & Actions */}
      <div className="shrink-0 border-t border-white/10 px-2 py-3 space-y-1">
        {/* User chip */}
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-3 py-2 mb-1 animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold uppercase">
                {(user.first_name?.[0] ?? user.username?.[0] ?? '?')}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">
                {user.first_name ? `${user.first_name} ${user.last_name ?? ''}`.trim() : user.username}
              </p>
              <p className="text-slate-400 text-xs capitalize truncate">{role}</p>
            </div>
          </div>
        )}

        {/* Collapse toggle (hidden on mobile) */}
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

        {/* Logout */}
        <button
          onClick={handleLogout}
          title="Sign out"
          className={clsx(
            'flex items-center gap-3 w-full px-3 py-2 rounded-btn',
            'text-slate-400 hover:text-danger hover:bg-danger/10 transition-colors text-sm font-medium',
            collapsed && 'justify-center px-2',
          )}
        >
          <LogOut size={16} strokeWidth={2} className="shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  )

  return (
    <>
      {/* Mobile hamburger button — rendered outside sidebar, consumed by layout */}
      <button
        id="sidebar-hamburger"
        onClick={() => setMobileOpen(true)}
        className={clsx(
          'lg:hidden fixed top-4 left-4 z-40',
          'w-10 h-10 flex items-center justify-center rounded-btn bg-primary-900 text-white shadow-lg',
          mobileOpen && 'hidden',
        )}
        aria-label="Open navigation"
      >
        <Menu size={20} />
      </button>

      {/* Desktop / Tablet persistent sidebar */}
      <div className="hidden lg:flex h-screen sticky top-0">
        {sidebarContent}
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 flex h-full animate-slide-in">
            {/* Force expanded on mobile */}
            <aside className="flex flex-col h-full bg-primary-900 w-64">
              {/* Close btn */}
              <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-btn bg-primary-500 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">D</span>
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">Dayflow</p>
                    <p className="text-slate-400 text-xs">HRMS</p>
                  </div>
                </div>
                <button onClick={() => setMobileOpen(false)} className="text-slate-400 hover:text-white p-1">
                  <X size={20} />
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
                  className="flex items-center gap-3 w-full px-3 py-2 rounded-btn text-slate-400 hover:text-danger hover:bg-danger/10 transition-colors text-sm font-medium"
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
