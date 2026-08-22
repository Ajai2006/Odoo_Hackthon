import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddEmployeeModal } from '../components/AddEmployeeModal.tsx';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    addEmployee: vi.fn(),
  },
}));

describe('AddEmployeeModal', () => {
  const baseProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSuccess: vi.fn(),
    showToast: vi.fn(),
  };

  it('does not render when isOpen is false', () => {
    render(<AddEmployeeModal {...baseProps} isOpen={false} />);
    expect(screen.queryByText(/Add New Employee/i)).toBeNull();
  });

  it('renders all form fields when isOpen is true', () => {
    render(<AddEmployeeModal {...baseProps} />);
    expect(screen.getByText(/Add New Employee/i)).toBeTruthy();
    expect(screen.getByLabelText(/Full Name/i)).toBeTruthy();
    expect(screen.getByLabelText(/Work Email/i)).toBeTruthy();
    expect(screen.getByLabelText(/Position \/ Job Title/i)).toBeTruthy();
    expect(screen.getByLabelText(/Department/i)).toBeTruthy();
    expect(screen.getByLabelText(/System Role/i)).toBeTruthy();
    expect(screen.getByLabelText(/Initial Password/i)).toBeTruthy();
  });

  it('submits form with entered employee details and position', async () => {
    vi.mocked(api.addEmployee).mockResolvedValueOnce({
      success: true,
      message: 'Employee account created',
    });

    render(<AddEmployeeModal {...baseProps} />);

    await userEvent.type(screen.getByLabelText(/Full Name/i), 'Elena Rostova');
    await userEvent.type(screen.getByLabelText(/Work Email/i), 'elena.rostova@dayflow.io');
    await userEvent.type(screen.getByLabelText(/Position \/ Job Title/i), 'Lead Product Designer');

    await userEvent.click(screen.getByRole('button', { name: /Create Employee User/i }));

    expect(api.addEmployee).toHaveBeenCalledWith({
      name: 'Elena Rostova',
      email: 'elena.rostova@dayflow.io',
      position: 'Lead Product Designer',
      department: 'Engineering',
      role: 'employee',
      password: 'Password123!',
    });

    expect(baseProps.showToast).toHaveBeenCalledWith(
      'Employee Created',
      'Employee account created',
      'success'
    );
    expect(baseProps.onSuccess).toHaveBeenCalled();
    expect(baseProps.onClose).toHaveBeenCalled();
  });
});
