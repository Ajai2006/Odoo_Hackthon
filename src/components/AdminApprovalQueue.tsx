import React, { useState } from 'react';
import { LeaveRequest } from '../types';
import StatusBadge from './StatusBadge';
import LeaveTypeBadge from './LeaveTypeBadge';
import { ReviewModal } from './ReviewModal';
import { ShieldCheck, Flame, AlertCircle, Clock, CheckCircle2, UserCheck, ShieldAlert, Check, X, Search, Filter } from 'lucide-react';

interface AdminApprovalQueueProps {
  pendingLeaves: LeaveRequest[];
  allLeaves?: LeaveRequest[];
  adminId: number;
  loading?: boolean;
  onLeaveReviewed: (updated: LeaveRequest) => void;
  refreshLeaves: () => void;
}

export const AdminApprovalQueue: React.FC<AdminApprovalQueueProps> = ({
  pendingLeaves,
  allLeaves = [],
  adminId,
  loading = false,
  onLeaveReviewed,
  refreshLeaves,
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'approved' | 'rejected'>('all');
  const [historySearch, setHistorySearch] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);

  const urgentCount = pendingLeaves.filter((l) => l.sla?.urgency === 'urgent').length;
  const warningCount = pendingLeaves.filter((l) => l.sla?.urgency === 'warning').length;
  const normalCount = pendingLeaves.filter((l) => l.sla?.urgency === 'normal').length;

  // Inline Quick Action (Approve / Reject directly without opening modal)
  const handleInlineAction = async (leaveId: number, status: 'approved' | 'rejected') => {
    setProcessingId(leaveId);
    try {
      const res = await fetch(`/api/leaves/${leaveId}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          admin_comment: status === 'approved' ? 'Quick approved by HR Admin.' : 'Declined via admin approval queue.',
          reviewer_id: adminId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onLeaveReviewed(data.data);
      }
    } catch (err) {
      console.error('Failed to process inline review', err);
    } finally {
      setProcessingId(null);
    }
  };

  const pastLeaves = allLeaves
    .filter((l) => l.status !== 'pending')
    .filter((l) => (historyFilter === 'all' ? true : l.status === historyFilter))
    .filter((l) => {
      if (!historySearch.trim()) return true;
      const q = historySearch.toLowerCase();
      return (
        (l.employee_name && l.employee_name.toLowerCase().includes(q)) ||
        (l.department && l.department.toLowerCase().includes(q)) ||
        l.reason.toLowerCase().includes(q) ||
        (l.admin_comment && l.admin_comment.toLowerCase().includes(q))
      );
    });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* SLA Metric Overview Cards */}
      <div className="stat-cards-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-type-pill stat-pill-paid">
              <Clock size={13} />
              <span>Total Queue</span>
            </span>
          </div>
          <div className="stat-figure-row">
            <span className="stat-big-num tabular-nums">{pendingLeaves.length}</span>
            <span className="stat-subtext">requests pending</span>
          </div>
          <div className="stat-footer-bar">
            <span>Awaiting Manager Decision</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-type-pill" style={{ backgroundColor: 'var(--danger-bg)', color: '#BE123C', border: '1px solid var(--danger-border)' }}>
              <Flame size={13} />
              <span>Urgent SLA (&gt;3 Days)</span>
            </span>
          </div>
          <div className="stat-figure-row">
            <span className="stat-big-num tabular-nums" style={{ color: urgentCount > 0 ? 'var(--danger)' : 'var(--primary-900)' }}>
              {urgentCount}
            </span>
            <span className="stat-subtext">escalated requests</span>
          </div>
          <div className="stat-footer-bar">
            <span>Requires Immediate Action</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-type-pill stat-pill-sick">
              <AlertCircle size={13} />
              <span>Approaching SLA (1-3d)</span>
            </span>
          </div>
          <div className="stat-figure-row">
            <span className="stat-big-num tabular-nums">{warningCount}</span>
            <span className="stat-subtext">pending review</span>
          </div>
          <div className="stat-footer-bar">
            <span>Within Resolution Window</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-type-pill" style={{ backgroundColor: 'var(--success-bg)', color: '#047857', border: '1px solid var(--success-border)' }}>
              <CheckCircle2 size={13} />
              <span>On Track (&lt;24h)</span>
            </span>
          </div>
          <div className="stat-figure-row">
            <span className="stat-big-num tabular-nums">{normalCount}</span>
            <span className="stat-subtext">new today</span>
          </div>
          <div className="stat-footer-bar">
            <span>Fresh Submissions</span>
          </div>
        </div>
      </div>

      {/* Main Panel with Tabs */}
      <div className="card-panel">
        <div className="card-panel-header">
          <div className="flex-align-center gap-2">
            <div className="brand-icon-box" style={{ width: '28px', height: '28px' }}>
              <ShieldAlert size={16} />
            </div>
            <div>
              <h3>Leave Approval Management</h3>
              <p className="text-caption">Review pending employee requests with SLA aging and conflict detection</p>
            </div>
          </div>

          {/* Sub-tabs: Pending Queue vs History */}
          <div className="flex-align-center gap-1" style={{ backgroundColor: 'var(--bg-primary)', padding: '2px', borderRadius: 'var(--radius-button)', border: '1px solid var(--border)' }}>
            <button
              className={`btn btn-sm ${activeTab === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                border: 'none',
                boxShadow: 'none',
                backgroundColor: activeTab === 'pending' ? 'var(--primary-700)' : 'transparent',
                color: activeTab === 'pending' ? '#FFFFFF' : 'var(--text-secondary)'
              }}
              onClick={() => setActiveTab('pending')}
            >
              <span>Pending Queue</span>
              {pendingLeaves.length > 0 && (
                <span className="nav-badge" style={{ marginLeft: '4px' }}>
                  {pendingLeaves.length}
                </span>
              )}
            </button>

            <button
              className={`btn btn-sm ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                border: 'none',
                boxShadow: 'none',
                backgroundColor: activeTab === 'history' ? 'var(--primary-700)' : 'transparent',
                color: activeTab === 'history' ? '#FFFFFF' : 'var(--text-secondary)'
              }}
              onClick={() => setActiveTab('history')}
            >
              <span>Audit History</span>
            </button>
          </div>
        </div>

        {/* TAB 1: PENDING QUEUE */}
        {activeTab === 'pending' && (
          <div className="card-panel-body" style={{ padding: '24px' }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="skeleton skeleton-row" />
                <div className="skeleton skeleton-row" />
                <div className="skeleton skeleton-row" />
              </div>
            ) : pendingLeaves.length === 0 ? (
              <div className="empty-state-box">
                <div className="empty-state-icon">
                  <ShieldCheck size={28} style={{ color: 'var(--success)' }} />
                </div>
                <h4 className="empty-state-title">Approval Queue is Clear</h4>
                <p className="empty-state-desc">
                  Great job! All incoming employee leave requests have been reviewed and synchronized with the attendance calendar.
                </p>
                <button className="btn btn-secondary btn-sm" onClick={refreshLeaves}>
                  Refresh Queue
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {pendingLeaves.map((leave) => {
                  const hasConflict = leave.conflicts && leave.conflicts.length > 0;
                  const isProcessing = processingId === leave.id;

                  return (
                    <div key={leave.id} className="admin-request-card">
                      {/* Top Header Row */}
                      <div className="admin-card-header">
                        <div className="admin-user-group">
                          <img
                            src={leave.employee_avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
                            alt={leave.employee_name}
                            className="admin-avatar-mini"
                          />
                          <div>
                            <div className="flex-align-center gap-2">
                              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--primary-900)' }}>
                                {leave.employee_name}
                              </span>
                              <span className="text-label" style={{ backgroundColor: 'var(--bg-primary)', padding: '1px 6px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                                {leave.department}
                              </span>
                            </div>
                            <span className="text-caption">{leave.employee_email}</span>
                          </div>
                        </div>

                        {/* Status + SLA Aging label */}
                        <div className="flex-align-center gap-2">
                          <LeaveTypeBadge type={leave.leave_type} />
                          <StatusBadge status="pending" sla={leave.sla} showSla={true} />
                        </div>
                      </div>

                      {/* Request Details Bar */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-primary)', padding: '8px 12px', borderRadius: 'var(--radius-input)', border: '1px solid var(--border)', flexWrap: 'wrap', gap: '8px' }}>
                        <div className="flex-align-center gap-3">
                          <span style={{ fontSize: '13px', fontWeight: 500 }}>
                            📅 {leave.start_date} <span className="text-caption">to</span> {leave.end_date}
                          </span>
                          <span className="tabular-nums font-semibold" style={{ fontSize: '13px', color: 'var(--primary-700)' }}>
                            • {leave.total_days} Working Days
                          </span>
                        </div>
                        <span className="text-label text-secondary">
                          Submitted {leave.created_at}
                        </span>
                      </div>

                      {/* Reason Quote */}
                      <p style={{ fontSize: '14px', color: 'var(--text-primary)', fontStyle: 'italic' }}>
                        "{leave.reason}"
                      </p>

                      {/* Smart Conflict Resolver Pill & Explanation */}
                      {hasConflict && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--warning-bg)', border: '1px solid var(--warning-border)', padding: '6px 12px', borderRadius: 'var(--radius-badge)', color: '#B45309', fontSize: '12px' }}>
                          <span className="conflict-pill">
                            <ShieldAlert size={12} />
                            <span>⚠️ Conflict</span>
                          </span>
                          <span>
                            {leave.conflicts!.length} team member already on approved leave these dates ({leave.conflicts!.map(c => c.employee_name).join(', ')}).
                          </span>
                        </div>
                      )}

                      {/* Action Bar (Inline Approve/Reject + Full Review Modal) */}
                      <div className="admin-action-row">
                        <span className="text-label text-secondary">
                          Request #{leave.id}
                        </span>

                        <div className="inline-actions-group">
                          {/* Inline Reject (Danger outline) */}
                          <button
                            className="btn btn-outline-danger btn-sm"
                            disabled={isProcessing}
                            onClick={() => handleInlineAction(leave.id, 'rejected')}
                            title="Quick Reject"
                          >
                            <X size={13} />
                            <span>Quick Reject</span>
                          </button>

                          {/* Inline Approve (Success outline) */}
                          <button
                            className="btn btn-outline-success btn-sm"
                            disabled={isProcessing}
                            onClick={() => handleInlineAction(leave.id, 'approved')}
                            title="Quick Approve"
                          >
                            <Check size={13} />
                            <span>Quick Approve</span>
                          </button>

                          {/* Open Review Modal */}
                          <button
                            className="btn btn-primary btn-sm"
                            disabled={isProcessing}
                            onClick={() => setSelectedLeave(leave)}
                          >
                            <UserCheck size={13} />
                            <span>Review & Decide</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: AUDIT HISTORY */}
        {activeTab === 'history' && (
          <div>
            {/* Filter Bar */}
            <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-zebra)', flexWrap: 'wrap', gap: '8px' }}>
              <div className="search-input-wrapper" style={{ width: '280px' }}>
                <Search size={14} className="search-icon-pos" />
                <input
                  type="text"
                  placeholder="Filter past reviews..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                />
              </div>

              <div className="flex-align-center gap-1">
                {(['all', 'approved', 'rejected'] as const).map((filter) => (
                  <button
                    key={filter}
                    className={`btn btn-sm ${historyFilter === filter ? 'btn-primary' : 'btn-secondary'}`}
                    style={{
                      border: 'none',
                      backgroundColor: historyFilter === filter ? 'var(--primary-700)' : 'transparent',
                      color: historyFilter === filter ? '#FFFFFF' : 'var(--text-secondary)'
                    }}
                    onClick={() => setHistoryFilter(filter)}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="table-scroll-container">
              <table className="dayflow-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Type</th>
                    <th>Date Range</th>
                    <th className="tabular-nums">Days</th>
                    <th>Status</th>
                    <th>Admin Comment</th>
                    <th>Reviewer</th>
                  </tr>
                </thead>
                <tbody>
                  {pastLeaves.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <div className="empty-state-box">
                          <h4 className="empty-state-title">No Audit Records</h4>
                          <p className="empty-state-desc">No past reviewed leave requests match your search filter.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pastLeaves.map((leave) => (
                      <tr key={leave.id}>
                        <td>
                          <div className="flex-align-center gap-2">
                            <img
                              src={leave.employee_avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
                              alt={leave.employee_name}
                              className="user-avatar"
                              style={{ width: '24px', height: '24px' }}
                            />
                            <div>
                              <strong style={{ fontSize: '13px' }}>{leave.employee_name}</strong>
                              <span className="text-caption" style={{ display: 'block', fontSize: '11px' }}>{leave.department}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <LeaveTypeBadge type={leave.leave_type} />
                        </td>
                        <td>
                          <span style={{ fontSize: '13px' }}>{leave.start_date} to {leave.end_date}</span>
                        </td>
                        <td>
                          <span className="tabular-nums font-semibold" style={{ fontSize: '13px' }}>{leave.total_days}d</span>
                        </td>
                        <td>
                          <StatusBadge status={leave.status} />
                        </td>
                        <td style={{ maxWidth: '240px' }}>
                          <span className="text-caption" style={{ fontStyle: leave.admin_comment ? 'normal' : 'italic' }}>
                            {leave.admin_comment || 'No comment provided'}
                          </span>
                        </td>
                        <td>
                          <span className="text-label">{leave.reviewer_name || 'HR Admin'}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
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
