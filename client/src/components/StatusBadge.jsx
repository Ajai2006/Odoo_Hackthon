import React from 'react';
import {
  CheckCircle2,
  Clock,
  XCircle,
  Plane,
  AlertCircle,
  MinusCircle
} from 'lucide-react';

/**
 * StatusBadge — Dayflow accessibility rule:
 * Status ALWAYS = color + icon + label together.
 * Never color alone.
 */
const STATUS_CONFIG = {
  present:    { label: 'Present',    Icon: CheckCircle2, cls: 'present' },
  half_day:   { label: 'Half Day',   Icon: Clock,        cls: 'half_day' },
  halfday:    { label: 'Half Day',   Icon: Clock,        cls: 'half_day' },
  absent:     { label: 'Absent',     Icon: XCircle,      cls: 'absent' },
  leave:      { label: 'Leave',      Icon: Plane,        cls: 'leave' },
  incomplete: { label: 'Incomplete', Icon: AlertCircle,  cls: 'incomplete' },
  weekend:    { label: 'Weekend',    Icon: MinusCircle,  cls: 'weekend' },
  not_marked: { label: 'Not Marked', Icon: MinusCircle,  cls: 'not_marked' },
};

export function StatusBadge({ status, size = 14 }) {
  const key = (status || 'not_marked').toLowerCase().replace('-', '_').replace(' ', '_');
  const cfg = STATUS_CONFIG[key] || STATUS_CONFIG['not_marked'];
  const { label, Icon, cls } = cfg;

  return (
    <span className={`status-badge ${cls}`} role="status" aria-label={label}>
      <Icon size={size} aria-hidden="true" />
      {label}
    </span>
  );
}

export default StatusBadge;
