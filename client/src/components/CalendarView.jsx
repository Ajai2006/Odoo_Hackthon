import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export function CalendarView({ records = [] }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Create date-indexed map of attendance records
  const recordMap = new Map();
  records.forEach(r => {
    recordMap.set(r.date, r);
  });

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const daysGrid = [];
  // Offset for first day of month (Monday start)
  const offset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  for (let i = 0; i < offset; i++) {
    daysGrid.push({ empty: true, key: `empty-${i}` });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayOfWeek = new Date(year, month, d).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const record = recordMap.get(dStr);

    daysGrid.push({
      day: d,
      date: dStr,
      isWeekend,
      record,
      key: dStr
    });
  }

  return (
    <div className="glass-panel">
      <div className="panel-header">
        <div className="panel-title-wrap">
          <CalendarIcon size={20} color="#38bdf8" />
          <h2 className="panel-title">Monthly Attendance Calendar View</h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            onClick={handlePrevMonth}
            className="input-field" 
            style={{ padding: '0.4rem 0.6rem', cursor: 'pointer' }}
          >
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontWeight: 700, fontSize: '1rem', minWidth: '130px', textAlign: 'center' }}>
            {monthNames[month]} {year}
          </span>
          <button 
            onClick={handleNextMonth}
            className="input-field" 
            style={{ padding: '0.4rem 0.6rem', cursor: 'pointer' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Days of week header */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        gap: '6px', 
        textAlign: 'center',
        marginBottom: '8px',
        fontWeight: 600,
        fontSize: '0.8rem',
        color: '#9ca3af'
      }}>
        <div>MON</div>
        <div>TUE</div>
        <div>WED</div>
        <div>THU</div>
        <div>FRI</div>
        <div>SAT</div>
        <div>SUN</div>
      </div>

      {/* Calendar Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        gap: '6px'
      }}>
        {daysGrid.map(item => {
          if (item.empty) {
            return (
              <div 
                key={item.key} 
                style={{ 
                  height: '70px', 
                  background: 'rgba(255,255,255,0.01)', 
                  borderRadius: '6px' 
                }} 
              />
            );
          }

          const rec = item.record;
          let statusClass = 'not_marked';
          if (rec) {
            statusClass = rec.status;
          } else if (item.isWeekend) {
            statusClass = 'weekend';
          }

          return (
            <div
              key={item.key}
              style={{
                height: '75px',
                background: item.isWeekend ? 'rgba(31, 41, 55, 0.2)' : 'rgba(31, 41, 55, 0.5)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '6px 8px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: item.isWeekend ? '#6b7280' : '#e5e7eb' }}>
                  {item.day}
                </span>
                {rec?.late_minutes > 0 && (
                  <span style={{ fontSize: '0.65rem', color: '#f87171', fontWeight: 700 }}>
                    +{rec.late_minutes}m
                  </span>
                )}
              </div>

              <div>
                {rec ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span className={`status-pill ${statusClass}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                      {rec.status.replace('_', ' ')}
                    </span>
                    {rec.work_hours > 0 && (
                      <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontFamily: 'var(--font-mono)' }}>
                        {rec.work_hours} hrs
                      </span>
                    )}
                  </div>
                ) : item.isWeekend ? (
                  <span style={{ fontSize: '0.65rem', color: '#6b7280' }}>Weekend</span>
                ) : (
                  <span style={{ fontSize: '0.65rem', color: '#4b5563' }}>--</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CalendarView;
