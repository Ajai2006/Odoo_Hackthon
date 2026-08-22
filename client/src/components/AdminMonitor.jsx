import React, { useState, useEffect } from 'react';
import {
  Users, CheckCircle2, UserX, Clock,
  Search, ChevronDown, RefreshCw, AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { StatCard } from './StatCard';
import { StatusBadge } from './StatusBadge';

/* Skeleton */
function MonitorSkeleton() {
  return (
    <div>
      <div className="stat-strip mb-8">
        {[1,2,3].map(i => (
          <div key={i} className="skeleton-card">
            <div className="skeleton skeleton-line short mb-2" />
            <div className="skeleton skeleton-line tall" style={{ height:40, width:'60%' }} />
          </div>
        ))}
      </div>
      <div className="panel">
        <div className="filter-bar">
          {[1,2,3,4].map(i => <div key={i} className="skeleton skeleton-line" style={{ height:36, flex:1, minWidth:120 }} />)}
        </div>
        <div style={{ padding:'var(--sp-4)' }}>
          {[...Array(5)].map((_,i) => (
            <div key={i} className="skeleton skeleton-line" style={{ marginBottom:'var(--sp-3)' }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* Empty state */
function EmptyMonitor() {
  return (
    <div className="empty-state">
      <div className="empty-state-icon"><Users size={24} /></div>
      <h3>No records match your filters</h3>
      <p>Try changing the date, department or status filter to broaden your search.</p>
    </div>
  );
}

export function AdminMonitor({ currentUser, showToast }) {
  const isManager = currentUser?.role === 'manager';
  const managerDept = currentUser?.employee?.department || 'Design';

  const [date, setDate]         = useState(new Date().toISOString().slice(0,10));
  const [dept, setDept]         = useState(isManager ? managerDept : 'all');
  const [status, setStatus]     = useState('all');
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(true);
  const [data, setData]         = useState({ records:[], summary:{} });

  const effectiveDept = isManager ? managerDept : dept;

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.getAllAttendance({ date, department: effectiveDept, status, search });
      setData(res);
    } catch (err) {
      showToast('Failed to load monitor', err.message, 'error');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [date, effectiveDept, status]);

  const handleSearchSubmit = (e) => { e.preventDefault(); load(); };

  if (loading) return <MonitorSkeleton />;

  const { records = [], summary = {} } = data;
  const total   = summary.totalEmployees || 0;
  const inCount = summary.checkedInCount  || 0;
  const late    = summary.lateCount       || 0;
  const leave   = summary.leaveCount      || 0;
  const absent  = summary.absentCount     || 0;

  const fmtTime = (ts) => ts ? ts.split(' ')[1]?.slice(0,5) || '—' : '—';

  return (
    <div>
      {/* Compact stat strip — 3-card requirement */}
      <div className="stat-strip mb-8" style={{ gridTemplateColumns:'repeat(3, 1fr)' }}>
        <StatCard
          title="Present Today"
          value={inCount}
          icon={<CheckCircle2 size={18} />}
          variant="success"
          change={total > 0 ? `${Math.round((inCount/total)*100)}% attendance` : undefined}
          changeType="flat"
          subtitle={`of ${total} staff`}
        />
        <StatCard
          title="Absent Today"
          value={absent}
          icon={<UserX size={18} />}
          variant="danger"
          change={absent > 0 ? `${absent} unplanned` : 'None today'}
          changeType={absent > 0 ? 'down' : 'flat'}
          subtitle="Unplanned absences"
        />
        <StatCard
          title="On Leave Today"
          value={leave}
          icon={<Clock size={18} />}
          variant="info"
          subtitle="Approved time off"
          changeType="flat"
        />
      </div>

      <div className="panel mb-8">
        {/* Filter bar */}
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
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="HR & People">HR &amp; People</option>
                  <option value="Sales">Sales</option>
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
          <form onSubmit={handleSearchSubmit} className="filter-search" style={{ flex:1 }}>
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

          {/* Refresh */}
          <div className="form-group" style={{ justifyContent:'flex-end' }}>
            <label className="form-label">&nbsp;</label>
            <button
              className="btn btn-ghost"
              onClick={load}
              aria-label="Refresh data"
            >
              <RefreshCw size={15} />
              Refresh
            </button>
          </div>
        </div>

        {/* ---- ALL-EMPLOYEES TABLE ---- */}
        {records.length === 0 ? (
          <EmptyMonitor />
        ) : (
          <div className="table-wrapper">
            <table className="data-table" aria-label="All-employee attendance monitor">
              <thead>
                <tr>
                  <th scope="col"><div className="th-inner">Employee</div></th>
                  <th scope="col"><div className="th-inner">Department</div></th>
                  <th scope="col"><div className="th-inner">Date</div></th>
                  <th scope="col"><div className="th-inner">Status</div></th>
                  <th scope="col"><div className="th-inner">Clock In</div></th>
                  <th scope="col"><div className="th-inner">Clock Out</div></th>
                  <th scope="col"><div className="th-inner">Hours</div></th>
                  <th scope="col"><div className="th-inner">Punctuality</div></th>
                </tr>
              </thead>
              <tbody>
                {records.map((emp) => {
                  const isIncomplete = emp.status === 'incomplete';
                  const initials     = emp.employee_name?.split(' ').map(n=>n[0]).join('').slice(0,2) || '?';

                  return (
                    <tr
                      key={emp.employee_id}
                      className={isIncomplete ? 'row-incomplete' : ''}
                      aria-label={`${emp.employee_name}: ${emp.status || 'not marked'}`}
                    >
                      <td>
                        <div className="emp-cell">
                          {emp.employee_avatar
                            ? <img src={emp.employee_avatar} alt="" className="emp-avatar" aria-hidden="true" />
                            : <div className="emp-avatar-placeholder" aria-hidden="true">{initials}</div>
                          }
                          <div>
                            <div className="emp-name">{emp.employee_name}</div>
                            <div className="emp-meta">{emp.employee_code} · {emp.designation}</div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span style={{ fontSize:13, color:'var(--text-secondary)', fontWeight:500 }}>
                          {emp.department}
                        </span>
                      </td>

                      <td className="td-num">{emp.date || date}</td>

                      <td>
                        <StatusBadge status={emp.status || 'not_marked'} />
                      </td>

                      <td className="td-num">{fmtTime(emp.check_in)}</td>
                      <td className="td-num">{fmtTime(emp.check_out)}</td>
                      <td className="td-num">
                        {emp.work_hours > 0 ? `${emp.work_hours} hrs` : '—'}
                      </td>

                      <td>
                        {emp.late_minutes > 0
                          ? <span className="late-badge"><AlertCircle size={12} />{+emp.late_minutes}m late</span>
                          : emp.check_in
                            ? <span className="ontime-badge">✓ On time</span>
                            : <span className="td-muted">—</span>
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminMonitor;
