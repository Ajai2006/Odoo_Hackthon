import { getDb } from './db';
import { AttendanceStatus, LeaveRequest, AttendanceRecord } from '@/types';

/**
 * Updates or inserts an attendance record for a specific employee and date.
 * Following Member 2 module contract.
 */
export function updateAttendanceStatus(
  employeeId: number,
  date: string,
  status: AttendanceStatus = 'Leave',
  leaveRequestId: number | null = null,
  notes: string | null = null
): AttendanceRecord {
  const db = getDb();
  
  const defaultNotes = notes || (status === 'Leave' && leaveRequestId ? `Approved Leave (Ref #${leaveRequestId})` : `Updated to ${status}`);

  const stmt = db.prepare(`
    INSERT INTO attendance (employee_id, date, status, leave_request_id, notes, updated_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(employee_id, date) DO UPDATE SET
      status = excluded.status,
      leave_request_id = excluded.leave_request_id,
      notes = excluded.notes,
      updated_at = datetime('now')
  `);

  stmt.run(employeeId, date, status, leaveRequestId, defaultNotes);

  const updated = db.prepare(`
    SELECT a.*, e.name as employee_name, e.department
    FROM attendance a
    JOIN employees e ON a.employee_id = e.id
    WHERE a.employee_id = ? AND a.date = ?
  `).get(employeeId, date) as AttendanceRecord;

  return updated;
}

/**
 * Synchronizes an approved leave request across all calendar dates in [start_date, end_date].
 * Ensures attendance calendar reflects "Leave" immediately.
 */
export function syncLeaveToAttendance(leave: {
  id: number;
  employee_id: number;
  start_date: string;
  end_date: string;
  leave_type: string;
}): AttendanceRecord[] {
  const dates = getDatesBetween(leave.start_date, leave.end_date);
  const results: AttendanceRecord[] = [];

  for (const date of dates) {
    const dayOfWeek = new Date(date + 'T00:00:00Z').getUTCDay();
    // Exclude weekends if desired, or mark all days of leave
    // Typically business leave is on working days, but we log full leave span
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const record = updateAttendanceStatus(
        leave.employee_id,
        date,
        'Leave',
        leave.id,
        `Approved ${leave.leave_type.toUpperCase()} Leave (#${leave.id})`
      );
      results.push(record);
    }
  }

  return results;
}

/**
 * Reverts attendance records if an approved leave is ever revoked.
 */
export function clearLeaveFromAttendance(leaveId: number) {
  const db = getDb();
  db.prepare(`
    DELETE FROM attendance WHERE leave_request_id = ?
  `).run(leaveId);
}

/**
 * Retrieves attendance records for a specific employee or all employees in a date range.
 */
export function getAttendanceRecords(filters: {
  employee_id?: number;
  start_date?: string;
  end_date?: string;
  department?: string;
}): AttendanceRecord[] {
  const db = getDb();
  let query = `
    SELECT a.*, e.name as employee_name, e.department
    FROM attendance a
    JOIN employees e ON a.employee_id = e.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (filters.employee_id) {
    query += ` AND a.employee_id = ?`;
    params.push(filters.employee_id);
  }
  if (filters.start_date) {
    query += ` AND a.date >= ?`;
    params.push(filters.start_date);
  }
  if (filters.end_date) {
    query += ` AND a.date <= ?`;
    params.push(filters.end_date);
  }
  if (filters.department) {
    query += ` AND e.department = ?`;
    params.push(filters.department);
  }

  query += ` ORDER BY a.date ASC, e.name ASC`;
  return db.prepare(query).all(...params) as AttendanceRecord[];
}

/**
 * Helper to generate all ISO date strings between start and end date inclusive.
 */
export function getDatesBetween(startDateStr: string, endDateStr: string): string[] {
  const dates: string[] = [];
  const curr = new Date(startDateStr + 'T00:00:00Z');
  const end = new Date(endDateStr + 'T00:00:00Z');

  while (curr <= end) {
    dates.push(curr.toISOString().split('T')[0]);
    curr.setUTCDate(curr.getUTCDate() + 1);
  }
  return dates;
}
