import React, { useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, CheckCircle2, UserX, Clock,
  CalendarDays, Building2, ChevronDown
} from 'lucide-react';
import { api } from '../services/api';
import { StatCard } from './StatCard';

/* Skeleton */
function AnalyticsSkeleton() {
  return (
    <div>
      <div className="stat-strip mb-8">
        {[...Array(6)].map((_,i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton skeleton-line short mb-2" />
            <div className="skeleton skeleton-line tall" style={{ height:40, width:'50%' }} />
          </div>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'var(--sp-6)' }}>
        {[1,2].map(i => (
          <div key={i} className="skeleton-card">
            {[...Array(4)].map((_,j) => <div key={j} className="skeleton skeleton-line" style={{ marginBottom:'var(--sp-3)' }} />)}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnalyticsView({ currentUser, showToast }) {
  const isManager = currentUser?.role === 'manager';
  const isEmployee = currentUser?.role === 'employee';
  const userDept = currentUser?.employee?.department || 'Design';

  const [dept, setDept]         = useState(isManager ? userDept : (isEmployee ? userDept : 'all'));
  const [loading, setLoading]   = useState(true);
  const [data, setData]         = useState(null);

  const effectiveDept = isManager ? userDept : dept;

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.getAnalytics({ department: effectiveDept });
      setData(res);
    } catch (err) {
      showToast('Analytics error', err.message, 'error');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [effectiveDept]);

  if (loading) return <AnalyticsSkeleton />;

  const { metrics = {}, departmentBreakdown = [], monthlyTrend = [] } = data || {};

  return (
    <div>
      {/* Scope banner / Dept filter */}
      <div className="page-header-actions mb-6" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'var(--sp-4)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'var(--sp-2)' }}>
          {isEmployee && (
            <span className="badge-employee" style={{ padding:'4px 10px', borderRadius:'var(--r-btn)', fontSize:12, fontWeight:600 }}>
              Showing {userDept} Department &amp; Benchmarks
            </span>
          )}
          {isManager && (
            <span className="badge-manager" style={{ padding:'4px 10px', borderRadius:'var(--r-btn)', fontSize:12, fontWeight:600 }}>
              Team Analytics Scope: {userDept}
            </span>
          )}
          {currentUser?.role === 'admin' && (
            <span className="badge-admin" style={{ padding:'4px 10px', borderRadius:'var(--r-btn)', fontSize:12, fontWeight:600 }}>
              Organization-Wide Executive Analytics
            </span>
          )}
        </div>

        {currentUser?.role === 'admin' && (
          <div className="form-group flex-row" style={{ flexDirection:'row', alignItems:'center', gap:'var(--sp-2)' }}>
            <Building2 size={16} style={{ color:'var(--text-secondary)' }} aria-hidden="true" />
            <div className="select-wrap">
              <select
                className="form-control"
                value={dept}
                onChange={e => setDept(e.target.value)}
                aria-label="Filter analytics by department"
              >
                <option value="all">Company-wide</option>
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="HR & People">HR &amp; People</option>
                <option value="Sales">Sales</option>
              </select>
              <ChevronDown size={14} className="select-caret" aria-hidden="true" />
            </div>
          </div>
        )}
      </div>

      {/* 6-card stat strip — Differentiator StatCards */}
      <div className="stat-strip mb-8">
        <StatCard
          title="Attendance Rate"
          value={`${metrics.attendancePercentage ?? 0}%`}
          icon={<TrendingUp size={18} />}
          variant="success"
          change={metrics.attendancePercentage >= 90 ? 'Above target (90%)' : 'Below target (90%)'}
          changeType={metrics.attendancePercentage >= 90 ? 'up' : 'down'}
          subtitle="Present + 0.5×HalfDay"
        />
        <StatCard
          title="Present Shifts"
          value={metrics.presentCount ?? 0}
          icon={<CheckCircle2 size={18} />}
          variant="success"
          subtitle={`+ ${metrics.halfDayCount ?? 0} half-day shifts`}
          changeType="flat"
        />
        <StatCard
          title="Approved Leaves"
          value={metrics.leaveCount ?? 0}
          icon={<CalendarDays size={18} />}
          variant="info"
          subtitle="Scheduled PTO"
          changeType="flat"
        />
        <StatCard
          title="Unplanned Absences"
          value={metrics.absentCount ?? 0}
          icon={<UserX size={18} />}
          variant="danger"
          change={metrics.absentCount > 0 ? `${metrics.absentCount} incidents` : 'None'}
          changeType={metrics.absentCount > 0 ? 'down' : 'flat'}
          subtitle="Unexcused missed days"
        />
        <StatCard
          title="Late Arrivals"
          value={metrics.lateArrivalCount ?? 0}
          icon={<Clock size={18} />}
          variant="warning"
          change={metrics.lateArrivalCount > 0 ? 'Review recommended' : 'Optimal'}
          changeType={metrics.lateArrivalCount > 0 ? 'down' : 'up'}
          subtitle="Arrivals after 09:30"
        />
        <StatCard
          title="Avg Daily Hours"
          value={`${metrics.avgDailyWorkHours ?? 0} h`}
          icon={<BarChart3 size={18} />}
          variant="primary"
          change="Target: 8.5 h"
          changeType="flat"
          subtitle="Mean clocked hours"
        />
      </div>

      {/* Two-panel grid: Dept breakdown + Trend */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(460px, 1fr))', gap:'var(--sp-6)' }}>
        {/* Department performance */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <Building2 size={18} aria-hidden="true" />
              Department Performance
            </div>
          </div>
          <div className="table-wrapper">
            <table className="data-table" aria-label="Department attendance breakdown">
              <thead>
                <tr>
                  <th scope="col">Department</th>
                  <th scope="col">Staff</th>
                  <th scope="col">Present Shifts</th>
                  <th scope="col">Late Logs</th>
                  <th scope="col">Avg Hours</th>
                </tr>
              </thead>
              <tbody>
                {departmentBreakdown.map(d => (
                  <tr key={d.department}>
                    <td className="font-semibold">{d.department}</td>
                    <td className="td-num">{d.employeeCount}</td>
                    <td className="td-num" style={{ color:'var(--success)', fontWeight:600 }}>{d.presentLogs}</td>
                    <td className="td-num" style={{ color: d.lateLogs > 0 ? 'var(--danger)' : 'var(--text-secondary)' }}>{d.lateLogs}</td>
                    <td className="td-num">{d.deptAvgHours ?? '—'} h</td>
                  </tr>
                ))}
                {departmentBreakdown.length === 0 && (
                  <tr><td colSpan={5} className="td-muted" style={{ textAlign:'center', padding:'var(--sp-8)' }}>No data</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Weekly trend */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <TrendingUp size={18} aria-hidden="true" />
              Weekly Trend (last 6 weeks)
            </div>
          </div>
          <div className="table-wrapper">
            <table className="data-table" aria-label="Weekly attendance trend">
              <thead>
                <tr>
                  <th scope="col">Week</th>
                  <th scope="col">Total</th>
                  <th scope="col">Present Rate</th>
                  <th scope="col">Late</th>
                  <th scope="col">Avg Shift</th>
                </tr>
              </thead>
              <tbody>
                {monthlyTrend.map((t, i) => {
                  const rate = t.total_records > 0 ? Math.round((t.present_count/t.total_records)*100) : 0;
                  return (
                    <tr key={t.week_number || i}>
                      <td className="td-num font-semibold">{t.week_start}</td>
                      <td className="td-num">{t.total_records}</td>
                      <td>
                        <span style={{ fontWeight:700, color: rate >= 90 ? 'var(--success)' : 'var(--warning)', fontVariantNumeric:'tabular-nums' }}>
                          {rate}%
                        </span>
                      </td>
                      <td className="td-num" style={{ color: t.late_count > 0 ? 'var(--danger)' : 'var(--text-secondary)' }}>
                        {t.late_count}
                      </td>
                      <td className="td-num">{t.avg_hours ?? '—'} h</td>
                    </tr>
                  );
                })}
                {monthlyTrend.length === 0 && (
                  <tr><td colSpan={5} className="td-muted" style={{ textAlign:'center', padding:'var(--sp-8)' }}>No trend data</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsView;
