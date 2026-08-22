import React, { useState, useRef, useEffect } from 'react';
import {
  Clock, Users, BarChart3, Bell, Search, ChevronDown,
  LayoutDashboard, CalendarDays, History, ShieldCheck,
  LogOut, UserCog, ChevronsLeft, ChevronsRight, Menu, X
} from 'lucide-react';
import { setCurrentUserId } from '../services/api';

/* ---- Role-aware sidebar nav items ---- */
const EMPLOYEE_NAV = [
  { id: 'attendance', label: 'My Attendance', icon: Clock },
  { id: 'analytics',  label: 'Analytics',     icon: BarChart3 },
];

const ADMIN_NAV = [
  { id: 'attendance', label: 'My Attendance', icon: Clock },
  { id: 'admin',      label: 'Monitor',       icon: ShieldCheck },
  { id: 'analytics',  label: 'Analytics',     icon: BarChart3 },
];

export function AppShell({ currentUser, usersList, activeTab, setActiveTab, onUserChange, children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen]             = useState(false);
  const [dropdownOpen, setDropdownOpen]          = useState(false);
  const dropdownRef = useRef(null);

  const isAdmin = currentUser?.role === 'admin';
  const navItems = isAdmin ? ADMIN_NAV : EMPLOYEE_NAV;

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
    setCurrentUserId(userId);
    setDropdownOpen(false);
    if (onUserChange) onUserChange(parseInt(userId, 10));
  };

  const PAGE_TITLES = {
    attendance: 'My Attendance',
    admin:      'Attendance Monitor',
    analytics:  'Workforce Analytics',
  };

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
            <div className="sidebar-subtitle">HRMS</div>
          </div>
        </div>

        {/* Nav */}
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
              <input type="search" placeholder="Search…" aria-label="Global search" />
            </div>

            {/* Notifications */}
            <button className="topbar-icon-btn" aria-label="Notifications">
              <Bell size={18} />
              <span className="notif-dot" aria-hidden="true" />
            </button>

            {/* Avatar / Persona Switcher */}
            <div className="relative" ref={dropdownRef}>
              <button
                className="avatar-btn"
                onClick={() => setDropdownOpen(p => !p)}
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
                id="avatar-btn"
              >
                {currentUser?.avatar
                  ? <img src={currentUser.avatar} alt={currentUser?.name} className="avatar-img" />
                  : (
                    <div className="avatar-img" style={{ background: 'var(--primary-100)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--primary-700)', fontWeight:700, fontSize:12 }}>
                      {currentUser?.name?.[0] || '?'}
                    </div>
                  )
                }
                <span className="avatar-name">{currentUser?.name || '…'}</span>
                <ChevronDown size={14} className="avatar-caret" />
              </button>

              {dropdownOpen && (
                <div className="dropdown-panel" role="menu">
                  {/* Current user info */}
                  <div className="dropdown-header">
                    <div className="dropdown-header-name">{currentUser?.name}</div>
                    <div className="dropdown-header-role">
                      {currentUser?.role?.toUpperCase()} · {currentUser?.employee?.department || 'Staff'}
                    </div>
                  </div>

                  <div className="dropdown-item" style={{ cursor:'default' }}>
                    <UserCog size={16} color="var(--text-secondary)" />
                    <span style={{ fontSize:13 }}>Profile settings</span>
                  </div>

                  <div className="divider" />

                  {/* Role / Persona Switcher */}
                  <div className="dropdown-section-label">Switch Persona</div>
                  {usersList.map(u => (
                    <button
                      key={u.id}
                      className={`dropdown-item ${currentUser?.id === u.id ? 'active' : ''}`}
                      onClick={() => handleSwitchUser(u.id)}
                      role="menuitem"
                      style={currentUser?.id === u.id ? { background:'var(--primary-100)', color:'var(--primary-700)' } : {}}
                    >
                      {u.avatar
                        ? <img src={u.avatar} alt={u.name} style={{ width:22, height:22, borderRadius:'50%', objectFit:'cover', flexShrink:0 }} />
                        : <div style={{ width:22, height:22, borderRadius:'50%', background:'var(--primary-100)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'var(--primary-700)', flexShrink:0 }}>{u.name?.[0]}</div>
                      }
                      <span style={{ fontSize:13 }}>{u.name} <span style={{ color:'var(--text-secondary)', fontWeight:400 }}>({u.role})</span></span>
                    </button>
                  ))}

                  <div className="divider" />
                  <button className="dropdown-item danger" role="menuitem">
                    <LogOut size={16} />
                    <span>Sign out</span>
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
    </div>
  );
}

export default AppShell;
