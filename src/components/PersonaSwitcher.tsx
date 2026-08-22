import React from 'react';
import { Employee } from '@/types';
import { User, Shield, ChevronDown, Check } from 'lucide-react';

interface PersonaSwitcherProps {
  employees: Employee[];
  currentPersona: Employee | null;
  isAdminMode: boolean;
  onSelectPersona: (emp: Employee, isAdmin: boolean) => void;
  pendingCount: number;
}

export const PersonaSwitcher: React.FC<PersonaSwitcherProps> = ({
  employees,
  currentPersona,
  isAdminMode,
  onSelectPersona,
  pendingCount,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="persona-switcher-container">
      <div className="persona-trigger-badge" onClick={() => setIsOpen(!isOpen)}>
        <div className="persona-avatar-wrapper">
          <img
            src={currentPersona?.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
            alt={currentPersona?.name || 'User'}
            className="persona-avatar-img"
          />
          {isAdminMode ? (
            <span className="admin-badge-indicator" title="Admin Mode">
              <Shield size={10} />
            </span>
          ) : (
            <span className="employee-badge-indicator" title="Employee Mode">
              <User size={10} />
            </span>
          )}
        </div>

        <div className="persona-info-snippet">
          <span className="persona-name">{currentPersona?.name || 'Select Persona'}</span>
          <span className="persona-role">
            {isAdminMode ? '👑 HR Admin (Manager Review)' : `👤 ${currentPersona?.role}`}
          </span>
        </div>

        <ChevronDown size={14} className={`dropdown-arrow ${isOpen ? 'rotated' : ''}`} />
      </div>

      {isOpen && (
        <>
          <div className="dropdown-overlay" onClick={() => setIsOpen(false)} />
          <div className="persona-dropdown-menu">
            <div className="dropdown-section-title">
              <span>Switch Simulated Persona</span>
              <span className="hackathon-tag">Hackathon Demo</span>
            </div>

            {/* Admin Option */}
            <div
              className={`persona-option admin-option ${isAdminMode ? 'active' : ''}`}
              onClick={() => {
                const adminUser = employees.find((e) => e.department.includes('Human Resources')) || employees[employees.length - 1];
                if (adminUser) onSelectPersona(adminUser, true);
                setIsOpen(false);
              }}
            >
              <div className="persona-option-left">
                <div className="admin-avatar-box">
                  <Shield size={18} />
                </div>
                <div>
                  <div className="flex-align-center gap-2">
                    <span className="font-semibold">Marcus Vance (HR Admin)</span>
                    {pendingCount > 0 && (
                      <span className="pending-pill-badge">{pendingCount} pending</span>
                    )}
                  </div>
                  <span className="text-caption text-muted">Admin Mode • Review & Approve Queue</span>
                </div>
              </div>
              {isAdminMode && <Check size={16} className="text-primary" />}
            </div>

            <div className="dropdown-divider" />
            <div className="dropdown-section-sub">Employee Personas</div>

            {/* Employee Options */}
            {employees
              .filter((e) => !e.department.includes('Human Resources'))
              .map((emp) => {
                const isSelected = !isAdminMode && currentPersona?.id === emp.id;
                return (
                  <div
                    key={emp.id}
                    className={`persona-option ${isSelected ? 'active' : ''}`}
                    onClick={() => {
                      onSelectPersona(emp, false);
                      setIsOpen(false);
                    }}
                  >
                    <div className="persona-option-left">
                      <img
                        src={emp.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
                        alt={emp.name}
                        className="option-avatar"
                      />
                      <div>
                        <div className="font-semibold text-sm">{emp.name}</div>
                        <div className="text-caption text-muted">{emp.role} • {emp.department}</div>
                      </div>
                    </div>
                    {isSelected && <Check size={16} className="text-primary" />}
                  </div>
                );
              })}
          </div>
        </>
      )}
    </div>
  );
};

export default PersonaSwitcher;
