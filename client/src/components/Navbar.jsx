import React, { useState, useRef, useEffect } from 'react';
import {
  Clock, Users, BarChart3, Bell, Search, ChevronDown,
  LayoutDashboard, CalendarDays, History, ShieldCheck,
  LogOut, UserCog, ChevronsLeft, ChevronsRight, Menu, X,
  Shield, UserCheck, ArrowRight, Building2, Lock, RefreshCw
} from 'lucide-react';

/* ---- Role-aware sidebar navigation configurations ---- */
const GET_NAV_ITEMS = (role, department) => {
  if (role === 'admin') {
    return [
      { id: 'attendance', label: 'My Attendance', icon: Clock },
      { id: 'admin',      label: 'Company Monitor', icon: ShieldCheck },
      { id: 'leaves',     label: 'Leave Approvals Queue', icon: CalendarDays },
      { id: 'analytics',  label: 'Workforce Analytics', icon: BarChart3 },
    ];
  }

  if (role === 'manager') {
    return [
      { id: 'attendance', label: 'My Attendance', icon: Clock },
      { id: 'admin',      label: `Team Monitor (${department || 'Team'})`, icon: Users },
      { id: 'leaves',     label: 'Team Leave Reviews', icon: CalendarDays },
      { id: 'analytics',  label: 'Team Analytics', icon: BarChart3 },
    ];
  }

  // Regular Employee
  return [
    { id: 'attendance', label: 'My Attendance', icon: Clock },
    { id: 'leaves',     label: 'My Leaves & Time Off', icon: CalendarDays },
    { id: 'analytics',  label: 'My Analytics', icon: BarChart3 },
  ];
};

export function AppShell({ 
  currentUser, 
  usersList = [], 
  activeTab, 
  setActiveTab, 
  onUserChange, 
  onSignOut,
  children 
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen]             = useState(false);
  const [dropdownOpen, setDropdownOpen]         = useState(false);
  const dropdownRef = useRef(null);

  const role = currentUser?.role || 'employee';
  const department = currentUser?.employee?.department || 'Staff';
  const navItems = GET_NAV_ITEMS(role, department);

  /* Close dropdown on outside click */
  useEffect(() => {
    function handler(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSwitchUser = (userId) => {
    setDropdownOpen(false);
    setSwitcherModalOpen(false);
    if (onUserChange) onUserChange(parseInt(userId, 10));
  };

  const PAGE_TITLES = {
    attendance: 'My Attendance & Clock In/Out',
    admin: role === 'admin' 
      ? 'Company Attendance Monitor' 
      : `Team Attendance Monitor — ${department}`,
    leaves: role === 'admin'
      ? 'Leave Approvals Queue & Attendance Auto-Sync'
      : role === 'manager'
        ? `Team Leave Approvals (${department})`
        : 'My Leave Balances & Time Off Applications',
    analytics: role === 'admin' 
      ? 'Workforce Intelligence & Analytics' 
      : role === 'manager' 
        ? `Team Performance Analytics (${department})` 
        : 'Personal Attendance Insights',
  };

  const roleBadgeClass = role === 'admin' 
    ? 'badge-admin' 
    : role === 'manager' 
      ? 'badge-manager' 
      : 'badge-employee';

  return (
    <div className="app-shell">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:199 }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ---- SIDEBAR ---- */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <Clock size={18} />
          </div>
          <div>
            <div className="sidebar-title">Dayflow</div>
            <div className="sidebar-subtitle">HRMS · Attendance</div>
          </div>
        </div>

        {/* User Role Quick Card in Sidebar */}
        {!sidebarCollapsed && (
          <div className="sidebar-user-pill">
            <span className={`role-pill ${roleBadgeClass}`}>
              {role.toUpperCase()}
            </span>
            <span className="sidebar-user-dept">{department}</span>
          </div>
        )}

        {/* Nav Items */}
        <nav className="sidebar-nav">
          <div className="nav-section-label">Workspace</div>

          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => { setActiveTab(item.id); setMobileOpen(false); }}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Collapse toggle — desktop only */}
        <button
          className="sidebar-toggle"
          onClick={() => setSidebarCollapsed(p => !p)}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{ display: 'none' }}
          ref={el => { if (el) el.style.display = 'flex'; }}
        >
          {sidebarCollapsed
            ? <ChevronsRight size={18} />
            : <ChevronsLeft size={18} />}
          <span>Collapse</span>
        </button>
      </aside>

      {/* ---- MAIN AREA ---- */}
      <div className={`main-area ${sidebarCollapsed ? 'sidebar-collapsed-layout' : ''}`}>
        {/* ---- TOP BAR ---- */}
        <header className="topbar">
          <div className="topbar-left">
            {/* Hamburger — mobile */}
            <button
              className="topbar-icon-btn"
              onClick={() => setMobileOpen(p => !p)}
              style={{ display: 'none' }}
              id="mobile-menu-btn"
            >
              <Menu size={18} />
            </button>

            <div className="topbar-breadcrumb">
              <span>Dayflow</span>
              <span>/</span>
              <span className="topbar-page-title">{PAGE_TITLES[activeTab] || 'Dashboard'}</span>
            </div>
          </div>

          <div className="topbar-right">
            {/* Search */}
            <div className="topbar-search">
              <Search size={16} className="search-icon" />
              <input type="search" placeholder="Search shifts or staff…" aria-label="Global search" />
            </div>

            {/* Notifications */}
            <button className="topbar-icon-btn" aria-label="Notifications">
              <Bell size={18} />
              <span className="notif-dot" aria-hidden="true" />
            </button>

            {/* Avatar / Account Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                className="avatar-btn"
                onClick={() => setDropdownOpen(p => !p)}
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
                id="avatar-btn"
              >
                {currentUser?.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser?.name} className="avatar-img" />
                ) : (
                  <div className="avatar-img avatar-fallback">
                    {currentUser?.name?.[0] || '?'}
                  </div>
                )}
                <div className="avatar-info-block">
                  <span className="avatar-name">{currentUser?.name || '…'}</span>
                  <span className={`role-tag-mini ${roleBadgeClass}`}>{role}</span>
                </div>
                <ChevronDown size={14} className="avatar-caret" />
              </button>

              {dropdownOpen && (
                <div className="dropdown-panel" role="menu">
                  {/* Current user info */}
                  <div className="dropdown-header">
                    <div className="dropdown-header-name">{currentUser?.name}</div>
                    <div className="dropdown-header-role">
                      <span className={`role-pill ${roleBadgeClass}`}>
                        {role.toUpperCase()}
                      </span>
                      <span>· {department}</span>
                    </div>
                    <div className="dropdown-header-email">
                      {currentUser?.email || currentUser?.employee?.employee_code || ''}
                    </div>
                  </div>

                  {/* Employee Code */}
                  <div style={{ padding: '0.5rem 0.75rem', fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Shield size={11} />
                    <span>{currentUser?.employee?.employee_code || 'Employee'}</span>
                    <span>· {department}</span>
                  </div>

                  <div className="divider" />

                  {/* Sign out — only action available, no user switching */}
                  <button 
                    className="dropdown-item danger" 
                    onClick={() => { setDropdownOpen(false); if (onSignOut) onSignOut(); }}
                    role="menuitem"
                  >
                    <LogOut size={16} />
                    <span>Sign out of Dayflow HRMS</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ---- PAGE CONTENT ---- */}
        <main className="page-body">
          {children}
        </main>
      </div>

      {/* Account switcher modal removed — users must Sign Out and log in again for privacy */}
    </div>
  );
}

export default AppShell;
