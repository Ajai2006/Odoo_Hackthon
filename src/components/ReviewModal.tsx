import React, { useState } from 'react';
import { LeaveRequest, ReviewLeavePayload } from '../types';
import { Check, X, ShieldAlert, AlertTriangle, MessageSquare, Clock, Users } from 'lucide-react';
import StatusBadge from './StatusBadge';
import LeaveTypeBadge from './LeaveTypeBadge';

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
  const [commentTouched, setCommentTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const quickTemplates = decision === 'approved' ? [
    'Approved. Ensure handoffs and sprint PRs are complete.',
    'Approved. Enjoy your time off!',
    'Approved. Check in with team lead upon return.',
  ] : [
    'Rejected due to critical department deadline.',
    'Rejected due to team coverage minimum requirement.',
    'Please reschedule to avoid sprint blackout dates.',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommentTouched(true);
    setError('');

    if (decision === 'rejected' && comment.trim().length === 0) {
      return;
    }

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
        setError(data.message || 'Failed to process leave review.');
      } else {
        onSuccess(data.data);
      }
    } catch (err: any) {
      setError('Network error processing review.');
    } finally {
      setSubmitting(false);
    }
  };

  const isRejectInvalid = decision === 'rejected' && commentTouched && comment.trim().length === 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-box">
          <div className="flex-align-center gap-2">
            <div className="brand-icon-box" style={{ width: '28px', height: '28px' }}>
              <Clock size={15} />
            </div>
            <div>
              <h3>Review Leave Request #{leave.id}</h3>
              <p className="text-caption">Submitted by {leave.employee_name} ({leave.department})</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">✕</button>
        </div>

        {error && (
          <div style={{ margin: '16px 24px 0', padding: '8px 12px', backgroundColor: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-input)', color: 'var(--danger)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={15} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body-content">
            {/* Applicant Detail Header Card */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-primary)', padding: '12px 16px', borderRadius: 'var(--radius-input)', border: '1px solid var(--border)' }}>
              <div className="flex-align-center gap-3">
                <img
                  src={leave.employee_avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
                  alt={leave.employee_name}
                  className="user-avatar"
                  style={{ width: '40px', height: '40px' }}
                />
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--primary-900)' }}>{leave.employee_name}</h4>
                  <p className="text-caption">{leave.department} • {leave.employee_email}</p>
                </div>
              </div>
              {leave.sla && (
                <StatusBadge status="pending" sla={leave.sla} showSla={true} />
              )}
            </div>

            {/* Leave Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-input)' }}>
              <div>
                <span className="text-label">Leave Type</span>
                <div style={{ marginTop: '2px' }}>
                  <LeaveTypeBadge type={leave.leave_type} />
                </div>
              </div>
              <div>
                <span className="text-label">Total Duration</span>
                <p className="tabular-nums font-semibold" style={{ fontSize: '14px', marginTop: '2px' }}>
                  {leave.total_days} Working Days
                </p>
              </div>
              <div>
                <span className="text-label">Start Date</span>
                <p style={{ fontSize: '14px', fontWeight: 500 }}>{leave.start_date}</p>
              </div>
              <div>
                <span className="text-label">End Date</span>
                <p style={{ fontSize: '14px', fontWeight: 500 }}>{leave.end_date}</p>
              </div>
            </div>

            {/* Employee Reason */}
            <div style={{ backgroundColor: 'var(--bg-primary)', padding: '12px 16px', borderRadius: 'var(--radius-input)', border: '1px solid var(--border)' }}>
              <span className="text-label">Employee Reason</span>
              <p style={{ fontSize: '14px', fontStyle: 'italic', marginTop: '4px', color: 'var(--text-primary)' }}>
                "{leave.reason}"
              </p>
            </div>

            {/* Smart Conflict & Coverage Analysis */}
            {leave.conflicts && leave.conflicts.length > 0 ? (
              <div style={{ backgroundColor: 'var(--warning-bg)', border: '1px solid var(--warning-border)', padding: '12px 16px', borderRadius: 'var(--radius-input)', color: '#B45309' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, marginBottom: '6px' }}>
                  <ShieldAlert size={16} />
                  <span>Team Conflict Warning: {leave.conflicts.length} Overlapping Leave in {leave.department}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
                  {leave.conflicts.map((c) => (
                    <div key={c.leave_id} style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.6)', padding: '4px 8px', borderRadius: '4px' }}>
                      <span><strong>{c.employee_name}</strong> ({c.start_date} to {c.end_date})</span>
                      <span>{c.overlap_days}d overlap • {c.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ backgroundColor: 'var(--success-bg)', border: '1px solid var(--success-border)', padding: '8px 12px', borderRadius: 'var(--radius-input)', color: '#047857', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={15} />
                <span>Zero team conflicts detected. Full departmental coverage maintained.</span>
              </div>
            )}

            {/* Decision Toggle */}
            <div className="form-field">
              <label className="field-label">Review Decision</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                  type="button"
                  className={`btn ${decision === 'approved' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    backgroundColor: decision === 'approved' ? 'var(--success)' : 'transparent',
                    borderColor: decision === 'approved' ? 'var(--success)' : 'var(--border)',
                    color: decision === 'approved' ? '#FFFFFF' : 'var(--text-secondary)'
                  }}
                  onClick={() => setDecision('approved')}
                >
                  <Check size={16} />
                  <span>Approve Leave</span>
                </button>

                <button
                  type="button"
                  className={`btn ${decision === 'rejected' ? 'btn-danger-solid' : 'btn-secondary'}`}
                  style={{
                    backgroundColor: decision === 'rejected' ? 'var(--danger)' : 'transparent',
                    borderColor: decision === 'rejected' ? 'var(--danger)' : 'var(--border)',
                    color: decision === 'rejected' ? '#FFFFFF' : 'var(--text-secondary)'
                  }}
                  onClick={() => setDecision('rejected')}
                >
                  <X size={16} />
                  <span>Reject Leave</span>
                </button>
              </div>
            </div>

            {/* Admin Comment */}
            <div className="form-field">
              <div className="form-label-row">
                <label className="field-label" htmlFor="reviewComment">
                  <MessageSquare size={13} style={{ display: 'inline', marginRight: '4px' }} />
                  Manager Feedback / Comment
                </label>
                <span className="text-caption" style={{ fontSize: '11px' }}>
                  {decision === 'rejected' ? '(Required for rejection)' : '(Optional note for employee)'}
                </span>
              </div>
              <textarea
                id="reviewComment"
                rows={2}
                className={`form-textarea ${isRejectInvalid ? 'input-has-error' : ''}`}
                placeholder={decision === 'approved' ? 'Add optional approval instructions or notes...' : 'Reason for rejection (required)...'}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onBlur={() => setCommentTouched(true)}
                required={decision === 'rejected'}
              />
              {isRejectInvalid && (
                <div className="inline-field-error">
                  <AlertTriangle size={13} />
                  <span>Rejection reason is required before confirming.</span>
                </div>
              )}

              {/* Quick Template Pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                <span className="text-label" style={{ alignSelf: 'center' }}>Templates:</span>
                {quickTemplates.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '2px 8px', fontSize: '11px', border: '1px dashed var(--border)' }}
                    onClick={() => setComment(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {decision === 'approved' && (
              <div style={{ backgroundColor: 'var(--primary-50)', border: '1px solid var(--primary-100)', padding: '8px 12px', borderRadius: 'var(--radius-input)', fontSize: '12px', color: 'var(--primary-700)' }}>
                ⚡ <strong>Attendance Sync Hook:</strong> Approving will immediately sync <strong>{leave.employee_name}</strong>'s attendance calendar from <strong>{leave.start_date}</strong> to <strong>{leave.end_date}</strong> as <em>"Leave"</em>.
              </div>
            )}
          </div>

          <div className="modal-footer-box">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || (decision === 'rejected' && comment.trim().length === 0)}
              className={`btn btn-sm ${decision === 'approved' ? 'btn-primary' : 'btn-danger-solid'}`}
              style={{
                backgroundColor: decision === 'approved' ? 'var(--primary-700)' : 'var(--danger)',
                borderColor: decision === 'approved' ? 'var(--primary-700)' : 'var(--danger)'
              }}
            >
              {submitting ? (
                'Processing...'
              ) : decision === 'approved' ? (
                <>
                  <Check size={14} />
                  <span>Confirm Approval & Sync</span>
                </>
              ) : (
                <>
                  <X size={14} />
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
