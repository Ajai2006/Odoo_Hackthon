import React from 'react';
import { CalendarDays, TrendingUp, Award, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

/* Skeleton for weekly strip */
function WeeklySkeleton() {
  return (
    <div className="panel mb-8">
      <div className="panel-header">
        <div className="panel-title"><CalendarDays size={18} />Weekly Performance & Target Analysis</div>
      </div>
      <div className="panel-body">
        <div className="weekly-strip">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="skeleton skeleton-line" style={{ height: 100, borderRadius: 'var(--r-input)' }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function WeeklyView({ weeklyData, loading }) {
  if (loading) return <WeeklySkeleton />;

  const { breakdown = [], totalWeeklyHours = 0, averageDailyHours = 0, presentDays = 0, weekStartDate, weekEndDate } = weeklyData || {};

  const targetPercentage = Math.min(100, Math.round((totalWeeklyHours / 40) * 100));
  const overtimeHours = Math.max(0, (totalWeeklyHours - 40).toFixed(1));
  const lateDays = breakdown.filter(d => d.late_minutes > 0).length;

  return (
    <div className="panel mb-8">
      <div className="panel-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="panel-title">
          <CalendarDays size={18} aria-hidden="true" />
          Weekly Shift & Performance Analysis
        </div>
        <div className="panel-actions">
          <span className="text-sm text-muted" style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
            {weekStartDate} – {weekEndDate}
          </span>
        </div>
      </div>

      {/* Summary strip with Target Progress Bar */}
      <div style={{ padding: 'var(--sp-4) var(--sp-6)', background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--sp-6)', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)' }}>Total Weekly Hours</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary-900)' }}>
              {totalWeeklyHours} <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-secondary)' }}>/ 40.0 h</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)' }}>Average Daily Shift</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary-900)' }}>
              {averageDailyHours} <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-secondary)' }}>h / day</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)' }}>Shift Attendance</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#10b981' }}>
              {presentDays} <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-secondary)' }}>/ 5 days</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)' }}>Weekly Target Progress</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: targetPercentage >= 90 ? '#10b981' : '#f59e0b' }}>
              {targetPercentage}%
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
            <span>Weekly 40-Hour Target Goal</span>
            <span>{totalWeeklyHours} hrs completed {overtimeHours > 0 ? `(+${overtimeHours}h Overtime)` : ''}</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              width: `${targetPercentage}%`,
              height: '100%',
              background: targetPercentage >= 100 ? '#10b981' : targetPercentage >= 75 ? '#0284c7' : '#f59e0b',
              borderRadius: '4px',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      </div>

      <div className="panel-body">
        {/* Weekly Day Cells */}
        <div className="weekly-strip mb-4">
          {breakdown.map(item => (
            <div
              key={item.date}
              className={`week-cell ${item.isToday ? 'today' : ''}`}
              aria-label={`${item.dayName} ${item.date}: ${item.status}`}
            >
              <div className="week-cell-day">{item.dayName}</div>
              <div className="week-cell-date">{item.date.slice(8)}</div>

              {/* Status badge */}
              <div style={{ transform: 'scale(0.9)', transformOrigin: 'center', marginTop: 'var(--sp-1)' }}>
                <StatusBadge status={item.status} size={12} />
              </div>

              <div className="week-cell-hours">
                {item.work_hours > 0 ? `${item.work_hours} h` : '—'}
              </div>
            </div>
          ))}
        </div>

        {/* Weekly Analysis Insight Banner */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: 'var(--r-input)', border: '1px solid #e2e8f0', fontSize: '12px' }}>
          <TrendingUp size={16} style={{ color: '#0284c7', shrink: 0 }} />
          <div>
            <strong>Weekly Analysis Insight:</strong> {targetPercentage >= 90 ? 'Shift hours target achieved. Good productivity and shift compliance.' : 'Shift target currently under 90%. Additional hours recommended before weekend.'} {lateDays > 0 ? `(${lateDays} late log detected this week)` : ''}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeeklyView;
