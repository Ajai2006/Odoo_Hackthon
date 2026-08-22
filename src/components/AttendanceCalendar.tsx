import React, { useState, useEffect } from 'react';
import { AttendanceRecord, Employee } from '../types';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2, User, Clock } from 'lucide-react';

interface AttendanceCalendarProps {
  currentEmployee?: Employee;
  allEmployees?: Employee[];
}

export const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({
  currentEmployee,
  allEmployees = [],
}) => {
  const [currentMonth, setCurrentMonth] = useState<number>(7); // 7 is August (0-indexed)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [selectedEmpId, setSelectedEmpId] = useState<number | 'all'>(currentEmployee?.id || 'all');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedDayDetails, setSelectedDayDetails] = useState<{
    date: string;
    records: AttendanceRecord[];
  } | null>(null);

  useEffect(() => {
    if (currentEmployee && selectedEmpId === 'all') {
      setSelectedEmpId(currentEmployee.id);
    }
  }, [currentEmployee]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const monthStart = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`;
      const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
      const monthEnd = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;

      let url = `/api/attendance?start_date=${monthStart}&end_date=${monthEnd}`;
      if (selectedEmpId !== 'all') {
        url += `&employee_id=${selectedEmpId}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setRecords(data.records);
      }
    } catch (err) {
      console.error('Failed to fetch attendance calendar', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [currentMonth, currentYear, selectedEmpId]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const recordsByDate: Record<string, AttendanceRecord[]> = {};
  for (const r of records) {
    if (!recordsByDate[r.date]) {
      recordsByDate[r.date] = [];
    }
    recordsByDate[r.date].push(r);
  }

  return (
    <div className="card-panel">
      <div className="card-panel-header">
        <div className="flex-align-center gap-2">
          <div className="brand-icon-box" style={{ width: '28px', height: '28px' }}>
            <CalendarIcon size={15} />
          </div>
          <div>
            <h3>Attendance & Leave Calendar</h3>
            <p className="text-caption">Auto-synced with Member 2 attendance module — approved leaves reflect live</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex-align-center gap-3">
          <select
            className="form-input"
            style={{ width: '200px', height: '34px', padding: '4px 8px', fontSize: '13px' }}
            value={selectedEmpId}
            onChange={(e) => setSelectedEmpId(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))}
          >
            <option value="all">All Employees (Team Matrix)</option>
            {allEmployees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.department})
              </option>
            ))}
          </select>

          {/* Month Stepper */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid var(--border)', borderRadius: 'var(--radius-input)', padding: '2px 6px', backgroundColor: 'var(--bg-surface)' }}>
            <button className="btn btn-sm" style={{ border: 'none', padding: '2px', boxShadow: 'none' }} onClick={handlePrevMonth}>
              <ChevronLeft size={14} />
            </button>
            <span style={{ fontSize: '13px', fontWeight: 600, minWidth: '110px', textAlign: 'center' }}>
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button className="btn btn-sm" style={{ border: 'none', padding: '2px', boxShadow: 'none' }} onClick={handleNextMonth}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Legend Bar */}
      <div style={{ padding: '8px 24px', backgroundColor: 'var(--bg-zebra)', borderBottom: '1px solid var(--border)', display: 'flex', gap: '20px', fontSize: '12px', color: 'var(--text-secondary)' }}>
        <div className="flex-align-center gap-1">
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)' }} />
          <span>Present</span>
        </div>
        <div className="flex-align-center gap-1">
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary-700)' }} />
          <span>On Leave (Auto-Synced)</span>
        </div>
        <div className="flex-align-center gap-1">
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--text-muted)' }} />
          <span>Weekend</span>
        </div>
      </div>

      <div style={{ padding: '24px' }}>
        {/* Calendar Grid */}
        <div className="calendar-matrix">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="matrix-header-cell">{d}</div>
          ))}

          {/* Blank cells */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="matrix-day-cell matrix-day-weekend" />
          ))}

          {/* Actual days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
            const dayOfWeek = new Date(currentYear, currentMonth, dayNum).getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const dayRecords = recordsByDate[dateStr] || [];

            return (
              <div
                key={dateStr}
                className={`matrix-day-cell ${isWeekend ? 'matrix-day-weekend' : ''}`}
                style={{ cursor: dayRecords.length > 0 ? 'pointer' : 'default' }}
                onClick={() => dayRecords.length > 0 && setSelectedDayDetails({ date: dateStr, records: dayRecords })}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="matrix-day-num tabular-nums">{dayNum}</span>
                  {dayRecords.length > 0 && (
                    <span className="text-label" style={{ fontSize: '10px' }}>{dayRecords.length}</span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
                  {dayRecords.slice(0, 2).map((r, idx) => (
                    <div
                      key={idx}
                      className={r.status === 'Leave' ? 'att-tag-leave' : 'att-tag-present'}
                      title={`${r.employee_name}: ${r.status}`}
                    >
                      {r.status === 'Leave' ? '✈️ Leave' : '✓ Present'} {selectedEmpId === 'all' && `(${r.employee_name?.split(' ')[0]})`}
                    </div>
                  ))}
                  {dayRecords.length > 2 && (
                    <span className="text-label" style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                      +{dayRecords.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Modal */}
      {selectedDayDetails && (
        <div className="modal-overlay" onClick={() => setSelectedDayDetails(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-box">
              <h3>Attendance for {selectedDayDetails.date}</h3>
              <button className="modal-close-btn" onClick={() => setSelectedDayDetails(null)}>✕</button>
            </div>
            <div className="modal-body-content">
              {selectedDayDetails.records.map((r) => (
                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-input)', backgroundColor: 'var(--bg-primary)' }}>
                  <div>
                    <strong style={{ fontSize: '13px' }}>{r.employee_name}</strong>
                    <span className="text-caption" style={{ display: 'block', fontSize: '11px' }}>{r.notes || 'Standard log'}</span>
                  </div>
                  <span className={r.status === 'Leave' ? 'att-tag-leave' : 'att-tag-present'}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
            <div className="modal-footer-box">
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedDayDetails(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceCalendar;
