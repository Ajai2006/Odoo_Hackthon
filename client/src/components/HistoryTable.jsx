import React, { useState } from 'react';
import { History, Search, ChevronUp, ChevronDown, Minus } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

const COLUMNS = [
  { key:'date',       label:'Date' },
  { key:'check_in',   label:'Clock In' },
  { key:'check_out',  label:'Clock Out' },
  { key:'work_hours', label:'Work Hours' },
  { key:'status',     label:'Status' },
];

/* Empty state */
function EmptyState({ onClockInClick }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon"><History size={24} /></div>
      <h3>No attendance records</h3>
      <p>Your attendance history will appear here once you start clocking in each day.</p>
      <button 
        className="btn btn-primary btn-sm" 
        onClick={onClockInClick || (() => window.scrollTo({ top: 0, behavior: 'smooth' }))}
      >
        Clock in today
      </button>
    </div>
  );
}

/* Skeleton */
function TableSkeleton() {
  return (
    <div className="panel mb-8">
      <div className="panel-header"><div className="panel-title"><History size={18} />Attendance History</div></div>
      <div className="panel-body" style={{ display:'flex', flexDirection:'column', gap:'var(--sp-3)' }}>
        {[...Array(5)].map((_,i) => <div key={i} className="skeleton skeleton-line" />)}
      </div>
    </div>
  );
}

function SortIcon({ field, sortKey, sortDir }) {
  if (sortKey !== field) return <Minus size={12} className="sort-icon" aria-hidden="true" />;
  return sortDir === 'asc'
    ? <ChevronUp  size={12} className="sort-icon active" aria-hidden="true" />
    : <ChevronDown size={12} className="sort-icon active" aria-hidden="true" />;
}

export function HistoryTable({ records = [], loading, onClockInClick }) {
  const [sortKey, setSortKey]   = useState('date');
  const [sortDir, setSortDir]   = useState('desc');
  const [search, setSearch]     = useState('');
  const [statusFilter, setFilter] = useState('all');

  if (loading) return <TableSkeleton />;

  /* Filter */
  let rows = records.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return r.date?.includes(q) || r.status?.includes(q) || r.notes?.toLowerCase().includes(q);
    }
    return true;
  });

  /* Sort */
  rows = [...rows].sort((a, b) => {
    const va = a[sortKey] ?? '';
    const vb = b[sortKey] ?? '';
    const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true });
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const fmtTime = (ts) => {
    if (!ts) return '—';
    return ts.split(' ')[1]?.slice(0, 5) || '—';
  };

  return (
    <div className="panel mb-8">
      <div className="panel-header">
        <div className="panel-title">
          <History size={18} aria-hidden="true" />
          Attendance History
        </div>
        <span style={{ fontSize:13, color:'var(--text-secondary)' }}>
          {records.length} records
        </span>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <div className="filter-search">
          <Search size={15} className="filter-search-icon" aria-hidden="true" />
          <input
            className="form-control"
            style={{ paddingLeft:34 }}
            placeholder="Search date, status, notes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search attendance records"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="status-filter-hist">Status</label>
          <div className="select-wrap">
            <select
              id="status-filter-hist"
              className="form-control"
              value={statusFilter}
              onChange={e => setFilter(e.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="present">Present</option>
              <option value="half_day">Half Day</option>
              <option value="leave">Leave</option>
              <option value="absent">Absent</option>
              <option value="incomplete">Incomplete</option>
            </select>
            <ChevronDown size={14} className="select-caret" aria-hidden="true" />
          </div>
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState onClockInClick={onClockInClick} />
      ) : (
        <div className="table-wrapper">
          <table className="data-table" aria-label="Attendance history">
            <thead>
              <tr>
                {COLUMNS.map(col => (
                  <th key={col.key} onClick={() => toggleSort(col.key)} scope="col">
                    <div className="th-inner">
                      {col.label}
                      <SortIcon field={col.key} sortKey={sortKey} sortDir={sortDir} />
                    </div>
                  </th>
                ))}
                <th scope="col">Punctuality</th>
                <th scope="col">Notes</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(rec => (
                <tr
                  key={rec.id}
                  className={rec.status === 'incomplete' ? 'row-incomplete' : ''}
                >
                  <td className="td-num font-semibold">{rec.date}</td>
                  <td className="td-num">{fmtTime(rec.check_in)}</td>
                  <td className="td-num">{fmtTime(rec.check_out)}</td>
                  <td className="td-num">
                    {rec.work_hours > 0 ? `${rec.work_hours} hrs` : '—'}
                  </td>
                  <td><StatusBadge status={rec.status} /></td>
                  <td>
                    {rec.late_minutes > 0
                      ? <span className="late-badge">+{rec.late_minutes}m late</span>
                      : rec.check_in
                        ? <span className="ontime-badge">✓ On time</span>
                        : <span className="td-muted">—</span>
                    }
                  </td>
                  <td className="td-muted" style={{ maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {rec.notes || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default HistoryTable;
