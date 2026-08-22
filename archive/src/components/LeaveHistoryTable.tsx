import React, { useState } from 'react';
import { LeaveRequest } from '../types';
import StatusBadge from './StatusBadge';
import LeaveTypeBadge from './LeaveTypeBadge';
import { History, Search, MessageSquare, Calendar, FolderClock, ArrowUpDown } from 'lucide-react';

interface LeaveHistoryTableProps {
  leaves: LeaveRequest[];
  loading?: boolean;
  onApplyClick?: () => void;
}

export const LeaveHistoryTable: React.FC<LeaveHistoryTableProps> = ({
  leaves,
  loading = false,
  onApplyClick,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedComment, setSelectedComment] = useState<{ id: number; comment: string; reviewer?: string } | null>(null);

  const filteredLeaves = leaves
    .filter((l) => {
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
    })
    .sort((a, b) => {
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return sortAsc ? timeA - timeB : timeB - timeA;
    });

  return (
    <div className="card-panel">
      <div className="card-panel-header">
        <div className="flex-align-center gap-2">
          <div className="brand-icon-box" style={{ width: '28px', height: '28px' }}>
            <History size={16} />
          </div>
          <div>
            <h3>Leave History & Requests</h3>
            <p className="text-caption">Review past submissions, manager approvals, and SLA tracking</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex-align-center gap-1" style={{ backgroundColor: 'var(--bg-primary)', padding: '2px', borderRadius: 'var(--radius-button)', border: '1px solid var(--border)' }}>
          {['all', 'pending', 'approved', 'rejected'].map((st) => (
            <button
              key={st}
              className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                border: 'none',
                boxShadow: 'none',
                backgroundColor: statusFilter === st ? 'var(--primary-700)' : 'transparent',
                color: statusFilter === st ? '#FFFFFF' : 'var(--text-secondary)'
              }}
              onClick={() => setStatusFilter(st)}
            >
              {st.charAt(0).toUpperCase() + st.slice(1)}
              {st === 'pending' && (
                <span className="nav-badge" style={{ marginLeft: '4px' }}>
                  {leaves.filter((l) => l.status === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table Search & Controls Bar */}
      <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-zebra)' }}>
        <div className="search-input-wrapper" style={{ width: '320px' }}>
          <Search size={14} className="search-icon-pos" />
          <input
            type="text"
            placeholder="Search by reason, type, or date..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setSortAsc(!sortAsc)}
          title="Toggle sort order"
        >
          <ArrowUpDown size={13} />
          <span>{sortAsc ? 'Oldest First' : 'Newest First'}</span>
        </button>
      </div>

      {/* Data Table */}
      <div className="table-scroll-container">
        <table className="dayflow-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Date Range</th>
              <th className="tabular-nums">Days</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Manager Feedback</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Skeleton Loader (Rule: Skeleton loader, not a spinner)
              <>
                <tr>
                  <td colSpan={6}><div className="skeleton skeleton-row" /></td>
                </tr>
                <tr>
                  <td colSpan={6}><div className="skeleton skeleton-row" /></td>
                </tr>
                <tr>
                  <td colSpan={6}><div className="skeleton skeleton-row" /></td>
                </tr>
              </>
            ) : filteredLeaves.length === 0 ? (
              // Designed Empty State (Rule: Icon + short message + primary action)
              <tr>
                <td colSpan={6}>
                  <div className="empty-state-box">
                    <div className="empty-state-icon">
                      <FolderClock size={24} />
                    </div>
                    <h4 className="empty-state-title">No Leave Requests Found</h4>
                    <p className="empty-state-desc">
                      {statusFilter !== 'all'
                        ? `You have no ${statusFilter} leave applications recorded in the system.`
                        : "You haven't submitted any leave applications yet. Plan your next time off easily."}
                    </p>
                    {onApplyClick && (
                      <button className="btn btn-primary btn-sm" onClick={onApplyClick}>
                        Apply for Leave
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredLeaves.map((leave) => (
                <tr key={leave.id}>
                  <td>
                    <LeaveTypeBadge type={leave.leave_type} />
                  </td>
                  <td>
                    <div className="flex-align-center gap-1" style={{ fontSize: '13px' }}>
                      <Calendar size={13} className="text-secondary" />
                      <span>{leave.start_date} <span className="text-caption">to</span> {leave.end_date}</span>
                    </div>
                  </td>
                  <td>
                    <span className="tabular-nums font-semibold" style={{ fontSize: '13px' }}>
                      {leave.total_days}d
                    </span>
                  </td>
                  <td style={{ maxWidth: '240px' }}>
                    <p className="text-caption text-primary" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={leave.reason}>
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
                      <span className="text-label" style={{ color: 'var(--warning)' }}>Awaiting review</span>
                    ) : leave.admin_comment ? (
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '2px 8px', fontSize: '12px' }}
                        onClick={() => setSelectedComment({ id: leave.id, comment: leave.admin_comment!, reviewer: leave.reviewer_name })}
                        title="View manager feedback"
                      >
                        <MessageSquare size={12} />
                        <span>View Note</span>
                      </button>
                    ) : (
                      <span className="text-label text-secondary">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Admin Comment Modal */}
      {selectedComment && (
        <div className="modal-overlay" onClick={() => setSelectedComment(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-box">
              <h3>Manager Review Note</h3>
              <button className="modal-close-btn" onClick={() => setSelectedComment(null)}>✕</button>
            </div>
            <div className="modal-body-content">
              <p className="text-caption">Feedback for Leave Request #{selectedComment.id} (Reviewed by {selectedComment.reviewer || 'HR Admin'}):</p>
              <div style={{ backgroundColor: 'var(--bg-primary)', padding: '16px', borderRadius: 'var(--radius-input)', border: '1px solid var(--border)', fontStyle: 'italic' }}>
                "{selectedComment.comment}"
              </div>
            </div>
            <div className="modal-footer-box">
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedComment(null)}>
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
