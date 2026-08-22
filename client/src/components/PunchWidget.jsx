import React, { useState, useEffect } from 'react';
import {
  LogIn, LogOut, CheckCircle2, Clock, Timer, AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { StatusBadge } from './StatusBadge';

/* Skeleton loader for the punch hero */
function PunchSkeleton() {
  return (
    <div className="punch-section">
      <div className="skeleton-card">
        <div className="skeleton skeleton-line tall" style={{ width: '70%', margin: '0 auto var(--sp-4)' }} />
        <div className="skeleton skeleton-line" style={{ width: '50%', margin: '0 auto var(--sp-8)' }} />
        <div className="skeleton skeleton-line tall" style={{ height: 58, borderRadius: 'var(--r-btn)' }} />
      </div>
      <div className="skeleton-card">
        <div className="skeleton skeleton-line" style={{ width: '40%', marginBottom: 'var(--sp-6)' }} />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'var(--sp-3)' }}>
          {[1,2,3,4].map(i => (
            <div key={i} className="skeleton skeleton-line" style={{ height: 70 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function PunchWidget({ todayRecord, onPunchSuccess, showToast, loading: parentLoading }) {
  const [now, setNow]         = useState(new Date());
  const [actionBusy, setActionBusy] = useState(false);
  const [elapsed, setElapsed] = useState('--:--:--');

  /* Live clock every second */
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  /* Shift elapsed timer — runs only when shift is active */
  useEffect(() => {
    if (!todayRecord?.check_in || todayRecord?.check_out) { setElapsed('--:--:--'); return; }

    const update = () => {
      const inMs  = new Date(todayRecord.check_in.replace(' ', 'T')).getTime();
      const diffMs = Math.max(0, Date.now() - inMs);
      const s   = Math.floor(diffMs / 1000);
      const hh  = String(Math.floor(s / 3600)).padStart(2, '0');
      const mm  = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
      const ss  = String(s % 60).padStart(2, '0');
      setElapsed(`${hh}:${mm}:${ss}`);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [todayRecord]);

  if (parentLoading) return <PunchSkeleton />;

  const hasIn  = !!todayRecord?.check_in;
  const hasOut = !!todayRecord?.check_out;

  const fmtTime = (ts) => {
    if (!ts) return '--:--:--';
    const part = ts.split(' ')[1] || ts;
    return part.slice(0, 8);
  };

  const handleCheckIn = async () => {
    setActionBusy(true);
    try {
      const res = await api.checkIn();
      showToast('Checked in successfully', res.message, 'success');
      onPunchSuccess?.();
    } catch (err) {
      showToast('Check-in failed', err.message, 'error');
    } finally { setActionBusy(false); }
  };

  const handleCheckOut = async () => {
    setActionBusy(true);
    try {
      const res = await api.checkOut();
      showToast('Checked out successfully', res.message, 'success');
      onPunchSuccess?.();
    } catch (err) {
      showToast('Check-out failed', err.message, 'error');
    } finally { setActionBusy(false); }
  };

  const dayStr  = now.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:true });

  return (
    <div className="punch-section mb-8">
      {/* ---- PUNCH HERO CARD ---- */}
      <div className="punch-hero-card">
        {/* Live time display */}
        <div>
          <div className="punch-time-display" aria-live="polite" aria-atomic="true">
            {timeStr}
          </div>
          <div className="punch-date-display">{dayStr}</div>
        </div>

        {/* Today status badge */}
        <div>
          <StatusBadge status={todayRecord?.status || 'not_marked'} />
        </div>

        {/* CTA Buttons */}
        <div className="punch-btn-group" style={{ width:'100%' }}>
          {!hasIn && (
            <button
              className="btn-punch-checkin"
              onClick={handleCheckIn}
              disabled={actionBusy}
              id="btn-punch-checkin"
              aria-label="Check in for today"
            >
              <LogIn size={22} aria-hidden="true" />
              {actionBusy ? 'Clocking in…' : 'Check In'}
            </button>
          )}

          {hasIn && !hasOut && (
            <>
              <button
                className="btn-punch-checkout"
                onClick={handleCheckOut}
                disabled={actionBusy}
                id="btn-punch-checkout"
                aria-label="Check out for today"
              >
                <LogOut size={22} aria-hidden="true" />
                {actionBusy ? 'Clocking out…' : 'Check Out'}
              </button>

              <div className="punch-elapsed" aria-live="polite">
                <Timer size={14} aria-hidden="true" />
                Shift elapsed: <strong>{elapsed}</strong>
              </div>
            </>
          )}

          {hasIn && hasOut && (
            <div className="punch-completed-badge" role="status">
              <CheckCircle2 size={20} aria-hidden="true" />
              Shift completed · {todayRecord.work_hours} hrs today
            </div>
          )}
        </div>

        {/* Shift note */}
        <p style={{ fontSize:13, color:'var(--text-secondary)' }}>
          Standard shift: 09:30 AM – 06:00 PM (8.5 h)
        </p>
      </div>

      {/* ---- TODAY SUMMARY ---- */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <Clock size={18} aria-hidden="true" />
            Today's Shift Summary
          </div>
        </div>
        <div className="panel-body">
          <div className="today-summary-grid">
            <div className="today-summary-item">
              <div className="today-summary-label">
                <LogIn size={13} aria-hidden="true" />
                Clock-In
              </div>
              <div className={`today-summary-value ${!hasIn ? 'muted' : ''}`}>
                {fmtTime(todayRecord?.check_in)}
              </div>
            </div>

            <div className="today-summary-item">
              <div className="today-summary-label">
                <LogOut size={13} aria-hidden="true" />
                Clock-Out
              </div>
              <div className={`today-summary-value ${!hasOut ? 'muted' : ''}`}>
                {fmtTime(todayRecord?.check_out)}
              </div>
            </div>

            <div className="today-summary-item">
              <div className="today-summary-label">
                <Timer size={13} aria-hidden="true" />
                Hours Worked
              </div>
              <div className={`today-summary-value ${!todayRecord?.work_hours ? 'muted' : ''}`}>
                {todayRecord?.work_hours > 0
                  ? `${todayRecord.work_hours} hrs`
                  : hasIn ? elapsed : '0.00 hrs'}
              </div>
            </div>

            <div className="today-summary-item">
              <div className="today-summary-label">
                <AlertCircle size={13} aria-hidden="true" />
                Punctuality
              </div>
              <div style={{ marginTop: 4 }}>
                {todayRecord?.late_minutes > 0
                  ? <span className="late-badge">+{todayRecord.late_minutes}m late</span>
                  : hasIn
                    ? <span className="ontime-badge">✓ On time</span>
                    : <span style={{ fontSize:14, color:'var(--text-secondary)' }}>—</span>
                }
              </div>
            </div>
          </div>

          {todayRecord?.notes && (
            <div style={{ marginTop:'var(--sp-4)', padding:'var(--sp-3)', background:'var(--bg-primary)', borderRadius:'var(--r-input)', fontSize:13, color:'var(--text-secondary)' }}>
              <strong style={{ color:'var(--text-primary)' }}>Remarks:</strong> {todayRecord.notes}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PunchWidget;
