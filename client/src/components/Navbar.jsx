import React from 'react';
import { 
  Clock, 
  Users, 
  BarChart3, 
  ShieldCheck, 
  UserCheck, 
  ChevronDown 
} from 'lucide-react';
import { setCurrentUserId } from '../services/api';

export function Navbar({ 
  currentUser, 
  usersList, 
  activeTab, 
  setActiveTab, 
  onUserChange 
}) {
  const isAdmin = currentUser?.role === 'admin';

  const handleSelectUser = (e) => {
    const newUserId = parseInt(e.target.value, 10);
    setCurrentUserId(newUserId);
    if (onUserChange) onUserChange(newUserId);
  };

  return (
    <header className="navbar">
      <div className="nav-brand">
        <div className="brand-icon">
          <Clock size={22} />
        </div>
        <div>
          <span className="brand-title">Dayflow</span>
          <span style={{ marginLeft: '8px' }} className="brand-badge">HRMS v1.0</span>
        </div>
      </div>

      <nav className="nav-tabs">
        <button 
          className={`nav-tab-btn ${activeTab === 'employee' ? 'active' : ''}`}
          onClick={() => setActiveTab('employee')}
        >
          <Clock size={16} />
          <span>My Attendance</span>
        </button>

        {isAdmin && (
          <button 
            className={`nav-tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            <Users size={16} />
            <span>Attendance Monitor</span>
          </button>
        )}

        <button 
          className={`nav-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <BarChart3 size={16} />
          <span>Workforce Analytics</span>
        </button>
      </nav>

      <div className="nav-actions">
        {/* Multi-role Simulator Dropdown for Live Hackathon Testing */}
        <div className="user-switcher" title="Switch persona to test Employee vs Admin flow">
          {currentUser?.avatar ? (
            <img src={currentUser.avatar} alt={currentUser.name} className="user-avatar" />
          ) : (
            <div className="user-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#374151' }}>
              <UserCheck size={18} />
            </div>
          )}
          
          <div className="user-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span className="user-name">{currentUser?.name || 'Loading...'}</span>
              <ChevronDown size={14} color="#9ca3af" />
            </div>
            <span className="user-role-badge">
              {isAdmin ? <ShieldCheck size={12} color="#818cf8" /> : <Clock size={12} color="#34d399" />}
              {currentUser?.role?.toUpperCase()} • {currentUser?.employee?.department || 'Staff'}
            </span>
          </div>

          <select 
            value={currentUser?.id || 2} 
            onChange={handleSelectUser}
            style={{
              position: 'absolute',
              opacity: 0,
              width: '100%',
              height: '100%',
              cursor: 'pointer',
              top: 0,
              left: 0
            }}
          >
            {usersList.map(u => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role.toUpperCase()} - {u.department || 'General'})
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
