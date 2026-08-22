import React, { useState } from 'react';
import {
  Clock, Shield, Users, UserCheck, ArrowRight, Sparkles,
  Building2, Briefcase, CheckCircle2, Lock, KeyRound
} from 'lucide-react';

export function LoginPortal({ usersList, onSelectUser }) {
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all');

  const adminUsers = usersList.filter(u => u.role === 'admin');
  const managerUsers = usersList.filter(u => u.role === 'manager');
  const employeeUsers = usersList.filter(u => u.role === 'employee');

  const filteredUsers = selectedRoleFilter === 'admin' 
    ? adminUsers 
    : selectedRoleFilter === 'manager' 
      ? managerUsers 
      : selectedRoleFilter === 'employee' 
        ? employeeUsers 
        : usersList;

  return (
    <div className="login-portal-container">
      {/* Background ambient accents */}
      <div className="login-ambient-blur blur-1" />
      <div className="login-ambient-blur blur-2" />

      <div className="login-card-wrapper">
        {/* Brand Header */}
        <div className="login-brand-header">
          <div className="login-logo-badge">
            <Clock size={28} />
          </div>
          <h1>Dayflow HRMS</h1>
          <p className="login-subtitle">Enterprise Attendance & Workforce Management Platform</p>
        </div>

        {/* Role Portal Selection Tabs */}
        <div className="login-role-tabs">
          <button
            className={`login-role-tab ${selectedRoleFilter === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedRoleFilter('all')}
          >
            All Accounts ({usersList.length})
          </button>
          <button
            className={`login-role-tab ${selectedRoleFilter === 'admin' ? 'active' : ''}`}
            onClick={() => setSelectedRoleFilter('admin')}
          >
            <Shield size={14} /> Admins ({adminUsers.length})
          </button>
          <button
            className={`login-role-tab ${selectedRoleFilter === 'manager' ? 'active' : ''}`}
            onClick={() => setSelectedRoleFilter('manager')}
          >
            <Users size={14} /> Managers ({managerUsers.length})
          </button>
          <button
            className={`login-role-tab ${selectedRoleFilter === 'employee' ? 'active' : ''}`}
            onClick={() => setSelectedRoleFilter('employee')}
          >
            <UserCheck size={14} /> Employees ({employeeUsers.length})
          </button>
        </div>

        {/* Role Scope Info Banner */}
        <div className="login-rbac-banner">
          <div className="rbac-tier">
            <span className="badge-admin">Admin</span>
            <span>Full company monitor, all departments, workforce analytics & records</span>
          </div>
          <div className="rbac-tier">
            <span className="badge-manager">Manager</span>
            <span>Department-level team monitor (Design), team analytics, self punch</span>
          </div>
          <div className="rbac-tier">
            <span className="badge-employee">Employee</span>
            <span>Personal punch in/out, shift tracker, weekly targets & personal history</span>
          </div>
        </div>

        {/* User Card Grid */}
        <div className="login-users-grid">
          {filteredUsers.map(user => {
            const roleBadgeClass = user.role === 'admin' 
              ? 'badge-admin' 
              : user.role === 'manager' 
                ? 'badge-manager' 
                : 'badge-employee';

            return (
              <div
                key={user.id}
                className={`login-user-card ${user.role}`}
                onClick={() => onSelectUser(user.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectUser(user.id); }}
              >
                <div className="user-card-top">
                  <div className="user-card-avatar-wrap">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="user-card-avatar" />
                    ) : (
                      <div className="user-card-avatar fallback">{user.name?.[0]}</div>
                    )}
                    <span className={`status-indicator ${user.role}`} />
                  </div>
                  <div className="user-card-info">
                    <div className="user-card-name">{user.name}</div>
                    <div className="user-card-designation">{user.designation || 'Staff Member'}</div>
                    <div className="user-card-dept">
                      <Building2 size={12} /> {user.department || 'Dayflow Staff'}
                    </div>
                  </div>
                </div>

                <div className="user-card-bottom">
                  <span className={`role-pill ${roleBadgeClass}`}>
                    {user.role.toUpperCase()}
                  </span>
                  <button className="login-action-btn">
                    <span>Enter Portal</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security / System Notice */}
        <div className="login-footer-notice">
          <Lock size={13} />
          <span>Role-Based Access Control (RBAC) enforced via SQLite relational schema & Express middleware.</span>
        </div>
      </div>
    </div>
  );
}

export default LoginPortal;
