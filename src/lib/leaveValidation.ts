import { ApplyLeavePayload, LeaveType } from '@/types';
import { getDb } from './db';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  totalDays?: number;
}

const VALID_LEAVE_TYPES: LeaveType[] = ['paid', 'sick', 'unpaid'];

/**
 * Calculates working days (excluding Saturdays and Sundays) between two ISO dates.
 */
export function calculateWorkingDays(startDateStr: string, endDateStr: string): number {
  const start = new Date(startDateStr + 'T00:00:00Z');
  const end = new Date(endDateStr + 'T00:00:00Z');

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
    return 0;
  }

  let count = 0;
  const curr = new Date(start);

  while (curr <= end) {
    const day = curr.getUTCDay();
    if (day !== 0 && day !== 6) {
      count++;
    }
    curr.setUTCDate(curr.getUTCDate() + 1);
  }

  return count === 0 ? 1 : count;
}

/**
 * Validates leave application payload server-side.
 */
export async function validateLeaveApplication(payload: Partial<ApplyLeavePayload>): Promise<ValidationResult> {
  const errors: Record<string, string> = {};

  // 1. Employee ID validation
  if (!payload.employee_id || typeof payload.employee_id !== 'number' || payload.employee_id <= 0) {
    errors.employee_id = 'Valid employee ID is required.';
  } else {
    const db = await getDb();
    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(payload.employee_id);
    if (!employee) {
      errors.employee_id = 'Employee not found in database.';
    }
  }

  // 2. Leave Type validation
  if (!payload.leave_type || !VALID_LEAVE_TYPES.includes(payload.leave_type)) {
    errors.leave_type = `Leave type must be one of: ${VALID_LEAVE_TYPES.join(', ')}.`;
  }

  // 3. Start Date validation (ISO format & not in the past)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!payload.start_date || !dateRegex.test(payload.start_date)) {
    errors.start_date = 'Start date must be in YYYY-MM-DD format.';
  }

  if (!payload.end_date || !dateRegex.test(payload.end_date)) {
    errors.end_date = 'End date must be in YYYY-MM-DD format.';
  }

  let totalDays = 0;

  if (payload.start_date && payload.end_date && dateRegex.test(payload.start_date) && dateRegex.test(payload.end_date)) {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Check start_date not in past
    if (payload.start_date < todayStr) {
      errors.start_date = `Start date cannot be in the past (must be on or after ${todayStr}).`;
    }

    // Check end_date >= start_date
    if (payload.end_date < payload.start_date) {
      errors.end_date = 'End date cannot be earlier than start date.';
    }

    totalDays = calculateWorkingDays(payload.start_date, payload.end_date);
    if (totalDays <= 0) {
      errors.date_range = 'Invalid date range selected.';
    }
  }

  // 4. Reason validation (min 10 chars)
  if (!payload.reason || typeof payload.reason !== 'string' || payload.reason.trim().length < 10) {
    errors.reason = 'Reason is required and must be at least 10 characters long.';
  }

  // 5. Check if employee already has a pending or approved leave overlapping with this range
  if (payload.employee_id && payload.start_date && payload.end_date && Object.keys(errors).length === 0) {
    const db = await getDb();
    const overlap = db.prepare(`
      SELECT id, status, start_date, end_date FROM leave_requests
      WHERE employee_id = ?
        AND status IN ('pending', 'approved')
        AND NOT (end_date < ? OR start_date > ?)
      LIMIT 1
    `).get(payload.employee_id, payload.start_date, payload.end_date) as any;

    if (overlap) {
      errors.conflict = `You already have a ${overlap.status} leave request (#${overlap.id}) from ${overlap.start_date} to ${overlap.end_date}.`;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    totalDays,
  };
}
