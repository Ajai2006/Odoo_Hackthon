import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

/**
 * Shared StatCard Component (Contract owned by Member 4)
 * Props:
 * - title: string
 * - value: string | number
 * - icon: ReactNode (Lucide icon)
 * - change: string | number (e.g. "+4.5%")
 * - changeType: 'positive' | 'negative' | 'neutral'
 * - subtitle: string
 * - variant: 'primary' | 'success' | 'warning' | 'danger' | 'purple'
 */
export function StatCard({
  title,
  value,
  icon,
  change,
  changeType = 'neutral',
  subtitle,
  variant = 'primary'
}) {
  return (
    <div className={`stat-card variant-${variant}`}>
      <div className="stat-header">
        <span className="stat-title">{title}</span>
        {icon && (
          <div className={`stat-icon-wrapper variant-${variant}`}>
            {icon}
          </div>
        )}
      </div>

      <div className="stat-value">{value}</div>

      <div className="stat-footer">
        {change && (
          <span className={`stat-change ${changeType}`}>
            {changeType === 'positive' && <ArrowUpRight size={14} />}
            {changeType === 'negative' && <ArrowDownRight size={14} />}
            {changeType === 'neutral' && <Minus size={14} />}
            {change}
          </span>
        )}
        {subtitle && <span>{subtitle}</span>}
      </div>
    </div>
  );
}

export default StatCard;
