import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

/**
 * Shared StatCard — Member 4 contract
 * Props: title, value, icon, change, changeType ('up'|'down'|'flat'), subtitle, variant ('primary'|'success'|'warning'|'danger'|'info')
 */
export function StatCard({ title, value, icon, change, changeType = 'flat', subtitle, variant = 'primary' }) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <span className="stat-card-label">{title}</span>
        {icon && (
          <div className={`stat-card-icon ${variant}`} aria-hidden="true">
            {icon}
          </div>
        )}
      </div>

      <div className="stat-card-value">{value}</div>

      <div className="stat-card-footer">
        {change && (
          <span className={`stat-card-change ${changeType}`} aria-label={`Change: ${change}`}>
            {changeType === 'up'   && <ArrowUpRight   size={13} aria-hidden="true" />}
            {changeType === 'down' && <ArrowDownRight  size={13} aria-hidden="true" />}
            {changeType === 'flat' && <Minus           size={13} aria-hidden="true" />}
            {change}
          </span>
        )}
        {subtitle && <span className="text-muted">{subtitle}</span>}
      </div>
    </div>
  );
}

export default StatCard;
