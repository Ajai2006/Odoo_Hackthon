/**
 * EmployeeDashboard — /employee/dashboard
 *
 * StatCards: today's attendance status, monthly attendance %, pending leaves, leave balance
 * Recent activity feed, payslip shortcut
 *
 * Data: mocked now; wire real endpoints once Members 2 & 3 land.
 * To wire up: replace MOCK_STATS with real api.get() calls in fetchStats().
 */
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Clock, CalendarCheck, FileText, AlertCircle,
  CheckCircle2, XCircle, Timer, ArrowRight,
} from 'lucide-react'
import { clsx } from 'clsx'
import { useAuth } from '@/contexts/AuthContext'
import { StatCard, StatusBadge } from '@/components/ui'
import api from '@/services/api'

// ── ⚠️ MOCK DATA — replace with real API calls at integration time ──────────
const MOCK_STATS = {
  attendance_today:   'present',     // 'present' | 'absent' | 'on-leave' | 'late'
  monthly_attendance: 92.3,          // percent
  pending_leaves:     2,
  leave_balance:      8,             // days remaining
}

const MOCK_ACTIVITY = [
  { id: 1, type: 'attendance', label: 'Checked in',             time: 'Today 09:02 AM', icon: CheckCircle2, color: 'text-success' },
  { id: 2, type: 'leave',      label: 'Leave approved (2 days)', time: 'Yesterday',     icon: CalendarCheck, color: 'text-info'    },
  { id: 3, type: 'payroll',    label: 'Payslip available for July', time: '01 Aug',     icon: FileText,      color: 'text-primary-500' },
  { id: 4, type: 'attendance', label: 'Missed check-out',       time: '29 Jul',         icon: AlertCircle,   color: 'text-warning' },
  { id: 5, type: 'leave',      label: 'Leave applied (1 day)',  time: '25 Jul',         icon: Timer,         color: 'text-warning' },
]
// ─────────────────────────────────────────────────────────────────────────────

export default function EmployeeDashboard() {
  const { user } = useAuth()
  const [stats, setStats]     = useState(null)
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function fetchStats() {
      try {
        // TODO (integration): replace with real calls:
        // const [att, leave] = await Promise.all([
        //   api.get('/api/attendance/my/today/'),
        //   api.get('/api/leave/my/summary/'),
        // ])
        // setStats({ attendance_today: att.data.status, ... })
        await new Promise((r) => setTimeout(r, 600)) // simulate network
        if (!cancelled) {
          setStats(MOCK_STATS)
          setActivity(MOCK_ACTIVITY)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchStats()
    return () => { cancelled = true }
  }, [])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const firstName = user?.first_name || user?.username || 'there'

  return (
    <div className="animate-fade-in">
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-h2 text-primary-900">{greeting()}, {firstName} 👋</h1>
        <p className="text-caption text-text-secondary mt-0.5">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Today's Status"
          value={stats?.attendance_today ? stats.attendance_today.replace('-', ' ').replace(/^\w/, c => c.toUpperCase()) : '—'}
          icon={<Clock size={20} />}
          color={
            stats?.attendance_today === 'present'  ? 'success' :
            stats?.attendance_today === 'absent'   ? 'danger'  :
            stats?.attendance_today === 'on-leave' ? 'info'    : 'warning'
          }
          loading={loading}
        />
        <StatCard
          title="Monthly Attendance"
          value={stats ? `${stats.monthly_attendance}%` : '—'}
          icon={<CheckCircle2 size={20} />}
          color={stats?.monthly_attendance >= 90 ? 'success' : stats?.monthly_attendance >= 75 ? 'warning' : 'danger'}
          trend={stats ? { value: null, label: 'This month', up: null } : null}
          loading={loading}
        />
        <StatCard
          title="Pending Leaves"
          value={stats?.pending_leaves ?? '—'}
          icon={<Timer size={20} />}
          color="warning"
          loading={loading}
        />
        <StatCard
          title="Leave Balance"
          value={stats ? `${stats.leave_balance} days` : '—'}
          icon={<CalendarCheck size={20} />}
          color="info"
          loading={loading}
        />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-bg-surface rounded-card border border-border shadow-card">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-h3 text-primary-900">Recent Activity</h2>
          </div>
          <div className="divide-y divide-border">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="px-5 py-4 flex items-center gap-3">
                    <div className="skeleton w-8 h-8 rounded-full" />
                    <div className="flex-1">
                      <div className="skeleton h-3.5 w-48 rounded mb-1.5" />
                      <div className="skeleton h-3 w-24 rounded" />
                    </div>
                  </div>
                ))
              : activity.map((a) => {
                  const Icon = a.icon
                  return (
                    <div key={a.id} className="px-5 py-4 flex items-center gap-3 hover:bg-bg-primary transition-colors">
                      <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center bg-bg-primary', a.color)}>
                        <Icon size={15} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{a.label}</p>
                        <p className="text-xs text-text-secondary">{a.time}</p>
                      </div>
                    </div>
                  )
                })
            }
          </div>
        </div>

        {/* Quick links */}
        <div className="space-y-4">
          <div className="bg-bg-surface rounded-card border border-border shadow-card p-5">
            <h2 className="text-h3 text-primary-900 mb-4">Quick Links</h2>
            <div className="space-y-2">
              <Link
                to="/employee/payslip"
                id="dashboard-payslip-link"
                className="flex items-center justify-between px-4 py-3 rounded-input bg-primary-500/5 border border-primary-500/20 hover:bg-primary-500/10 transition-colors group"
              >
                <div className="flex items-center gap-2 text-primary-700 font-medium text-sm">
                  <FileText size={15} />
                  View My Payslip
                </div>
                <ArrowRight size={14} className="text-primary-500 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/employee/leave"
                className="flex items-center justify-between px-4 py-3 rounded-input bg-info/5 border border-info/20 hover:bg-info/10 transition-colors group"
              >
                <div className="flex items-center gap-2 text-info font-medium text-sm">
                  <CalendarCheck size={15} />
                  Apply for Leave
                </div>
                <ArrowRight size={14} className="text-info group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/employee/attendance"
                className="flex items-center justify-between px-4 py-3 rounded-input bg-success/5 border border-success/20 hover:bg-success/10 transition-colors group"
              >
                <div className="flex items-center gap-2 text-success font-medium text-sm">
                  <Clock size={15} />
                  Attendance Log
                </div>
                <ArrowRight size={14} className="text-success group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Today's status card */}
          {stats && (
            <div className="bg-bg-surface rounded-card border border-border shadow-card p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3">Today's Status</h3>
              <StatusBadge status={stats.attendance_today} size="lg" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
