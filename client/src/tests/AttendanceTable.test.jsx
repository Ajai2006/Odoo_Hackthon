import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AttendanceTable } from '../components/AttendanceTable';

const mockRecords = [
  {
    employee_id: 1,
    employee_name: 'Alex Chen',
    employee_code: 'DF-1001',
    designation: 'Senior Engineer',
    department: 'Engineering',
    status: 'present',
    check_in: '2026-08-22 09:05:00',
    check_out: '2026-08-22 17:30:00',
    work_hours: 8.25,
    late_minutes: 0,
    date: '2026-08-22',
    employee_avatar: null,
  },
  {
    employee_id: 2,
    employee_name: 'Priya Patel',
    employee_code: 'DF-1002',
    designation: 'Frontend Engineer',
    department: 'Engineering',
    status: 'incomplete',
    check_in: '2026-08-22 09:45:00',
    check_out: null,
    work_hours: 0,
    late_minutes: 15,
    date: '2026-08-22',
    employee_avatar: null,
  },
];

describe('AttendanceTable', () => {
  it('shows empty state when records array is empty', () => {
    render(<AttendanceTable records={[]} date="2026-08-22" />);
    expect(screen.getByText(/no records match your filters/i)).toBeTruthy();
  });

  it('renders a row for each employee record', () => {
    render(<AttendanceTable records={mockRecords} date="2026-08-22" />);
    expect(screen.getByText('Alex Chen')).toBeTruthy();
    expect(screen.getByText('Priya Patel')).toBeTruthy();
  });

  it('renders employee code and designation as meta info', () => {
    render(<AttendanceTable records={mockRecords} date="2026-08-22" />);
    expect(screen.getByText(/df-1001/i)).toBeTruthy();
    expect(screen.getByText(/senior engineer/i)).toBeTruthy();
  });

  it('shows "On time" badge for punctual employee', () => {
    render(<AttendanceTable records={[mockRecords[0]]} date="2026-08-22" />);
    expect(screen.getByText(/on time/i)).toBeTruthy();
  });

  it('shows late badge with minutes for late employee', () => {
    render(<AttendanceTable records={[mockRecords[1]]} date="2026-08-22" />);
    expect(screen.getByText(/15m late/i)).toBeTruthy();
  });

  it('applies row-incomplete class for incomplete status', () => {
    const { container } = render(<AttendanceTable records={[mockRecords[1]]} date="2026-08-22" />);
    expect(container.querySelector('.row-incomplete')).toBeTruthy();
  });

  it('shows initials placeholder when no avatar URL provided', () => {
    render(<AttendanceTable records={[mockRecords[0]]} date="2026-08-22" />);
    // 'Alex Chen' → initials 'AC'
    expect(screen.getByText('AC')).toBeTruthy();
  });
});
