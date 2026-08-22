import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, CheckCircle2, XCircle, AlertCircle, Plus, Send,
  FileText, ShieldCheck, UserCheck, RefreshCw, MessageSquare
} from 'lucide-react';
import { api } from '../services/api';

export function LeaveManager({ currentUser, showToast }) {
  const isAdmin = currentUser?.role === 'admin';
  const isManager = currentUser?.role === 'manager';
  const canReview = isAdmin || isManager;

  const [activeTab, setActiveTab] = useState('my'); // 'my' | 'review'
  const [balance, setBalance]     = useState(null);
  const [myRequests, setMyRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [formOpen, setFormOpen]   = useState(false);

  // Leave Form state
  const [leaveType, setLeaveType] = useState('paid');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate]     = useState(new Date().toISOString().slice(0, 10));
  const [reason, setReason]       = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Review modal / note state
  const [rejectingId, setRejectingId] = useState(null);
  const [reviewerNote, setReviewerNote] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [balRes, myRes] = await Promise.all([
        api.getLeaveBalance().catch(() => null),
        api.getMyLeaves().catch(() => ({ requests: [] }))
      ]);
      setBalance(balRes?.balance || null);
      setMyRequests(myRes?.requests || []);

      if (canReview) {
        const allRes = await api.getAllLeaves().catch(() => ({ requests: [] }));
        setAllRequests(allRes?.requests || []);
      }
    } catch (err) {
      showToast('Error loading leave data', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.applyLeave({
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        reason
      });
      showToast('Leave Applied', 'Your leave request has been submitted to HR.', 'success');
      setFormOpen(false);
      setReason('');
      await loadData();
    } catch (err) {
      showToast('Application Failed', err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.approveLeave(id, 'Approved by reviewer');
      showToast('Request Approved', 'Leave approved and attendance calendar auto-synced.', 'success');
      await loadData();
    } catch (err) {
      showToast('Approval Error', err.message, 'error');
    }
  };

  const handleRejectSubmit = async (id) => {
    if (!reviewerNote.trim()) {
      showToast('Comment Required', 'Please provide a reason for rejecting the leave request.', 'error');
      return;
    }
    try {
      await api.rejectLeave(id, reviewerNote);
      showToast('Request Rejected', 'Rejection recorded with reviewer comments.', 'info');
      setRejectingId(null);
      setReviewerNote('');
      await loadData();
    } catch (err) {
      showToast('Rejection Error', err.message, 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem 0' }}>
        <div className="skeleton-card" style={{ height: 120, marginBottom: '1.5rem' }} />
        <div className="skeleton-card" style={{ height: 250 }} />
      </div>
    );
  }

  const pendingReviewCount = allRequests.filter(r => r.status === 'pending').length;

  return (
    <div>
      {/* Tab Header for Leave Module */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div className="login-role-tabs" style={{ marginBottom: 0 }}>
          <button
            className={`login-role-tab ${activeTab === 'my' ? 'active' : ''}`}
            onClick={() => setActiveTab('my')}
          >
            <Calendar size={14} /> My Leave Balances & History
          </button>

          {canReview && (
            <button
              className={`login-role-tab ${activeTab === 'review' ? 'active' : ''}`}
              onClick={() => setActiveTab('review')}
            >
              <ShieldCheck size={14} /> HR Review Queue ({pendingReviewCount} Pending)
            </button>
          )}
        </div>

        {activeTab === 'my' && (
          <button
            className="btn btn-primary"
            onClick={() => setFormOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', borderRadius: 'var(--radius-btn)', fontSize: '13px', fontWeight: 600 }}
          >
            <Plus size={16} /> Request Time Off
          </button>
        )}
      </div>

      {/* ── TAB 1: MY LEAVE BALANCES & HISTORY ── */}
      {activeTab === 'my' && (
        <>
          {/* Leave Balances Cards */}
          <div className="stat-strip mb-8" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
              <div className="stat-label">Paid Annual Leave</div>
              <div className="stat-value">{balance?.paid_balance ?? balance?.paid_leave_balance ?? 20} <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>days left</span></div>
              <div className="stat-subtitle">Allocated 20 days / year</div>
            </div>

            <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
              <div className="stat-label">Sick Leave</div>
              <div className="stat-value">{balance?.sick_balance ?? balance?.sick_leave_balance ?? 10} <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>days left</span></div>
              <div className="stat-subtitle">Medical & emergency leave</div>
            </div>

            <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
              <div className="stat-label">Unpaid Leave</div>
              <div className="stat-value">{balance?.unpaid_balance ?? balance?.unpaid_leave_balance ?? 30} <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>days left</span></div>
              <div className="stat-subtitle">Extended personal leave</div>
            </div>
          </div>

          {/* My Leave Requests Table */}
          <div className="panel mb-8">
            <div className="panel-header">
              <div className="panel-title">
                <FileText size={18} /> My Time Off Applications
              </div>
            </div>
            <div className="panel-body">
              {myRequests.length === 0 ? (
                <div className="empty-state">
                  <Calendar size={28} style={{ color: 'var(--text-secondary)' }} />
                  <h3>No leave requests found</h3>
                  <p>You haven't submitted any time off applications yet.</p>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Leave Type</th>
                        <th>Dates</th>
                        <th>Duration</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th>Reviewer Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myRequests.map(req => (
                        <tr key={req.id}>
                          <td style={{ textTransform: 'capitalize', fontWeight: 600 }}>{req.leave_type} Leave</td>
                          <td>{req.start_date} → {req.end_date}</td>
                          <td>{req.total_days || req.days_count || 1} day(s)</td>
                          <td>{req.reason}</td>
                          <td>
                            <span className={`status-badge ${req.status}`}>
                              {req.status === 'approved' && <CheckCircle2 size={12} />}
                              {req.status === 'rejected' && <XCircle size={12} />}
                              {req.status === 'pending' && <Clock size={12} />}
                              {req.status}
                            </span>
                          </td>
                          <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                            {req.reviewer_comments || req.reviewer_notes || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── TAB 2: HR / MANAGER REVIEW QUEUE ── */}
      {activeTab === 'review' && canReview && (
        <div className="panel mb-8">
          <div className="panel-header">
            <div className="panel-title">
              <ShieldCheck size={18} /> HR Approval Queue & Attendance Auto-Sync
            </div>
          </div>
          <div className="panel-body">
            {allRequests.length === 0 ? (
              <div className="empty-state">
                <UserCheck size={28} style={{ color: 'var(--text-secondary)' }} />
                <h3>No pending requests</h3>
                <p>All leave applications across your department have been reviewed.</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Department</th>
                      <th>Type</th>
                      <th>Requested Dates</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allRequests.map(req => (
                      <tr key={req.id}>
                        <td>
                          <strong>{req.employee_name}</strong>
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{req.employee_code}</div>
                        </td>
                        <td>{req.department}</td>
                        <td style={{ textTransform: 'capitalize', fontWeight: 600 }}>{req.leave_type}</td>
                        <td>{req.start_date} to {req.end_date} ({req.total_days || req.days_count || 1}d)</td>
                        <td>{req.reason}</td>
                        <td>
                          <span className={`status-badge ${req.status}`}>
                            {req.status}
                          </span>
                        </td>
                        <td>
                          {req.status === 'pending' ? (
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <button
                                className="btn btn-sm"
                                style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.35rem 0.65rem', borderRadius: '4px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                                onClick={() => handleApprove(req.id)}
                              >
                                Approve
                              </button>
                              <button
                                className="btn btn-sm"
                                style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.35rem 0.65rem', borderRadius: '4px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                                onClick={() => setRejectingId(req.id)}
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                              Processed ({req.reviewer_comments || req.reviewer_notes || 'No notes'})
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── APPLY LEAVE MODAL ── */}
      {formOpen && (
        <div className="modal-overlay" onClick={() => setFormOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 450 }}>
            <div className="modal-header">
              <h3>Request Time Off</h3>
              <button className="modal-close-btn" onClick={() => setFormOpen(false)}>×</button>
            </div>
            <form onSubmit={handleApplySubmit} style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Leave Category</label>
                <select
                  className="form-control"
                  value={leaveType}
                  onChange={e => setLeaveType(e.target.value)}
                >
                  <option value="paid">Paid Annual Leave ({balance?.paid_balance ?? balance?.paid_leave_balance ?? 20} days left)</option>
                  <option value="sick">Sick Leave ({balance?.sick_balance ?? balance?.sick_leave_balance ?? 10} days left)</option>
                  <option value="unpaid">Unpaid Personal Leave ({balance?.unpaid_balance ?? balance?.unpaid_leave_balance ?? 30} days left)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Start Date</label>
                  <input
                    type="date"
                    required
                    className="form-control"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>End Date</label>
                  <input
                    type="date"
                    required
                    className="form-control"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Reason / Notes</label>
                <textarea
                  required
                  rows={3}
                  className="form-control"
                  placeholder="Provide reason for time off request…"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
              >
                {submitting ? 'Submitting Application…' : 'Submit Leave Request'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── REJECTION NOTE MODAL ── */}
      {rejectingId && (
        <div className="modal-overlay" onClick={() => setRejectingId(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h3>Reject Leave Request</h3>
              <button className="modal-close-btn" onClick={() => setRejectingId(null)}>×</button>
            </div>
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Reason for Rejection *</label>
                <textarea
                  required
                  rows={3}
                  className="form-control"
                  placeholder="Explain why this request is rejected…"
                  value={reviewerNote}
                  onChange={e => setReviewerNote(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" onClick={() => setRejectingId(null)}>Cancel</button>
                <button className="btn" style={{ background: '#ef4444', color: '#fff' }} onClick={() => handleRejectSubmit(rejectingId)}>
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeaveManager;
