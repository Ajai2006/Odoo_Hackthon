import React, { useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, CheckCircle2, UserX, Clock,
  CalendarDays, Building2, ChevronDown, Sparkles, Download, Lightbulb, Zap, ArrowUpRight
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

  const handleExportAnalyticsCSV = () => {
    if (!data) return;
    const { departmentBreakdown = [], monthlyTrend = [] } = data;
    const headers = ['Type', 'Category / Start Date', 'Employee Count / Records', 'Present Count / Rate', 'Late Count', 'Avg Shift Hours'];
    const rows = [
      ...departmentBreakdown.map(d => [`"Department"`, `"${d.department}"`, d.employeeCount, d.presentLogs, d.lateLogs, d.deptAvgHours || 0]),
      ...monthlyTrend.map(t => [`"Weekly Trend"`, `"${t.week_start}"`, t.total_records, `${t.present_count} present`, t.late_count, t.avg_hours || 0])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Dayflow_Workforce_Analytics_${effectiveDept}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Export Complete', 'Workforce analytics downloaded as CSV.', 'success');
  };

  if (loading) return <AnalyticsSkeleton />;

  const { metrics = {}, departmentBreakdown = [], monthlyTrend = [] } = data || {};

  // Compute Smart AI Insights
  const topDept = [...departmentBreakdown].sort((a, b) => (b.presentLogs || 0) - (a.presentLogs || 0))[0];
  const rate = metrics.attendancePercentage ?? 0;
  const lateCount = metrics.lateArrivalCount ?? 0;

  return (
    <div>
      {/* Scope banner / Dept filter & Export button */}
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
                  <option value="Finance">Finance</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Operations">Operations</option>
                </select>
                <ChevronDown size={14} className="select-caret" aria-hidden="true" />
              </div>
            </div>
          )}

          <button
            className="btn btn-primary"
            onClick={handleExportAnalyticsCSV}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '13px', padding: '0.55rem 0.95rem' }}
          >
            <Download size={15} /> Export Analytics CSV
          </button>
        </div>
      </div>

      {/* 🔮 SMART AI WORKFORCE INSIGHTS PANEL */}
      <div className="panel mb-8" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)', border: '1px solid #bae6fd', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.08)' }}>
        <div className="panel-header" style={{ borderBottom: '1px solid #e0f2fe' }}>
          <div className="panel-title" style={{ color: '#0369a1', fontWeight: 700 }}>
            <Sparkles size={18} style={{ color: '#0284c7' }} />
            AI Workforce Insights & Automated Recommendations
          </div>
          <span style={{ fontSize: '11px', background: '#0284c7', color: '#fff', padding: '3px 8px', borderRadius: '12px', fontWeight: 600 }}>
            AI ASSISTANT
          </span>
        </div>

        <div className="panel-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '0.85rem', background: '#ffffff', borderRadius: '10px', border: '1px solid #e0f2fe' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
              <TrendingUp size={15} color="#10b981" /> Attendance Performance Analysis
            </div>
            <p style={{ fontSize: '12px', color: '#475569', margin: 0, lineHeight: 1.5 }}>
              Overall workforce attendance rate stands at <strong style={{ color: '#0f172a' }}>{rate}%</strong>. {topDept ? `${topDept.department} leads shift completions.` : 'Performance aligns with targets.'}
            </p>
          </div>

          <div style={{ padding: '0.85rem', background: '#ffffff', borderRadius: '10px', border: '1px solid #e0f2fe' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
              <Zap size={15} color="#f59e0b" /> Punctuality & Anomaly Insights
            </div>
            <p style={{ fontSize: '12px', color: '#475569', margin: 0, lineHeight: 1.5 }}>
              {lateCount > 0 
                ? `Detected ${lateCount} late clock-in instance(s) after 09:30 AM standard shift start.` 
                : 'Zero late clock-in anomalies detected. Excellent team punctuality.'}
            </p>
          </div>

          <div style={{ padding: '0.85rem', background: '#ffffff', borderRadius: '10px', border: '1px solid #e0f2fe' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
              <Lightbulb size={15} color="#0284c7" /> AI Manager Recommendation
            </div>
            <p style={{ fontSize: '12px', color: '#475569', margin: 0, lineHeight: 1.5 }}>
              {lateCount > 2 
                ? 'Recommended action: Schedule a 15-min shift alignment or enable automated morning check-in reminders.' 
                : 'Recommended action: Maintain current shift roster; attendance distribution is optimal.'}
            </p>
          </div>
        </div>
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
              Department Performance Breakdown
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
              Weekly Trend Analysis (last 6 weeks)
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
