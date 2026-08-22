import React from 'react';
import { LeaveStatus, SLAInfo, SLAUrgency } from '@/types';
import { Clock, CheckCircle2, XCircle, AlertTriangle, Flame } from 'lucide-react';

interface StatusBadgeProps {
  status: LeaveStatus;
  sla?: SLAInfo;
  showSla?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Member 4 Standard StatusBadge Component for Dayflow HRMS
 * Pending = Amber with pulse animation
 * Approved = Emerald Green
 * Rejected = Ruby Red
 * Includes optional SLA aging badge
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  sla,
  showSla = false,
  size = 'md',
}) => {
  const sizeClass = size === 'sm' ? 'badge-sm' : size === 'lg' ? 'badge-lg' : 'badge-md';

  const renderBadge = () => {
    switch (status) {
      case 'pending':
        return (
          <span className={`status-badge status-pending ${sizeClass}`}>
            <span className="pulse-dot" />
            <Clock className="badge-icon" size={14} />
            <span>Pending</span>
          </span>
        );
      case 'approved':
        return (
          <span className={`status-badge status-approved ${sizeClass}`}>
            <CheckCircle2 className="badge-icon" size={14} />
            <span>Approved</span>
          </span>
        );
      case 'rejected':
        return (
          <span className={`status-badge status-rejected ${sizeClass}`}>
            <XCircle className="badge-icon" size={14} />
            <span>Rejected</span>
          </span>
        );
      default:
        return <span className={`status-badge status-neutral ${sizeClass}`}>{status}</span>;
    }
  };

  const renderSlaPill = () => {
    if (!showSla || !sla || status !== 'pending') return null;

    let urgencyClass = 'sla-normal';
    let Icon = Clock;

    if (sla.urgency === 'urgent') {
      urgencyClass = 'sla-urgent';
      Icon = Flame;
    } else if (sla.urgency === 'warning') {
      urgencyClass = 'sla-warning';
      Icon = AlertTriangle;
    }

    return (
      <span className={`sla-pill ${urgencyClass} ${sizeClass}`} title={`Pending for ${sla.pending_hours} hours`}>
        <Icon size={12} className="sla-icon" />
        <span>{sla.label}</span>
      </span>
    );
  };

  return (
    <div className="status-badge-container">
      {renderBadge()}
      {renderSlaPill()}
    </div>
  );
};

export default StatusBadge;
