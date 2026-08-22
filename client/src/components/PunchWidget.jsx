import React, { useState, useEffect } from 'react';
import { 
  LogIn, 
  LogOut, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  AlertCircle,
  Timer,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';

export function PunchWidget({ todayRecord, onPunchSuccess, showToast }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [elapsedShiftTime, setElapsedShiftTime] = useState('00:00:00');

  // Live Digital Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Live Shift Elapsed Timer
  useEffect(() => {
    if (todayRecord?.check_in && !todayRecord?.check_out) {
      const updateElapsed = () => {
        const inTime = new Date(todayRecord.check_in.replace(' ', 'T')).getTime();
        const now = new Date().getTime();
        const diffMs = Math.max(0, now - inTime);

        const totalSecs = Math.floor(diffMs / 1000);
        const hrs = String(Math.floor(totalSecs / 3600)).padStart(2, '0');
        const mins = String(Math.floor((totalSecs % 3600) / 60)).padStart(2, '0');
        const secs = String(totalSecs % 60).padStart(2, '0');
        setElapsedShiftTime(`${hrs}:${mins}:${secs}`);
      };

      updateElapsed();
      const interval = setInterval(updateElapsed, 1000);
      return () => clearInterval(interval);
    }
  }, [todayRecord]);

  const hasCheckedIn = !!todayRecord?.check_in;
  const hasCheckedOut = !!todayRecord?.check_out;

  // Handle Check In Punch
  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const res = await api.checkIn();
      showToast(res.message || 'Checked in successfully!', 'success');
      if (onPunchSuccess) onPunchSuccess();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Check Out Punch
  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const res = await api.checkOut();
      showToast(res.message || 'Checked out successfully!', 'success');
      if (onPunchSuccess) onPunchSuccess();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeOnly = (dateStr) => {
    if (!dateStr) return '--:--:--';
    const parts = dateStr.split(' ');
    return parts[1] || dateStr;
  };

  return (
    <div className="glass-panel">
      <div className="panel-header">
        <div className="panel-title-wrap">
          <Clock size={20} color="#6366f1" />
          <h2 className="panel-title">Today's Attendance Punch</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Standard Shift:</span>
          <span style={{ fontSize: '0.8rem', color: '#f3f4f6', fontWeight: 600 }}>09:30 AM – 06:00 PM (8.5h)</span>
        </div>
      </div>

      <div className="punch-hero">
        {/* Left: Punch Button & Live Time */}
        <div className="punch-live-section">
          <div className="live-time-display">
            {currentTime.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="live-date-display">
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
          </div>

          <div className="punch-btn-wrap">
            {!hasCheckedIn && (
              <button 
                className="punch-btn state-ready-checkin"
                onClick={handleCheckIn}
                disabled={loading}
                id="btn-punch-checkin"
              >
                <LogIn size={32} />
                <span>{loading ? 'Marking...' : 'CHECK IN'}</span>
              </button>
            )}

            {hasCheckedIn && !hasCheckedOut && (
              <button 
                className="punch-btn state-active-shift"
                onClick={handleCheckOut}
                disabled={loading}
                id="btn-punch-checkout"
              >
                <LogOut size={32} />
                <span>{loading ? 'Marking...' : 'CHECK OUT'}</span>
              </button>
            )}

            {hasCheckedIn && hasCheckedOut && (
              <button 
                className="punch-btn state-completed"
                disabled={true}
                id="btn-punch-completed"
              >
                <CheckCircle2 size={32} color="#10b981" />
                <span>COMPLETED</span>
              </button>
            )}
          </div>

          <div className="punch-status-note">
            {!hasCheckedIn && (
              <>
                <Sparkles size={14} color="#10b981" />
                <span>Click Check In to commence your daily shift.</span>
              </>
            )}
            {hasCheckedIn && !hasCheckedOut && (
              <>
                <Timer size={14} color="#6366f1" />
                <span>Shift in progress • Elapsed: <strong style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>{elapsedShiftTime}</strong></span>
              </>
            )}
            {hasCheckedIn && hasCheckedOut && (
              <>
                <CheckCircle2 size={14} color="#10b981" />
                <span>Today's shift complete. Total: <strong>{todayRecord.work_hours} hrs</strong></span>
              </>
            )}
          </div>
        </div>

        {/* Right: Today's Metrics Breakdown */}
        <div className="today-summary-details">
          <div className="summary-card-row">
            <div className="summary-item">
              <span className="summary-label">
                <LogIn size={13} color="#10b981" />
                Check-In Time
              </span>
              <span className="summary-val" style={{ color: hasCheckedIn ? '#34d399' : '#6b7280' }}>
                {formatTimeOnly(todayRecord?.check_in)}
              </span>
            </div>

            <div className="summary-item">
              <span className="summary-label">
                <LogOut size={13} color="#6366f1" />
                Check-Out Time
              </span>
              <span className="summary-val" style={{ color: hasCheckedOut ? '#818cf8' : '#6b7280' }}>
                {formatTimeOnly(todayRecord?.check_out)}
              </span>
            </div>
          </div>

          <div className="summary-card-row">
            <div className="summary-item">
              <span className="summary-label">
                <Clock size={13} color="#f59e0b" />
                Shift Duration
              </span>
              <span className="summary-val">
                {hasCheckedIn && !hasCheckedOut 
                  ? elapsedShiftTime 
                  : todayRecord?.work_hours 
                    ? `${todayRecord.work_hours} hrs` 
                    : '0.00 hrs'}
              </span>
            </div>

            <div className="summary-item">
              <span className="summary-label">
                <AlertCircle size={13} color="#a855f7" />
                Attendance Status
              </span>
              <div>
                {todayRecord ? (
                  <span className={`status-pill ${todayRecord.status}`}>
                    ● {todayRecord.status.replace('_', ' ')}
                  </span>
                ) : (
                  <span className="status-pill not_marked">● Not Clocked In</span>
                )}
              </div>
            </div>
          </div>

          {todayRecord?.notes && (
            <div className="summary-item" style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
              <span className="summary-label">Shift Notes</span>
              <span>{todayRecord.notes}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PunchWidget;
