import React from 'react';
import { Calendar, CheckCircle, TrendingUp, Clock, AlertTriangle } from 'lucide-react';

export function WeeklyView({ weeklyData }) {
  if (!weeklyData || !weeklyData.breakdown) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: '#9ca3af' }}>Loading weekly attendance data...</p>
      </div>
    );
  }

  const { breakdown, totalWeeklyHours, averageDailyHours, presentDays, weekStartDate, weekEndDate } = weeklyData;
  const targetWeeklyHours = 40.0;
  const completionPercentage = Math.min(100, Math.round((totalWeeklyHours / targetWeeklyHours) * 100));

  return (
    <div className="glass-panel">
      <div className="panel-header">
        <div className="panel-title-wrap">
          <Calendar size={20} color="#10b981" />
          <h2 className="panel-title">Weekly Attendance & Hours Breakdown</h2>
        </div>
        <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
          Period: <strong style={{ color: '#e5e7eb' }}>{weekStartDate}</strong> to <strong style={{ color: '#e5e7eb' }}>{weekEndDate}</strong>
        </div>
      </div>

      {/* Quick summary strip */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
        gap: '1rem', 
        marginBottom: '1.75rem' 
      }}>
        <div style={{ background: 'rgba(31, 41, 55, 0.4)', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>Total Hours Worked</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#6366f1', fontFamily: 'var(--font-heading)' }}>
            {totalWeeklyHours} <span style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: 500 }}>/ 40h</span>
          </div>
        </div>

        <div style={{ background: 'rgba(31, 41, 55, 0.4)', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>Average Daily Shift</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-heading)' }}>
            {averageDailyHours} <span style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: 500 }}>hrs/day</span>
          </div>
        </div>

        <div style={{ background: 'rgba(31, 41, 55, 0.4)', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>Days Present</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b', fontFamily: 'var(--font-heading)' }}>
            {presentDays} <span style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: 500 }}>/ 5 days</span>
          </div>
        </div>

        <div style={{ background: 'rgba(31, 41, 55, 0.4)', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>Weekly Target</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: completionPercentage >= 80 ? '#10b981' : '#38bdf8', fontFamily: 'var(--font-heading)' }}>
            {completionPercentage}%
          </div>
        </div>
      </div>

      {/* Daily Bars Grid */}
      <div className="weekly-grid">
        {breakdown.map((item) => {
          // Calculate height relative to 10h max scale
          const maxScale = 10.0;
          const barHeightPercent = Math.min(100, Math.round(((item.work_hours || 0) / maxScale) * 100));

          return (
            <div key={item.date} className={`week-day-card ${item.isToday ? 'is-today' : ''}`}>
              <div className="day-header">{item.dayName}</div>
              <div className="day-date">{item.date.slice(5)}</div>

              <div className="day-bar-container">
                <div className="day-bar-target-line" title="Target: 8.0 hrs" />
                <div 
                  className={`day-bar-fill ${item.status || 'not_recorded'}`}
                  style={{ height: `${barHeightPercent}%` }}
                />
              </div>

              <div className="day-hours-label">
                {item.work_hours > 0 ? `${item.work_hours}h` : '0h'}
              </div>

              <span className={`status-pill ${item.status}`}>
                {item.status.replace('_', ' ')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WeeklyView;
