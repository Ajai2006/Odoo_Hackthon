/**
 * AdminDashboard — /admin/dashboard
 *
 * StatCards: total employees, present/absent/on-leave today, pending approvals
 * Searchable DataTable of all employees, recent HR activity feed
 *
 * Data: mocked now; wire real endpoints once Members 2 & 3 land.
 * To wire up: replace MOCK_* constants with real api.get() calls.
 */
import React, { useState, useEffect } from 'react'
import { Users, UserCheck, UserX, Calendar, Clock, AlertCircle, CheckCircle2, DollarSign } from 'lucide-react'
import { clsx } from 'clsx'
import api from '@/services/api'
import { StatCard, DataTable, StatusBadge } from '@/components/ui'

// ── ⚠️ MOCK DATA — replace with real API calls at integration time ──────────
const MOCK_STATS = {
  total_employees:    48,
  present_today:      38,
  absent_today:       5,
  on_leave_today:     5,
  pending_approvals:  7,    // leave requests pending admin action
}

const MOCK_EMPLOYEES = [
  { id: 1, employee_id: 'EMP001', name: 'Arjun Sharma',  department: 'Engineering', designation: 'SDE II',     status: 'present',  attendance_pct: 96 },
  { id: 2, employee_id: 'EMP002', name: 'Priya Nair',    department: 'Design',      designation: 'UI Designer', status: 'present',  attendance_pct: 91 },
  { id: 3, employee_id: 'EMP003', name: 'Rohit Mehta',   department: 'Finance',     designation: 'Analyst',    status: 'on-leave', attendance_pct: 88 },
  { id: 4, employee_id: 'EMP004', name: 'Sneha Iyer',    department: 'HR',          designation: 'HR Manager', status: 'present',  attendance_pct: 94 },
  { id: 5, employee_id: 'EMP005', name: 'Karan Gupta',   department: 'Engineering', designation: 'SDE I',      status: 'absent',   attendance_pct: 79 },
  { id: 6, employee_id: 'EMP006', name: 'Meera Pillai',  department: 'Marketing',   designation: 'Exec',       status: 'present',  attendance_pct: 97 },
  { id: 7, employee_id: 'EMP007', name: 'Vikram Singh',  department: 'Engineering', designation: 'SDE III',    status: 'late',     attendance_pct: 85 },
  { id: 8, employee_id: 'EMP008', name: 'Ananya Das',    department: 'Design',      designation: 'UX Lead',    status: 'present',  attendance_pct: 93 },
]

const MOCK_ACTIVITY = [
  { id: 1, label: 'Karan Gupta marked absent', time: 'Today 09:30 AM', icon: UserX,        color: 'text-danger'  },
  { id: 2, label: 'Leave approved — Rohit Mehta (2d)', time: 'Today 09:15 AM', icon: CheckCircle2, color: 'text-success' },
  { id: 3, label: 'Payroll processed — Aug 2026', time: 'Yesterday', icon: DollarSign,   color: 'text-primary-500' },
  { id: 4, label: '3 leave requests pending review', time: '21 Aug', icon: AlertCircle,  color: 'text-warning' },
  { id: 5, label: 'New employee onboarded — Ananya Das', time: '19 Aug', icon: Users, color: 'text-info' },
]
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [stats, setStats]       = useState(null)
  const [employees, setEmployees] = useState([])
  const [activity, setActivity]   = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    let cancelled = false
    async function fetchData() {
      try {
        // TODO (integration): replace with real calls:
        // const [statsRes, empRes] = await Promise.all([
        //   api.get('/api/attendance/stats/today/'),
        //   api.get('/api/accounts/employees/'),
        // ])
        // setStats(statsRes.data)
        // setEmployees(empRes.data)
        await new Promise((r) => setTimeout(r, 700))
        if (!cancelled) {
          setStats(MOCK_STATS)
          setEmployees(MOCK_EMPLOYEES)
          setActivity(MOCK_ACTIVITY)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [])

  // ── Employee table columns ────────────────────────────────
  const columns = [
    { key: 'employee_id',  label: 'ID', sortable: true, width: '90px' },
    { key: 'name',         label: 'Name', sortable: true },
    { key: 'department',   label: 'Department', sortable: true },
    { key: 'designation',  label: 'Designation', sortable: false },
    {
      key: 'status', label: 'Today', sortable: true,
      render: (v) => <StatusBadge status={v} size="sm" />,
    },
    {
      key: 'attendance_pct', label: 'Attendance %', sortable: true,
      render: (v) => (
        <div className="flex items-center gap-2">
          <div className="w-20 h-1.5 bg-border rounded-full overflow-hidden">
            <div
              className={clsx('h-full rounded-full', v >= 90 ? 'bg-success' : v >= 75 ? 'bg-warning' : 'bg-danger')}
              style={{ width: `${v}%` }}
            />
          </div>
          <span className="tabular-nums text-xs text-text-secondary">{v}%</span>
        </div>
      ),
    },
  ]

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-h2 text-primary-900">Admin Dashboard</h1>
        <p className="text-caption text-text-secondary mt-0.5">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* StatCards row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard title="Total Employees"   value={stats?.total_employees ?? '—'}    icon={<Users size={20}/>}      color="primary"  loading={loading} />
        <StatCard title="Present Today"     value={stats?.present_today ?? '—'}      icon={<UserCheck size={20}/>}  color="success"  loading={loading} />
        <StatCard title="Absent Today"      value={stats?.absent_today ?? '—'}       icon={<UserX size={20}/>}      color="danger"   loading={loading} />
        <StatCard title="On Leave Today"    value={stats?.on_leave_today ?? '—'}     icon={<Calendar size={20}/>}   color="info"     loading={loading} />
        <StatCard title="Pending Approvals" value={stats?.pending_approvals ?? '—'}  icon={<AlertCircle size={20}/>} color="warning" loading={loading} />
      </div>

      {/* Employee DataTable + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-h3 text-primary-900">All Employees</h2>
          </div>
          <DataTable
            columns={columns}
            data={employees}
            loading={loading}
            pageSize={8}
            emptyText="No employee records found."
          />
        </div>

        {/* HR Activity feed */}
        <div className="bg-bg-surface rounded-card border border-border shadow-card h-fit">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-h3 text-primary-900">HR Activity</h2>
          </div>
          <div className="divide-y divide-border">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="px-5 py-4 flex items-center gap-3">
                    <div className="skeleton w-8 h-8 rounded-full shrink-0" />
                    <div className="flex-1">
                      <div className="skeleton h-3.5 w-full rounded mb-1.5" />
                      <div className="skeleton h-3 w-20 rounded" />
                    </div>
                  </div>
                ))
              : activity.map((a) => {
                  const Icon = a.icon
                  return (
                    <div key={a.id} className="px-5 py-4 flex items-start gap-3 hover:bg-bg-primary transition-colors">
                      <div className={clsx('mt-0.5 w-8 h-8 rounded-full flex items-center justify-center bg-bg-primary shrink-0', a.color)}>
                        <Icon size={15} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-text-primary leading-snug">{a.label}</p>
                        <p className="text-xs text-text-secondary mt-0.5">{a.time}</p>
                      </div>
                    </div>
                  )
                })
            }
          </div>
        </div>
      </div>
    </div>
  )
}
