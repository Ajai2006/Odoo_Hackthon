import { LeaveRequest, SLAInfo, SLAUrgency } from '@/types';

// Default SLA threshold: 3 days (72 hours) for critical urgency escalation
const SLA_WARNING_HOURS = 24; // 1 day
const SLA_URGENT_HOURS = 72; // 3 days

/**
 * Calculates SLA aging statistics for a leave request based on created_at timestamp.
 */
export function calculateSLA(createdAtStr: string, status: string): SLAInfo {
  if (status !== 'pending') {
    return {
      pending_days: 0,
      pending_hours: 0,
      urgency: 'normal',
      label: status === 'approved' ? 'Resolved (Approved)' : 'Resolved (Rejected)',
      is_breached: false,
    };
  }

  // Handle SQLite standard format "YYYY-MM-DD HH:MM:SS" or ISO
  const createdDate = new Date(createdAtStr.includes('T') ? createdAtStr : createdAtStr.replace(' ', 'T') + 'Z');
  const now = new Date();

  const diffMs = Math.max(0, now.getTime() - createdDate.getTime());
  const pendingHours = Math.floor(diffMs / (1000 * 60 * 60));
  const pendingDays = Math.floor(pendingHours / 24);

  let urgency: SLAUrgency = 'normal';
  let is_breached = false;

  if (pendingHours >= SLA_URGENT_HOURS) {
    urgency = 'urgent';
    is_breached = true;
  } else if (pendingHours >= SLA_WARNING_HOURS) {
    urgency = 'warning';
  }

  let label: string;
  if (pendingDays === 0) {
    label = pendingHours <= 1 ? 'Pending < 1 hr' : `Pending ${pendingHours} hrs`;
  } else if (pendingDays === 1) {
    label = 'Pending 1 day';
  } else {
    label = `Pending ${pendingDays} days`;
  }

  return {
    pending_days: pendingDays,
    pending_hours: pendingHours,
    urgency,
    label,
    is_breached,
  };
}

/**
 * Enriches leave request with SLA metadata.
 */
export function enrichLeaveWithSLA(leave: LeaveRequest): LeaveRequest {
  const sla = calculateSLA(leave.created_at, leave.status);
  return {
    ...leave,
    sla,
  };
}
