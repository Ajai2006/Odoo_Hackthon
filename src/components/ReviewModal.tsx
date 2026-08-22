import React, { useState } from 'react';
import { LeaveRequest, ReviewLeavePayload } from '@/types';
import { Check, X, ShieldAlert, AlertTriangle, MessageSquare, Clock, Users } from 'lucide-react';
import StatusBadge from './StatusBadge';

interface ReviewModalProps {
  leave: LeaveRequest;
  reviewerId: number;
  onClose: () => void;
  onSuccess: (updatedLeave: LeaveRequest) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  leave,
  reviewerId,
  onClose,
  onSuccess,
}) => {
  const [decision, setDecision] = useState<'approved' | 'rejected'>('approved');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const quickTemplates = decision === 'approved' ? [
    'Approved. Ensure all pending PRs and handoffs are complete.',
    'Approved. Have a restful time off!',
    'Approved. Please check in with team lead on return.',
  ] : [
    'Rejected due to critical department project deadline.',
    'Rejected due to minimum staffing coverage requirement in department.',
    'Please reschedule to avoid overlap with team sprint release.',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const payload: ReviewLeavePayload = {
        status: decision,
        admin_comment: comment.trim() || undefined,
        reviewer_id: reviewerId,
      };

      const res = await fetch(`/api/leaves/${leave.id}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'Failed to review leave request.');
      } else {
        onSuccess(data.data);
      }
    } catch (err: any) {
      setError('Network error processing review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content review-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-box">
            <div className="icon-wrapper icon-primary">
              <Clock size={18} />
            </div>
            <div>
              <h4 className="modal-title">Review Leave Request #{leave.id}</h4>
              <p className="modal-subtitle">Submitted by {leave.employee_name} ({leave.department})</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        {error && (
          <div className="alert-banner alert-error mx-6 mt-4">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Applicant Summary Card */}
            <div className="review-applicant-card">
              <img
                src={leave.employee_avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
                alt={leave.employee_name}
                className="applicant-avatar"
              />
              <div className="applicant-info">
                <div className="applicant-name-row">
                  <h4 className="applicant-name">{leave.employee_name}</h4>
                  <span className="applicant-dept-badge">{leave.department}</span>
                </div>
                <p className="applicant-email">{leave.employee_email}</p>
              </div>
              <div className="applicant-sla">
                <span className="text-caption">SLA Aging</span>
                {leave.sla && (
                  <StatusBadge status="pending" sla={leave.sla} showSla={true} />
                )}
              </div>
            </div>

            {/* Leave Details Grid */}
            <div className="review-details-grid">
              <div className="detail-item">
                <span className="detail-label">Leave Type</span>
                <span className={`type-tag type-${leave.leave_type}`}>
                  {leave.leave_type.toUpperCase()}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Start Date</span>
                <strong className="detail-val">{leave.start_date}</strong>
              </div>
              <div className="detail-item">
                <span className="detail-label">End Date</span>
                <strong className="detail-val">{leave.end_date}</strong>
              </div>
              <div className="detail-item">
                <span className="detail-label">Total Duration</span>
                <strong className="detail-val highlight">{leave.total_days} Working Days</strong>
              </div>
            </div>

            {/* Reason Box */}
            <div className="review-reason-box">
              <span className="detail-label">Employee Reason</span>
              <p className="reason-quote">"{leave.reason}"</p>
            </div>

            {/* Smart Conflict & Coverage Analysis */}
            {leave.conflicts && leave.conflicts.length > 0 ? (
              <div className="conflict-box conflict-warning">
                <div className="conflict-header">
                  <ShieldAlert size={18} className="text-warning" />
                  <strong>Smart Conflict Radar: {leave.conflicts.length} Overlapping Leave in {leave.department}</strong>
                </div>
                <div className="conflicts-list">
                  {leave.conflicts.map((c) => (
                    <div key={c.leave_id} className="conflict-item-card">
                      <div className="flex-between">
                        <span className="font-semibold text-sm">{c.employee_name}</span>
                        <span className="text-caption text-muted">
                          {c.start_date} to {c.end_date} ({c.overlap_days}d overlap)
                        </span>
                      </div>
                      <div className="flex-between mt-1">
                        <span className="text-caption">{c.leave_type.toUpperCase()} Leave</span>
                        <StatusBadge status={c.status} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="conflict-box conflict-safe">
                <Users size={16} className="text-emerald" />
                <span>Zero team conflicts detected. Full departmental coverage maintained.</span>
              </div>
            )}

            {/* Decision Selector */}
            <div className="form-group mt-4">
              <label className="form-label">Review Decision</label>
              <div className="decision-toggle-grid">
                <button
                  type="button"
                  className={`decision-btn btn-approve ${decision === 'approved' ? 'selected' : ''}`}
                  onClick={() => setDecision('approved')}
                >
                  <Check size={18} />
                  <span>Approve Leave</span>
                </button>
                <button
                  type="button"
                  className={`decision-btn btn-reject ${decision === 'rejected' ? 'selected' : ''}`}
                  onClick={() => setDecision('rejected')}
                >
                  <X size={18} />
                  <span>Reject Leave</span>
                </button>
              </div>
            </div>

            {/* Admin Comment */}
            <div className="form-group">
              <div className="flex-between">
                <label className="form-label" htmlFor="adminComment">
                  <MessageSquare size={14} className="inline mr-1" />
                  Manager / Admin Comment
                </label>
                <span className="text-caption text-muted">
                  {decision === 'rejected' ? 'Required for rejection' : 'Optional note for employee'}
                </span>
              </div>
              <textarea
                id="adminComment"
                rows={2}
                className="form-textarea"
                placeholder={decision === 'approved' ? 'Add an approval note or handoff instructions...' : 'State reason for rejection...'}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required={decision === 'rejected'}
              />

              {/* Quick Template Pills */}
              <div className="template-pills-row">
                <span className="text-caption text-muted">Quick templates:</span>
                {quickTemplates.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className="template-pill"
                    onClick={() => setComment(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {decision === 'approved' && (
              <div className="attendance-sync-notice">
                <div className="pulse-dot-green" />
                <span>
                  <strong>Immediate Attendance Sync:</strong> Approving will automatically update the attendance calendar for <strong>{leave.employee_name}</strong> from <strong>{leave.start_date}</strong> to <strong>{leave.end_date}</strong> to status <em>"Leave"</em>.
                </span>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || (decision === 'rejected' && comment.trim().length === 0)}
              className={`btn ${decision === 'approved' ? 'btn-approve-solid' : 'btn-reject-solid'}`}
            >
              {submitting ? (
                'Processing...'
              ) : decision === 'approved' ? (
                <>
                  <Check size={16} />
                  <span>Confirm & Sync Attendance</span>
                </>
              ) : (
                <>
                  <X size={16} />
                  <span>Confirm Rejection</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
