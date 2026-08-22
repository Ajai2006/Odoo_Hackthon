import React, { useState } from 'react';
import { Search, Bell, ChevronDown, Check, Menu, Shield, User } from 'lucide-react';
import { Employee } from '../types';

interface TopBarProps {
  employees: Employee[];
  currentPersona: Employee | null;
  isAdminMode: boolean;
  onSelectPersona: (emp: Employee, isAdmin: boolean) => void;
  pendingCount: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  employees,
  currentPersona,
  isAdminMode,
  onSelectPersona,
  pendingCount,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <header className="top-bar">
      <div className="top-bar-left">
        <button className="hamburger-btn" aria-label="Open menu">
          <Menu size={20} />
        </button>

        <div className="search-input-wrapper">
          <Search size={14} className="search-icon-pos" />
          <input
            type="text"
            placeholder="Search leaves, employees, dates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="top-bar-right">
        {/* Notification Bell with unread dot */}
        <button className="icon-btn" aria-label="Notifications" title={`${pendingCount} pending requests`}>
          <Bell size={16} />
          {pendingCount > 0 && <span className="notification-dot" />}
        </button>

        {/* Persona Dropdown */}
        <div className="persona-dropdown-container">
          <button
            className="persona-profile-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-expanded={dropdownOpen}
          >
            <img
              src={currentPersona?.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
              alt={currentPersona?.name || 'User'}
              className="user-avatar"
            />
            <div className="user-meta">
              <span className="user-name">{currentPersona?.name || 'Select Persona'}</span>
              <span className="user-role-badge">
                {isAdminMode ? 'HR Admin (Manager)' : currentPersona?.department}
              </span>
            </div>
            <ChevronDown size={14} color="var(--text-secondary)" />
          </button>

          {dropdownOpen && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 45 }}
                onClick={() => setDropdownOpen(false)}
              />
              <div className="persona-menu">
                <div className="persona-menu-header">Switch Simulated Role</div>

                {/* Admin Persona */}
                <div
                  className={`persona-item ${isAdminMode ? 'selected' : ''}`}
                  onClick={() => {
                    const admin = employees.find((e) => e.department.includes('Human Resources')) || employees[employees.length - 1];
                    if (admin) onSelectPersona(admin, true);
                    setDropdownOpen(false);
                  }}
                >
                  <div className="brand-icon-box" style={{ width: '28px', height: '28px', backgroundColor: 'var(--primary-700)' }}>
                    <Shield size={14} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="flex-align-center gap-2">
                      <span className="user-name">Marcus Vance</span>
                      {pendingCount > 0 && (
                        <span className="nav-badge">{pendingCount} pending</span>
                      )}
                    </div>
                    <span className="text-caption" style={{ fontSize: '11px' }}>HR Director (Admin Queue)</span>
                  </div>
                  {isAdminMode && <Check size={14} color="var(--primary-700)" />}
                </div>

                <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '4px 0' }} />
                <div className="persona-menu-header">Employee Self-Service</div>

                {/* Employee Personas */}
                {employees
                  .filter((e) => !e.department.includes('Human Resources'))
                  .map((emp) => {
                    const isSelected = !isAdminMode && currentPersona?.id === emp.id;
                    return (
                      <div
                        key={emp.id}
                        className={`persona-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          onSelectPersona(emp, false);
                          setDropdownOpen(false);
                        }}
                      >
                        <img src={emp.avatar_url} alt={emp.name} className="user-avatar" style={{ width: '26px', height: '26px' }} />
                        <div style={{ flex: 1 }}>
                          <span className="user-name" style={{ fontSize: '12px' }}>{emp.name}</span>
                          <span className="text-caption" style={{ display: 'block', fontSize: '11px' }}>{emp.role} • {emp.department}</span>
                        </div>
                        {isSelected && <Check size={14} color="var(--primary-700)" />}
                      </div>
                    );
                  })}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
