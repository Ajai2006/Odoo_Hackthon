import { getDb } from './db';
import { LeaveConflict, DepartmentCoverage, LeaveRequest } from '@/types';

/**
 * Checks for overlapping leaves within the same department for a given date range.
 */
export async function getDepartmentConflicts(
  employeeId: number,
  startDate: string,
  endDate: string,
  excludeLeaveId?: number
): Promise<{ conflicts: LeaveConflict[]; coverage: DepartmentCoverage }> {
  const db = await getDb();

  // 1. Get employee department
  const employee = db.prepare('SELECT id, name, department FROM employees WHERE id = ?').get(employeeId) as {
    id: number;
    name: string;
    department: string;
  } | undefined;

  if (!employee) {
    return {
      conflicts: [],
      coverage: {
        department: 'Unknown',
        total_members: 0,
        members_on_leave: 0,
        coverage_percentage: 100,
        conflicting_employees: [],
        warning_level: 'safe',
      },
    };
  }

  // 2. Query other employees in the same department who have approved or pending leaves in this date range
  let query = `
    SELECT 
      l.id as leave_id,
      l.employee_id,
      e.name as employee_name,
      e.department,
      l.leave_type,
      l.start_date,
      l.end_date,
      l.status
    FROM leave_requests l
    JOIN employees e ON l.employee_id = e.id
    WHERE e.department = ?
      AND l.employee_id != ?
      AND l.status IN ('pending', 'approved')
      AND NOT (l.end_date < ? OR l.start_date > ?)
  `;
  const params: any[] = [employee.department, employeeId, startDate, endDate];

  if (excludeLeaveId) {
    query += ` AND l.id != ?`;
    params.push(excludeLeaveId);
  }

  const rawConflicts = db.prepare(query).all(...params) as any[];

  // Calculate overlap days for each conflict
  const conflicts: LeaveConflict[] = rawConflicts.map((c) => {
    const overlapStart = new Date(Math.max(new Date(startDate).getTime(), new Date(c.start_date).getTime()));
    const overlapEnd = new Date(Math.min(new Date(endDate).getTime(), new Date(c.end_date).getTime()));
    const diffTime = Math.abs(overlapEnd.getTime() - overlapStart.getTime());
    const overlapDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return {
      leave_id: c.leave_id,
      employee_id: c.employee_id,
      employee_name: c.employee_name,
      department: c.department,
      leave_type: c.leave_type,
      start_date: c.start_date,
      end_date: c.end_date,
      status: c.status,
      overlap_days: Math.max(1, overlapDays),
    };
  });

  // 3. Calculate department total members and coverage drop
  const totalDeptMembersRow = db.prepare(
    'SELECT count(*) as count FROM employees WHERE department = ?'
  ).get(employee.department) as { count: number };
  const totalMembers = totalDeptMembersRow?.count || 1;

  // Unique employees on leave during this period (including this applicant)
  const uniqueConflictingEmployees = Array.from(new Set(conflicts.map((c) => c.employee_name)));
  const totalAbsent = uniqueConflictingEmployees.length + 1; // +1 for the applicant
  const activeStaff = Math.max(0, totalMembers - totalAbsent);
  const coveragePercentage = Math.round((activeStaff / totalMembers) * 100);

  let warningLevel: 'safe' | 'caution' | 'critical' = 'safe';
  if (coveragePercentage < 50 || uniqueConflictingEmployees.length >= 2) {
    warningLevel = 'critical';
  } else if (coveragePercentage < 75 || uniqueConflictingEmployees.length >= 1) {
    warningLevel = 'caution';
  }

  const coverage: DepartmentCoverage = {
    department: employee.department,
    total_members: totalMembers,
    members_on_leave: totalAbsent,
    coverage_percentage: coveragePercentage,
    conflicting_employees: uniqueConflictingEmployees,
    warning_level: warningLevel,
  };

  return { conflicts, coverage };
}

/**
 * Enriches a leave request with real-time conflict metadata.
 */
export async function enrichLeaveWithConflicts(leave: LeaveRequest): Promise<LeaveRequest> {
  const { conflicts } = await getDepartmentConflicts(
    leave.employee_id,
    leave.start_date,
    leave.end_date,
    leave.id
  );
  return {
    ...leave,
    conflicts,
  };
}
