import React, { useState } from 'react';
import { LeaveRequest } from '@/types';
import StatusBadge from './StatusBadge';
import { ReviewModal } from './ReviewModal';
import { ShieldCheck, Flame, AlertTriangle, Clock, CheckCircle2, UserCheck, ShieldAlert, Sparkles } from 'lucide-react';

interface AdminApprovalQueueProps {
  pendingLeaves: LeaveRequest[];
  adminId: number;
  onLeaveReviewed: (updated: LeaveRequest) => void;
  refreshLeaves: () => void;
}

export const AdminApprovalQueue: React.FC<AdminApprovalQueueProps> = ({
  pendingLeaves,
  adminId,
  onLeaveReviewed,
  refreshLeaves,
}) => {
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);

  const urgentCount = pendingLeaves.filter((l) => l.sla?.urgency === 'urgent').length;
  const warningCount = pendingLeaves.filter((l) => l.sla?.urgency === 'warning').length;
  const normalCount = pendingLeaves.filter((l) => l.sla?.urgency === 'normal').length;

  return (
    <div className="admin-queue-section">
      {/* SLA Metric Overview Cards */}
      <div className="sla-metrics-grid">
        <div className="sla-metric-card sla-metric-total">
          <div className="metric-icon-box">
            <Clock size={20} />
          </div>
          <div className="metric-info">
            <span className="metric-val">{pendingLeaves.length}</span>
            <span className="metric-title">Pending Approvals</span>
          </div>
        </div>

        <div className="sla-metric-card sla-metric-urgent">
          <div className="metric-icon-box">
            <Flame size={20} />
          </div>
          <div className="metric-info">
            <span className="metric-val">{urgentCount}</span>
            <span className="metric-title">Urgent SLA (>3 Days)</span>
          </div>
        </div>

        <div className="sla-metric-card sla-metric-warning">
          <div className="metric-icon-box">
            <AlertTriangle size={20} />
          </div>
          <div className="metric-info">
            <span className="metric-val">{warningCount}</span>
            <span className="metric-title">Approaching SLA (1-3d)</span>
          </div>
        </div>

        <div className="sla-metric-card sla-metric-normal">
          <div className="metric-icon-box">
            <CheckCircle2 size={20} />
          </div>
          <div className="metric-info">
            <span className="metric-val">{normalCount}</span>
            <span className="metric-title">On Track (&lt;24h)</span>
          </div>
        </div>
      </div>

      {/* Pending Queue Card */}
      <div className="card queue-card">
        <div className="card-header flex-between">
          <div className="card-title-group">
            <div className="icon-wrapper icon-warning">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h3 className="card-title">Pending Leave Approval Queue</h3>
              <p className="card-subtitle">
                Requests prioritized by SLA aging urgency with automated team conflict detection
              </p>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={refreshLeaves}>
            <Sparkles size={14} />
            <span>Refresh Queue</span>
          </button>
        </div>

        {pendingLeaves.length === 0 ? (
          <div className="queue-empty-state">
            <div className="empty-icon-circle">
              <ShieldCheck size={36} className="text-emerald" />
            </div>
            <h4>All Clear! No Pending Leave Requests</h4>
            <p className="text-muted">All incoming employee leave requests have been reviewed and synchronized.</p>
          </div>
        ) : (
          <div className="pending-cards-list">
            {pendingLeaves.map((leave) => {
              const hasConflict = leave.conflicts && leave.conflicts.length > 0;
              const isUrgent = leave.sla?.urgency === 'urgent';

              return (
                <div
                  key={leave.id}
                  className={`pending-request-card ${isUrgent ? 'card-urgent-glow' : ''} ${
                    hasConflict ? 'card-conflict-border' : ''
                  }`}
                >
                  <div className="pending-card-top flex-between">
                    <div className="applicant-profile-mini">
                      <img
                        src={leave.employee_avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
                        alt={leave.employee_name}
                        className="applicant-avatar-sm"
                      />
                      <div>
                        <div className="applicant-title-line">
                          <span className="applicant-name-bold">{leave.employee_name}</span>
                          <span className="dept-tag">{leave.department}</span>
                        </div>
                        <span className="applicant-email-sub">{leave.employee_email}</span>
                      </div>
                    </div>

                    <div className="top-right-badges">
                      <StatusBadge status="pending" sla={leave.sla} showSla={true} size="md" />
                    </div>
                  </div>

                  <div className="pending-card-details">
                    <div className="details-chip-row">
                      <span className={`type-tag type-${leave.leave_type}`}>
                        {leave.leave_type.toUpperCase()} LEAVE
                      </span>
                      <span className="date-chip">
                        📅 {leave.start_date} <span className="text-muted">to</span> {leave.end_date}
                      </span>
                      <span className="days-chip">
                        ⏱️ <strong>{leave.total_days} working days</strong>
                      </span>
                    </div>

                    <p className="leave-reason-quote">
                      "{leave.reason}"
                    </p>

                    {/* Conflict Alert Banner */}
                    {hasConflict && (
                      <div className="conflict-badge-banner">
                        <ShieldAlert size={14} />
                        <span>
                          <strong>Smart Conflict Warning:</strong> {leave.conflicts!.length} overlapping leave request in {leave.department} team ({leave.conflicts!.map(c => c.employee_name).join(', ')})
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pending-card-actions flex-between">
                    <span className="created-timestamp-sub">
                      Applied {leave.created_at}
                    </span>
                    <button
                      className="btn btn-primary btn-sm review-action-btn"
                      onClick={() => setSelectedLeave(leave)}
                    >
                      <UserCheck size={16} />
                      <span>Review & Decide</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedLeave && (
        <ReviewModal
          leave={selectedLeave}
          reviewerId={adminId}
          onClose={() => setSelectedLeave(null)}
          onSuccess={(updated) => {
            setSelectedLeave(null);
            onLeaveReviewed(updated);
          }}
        />
      )}
    </div>
  );
};

export default AdminApprovalQueue;
