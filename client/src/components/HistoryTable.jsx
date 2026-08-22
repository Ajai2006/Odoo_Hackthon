import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  ArrowUpDown, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';

export function HistoryTable({ records = [], onRefresh }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecords = records.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchDate = r.date?.toLowerCase().includes(term);
      const matchNotes = r.notes?.toLowerCase().includes(term);
      const matchStatus = r.status?.toLowerCase().includes(term);
      if (!matchDate && !matchNotes && !matchStatus) return false;
    }
    return true;
  });

  const formatTime = (ts) => {
    if (!ts) return '--:--';
    return ts.split(' ')[1] || ts;
  };

  return (
    <div className="glass-panel">
      <div className="panel-header">
        <div className="panel-title-wrap">
          <History size={20} color="#a855f7" />
          <h2 className="panel-title">My Attendance History Log</h2>
        </div>
        <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
          Total Logged Shifts: <strong style={{ color: '#fff' }}>{records.length}</strong>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            className="input-field" 
            placeholder="Search dates, notes, or statuses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <Filter size={16} color="#9ca3af" />
          <select 
            className="select-field"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="present">Present</option>
            <option value="half_day">Half Day</option>
            <option value="leave">Leave / PTO</option>
            <option value="absent">Absent</option>
            <option value="incomplete">Incomplete</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Clock In</th>
              <th>Clock Out</th>
              <th>Work Hours</th>
              <th>Punctuality</th>
              <th>Status</th>
              <th>Notes / Remarks</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: '#9ca3af' }}>
                  No attendance records found matching the criteria.
                </td>
              </tr>
            ) : (
              filteredRecords.map((rec) => (
                <tr key={rec.id}>
                  <td style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                    {rec.date}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>
                    {formatTime(rec.check_in)}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>
                    {formatTime(rec.check_out)}
                  </td>
                  <td style={{ fontWeight: 700, color: rec.work_hours >= 8 ? '#34d399' : '#e5e7eb' }}>
                    {rec.work_hours > 0 ? `${rec.work_hours} hrs` : '--'}
                  </td>
                  <td>
                    {rec.late_minutes > 0 ? (
                      <span style={{ color: '#f87171', fontSize: '0.8rem', fontWeight: 600 }}>
                        +{rec.late_minutes}m Late
                      </span>
                    ) : rec.check_in ? (
                      <span style={{ color: '#34d399', fontSize: '0.8rem', fontWeight: 500 }}>
                        On Time
                      </span>
                    ) : (
                      <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>--</span>
                    )}
                  </td>
                  <td>
                    <span className={`status-pill ${rec.status}`}>
                      ● {rec.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ color: '#9ca3af', fontSize: '0.825rem' }}>
                    {rec.notes || '--'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default HistoryTable;
