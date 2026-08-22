import React, { useState, useEffect } from 'react';
import { CheckCircle2, UserX, Clock } from 'lucide-react';
import { api } from '../services/api';
import { StatCard } from './StatCard';
import { FilterBar } from './FilterBar';
import { AttendanceTable } from './AttendanceTable';

/* Skeleton */
function MonitorSkeleton() {
  return (
    <div>
      <div className="stat-strip mb-8">
        {[1,2,3].map(i => (
          <div key={i} className="skeleton-card">
            <div className="skeleton skeleton-line short mb-2" />
            <div className="skeleton skeleton-line tall" style={{ height:40, width:'60%' }} />
          </div>
        ))}
      </div>
      <div className="panel">
        <div className="filter-bar">
          {[1,2,3,4].map(i => <div key={i} className="skeleton skeleton-line" style={{ height:36, flex:1, minWidth:120 }} />)}
        </div>
        <div style={{ padding:'var(--sp-4)' }}>
          {[...Array(5)].map((_,i) => (
            <div key={i} className="skeleton skeleton-line" style={{ marginBottom:'var(--sp-3)' }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Build and download the multi-section HR Master CSV report */
function buildAndDownloadCsv({ records, date, effectiveDept, status, inCount, total, absent, leave, late }) {
  if (!records || records.length === 0) return;
  const genDate = new Date().toLocaleString();

  const section1 = [
    `"========================================================================================="`,
    `"DAYFLOW HRMS — MASTER EXECUTIVE & INDIVIDUAL EMPLOYEE ANALYSIS REPORT"`,
    `"========================================================================================="`,
    `"Report Generated On","${genDate}"`,
    `"Department Filter Scope","${effectiveDept}"`,
    `"Status Filter Scope","${status}"`,
    `"Total Headcount Evaluated",${records.length}`,
    `""`,
    `"--- SECTION 1: OVERALL WORKFORCE SUMMARY METRICS ---"`,
    `"Metric Name","Metric Value","Target Benchmark"`,
    `"Total Staff Headcount",${records.length},"—"`,
    `"Present Staff Today",${inCount},"${total > 0 ? `${Math.round((inCount/total)*100)}% attendance` : '0%'}"`,
    `"Unplanned Absences Today",${absent},"< 5% target"`,
    `"Staff On Leave Today",${leave},"Approved PTO"`,
    `"Late Clock-Ins Today",${late},"09:30 AM Shift Start"`,
    `""`
  ];

  const empMap = new Map();
  records.forEach(r => {
    if (!empMap.has(r.employee_id)) {
      empMap.set(r.employee_id, {
        code: r.employee_code || '',
        name: r.employee_name || '',
        email: r.email || r.employee_email || '',
        dept: r.department || '',
        designation: r.designation || '',
        status: r.status || 'not_marked',
        checkIn: r.check_in || '—',
        checkOut: r.check_out || '—',
        hours: r.work_hours || 0,
        late: r.late_minutes || 0,
        notes: r.notes || 'Regular Shift'
      });
    }
  });

  const section2Headers = [
    '"--- SECTION 2: INDIVIDUAL EMPLOYEE ATTENDANCE & SHIFT BREAKDOWN ---"',
    '"Employee Code"', '"Employee Name"', '"Work Email"', '"Department"', '"Designation"',
    '"Shift Date"', '"Attendance Status"', '"Clock-In Timestamp"', '"Clock-Out Timestamp"',
    '"Hours Worked (h)"', '"Overtime Hours (h)"', '"Late Arrival (mins)"', '"Punctuality Rating"', '"Shift Remarks"'
  ];

  const section2Rows = Array.from(empMap.values()).map(e => {
    const overtime = Math.max(0, (e.hours - 8.5)).toFixed(2);
    const punctuality = e.late > 0 ? `Late (+${e.late}m)` : e.checkIn !== '—' ? 'On Time' : 'Absent/Pending';
    return [
      `"${e.code}"`, `"${e.name}"`, `"${e.email}"`, `"${e.dept}"`, `"${e.designation}"`,
      `"${date}"`, `"${e.status}"`, `"${e.checkIn}"`, `"${e.checkOut}"`,
      e.hours, overtime, e.late, `"${punctuality}"`, `"${e.notes.replace(/"/g, '""')}"`
    ];
  });

  const csv = 'data:text/csv;charset=utf-8,' + [
    ...section1,
    section2Headers[0],
    section2Headers.slice(1).join(','),
    ...section2Rows.map(r => r.join(','))
  ].join('\n');

  const link = document.createElement('a');
  link.setAttribute('href', encodeURI(csv));
  link.setAttribute('download', `Dayflow_HR_Master_Executive_Report_${date}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * AdminMonitor — Company-wide attendance monitor for Admins and Managers.
 * Sub-components: FilterBar (filters + actions) · AttendanceTable (data rows)
 */
export function AdminMonitor({ currentUser, showToast }) {
  const isManager  = currentUser?.role === 'manager';
  const managerDept = currentUser?.employee?.department || 'Design';

  const [date,    setDate]   = useState(new Date().toISOString().slice(0,10));
  const [dept,    setDept]   = useState(isManager ? managerDept : 'all');
  const [status,  setStatus] = useState('all');
  const [search,  setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [data,    setData]   = useState({ records:[], summary:{} });

  const effectiveDept = isManager ? managerDept : dept;

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.getAllAttendance({ date, department: effectiveDept, status, search });
      setData(res);
    } catch (err) {
      showToast('Failed to load monitor', err.message, 'error');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [date, effectiveDept, status]);

  if (loading) return <MonitorSkeleton />;

  const { records = [], summary = {} } = data;
  const total   = summary.totalEmployees || 0;
  const inCount = summary.checkedInCount  || 0;
  const late    = summary.lateCount       || 0;
  const leave   = summary.leaveCount      || 0;
  const absent  = summary.absentCount     || 0;

  return (
    <div>
      {/* Summary stat strip */}
      <div className="stat-strip mb-8" style={{ gridTemplateColumns:'repeat(3, 1fr)' }}>
        <StatCard
          title="Present Today"
          value={inCount}
          icon={<CheckCircle2 size={18} />}
          variant="success"
          change={total > 0 ? `${Math.round((inCount/total)*100)}% attendance` : undefined}
          changeType="flat"
          subtitle={`of ${total} staff`}
        />
        <StatCard
          title="Absent Today"
          value={absent}
          icon={<UserX size={18} />}
          variant="danger"
          change={absent > 0 ? `${absent} unplanned` : 'None today'}
          changeType={absent > 0 ? 'down' : 'flat'}
          subtitle="Unplanned absences"
        />
        <StatCard
          title="On Leave Today"
          value={leave}
          icon={<Clock size={18} />}
          variant="info"
          subtitle="Approved time off"
          changeType="flat"
        />
      </div>

      <div className="panel mb-8">
        {/* Filters + actions */}
        <FilterBar
          date={date}         setDate={setDate}
          dept={dept}         setDept={setDept}
          status={status}     setStatus={setStatus}
          search={search}     setSearch={setSearch}
          isManager={isManager}
          managerDept={managerDept}
          onRefresh={load}
          onSearch={(e) => { e.preventDefault(); load(); }}
          onExport={() => {
            buildAndDownloadCsv({ records, date, effectiveDept, status, inCount, total, absent, leave, late });
            showToast('Export Complete', 'HR Master Executive & Individual Analysis exported to CSV.', 'success');
          }}
        />

        {/* Attendance data table */}
        <AttendanceTable records={records} date={date} />
      </div>
    </div>
  );
}

export default AdminMonitor;
