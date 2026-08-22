import React, { useState } from 'react';
import { UserPlus, X, Lock, Mail, Briefcase, Building, Shield } from 'lucide-react';
import { api } from '../services/api';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  showToast: (title: string, message?: string, type?: string) => void;
}

const DEPARTMENTS = [
  'Engineering',
  'Design',
  'HR & People',
  'Sales',
  'Finance',
  'Marketing',
  'Operations'
];

export function AddEmployeeModal({ isOpen, onClose, onSuccess, showToast }: AddEmployeeModalProps) {
  const [name, setName]               = useState('');
  const [email, setEmail]             = useState('');
  const [position, setPosition]       = useState('');
  const [department, setDepartment]   = useState('Engineering');
  const [role, setRole]               = useState('employee');
  const [password, setPassword]       = useState('Password123!');
  const [submitting, setSubmitting]   = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !position.trim() || !password.trim()) {
      showToast('Validation Error', 'Full Name, Work Email, Position, and Password are required.', 'error');
      return;
    }

    setSubmitting(true);

    try {
      const res = await api.addEmployee({
        name: name.trim(),
        email: email.trim(),
        position: position.trim(),
        department,
        role,
        password: password.trim()
      });

      showToast(
        'Employee Created',
        res.message || `Successfully created account for ${name} (${position})`,
        'success'
      );

      // Reset form
      setName('');
      setEmail('');
      setPosition('');
      setDepartment('Engineering');
      setRole('employee');
      setPassword('Password123!');

      onSuccess();
      onClose();
    } catch (err: any) {
      showToast('Failed to Add Employee', err.message || 'Server error occurred', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} aria-label="Add Employee Modal Overlay">
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 520, width: '90%', borderRadius: 'var(--r-card, 12px)' }}
      >
        <div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '6px', borderRadius: '8px', display: 'flex' }}>
              <UserPlus size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Add New Employee</h3>
          </div>
          <button
            className="modal-close-btn"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="add-emp-name" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '13px', fontWeight: 600 }}>
              Full Name *
            </label>
            <input
              id="add-emp-name"
              type="text"
              className="form-control"
              placeholder="e.g. Elena Rostova"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          {/* Work Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="add-emp-email" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '13px', fontWeight: 600 }}>
              <Mail size={14} /> Work Email *
            </label>
            <input
              id="add-emp-email"
              type="email"
              className="form-control"
              placeholder="e.g. elena.rostova@dayflow.io"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Position / Designation */}
          <div className="form-group">
            <label className="form-label" htmlFor="add-emp-position" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '13px', fontWeight: 600 }}>
              <Briefcase size={14} /> Position / Job Title *
            </label>
            <input
              id="add-emp-position"
              type="text"
              className="form-control"
              placeholder="e.g. Senior Software Engineer"
              value={position}
              onChange={e => setPosition(e.target.value)}
              required
            />
          </div>

          {/* Department & Role row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {/* Department */}
            <div className="form-group">
              <label className="form-label" htmlFor="add-emp-dept" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '13px', fontWeight: 600 }}>
                <Building size={14} /> Department *
              </label>
              <select
                id="add-emp-dept"
                className="form-control"
                value={department}
                onChange={e => setDepartment(e.target.value)}
              >
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Role */}
            <div className="form-group">
              <label className="form-label" htmlFor="add-emp-role" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '13px', fontWeight: 600 }}>
                <Shield size={14} /> System Role *
              </label>
              <select
                id="add-emp-role"
                className="form-control"
                value={role}
                onChange={e => setRole(e.target.value)}
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="add-emp-password" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '13px', fontWeight: 600 }}>
              <Lock size={14} /> Initial Password *
            </label>
            <input
              id="add-emp-password"
              type="text"
              className="form-control"
              placeholder="Password123!"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', marginTop: '4px', display: 'block' }}>
              Employee can log in using this email and initial password.
            </span>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <UserPlus size={16} />
              {submitting ? 'Creating Account…' : 'Create Employee User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddEmployeeModal;
