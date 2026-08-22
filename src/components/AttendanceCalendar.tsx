import React, { useState, useEffect } from 'react';
import { AttendanceRecord, Employee } from '@/types';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2, XCircle, AlertCircle, Info, Filter } from 'lucide-react';

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
  const [selectedDept, setSelectedDept] = useState<string>('all');
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
      if (selectedDept !== 'all') {
        url += `&department=${selectedDept}`;
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
  }, [currentMonth, currentYear, selectedEmpId, selectedDept]);

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

  // Generate calendar grid
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday

  // Map records by date string YYYY-MM-DD
  const recordsByDate: Record<string, AttendanceRecord[]> = {};
  for (const r of records) {
    if (!recordsByDate[r.date]) {
      recordsByDate[r.date] = [];
    }
    recordsByDate[r.date].push(r);
  }

  return (
    <div className="card calendar-card">
      <div className="card-header flex-between flex-wrap gap-4">
        <div className="card-title-group">
          <div className="icon-wrapper icon-primary">
            <CalendarIcon size={20} />
          </div>
          <div>
            <h3 className="card-title">Live Attendance & Leave Calendar</h3>
            <p className="card-subtitle">
              Instant sync with Member 2 attendance module — approved leaves automatically reflect below
            </p>
          </div>
        </div>

        {/* Filters and Navigation */}
        <div className="calendar-controls-group">
          {/* Employee Filter */}
          <select
            className="form-select-sm"
            value={selectedEmpId}
            onChange={(e) => setSelectedEmpId(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))}
          >
            <option value="all">All Employees</option>
            {allEmployees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.department})
              </option>
            ))}
          </select>

          {/* Month Stepper */}
          <div className="month-stepper">
            <button className="stepper-btn" onClick={handlePrevMonth} title="Previous Month">
              <ChevronLeft size={16} />
            </button>
            <span className="month-label">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button className="stepper-btn" onClick={handleNextMonth} title="Next Month">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Legend Bar */}
      <div className="calendar-legend-bar">
        <div className="legend-item">
          <span className="legend-dot dot-present" />
          <span>Present</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot dot-leave" />
          <span>On Leave (Auto-Synced)</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot dot-absent" />
          <span>Absent</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot dot-weekend" />
          <span>Weekend</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid-container">
        {/* Day Headers */}
        <div className="calendar-grid-header">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="calendar-day-head">{d}</div>
          ))}
        </div>

        {/* Day Cells */}
        <div className="calendar-grid-body">
          {/* Blank cells for offset */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="calendar-cell cell-empty" />
          ))}

          {/* Actual days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
            const dayOfWeek = new Date(currentYear, currentMonth, dayNum).getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const dayRecords = recordsByDate[dateStr] || [];

            const hasLeave = dayRecords.some((r) => r.status === 'Leave');
            const hasPresent = dayRecords.some((r) => r.status === 'Present');
            const hasAbsent = dayRecords.some((r) => r.status === 'Absent');

            return (
              <div
                key={dateStr}
                className={`calendar-cell ${isWeekend ? 'cell-weekend' : ''} ${
                  hasLeave ? 'cell-has-leave' : ''
                }`}
                onClick={() => dayRecords.length > 0 && setSelectedDayDetails({ date: dateStr, records: dayRecords })}
              >
                <div className="cell-top">
                  <span className={`day-number ${isWeekend ? 'text-weekend' : ''}`}>
                    {dayNum}
                  </span>
                  {dayRecords.length > 0 && (
                    <span className="rec-count-pill">{dayRecords.length}</span>
                  )}
                </div>

                <div className="cell-badges">
                  {dayRecords.slice(0, 3).map((r, idx) => (
                    <div
                      key={idx}
                      className={`attendance-mini-pill status-pill-${r.status.toLowerCase()}`}
                      title={`${r.employee_name || 'Employee'}: ${r.status} (${r.notes || ''})`}
                    >
                      <span className="pill-status">{r.status}</span>
                      {selectedEmpId === 'all' && (
                        <span className="pill-emp-name">{r.employee_name?.split(' ')[0]}</span>
                      )}
                    </div>
                  ))}
                  {dayRecords.length > 3 && (
                    <span className="more-pill">+{dayRecords.length - 3} more</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Inspection Modal */}
      {selectedDayDetails && (
        <div className="modal-backdrop" onClick={() => setSelectedDayDetails(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-box">
                <CalendarIcon size={18} className="text-primary" />
                <h4>Attendance Details for {selectedDayDetails.date}</h4>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedDayDetails(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="attendance-details-list">
                {selectedDayDetails.records.map((r) => (
                  <div key={r.id} className="att-record-item">
                    <div className="flex-between">
                      <strong>{r.employee_name || `Employee #${r.employee_id}`}</strong>
                      <span className={`status-badge status-pill-${r.status.toLowerCase()}`}>
                        {r.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted mt-1">
                      Department: {r.department || 'General'}
                    </p>
                    {r.notes && (
                      <p className="text-sm text-accent mt-1 bg-surface-2 p-2 rounded">
                        📝 {r.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedDayDetails(null)}>
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
