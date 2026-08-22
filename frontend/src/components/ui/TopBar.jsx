/**
 * TopBar — Dayflow Navigation Shell Component
 *
 * Left: Global Search input
 * Right: Notification bell with badge & popover, User Avatar + Name + Role + Dropdown (Profile / Logout)
 */
import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Search, Bell, User, LogOut, ChevronDown, CheckCircle2,
  Calendar, DollarSign, Clock, ShieldCheck, X
} from 'lucide-react'
import { clsx } from 'clsx'
import { useAuth } from '@/contexts/AuthContext'

const SAMPLE_NOTIFICATIONS = [
  { id: 1, title: 'Payslip Available', desc: 'July payslip generated and ready for viewing.', time: '10m ago', icon: DollarSign, read: false, color: 'text-success bg-success/10' },
  { id: 2, title: 'Leave Request Update', desc: 'Your 2-day leave request was approved by HR.', time: '1h ago', icon: Calendar, read: false, color: 'text-info bg-info/10' },
  { id: 3, title: 'System Announcement', desc: 'Quarterly review portal opens this Friday.', time: '1d ago', icon: ShieldCheck, read: true, color: 'text-primary-500 bg-primary-100' },
]

export function TopBar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS)

  const notifRef = useRef(null)
  const userRef = useRef(null)

  const unreadCount = notifications.filter(n => !n.read).length

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false)
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const roleName = user?.role === 'admin' ? 'HR Admin' : 'Employee'
  const displayName = user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : (user?.username || 'User')
  const initial = (user?.first_name?.[0] || user?.username?.[0] || 'D').toUpperCase()

  return (
    <header className="h-16 bg-bg-surface border-b border-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Left: Search input & Mobile toggle */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-btn text-text-secondary hover:text-text-primary hover:bg-bg-primary transition-colors"
            aria-label="Toggle Navigation"
          >
            <span className="sr-only">Toggle navigation</span>
            {/* Hamburger Icon */}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        <div className="relative w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search employees, payroll, requests…"
            className={clsx(
              'w-full pl-9 pr-4 py-1.5 text-sm rounded-input border border-border bg-bg-primary',
              'text-text-primary placeholder:text-text-secondary',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-bg-surface',
              'transition-all duration-200',
            )}
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            id="notification-bell"
            onClick={() => setShowNotifications(s => !s)}
            className="relative p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse-soft">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Popover */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-bg-surface rounded-card border border-border shadow-lg z-50 animate-scale-in">
              <div className="p-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-primary-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-xs bg-primary-100 text-primary-700 font-medium rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-primary-500 hover:text-primary-700 font-medium transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="divide-y divide-border max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-text-secondary text-xs">
                    No notifications right now.
                  </div>
                ) : (
                  notifications.map((n) => {
                    const Icon = n.icon
                    return (
                      <div
                        key={n.id}
                        className={clsx(
                          'p-3 flex items-start gap-3 transition-colors hover:bg-bg-primary cursor-pointer',
                          !n.read && 'bg-primary-500/5'
                        )}
                        onClick={() => {
                          setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item))
                        }}
                      >
                        <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5', n.color)}>
                          <Icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-text-primary truncate">{n.title}</p>
                            <span className="text-[11px] text-text-secondary">{n.time}</span>
                          </div>
                          <p className="text-xs text-text-secondary mt-0.5 leading-snug">{n.desc}</p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              <div className="p-2 border-t border-border text-center">
                <span className="text-xs text-text-secondary">Dayflow Notification Center</span>
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-border hidden sm:block" />

        {/* User Profile Dropdown */}
        <div className="relative" ref={userRef}>
          <button
            id="user-menu-button"
            onClick={() => setShowUserMenu(s => !s)}
            className="flex items-center gap-2.5 p-1.5 rounded-btn hover:bg-bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <div className="w-8 h-8 rounded-full bg-primary-700 text-white font-semibold text-xs flex items-center justify-center shrink-0 shadow-sm">
              {initial}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-text-primary leading-none">{displayName}</p>
              <p className="text-[11px] text-text-secondary leading-none mt-1">{roleName}</p>
            </div>
            <ChevronDown size={14} className="text-text-secondary hidden sm:block" />
          </button>

          {/* User Menu Popover */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-bg-surface rounded-card border border-border shadow-lg py-1.5 z-50 animate-scale-in">
              <div className="px-4 py-2 border-b border-border">
                <p className="text-xs font-bold text-primary-900">{displayName}</p>
                <p className="text-[11px] text-text-secondary capitalize">{user?.email || `${user?.username}@dayflow.hrm`}</p>
                <span className="mt-1.5 inline-block px-2 py-0.5 text-[10px] font-semibold bg-primary-100 text-primary-700 rounded-full">
                  {roleName}
                </span>
              </div>

              <Link
                to={user?.role === 'admin' ? '/admin/dashboard' : '/employee/profile'}
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2 px-4 py-2 text-xs text-text-primary hover:bg-bg-primary transition-colors"
              >
                <User size={14} className="text-text-secondary" />
                My Profile & Account
              </Link>

              <div className="border-t border-border my-1" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-danger hover:bg-danger/10 transition-colors text-left"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default TopBar
