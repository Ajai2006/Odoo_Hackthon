export type LeaveType = 'paid' | 'sick' | 'unpaid';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';
export type AttendanceStatus = 'Present' | 'Absent' | 'Leave' | 'Half-day' | 'Holiday';
export type SLAUrgency = 'normal' | 'warning' | 'urgent';

export interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  avatar_url: string;
  paid_balance: number;
  sick_balance: number;
  unpaid_balance: number;
  created_at: string;
}

export interface LeaveRequest {
  id: number;
  employee_id: number;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  status: LeaveStatus;
  admin_comment: string | null;
  reviewed_by: number | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  employee_name?: string;
  employee_email?: string;
  department?: string;
  employee_avatar?: string;
  reviewer_name?: string;
  sla?: SLAInfo;
  conflicts?: LeaveConflict[];
}

export interface AttendanceRecord {
  id: number;
  employee_id: number;
  date: string;
  status: AttendanceStatus;
  leave_request_id: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  employee_name?: string;
  department?: string;
}

export interface SLAInfo {
  pending_days: number;
  pending_hours: number;
  urgency: SLAUrgency; // normal (<24h), warning (1-3d), urgent (>3d)
  label: string; // e.g. "Pending 2 days"
  is_breached: boolean;
}

export interface LeaveConflict {
  leave_id: number;
  employee_id: number;
  employee_name: string;
  department: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  status: LeaveStatus;
  overlap_days: number;
}

export interface DepartmentCoverage {
  department: string;
  total_members: number;
  members_on_leave: number;
  coverage_percentage: number;
  conflicting_employees: string[];
  warning_level: 'safe' | 'caution' | 'critical'; // <50% is critical
}

export interface ApplyLeavePayload {
  employee_id: number;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  reason: string;
}

export interface ReviewLeavePayload {
  status: 'approved' | 'rejected';
  admin_comment?: string;
  reviewer_id?: number;
}

export interface LeaveBalances {
  paid: { total: number; used: number; remaining: number };
  sick: { total: number; used: number; remaining: number };
  unpaid: { total: number; used: number; remaining: number };
}
