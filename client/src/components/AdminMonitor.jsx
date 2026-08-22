import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Filter, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  UserX,
  Briefcase,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { StatCard } from './StatCard';

export function AdminMonitor({ showToast }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [department, setDepartment] = useState('all');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ records: [], summary: {} });

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const res = await api.getAllAttendance({
        date,
        department,
        status,
        search
      });
      setData(res);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [date, department, status]);

  // Debounced or on-submit search
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadAttendance();
  };

  const { records = [], summary = {} } = data;
  const totalEmployees = summary.totalEmployees || 7;
  const checkedIn = summary.checkedInCount || 0;
  const lateCount = summary.lateCount || 0;
  const leaveCount = summary.leaveCount || 0;

  const formatTime = (ts) => {
    if (!ts) return '--:--';
    return ts.split(' ')[1] || ts;
  };

  return (
    <div>
      {/* Top Header */}
      <div className="page-header">
        <div className="header-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={28} color="#6366f1" />
            <h1>Live Attendance Monitor</h1>
          </div>
          <p>Real-time organizational attendance tracking, shift compliance, and workforce logs.</p>
        </div>

        <button 
          onClick={loadAttendance}
          className="input-field" 
          style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
          disabled={loading}
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Real-Time Live Stat Cards (Shared StatCard Component) */}
      <div className="stats-grid">
        <StatCard
          title="Total Workforce"
          value={totalEmployees}
          icon={<Users size={20} />}
          variant="primary"
          subtitle="Registered staff"
        />

        <StatCard
          title="Clocked In Today"
          value={checkedIn}
          icon={<CheckCircle2 size={20} />}
          variant="success"
          change={`${Math.round((checkedIn / totalEmployees) * 100)}%`}
          changeType="positive"
          subtitle="Shift active / present"
        />

        <StatCard
          title="Late Arrivals"
          value={lateCount}
          icon={<Clock size={20} />}
          variant="warning"
          change={lateCount > 0 ? `+${lateCount} today` : 'None'}
          changeType={lateCount > 0 ? 'negative' : 'positive'}
          subtitle="Past 09:30 AM"
        />

        <StatCard
          title="On Leave / Absent"
          value={leaveCount}
          icon={<UserX size={20} />}
          variant="purple"
          subtitle="Approved PTO / Off"
        />
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel">
        <div className="panel-header">
          <div className="panel-title-wrap">
            <Filter size={18} color="#6366f1" />
            <h3 className="panel-title" style={{ fontSize: '1.1rem' }}>Filter & Query Logs</h3>
          </div>
        </div>

        <div className="filter-bar">
          {/* Date Picker */}
          <div className="filter-group">
            <Calendar size={16} color="#9ca3af" />
            <input 
              type="date"
              className="input-field"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Department Filter */}
          <div className="filter-group">
            <Briefcase size={16} color="#9ca3af" />
            <select 
              className="select-field"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="all">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="HR & People">HR & People</option>
              <option value="Sales">Sales</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="filter-group">
            <select 
              className="select-field"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="present">Present</option>
              <option value="incomplete">Incomplete / Active Shift</option>
              <option value="half_day">Half Day</option>
              <option value="leave">Leave</option>
              <option value="absent">Absent</option>
              <option value="not_marked">Not Clocked In</option>
            </select>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="search-input-wrap">
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Search employee name, code, designation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
        </div>

        {/* All-Employees Attendance Table */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Hours</th>
                <th>Punctuality</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
                    No employee attendance records found for the selected criteria.
                  </td>
                </tr>
              ) : (
                records.map((emp) => (
                  <tr key={emp.employee_id}>
                    <td>
                      <div className="employee-cell">
                        <img 
                          src={emp.employee_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                          alt={emp.employee_name} 
                          className="table-avatar" 
                        />
                        <div className="table-emp-info">
                          <span className="table-emp-name">{emp.employee_name}</span>
                          <span className="table-emp-dept">{emp.employee_code} • {emp.designation}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span style={{ 
                        background: 'rgba(255,255,255,0.05)', 
                        padding: '0.2rem 0.6rem', 
                        borderRadius: '4px', 
                        fontSize: '0.8rem' 
                      }}>
                        {emp.department}
                      </span>
                    </td>

                    <td style={{ fontFamily: 'var(--font-mono)' }}>
                      {formatTime(emp.check_in)}
                    </td>

                    <td style={{ fontFamily: 'var(--font-mono)' }}>
                      {formatTime(emp.check_out)}
                    </td>

                    <td style={{ fontWeight: 700 }}>
                      {emp.work_hours > 0 ? `${emp.work_hours} hrs` : '--'}
                    </td>

                    <td>
                      {emp.late_minutes > 0 ? (
                        <span style={{ color: '#f87171', fontSize: '0.8rem', fontWeight: 600 }}>
                          +{emp.late_minutes}m Late
                        </span>
                      ) : emp.check_in ? (
                        <span style={{ color: '#34d399', fontSize: '0.8rem', fontWeight: 500 }}>
                          On Time
                        </span>
                      ) : (
                        <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>--</span>
                      )}
                    </td>

                    <td>
                      {emp.status ? (
                        <span className={`status-pill ${emp.status}`}>
                          ● {emp.status.replace('_', ' ')}
                        </span>
                      ) : (
                        <span className="status-pill not_marked">
                          ● Not Marked
                        </span>
                      )}
                    </td>

                    <td style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
                      {emp.notes || '--'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminMonitor;
