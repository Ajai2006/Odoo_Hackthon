import React from 'react';
import { LeaveStatus, SLAInfo } from '../types';
import { Clock, CheckCircle2, XCircle, AlertCircle, Flame } from 'lucide-react';

interface StatusBadgeProps {
  status: LeaveStatus;
  sla?: SLAInfo;
  showSla?: boolean;
}

/**
 * Member 4 Standard StatusBadge Component for Dayflow HRMS
 * Rule: STATUS IS ALWAYS SHOWN AS COLOR + ICON + LABEL TOGETHER. Never color alone.
 * Tokens:
 *  - Pending:  warning #F59E0B + Clock icon + "Pending"
 *  - Approved: success #10B981 + CheckCircle2 icon + "Approved"
 *  - Rejected: danger  #F43F5E + XCircle icon + "Rejected"
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  sla,
  showSla = false,
}) => {
  const renderBadge = () => {
    switch (status) {
      case 'pending':
        return (
          <span className="status-badge status-badge-pending" aria-label="Status: Pending">
            <Clock size={13} aria-hidden="true" />
            <span>Pending</span>
          </span>
        );
      case 'approved':
        return (
          <span className="status-badge status-badge-approved" aria-label="Status: Approved">
            <CheckCircle2 size={13} aria-hidden="true" />
            <span>Approved</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="status-badge status-badge-rejected" aria-label="Status: Rejected">
            <XCircle size={13} aria-hidden="true" />
            <span>Rejected</span>
          </span>
        );
      default:
        return (
          <span className="status-badge" aria-label={`Status: ${status}`}>
            <AlertCircle size={13} aria-hidden="true" />
            <span>{status}</span>
          </span>
        );
    }
  };

  const renderSlaTag = () => {
    if (!showSla || !sla || status !== 'pending') return null;

    let tagClass = 'sla-tag-normal';
    let Icon = Clock;

    if (sla.urgency === 'urgent') {
      tagClass = 'sla-tag-escalated';
      Icon = Flame;
    } else if (sla.urgency === 'warning') {
      tagClass = 'sla-tag-warning';
      Icon = AlertCircle;
    }

    return (
      <span
        className={`sla-tag ${tagClass}`}
        title={`Request age: ${sla.pending_hours} hours`}
        aria-label={`SLA aging: ${sla.label}`}
      >
        <Icon size={12} aria-hidden="true" />
        <span>{sla.label}</span>
      </span>
    );
  };

  return (
    <div className="status-badge-wrapper">
      {renderBadge()}
      {renderSlaTag()}
    </div>
  );
};

export default StatusBadge;
