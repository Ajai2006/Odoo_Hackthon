import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterBar } from '../components/FilterBar';

describe('FilterBar', () => {
  const baseProps = {
    date: '2026-08-22',
    setDate: vi.fn(),
    dept: 'all',
    setDept: vi.fn(),
    status: 'all',
    setStatus: vi.fn(),
    search: '',
    setSearch: vi.fn(),
    isManager: false,
    managerDept: 'Engineering',
    onRefresh: vi.fn(),
    onSearch: vi.fn((e) => e.preventDefault()),
    onExport: vi.fn(),
  };

  it('renders date, department, status, search controls', () => {
    render(<FilterBar {...baseProps} />);
    expect(screen.getByLabelText('Filter by date')).toBeTruthy();
    expect(screen.getByLabelText('Search employees')).toBeTruthy();
    expect(screen.getByRole('button', { name: /refresh/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /export hr master csv/i })).toBeTruthy();
  });

  it('calls setDate when date input changes', async () => {
    const setDate = vi.fn();
    render(<FilterBar {...baseProps} setDate={setDate} />);
    const dateInput = screen.getByLabelText('Filter by date');
    await userEvent.clear(dateInput);
    await userEvent.type(dateInput, '2026-09-01');
    expect(setDate).toHaveBeenCalled();
  });

  it('shows locked department badge for manager role', () => {
    render(<FilterBar {...baseProps} isManager={true} managerDept="Design" />);
    expect(screen.getByText(/design \(team view\)/i)).toBeTruthy();
    // No department select dropdown shown
    expect(screen.queryByRole('combobox', { name: /department/i })).toBeNull();
  });

  it('shows department select for admin role', () => {
    render(<FilterBar {...baseProps} isManager={false} />);
    const selects = screen.getAllByRole('combobox');
    // dept + status selects both present
    expect(selects.length).toBeGreaterThanOrEqual(2);
  });

  it('calls onRefresh when Refresh button is clicked', async () => {
    const onRefresh = vi.fn();
    render(<FilterBar {...baseProps} onRefresh={onRefresh} />);
    await userEvent.click(screen.getByRole('button', { name: /refresh/i }));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('calls onExport when Export button is clicked', async () => {
    const onExport = vi.fn();
    render(<FilterBar {...baseProps} onExport={onExport} />);
    await userEvent.click(screen.getByRole('button', { name: /export hr master csv/i }));
    expect(onExport).toHaveBeenCalledTimes(1);
  });
});
