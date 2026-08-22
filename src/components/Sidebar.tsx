import React from 'react';
import { Layers, ClipboardList, ShieldAlert, CalendarDays, Sparkles, User, Shield, LogOut, Settings } from 'lucide-react';
import { Employee } from '../types';

interface SidebarProps {
  activeTab: 'employee' | 'admin' | 'calendar' | 'radar';
  onTabChange: (tab: 'employee' | 'admin' | 'calendar' | 'radar') => void;
  isAdminMode: boolean;
  pendingCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isAdminMode,
  pendingCount,
}) => {
  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-icon-box">
          <Layers size={18} />
        </div>
        <div className="brand-text-group">
          <span className="brand-name">DAYFLOW</span>
          <span className="brand-motto">Every workday, aligned.</span>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="sidebar-nav">
        <span className="nav-section-label">Leave Management</span>

        <button
          className={`nav-item ${activeTab === 'employee' ? 'active' : ''}`}
          onClick={() => onTabChange('employee')}
        >
          <div className="nav-item-left">
            <ClipboardList size={16} className="nav-icon" />
            <span className="nav-item-label">My Leaves & Apply</span>
          </div>
        </button>

        <button
          className={`nav-item ${activeTab === 'admin' ? 'active' : ''}`}
          onClick={() => onTabChange('admin')}
        >
          <div className="nav-item-left">
            <ShieldAlert size={16} className="nav-icon" />
            <span className="nav-item-label">Approval Queue</span>
          </div>
          {pendingCount > 0 && (
            <span className="nav-badge">{pendingCount}</span>
          )}
        </button>

        <span className="nav-section-label">Attendance & Team</span>

        <button
          className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => onTabChange('calendar')}
        >
          <div className="nav-item-left">
            <CalendarDays size={16} className="nav-icon" />
            <span className="nav-item-label">Attendance Calendar</span>
          </div>
        </button>

        <button
          className={`nav-item ${activeTab === 'radar' ? 'active' : ''}`}
          onClick={() => onTabChange('radar')}
        >
          <div className="nav-item-left">
            <Sparkles size={16} className="nav-icon" />
            <span className="nav-item-label">Conflict Radar</span>
          </div>
        </button>
      </nav>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="flex-align-center gap-2">
            <span className="text-label" style={{ color: 'var(--primary-700)', fontWeight: 600 }}>
              {isAdminMode ? '🛡️ Admin Role' : '👤 Employee Role'}
            </span>
          </div>
          <span className="text-caption" style={{ fontSize: '11px' }}>v1.0.0</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
