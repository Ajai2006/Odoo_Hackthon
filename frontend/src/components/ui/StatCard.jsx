/**
 * StatCard — Dayflow Design System
 *
 * Props:
 *   title  {string}              — Card label (e.g. "Total Employees")
 *   value  {string|number}       — Primary metric displayed large
 *   icon   {ReactElement}        — Lucide icon element  <Users size={20} />
 *   trend  {object|null}         — { value: number, label: string, up: bool }
 *   color  {string}              — 'primary'|'success'|'warning'|'danger'|'info'
 *   loading {bool}               — shows skeleton while true
 */
import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { clsx } from 'clsx'

const COLOR_MAP = {
  primary: {
    bg:      'bg-primary-500/10',
    icon:    'text-primary-500',
    badge:   'bg-primary-500',
    border:  'border-primary-500/20',
    glow:    '#3B82F6',
  },
  success: {
    bg:      'bg-success/10',
    icon:    'text-success',
    badge:   'bg-success',
    border:  'border-success/20',
    glow:    '#10B981',
  },
  warning: {
    bg:      'bg-warning/10',
    icon:    'text-warning',
    badge:   'bg-warning',
    border:  'border-warning/20',
    glow:    '#F59E0B',
  },
  danger: {
    bg:      'bg-danger/10',
    icon:    'text-danger',
    badge:   'bg-danger',
    border:  'border-danger/20',
    glow:    '#F43F5E',
  },
  info: {
    bg:      'bg-info/10',
    icon:    'text-info',
    badge:   'bg-info',
    border:  'border-info/20',
    glow:    '#06B6D4',
  },
}

export function StatCard({ title, value, icon, trend = null, color = 'primary', loading = false }) {
  const c = COLOR_MAP[color] ?? COLOR_MAP.primary

  if (loading) {
    return (
      <div className="bg-bg-surface rounded-card border border-border p-6 shadow-card">
        <div className="skeleton h-4 w-24 mb-4 rounded" />
        <div className="skeleton h-8 w-16 mb-2 rounded" />
        <div className="skeleton h-3 w-32 rounded" />
      </div>
    )
  }

  return (
    <div
      className={clsx(
        'group relative bg-bg-surface rounded-card border shadow-card overflow-hidden',
        'transition-all duration-300 hover:-translate-y-1 hover:shadow-lg',
        'animate-fade-in',
        c.border,
      )}
    >
      {/* Accent bar */}
      <div
        className={clsx('absolute top-0 left-0 w-1 h-full rounded-l-card', c.badge)}
        style={{ opacity: 0.8 }}
      />

      <div className="p-6 pl-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <p className="text-caption text-text-secondary font-medium uppercase tracking-wide">
            {title}
          </p>
          <span
            className={clsx(
              'flex items-center justify-center w-10 h-10 rounded-input transition-transform duration-300 group-hover:scale-110',
              c.bg, c.icon,
            )}
          >
            {icon}
          </span>
        </div>

        {/* Value */}
        <p
          className="tabular-nums text-3xl font-bold text-primary-900 mb-2"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {value ?? '—'}
        </p>

        {/* Trend */}
        {trend && (
          <div className="flex items-center gap-1.5">
            {trend.up === true  && <TrendingUp  size={14} className="text-success" />}
            {trend.up === false && <TrendingDown size={14} className="text-danger" />}
            {trend.up === null  && <Minus        size={14} className="text-text-secondary" />}
            <span
              className={clsx(
                'text-caption font-medium',
                trend.up === true  && 'text-success',
                trend.up === false && 'text-danger',
                trend.up === null  && 'text-text-secondary',
              )}
            >
              {trend.value != null ? `${trend.value > 0 ? '+' : ''}${trend.value}%` : ''}
            </span>
            {trend.label && (
              <span className="text-caption text-text-secondary">{trend.label}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default StatCard
