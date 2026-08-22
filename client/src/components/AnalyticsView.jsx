import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Clock, 
  CheckCircle2, 
  UserX, 
  AlertTriangle,
  Building2,
  Calendar
} from 'lucide-react';
import { api } from '../services/api';
import { StatCard } from './StatCard';

export function AnalyticsView({ showToast }) {
  const [department, setDepartment] = useState('all');
  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.getAnalytics({ department });
      setAnalyticsData(res);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [department]);

  if (!analyticsData) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: '#9ca3af' }}>Calculating workforce analytics & trends...</p>
      </div>
    );
  }

  const { metrics, departmentBreakdown = [], monthlyTrend = [] } = analyticsData;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="header-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={28} color="#10b981" />
            <h1>Workforce Attendance Analytics</h1>
          </div>
          <p>Key workforce metrics, punctuality benchmarks, absenteeism analysis, and monthly trends.</p>
        </div>

        {/* Department filter */}
        <div className="filter-group">
          <Building2 size={16} color="#9ca3af" />
          <select 
            className="select-field"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="all">Company-wide (All Depts)</option>
            <option value="Engineering">Engineering</option>
            <option value="Design">Design</option>
            <option value="HR & People">HR & People</option>
            <option value="Sales">Sales</option>
          </select>
        </div>
      </div>

      {/* Differentiator Stat Cards Grid (Member 4 Shared StatCard Component) */}
      <div className="stats-grid">
        <StatCard
          title="Overall Attendance Rate"
          value={`${metrics.attendancePercentage}%`}
          icon={<TrendingUp size={20} />}
          variant="success"
          change="+2.4% vs last mo"
          changeType="positive"
          subtitle="Target: ≥ 92%"
        />

        <StatCard
          title="Total Present Shifts"
          value={metrics.presentCount}
          icon={<CheckCircle2 size={20} />}
          variant="primary"
          subtitle={`+ ${metrics.halfDayCount} half-day shifts`}
        />

        <StatCard
          title="Late Arrivals Count"
          value={metrics.lateArrivalCount}
          icon={<Clock size={20} />}
          variant="warning"
          change={metrics.lateArrivalCount > 0 ? "Needs Review" : "Optimal"}
          changeType={metrics.lateArrivalCount > 0 ? "negative" : "positive"}
          subtitle="Arrivals > 09:30 AM"
        />

        <StatCard
          title="Approved Leaves / PTO"
          value={metrics.leaveCount}
          icon={<Calendar size={20} />}
          variant="purple"
          subtitle="Scheduled time off"
        />

        <StatCard
          title="Unplanned Absences"
          value={metrics.absentCount}
          icon={<UserX size={20} />}
          variant="danger"
          change={metrics.absentCount > 0 ? `${metrics.absentCount} incidents` : "Zero"}
          changeType={metrics.absentCount > 0 ? "negative" : "positive"}
          subtitle="Unexcused missed days"
        />

        <StatCard
          title="Avg Daily Shift Duration"
          value={`${metrics.avgDailyWorkHours}h`}
          icon={<Clock size={20} />}
          variant="primary"
          change="Standard: 8.5h"
          changeType="neutral"
          subtitle="Calculated work hours"
        />
      </div>

      {/* Grid: Department Performance & Trend Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Department-wise Attendance Breakdown */}
        <div className="glass-panel" style={{ marginBottom: 0 }}>
          <div className="panel-header">
            <div className="panel-title-wrap">
              <Building2 size={18} color="#6366f1" />
              <h3 className="panel-title" style={{ fontSize: '1.1rem' }}>Department Breakdown</h3>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Staff</th>
                  <th>Present Shifts</th>
                  <th>Late Logs</th>
                  <th>Avg Hours</th>
                </tr>
              </thead>
              <tbody>
                {departmentBreakdown.map((dept) => (
                  <tr key={dept.department}>
                    <td style={{ fontWeight: 600 }}>{dept.department}</td>
                    <td>{dept.employeeCount}</td>
                    <td style={{ color: '#10b981', fontWeight: 600 }}>{dept.presentLogs}</td>
                    <td style={{ color: dept.lateLogs > 0 ? '#f87171' : '#9ca3af' }}>{dept.lateLogs}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{dept.deptAvgHours || '--'} hrs</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4-Week Trend Analysis */}
        <div className="glass-panel" style={{ marginBottom: 0 }}>
          <div className="panel-header">
            <div className="panel-title-wrap">
              <TrendingUp size={18} color="#10b981" />
              <h3 className="panel-title" style={{ fontSize: '1.1rem' }}>Weekly Trend Analysis</h3>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Week Starting</th>
                  <th>Total Logs</th>
                  <th>Present Rate</th>
                  <th>Late Arrivals</th>
                  <th>Avg Shift</th>
                </tr>
              </thead>
              <tbody>
                {monthlyTrend.map((t, idx) => {
                  const presentRate = t.total_records > 0 
                    ? Math.round((t.present_count / t.total_records) * 100) 
                    : 0;

                  return (
                    <tr key={t.week_number || idx}>
                      <td style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                        {t.week_start}
                      </td>
                      <td>{t.total_records}</td>
                      <td>
                        <span style={{ 
                          color: presentRate >= 90 ? '#34d399' : '#f59e0b',
                          fontWeight: 700 
                        }}>
                          {presentRate}%
                        </span>
                      </td>
                      <td style={{ color: t.late_count > 0 ? '#f87171' : '#9ca3af' }}>
                        {t.late_count}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>
                        {t.avg_hours} hrs
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AnalyticsView;
