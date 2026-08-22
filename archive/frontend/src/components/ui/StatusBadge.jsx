/**
 * StatusBadge — Dayflow Design System
 *
 * Props:
 *   status  {string}  — 'present'|'absent'|'on-leave'|'late'|'pending'|'approved'
 *                       |'rejected'|'paid'|'draft'|'active'|'inactive'
 *   size    {string}  — 'sm'|'md'|'lg'  (default: 'md')
 *
 * Rule: ALWAYS renders color + icon + label together. Never color alone.
 */
import React from 'react'
import {
  CheckCircle2, XCircle, Clock, AlertCircle, MinusCircle,
  DollarSign, FileText, UserCheck, UserX, Calendar,
  AlarmClock,
} from 'lucide-react'
import { clsx } from 'clsx'

const STATUS_CONFIG = {
  // Attendance
  present:    { label: 'Present',    icon: CheckCircle2, color: 'success' },
  absent:     { label: 'Absent',     icon: XCircle,      color: 'danger'  },
  late:       { label: 'Late',       icon: AlarmClock,   color: 'warning' },
  'on-leave': { label: 'On Leave',   icon: Calendar,     color: 'info'    },
  // Leave requests
  pending:    { label: 'Pending',    icon: Clock,        color: 'warning' },
  approved:   { label: 'Approved',   icon: CheckCircle2, color: 'success' },
  rejected:   { label: 'Rejected',   icon: XCircle,      color: 'danger'  },
  // Payroll
  paid:       { label: 'Paid',       icon: DollarSign,   color: 'success' },
  draft:      { label: 'Draft',      icon: FileText,     color: 'warning' },
  // Employee
  active:     { label: 'Active',     icon: UserCheck,    color: 'success' },
  inactive:   { label: 'Inactive',   icon: UserX,        color: 'danger'  },
  'n/a':      { label: 'N/A',        icon: MinusCircle,  color: 'neutral' },
}

const COLOR_CLASSES = {
  success: 'bg-success/10 text-success border-success/20',
  danger:  'bg-danger/10  text-danger  border-danger/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  info:    'bg-info/10    text-info    border-info/20',
  neutral: 'bg-slate-100  text-slate-500 border-slate-200',
}

const SIZE_CLASSES = {
  sm: { wrap: 'px-2 py-0.5 text-xs gap-1',    icon: 12 },
  md: { wrap: 'px-2.5 py-1 text-xs gap-1.5',  icon: 13 },
  lg: { wrap: 'px-3 py-1.5 text-sm gap-2',    icon: 15 },
}

export function StatusBadge({ status, size = 'md' }) {
  const key    = (status ?? '').toLowerCase()
  const config = STATUS_CONFIG[key] ?? STATUS_CONFIG['n/a']
  const color  = COLOR_CLASSES[config.color]
  const sz     = SIZE_CLASSES[size] ?? SIZE_CLASSES.md
  const Icon   = config.icon

  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full border',
        'whitespace-nowrap transition-all duration-200',
        color, sz.wrap,
      )}
    >
      <Icon size={sz.icon} strokeWidth={2.2} />
      {config.label}
    </span>
  )
}

export default StatusBadge
