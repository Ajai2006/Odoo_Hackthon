import React from 'react';
import { Users, AlertCircle } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

/** Shape of a single attendance record returned by the API */
export interface AttendanceRecord {
  employee_id: number;
  employee_name: string;
  employee_code: string;
  designation: string;
  department: string;
  status: string;
  check_in: string | null;
  check_out: string | null;
  work_hours: number;
  late_minutes: number;
  date?: string;
  employee_avatar?: string | null;
}

interface AttendanceTableProps {
  records: AttendanceRecord[];
  date: string;
}

/* Empty state */
function EmptyMonitor() {
  return (
    <div className="empty-state">
      <div className="empty-state-icon"><Users size={24} /></div>
      <h3>No records match your filters</h3>
      <p>Try changing the date, department or status filter to broaden your search.</p>
    </div>
  );
}

const fmtTime = (ts: string | null): string =>
  ts ? ts.split(' ')[1]?.slice(0, 5) ?? '—' : '—';

/**
 * AttendanceTable — Renders the all-employee attendance data table.
 * Extracted from AdminMonitor for single-responsibility maintainability.
 */
export function AttendanceTable({ records, date }: AttendanceTableProps) {
  if (records.length === 0) return <EmptyMonitor />;

  return (
    <div className="table-wrapper">
      <table className="data-table" aria-label="All-employee attendance monitor">
        <thead>
          <tr>
            <th scope="col"><div className="th-inner">Employee</div></th>
            <th scope="col"><div className="th-inner">Department</div></th>
            <th scope="col"><div className="th-inner">Date</div></th>
            <th scope="col"><div className="th-inner">Status</div></th>
            <th scope="col"><div className="th-inner">Clock In</div></th>
            <th scope="col"><div className="th-inner">Clock Out</div></th>
            <th scope="col"><div className="th-inner">Hours</div></th>
            <th scope="col"><div className="th-inner">Punctuality</div></th>
          </tr>
        </thead>
        <tbody>
          {records.map((emp) => {
            const isIncomplete = emp.status === 'incomplete';
            const initials = emp.employee_name?.split(' ').map(n => n[0]).join('').slice(0, 2) ?? '?';

            return (
              <tr
                key={emp.employee_id}
                className={isIncomplete ? 'row-incomplete' : ''}
                aria-label={`${emp.employee_name}: ${emp.status || 'not marked'}`}
              >
                <td>
                  <div className="emp-cell">
                    {emp.employee_avatar
                      ? <img src={emp.employee_avatar} alt="" className="emp-avatar" aria-hidden="true" />
                      : <div className="emp-avatar-placeholder" aria-hidden="true">{initials}</div>
                    }
                    <div>
                      <div className="emp-name">{emp.employee_name}</div>
                      <div className="emp-meta">{emp.employee_code} · {emp.designation}</div>
                    </div>
                  </div>
                </td>

                <td>
                  <span style={{ fontSize:13, color:'var(--text-secondary)', fontWeight:500 }}>
                    {emp.department}
                  </span>
                </td>

                <td className="td-num">{emp.date ?? date}</td>

                <td><StatusBadge status={emp.status || 'not_marked'} /></td>

                <td className="td-num">{fmtTime(emp.check_in)}</td>
                <td className="td-num">{fmtTime(emp.check_out)}</td>
                <td className="td-num">
                  {emp.work_hours > 0 ? `${emp.work_hours} hrs` : '—'}
                </td>

                <td>
                  {emp.late_minutes > 0
                    ? <span className="late-badge"><AlertCircle size={12} />{+emp.late_minutes}m late</span>
                    : emp.check_in
                      ? <span className="ontime-badge">✓ On time</span>
                      : <span className="td-muted">—</span>
                  }
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default AttendanceTable;
