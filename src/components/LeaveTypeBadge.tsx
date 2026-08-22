import React from 'react';
import { LeaveType } from '../types';
import { CalendarHeart, Stethoscope, CalendarMinus } from 'lucide-react';

interface LeaveTypeBadgeProps {
  type: LeaveType;
  showLabel?: boolean;
}

/**
 * Standard Leave Type Badge for Dayflow HRMS
 * Uses distinct icons & colors from status badges:
 *  - Paid: CalendarHeart (Indigo/Navy tint)
 *  - Sick: Stethoscope (Cyan/Teal tint)
 *  - Unpaid: CalendarMinus (Slate tint)
 */
export const LeaveTypeBadge: React.FC<LeaveTypeBadgeProps> = ({ type, showLabel = true }) => {
  switch (type) {
    case 'paid':
      return (
        <span className="leave-type-pill type-pill-paid">
          <CalendarHeart size={13} aria-hidden="true" />
          {showLabel && <span>Paid Leave</span>}
        </span>
      );
    case 'sick':
      return (
        <span className="leave-type-pill type-pill-sick">
          <Stethoscope size={13} aria-hidden="true" />
          {showLabel && <span>Sick Leave</span>}
        </span>
      );
    case 'unpaid':
      return (
        <span className="leave-type-pill type-pill-unpaid">
          <CalendarMinus size={13} aria-hidden="true" />
          {showLabel && <span>Unpaid Leave</span>}
        </span>
      );
    default:
      return (
        <span className="leave-type-pill type-pill-unpaid">
          <span>{type}</span>
        </span>
      );
  }
};

export default LeaveTypeBadge;
