import React from 'react';
import { Users, Search, ChevronDown, RefreshCw } from 'lucide-react';

const DEPARTMENTS = ['Engineering', 'Design', 'HR & People', 'Sales', 'Finance', 'Marketing', 'Operations'];

/**
 * FilterBar — Date / Department / Status / Search filters + Refresh + Export actions.
 * Extracted from AdminMonitor for single-responsibility maintainability.
 */
export function FilterBar({
  date, setDate,
  dept, setDept,
  status, setStatus,
  search, setSearch,
  isManager, managerDept,
  onRefresh, onSearch, onExport
}) {
  return (
    <div className="filter-bar">
      {/* Date */}
      <div className="form-group">
        <label className="form-label" htmlFor="monitor-date">Date</label>
        <input
          id="monitor-date"
          type="date"
          className="form-control"
          value={date}
          onChange={e => setDate(e.target.value)}
          aria-label="Filter by date"
        />
      </div>

      {/* Department */}
      <div className="form-group">
        <label className="form-label" htmlFor="monitor-dept">Department</label>
        {isManager ? (
          <div className="locked-dept-badge" title={`Restricted to your managed department (${managerDept})`}>
            <span className="badge-manager" style={{ padding:'6px 12px', display:'inline-flex', alignItems:'center', gap:6, borderRadius:'var(--r-btn)', fontSize:13, fontWeight:600 }}>
              <Users size={14} /> {managerDept} (Team View)
            </span>
          </div>
        ) : (
          <div className="select-wrap">
            <select
              id="monitor-dept"
              className="form-control"
              value={dept}
              onChange={e => setDept(e.target.value)}
            >
              <option value="all">All departments</option>
              {DEPARTMENTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <ChevronDown size={14} className="select-caret" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Status */}
      <div className="form-group">
        <label className="form-label" htmlFor="monitor-status">Status</label>
        <div className="select-wrap">
          <select
            id="monitor-status"
            className="form-control"
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="present">Present</option>
            <option value="incomplete">Incomplete</option>
            <option value="half_day">Half Day</option>
            <option value="leave">Leave</option>
            <option value="absent">Absent</option>
            <option value="not_marked">Not Marked</option>
          </select>
          <ChevronDown size={14} className="select-caret" aria-hidden="true" />
        </div>
      </div>

      {/* Search */}
      <form onSubmit={onSearch} className="filter-search" style={{ flex:1 }}>
        <label className="form-label" htmlFor="monitor-search" style={{ display:'block' }}>Search</label>
        <div style={{ position:'relative' }}>
          <Search size={15} className="filter-search-icon" aria-hidden="true" />
          <input
            id="monitor-search"
            className="form-control"
            style={{ paddingLeft:34 }}
            placeholder="Name, code, designation…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search employees"
          />
        </div>
      </form>

      {/* Actions */}
      <div className="form-group" style={{ justifyContent:'flex-end', display:'flex', gap:'0.5rem' }}>
        <label className="form-label">&nbsp;</label>
        <button className="btn btn-ghost" onClick={onRefresh} aria-label="Refresh data">
          <RefreshCw size={15} /> Refresh
        </button>
        <button
          className="btn btn-primary"
          onClick={onExport}
          style={{ display:'flex', alignItems:'center', gap:'0.35rem', fontSize:'12px', padding:'0.45rem 0.85rem' }}
        >
          Export HR Master CSV
        </button>
      </div>
    </div>
  );
}

export default FilterBar;
