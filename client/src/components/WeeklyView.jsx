import React from 'react';
import { CalendarDays } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

/* Skeleton for weekly strip */
function WeeklySkeleton() {
  return (
    <div className="panel mb-8">
      <div className="panel-header">
        <div className="panel-title"><CalendarDays size={18} />Weekly Overview</div>
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

  return (
    <div className="panel mb-8">
      <div className="panel-header">
        <div className="panel-title">
          <CalendarDays size={18} aria-hidden="true" />
          Weekly Overview
        </div>
        <div className="panel-actions">
          <span className="text-sm text-muted">
            {weekStartDate} – {weekEndDate}
          </span>
        </div>
      </div>

      {/* Summary strip */}
      <div style={{ display:'flex', gap:'var(--sp-8)', padding:'var(--sp-3) var(--sp-6)', background:'var(--bg-primary)', borderBottom:'1px solid var(--border)' }}>
        {[
          { label:'Total hours', value: `${totalWeeklyHours} h`, unit:'' },
          { label:'Avg per day',  value: `${averageDailyHours} h`, unit:'' },
          { label:'Days present', value: presentDays, unit:' / 5' },
          { label:'Weekly target', value: `${Math.min(100, Math.round((totalWeeklyHours/40)*100))}%`, unit:'' },
        ].map(item => (
          <div key={item.label}>
            <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-secondary)' }}>{item.label}</div>
            <div style={{ fontSize:20, fontWeight:700, color:'var(--primary-900)', fontVariantNumeric:'tabular-nums' }}>
              {item.value}<span style={{ fontSize:13, fontWeight:400, color:'var(--text-secondary)' }}>{item.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="panel-body">
        <div className="weekly-strip">
          {breakdown.map(item => (
            <div
              key={item.date}
              className={`week-cell ${item.isToday ? 'today' : ''}`}
              aria-label={`${item.dayName} ${item.date}: ${item.status}`}
            >
              <div className="week-cell-day">{item.dayName}</div>
              <div className="week-cell-date">{item.date.slice(8)}</div>

              {/* Status badge for this day */}
              <div style={{ transform:'scale(0.9)', transformOrigin:'center', marginTop:'var(--sp-1)' }}>
                <StatusBadge status={item.status} size={12} />
              </div>

              <div className="week-cell-hours">
                {item.work_hours > 0 ? `${item.work_hours} h` : '—'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WeeklyView;
