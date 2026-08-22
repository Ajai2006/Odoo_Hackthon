import React, { useState } from 'react';
import { LeaveRequest, LeaveStatus } from '@/types';
import StatusBadge from './StatusBadge';
import { History, Search, MessageSquare, Calendar, UserCheck } from 'lucide-react';

interface LeaveHistoryTableProps {
  leaves: LeaveRequest[];
  loading?: boolean;
}

export const LeaveHistoryTable: React.FC<LeaveHistoryTableProps> = ({ leaves, loading = false }) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedCommentLeave, setSelectedCommentLeave] = useState<LeaveRequest | null>(null);

  const filteredLeaves = leaves.filter((l) => {
    if (statusFilter !== 'all' && l.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        l.reason.toLowerCase().includes(q) ||
        l.leave_type.toLowerCase().includes(q) ||
        l.start_date.includes(q) ||
        l.end_date.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="card history-card">
      <div className="card-header flex-between">
        <div className="card-title-group">
          <div className="icon-wrapper icon-secondary">
            <History size={20} />
          </div>
          <div>
            <h3 className="card-title">Leave History & Requests</h3>
            <p className="card-subtitle">Track your leave applications, SLA status, and manager feedback</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="filter-pill-group">
          {['all', 'pending', 'approved', 'rejected'].map((st) => (
            <button
              key={st}
              className={`filter-pill ${statusFilter === st ? 'active' : ''}`}
              onClick={() => setStatusFilter(st)}
            >
              {st.charAt(0).toUpperCase() + st.slice(1)}
              {st === 'pending' && (
                <span className="count-dot">
                  {leaves.filter((l) => l.status === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="table-search-bar">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Search by reason, type, or date..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table Content */}
      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Date Range</th>
              <th>Days</th>
              <th>Reason</th>
              <th>Status & SLA</th>
              <th>Manager Review</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-muted">
                  Loading leave history...
                </td>
              </tr>
            ) : filteredLeaves.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-muted">
                  No leave requests found matching your filter.
                </td>
              </tr>
            ) : (
              filteredLeaves.map((leave) => (
                <tr key={leave.id} className="table-row-hover">
                  <td>
                    <span className={`type-tag type-${leave.leave_type}`}>
                      {leave.leave_type.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div className="date-range-cell">
                      <Calendar size={14} className="text-muted" />
                      <span>{leave.start_date} <span className="text-muted">to</span> {leave.end_date}</span>
                    </div>
                  </td>
                  <td>
                    <span className="total-days-badge">{leave.total_days}d</span>
                  </td>
                  <td className="reason-cell">
                    <p className="reason-text" title={leave.reason}>
                      {leave.reason}
                    </p>
                  </td>
                  <td>
                    <StatusBadge
                      status={leave.status}
                      sla={leave.sla}
                      showSla={leave.status === 'pending'}
                    />
                  </td>
                  <td>
                    {leave.status === 'pending' ? (
                      <span className="review-pending-text">Awaiting review</span>
                    ) : leave.admin_comment ? (
                      <button
                        className="comment-btn"
                        onClick={() => setSelectedCommentLeave(leave)}
                        title="View manager comment"
                      >
                        <MessageSquare size={14} />
                        <span className="truncate-comment">{leave.admin_comment}</span>
                      </button>
                    ) : (
                      <span className="text-muted text-sm">Reviewed without comment</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Comment Modal */}
      {selectedCommentLeave && (
        <div className="modal-backdrop" onClick={() => setSelectedCommentLeave(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-box">
                <UserCheck size={20} className="text-primary" />
                <h4>Manager Review Feedback</h4>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setSelectedCommentLeave(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="feedback-details-grid">
                <div>
                  <span className="label-caption">Leave Request</span>
                  <p className="font-semibold">#{selectedCommentLeave.id} • {selectedCommentLeave.leave_type.toUpperCase()} ({selectedCommentLeave.total_days} days)</p>
                </div>
                <div>
                  <span className="label-caption">Reviewer</span>
                  <p className="font-semibold">{selectedCommentLeave.reviewer_name || 'HR Admin'}</p>
                </div>
                <div>
                  <span className="label-caption">Decision</span>
                  <StatusBadge status={selectedCommentLeave.status} />
                </div>
              </div>
              <div className="feedback-comment-box">
                <span className="label-caption">Admin Comment</span>
                <p className="feedback-comment-text">"{selectedCommentLeave.admin_comment}"</p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedCommentLeave(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveHistoryTable;
