import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DOW         = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

/* Status → cal cell CSS class map */
const STATUS_CLASS = {
  present:    'status-present',
  half_day:   'status-half_day',
  halfday:    'status-half_day',
  absent:     'status-absent',
  leave:      'status-leave',
  incomplete: 'status-incomplete',
};

export function CalendarView({ records = [], loading }) {
  const [current, setCurrent] = useState(new Date());
  const [hovered, setHovered]  = useState(null);   // {x, y, record, day}

  const year  = current.getFullYear();
  const month = current.getMonth();
  const today = new Date().toISOString().slice(0, 10);

  /* Build record map */
  const recMap = new Map();
  records.forEach(r => recMap.set(r.date, r));

  /* Build grid */
  const firstDow    = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset      = firstDow === 0 ? 6 : firstDow - 1; // Mon-start offset

  const cells = [];
  for (let i = 0; i < offset; i++) cells.push({ empty: true, key:`e${i}` });
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const dow     = new Date(year, month, d).getDay();
    cells.push({
      day: d,
      date: dateStr,
      isWeekend: dow === 0 || dow === 6,
      isToday:   dateStr === today,
      record:    recMap.get(dateStr) || null,
    });
  }

  if (loading) {
    return (
      <div className="panel mb-8">
        <div className="panel-header">
          <div className="panel-title"><CalendarDays size={18} />Monthly Calendar</div>
        </div>
        <div className="panel-body">
          <div className="calendar-grid">
            {[...Array(35)].map((_,i) => (
              <div key={i} className="skeleton" style={{ height:56, borderRadius:'var(--r-input)' }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="panel mb-8" style={{ position:'relative' }}>
      <div className="panel-header">
        <div className="panel-title">
          <CalendarDays size={18} aria-hidden="true" />
          Monthly Calendar
        </div>
        <div className="panel-actions">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setCurrent(new Date(year, month - 1, 1))}
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontWeight:600, fontSize:15, minWidth:140, textAlign:'center', color:'var(--primary-900)' }}>
            {MONTH_NAMES[month]} {year}
          </span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setCurrent(new Date(year, month + 1, 1))}
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="panel-body">
        {/* Day-of-week headers */}
        <div className="calendar-header-row">
          {DOW.map(d => <div key={d} className="calendar-dow">{d}</div>)}
        </div>

        {/* Calendar cells */}
        <div className="calendar-grid">
          {cells.map((cell, idx) => {
            if (cell.empty) return <div key={cell.key} className="cal-cell empty" aria-hidden="true" />;

            const rec    = cell.record;
            const status = rec?.status?.toLowerCase().replace('-','_') || null;
            const tint   = status ? (STATUS_CLASS[status] || '') : '';

            return (
              <div
                key={cell.date}
                className={`cal-cell ${tint} ${cell.isWeekend ? 'weekend' : ''} ${cell.isToday ? 'today-cell' : ''} ${rec ? 'clickable' : ''}`}
                onMouseEnter={rec ? (e) => setHovered({ date: cell.date, record: rec, day: cell.day }) : undefined}
                onMouseLeave={rec ? () => setHovered(null) : undefined}
                title={rec ? `${cell.date}: ${status}` : undefined}
                role={rec ? 'button' : undefined}
                tabIndex={rec ? 0 : undefined}
                aria-label={rec ? `${cell.date}: ${status}` : cell.date}
              >
                <div className="cal-cell-date">{cell.day}</div>

                {rec && (
                  <div style={{ marginTop: 'var(--sp-1)', transform:'scale(0.78)', transformOrigin:'top center' }}>
                    <StatusBadge status={rec.status} size={11} />
                  </div>
                )}

                {/* Popover on hover */}
                {hovered?.date === cell.date && (
                  <div className="cal-popover" role="tooltip">
                    <div className="cal-popover-row">
                      <span>Status</span>
                      <StatusBadge status={rec.status} size={11} />
                    </div>
                    {rec.check_in && (
                      <div className="cal-popover-row">
                        <span>In</span>
                        <strong>{rec.check_in.split(' ')[1]?.slice(0,5) || '—'}</strong>
                      </div>
                    )}
                    {rec.check_out && (
                      <div className="cal-popover-row">
                        <span>Out</span>
                        <strong>{rec.check_out.split(' ')[1]?.slice(0,5) || '—'}</strong>
                      </div>
                    )}
                    {rec.work_hours > 0 && (
                      <div className="cal-popover-row">
                        <span>Hours</span>
                        <strong>{rec.work_hours} hrs</strong>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display:'flex', gap:'var(--sp-4)', marginTop:'var(--sp-4)', flexWrap:'wrap' }}>
          {[
            { status:'present',    label:'Present' },
            { status:'half_day',   label:'Half Day' },
            { status:'absent',     label:'Absent' },
            { status:'leave',      label:'Leave' },
            { status:'incomplete', label:'Incomplete' },
          ].map(l => (
            <StatusBadge key={l.status} status={l.status} size={12} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default CalendarView;
