import React, { useState, useEffect } from 'react';
import { AppShell }     from './components/Navbar';
import { PunchWidget }  from './components/PunchWidget';
import { WeeklyView }   from './components/WeeklyView';
import { CalendarView } from './components/CalendarView';
import { HistoryTable } from './components/HistoryTable';
import { AdminMonitor } from './components/AdminMonitor';
import { AnalyticsView }from './components/AnalyticsView';
import { api, getCurrentUserId, setCurrentUserId } from './services/api';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

/* ---- Toast stack ---- */
function ToastStack({ toasts }) {
  return (
    <div className="toast-stack" aria-live="polite" aria-atomic="false">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`} role="alert">
          <span className={`toast-icon ${t.type}`}>
            {t.type === 'success' && <CheckCircle2 size={18} aria-hidden="true" />}
            {t.type === 'error'   && <AlertCircle  size={18} aria-hidden="true" />}
            {t.type === 'info'    && <Info          size={18} aria-hidden="true" />}
          </span>
          <div className="toast-body">
            <strong>{t.title}</strong>
            {t.message && <span>{t.message}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

export function App() {
  const [currentUser,     setCurrentUser]     = useState(null);
  const [usersList,       setUsersList]       = useState([]);
  const [activeTab,       setActiveTab]       = useState('attendance');
  const [appLoading,      setAppLoading]      = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  const [todayRecord,     setTodayRecord]     = useState(null);
  const [weeklyData,      setWeeklyData]      = useState(null);
  const [historyRecords,  setHistoryRecords]  = useState([]);

  const [toasts, setToasts] = useState([]);

  /* showToast(title, message, type) */
  const showToast = (title, message = '', type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4200);
  };

  /* Load users list + current user */
  const loadUser = async (userIdOverride) => {
    try {
      const usersRes = await api.getUsers();
      const list     = usersRes.users || [];
      setUsersList(list);

      if (userIdOverride) setCurrentUserId(userIdOverride);
      const meRes = await api.getCurrentUser();
      setCurrentUser(meRes.user ? { ...meRes.user, employee: meRes.employee } : null);
    } catch (err) {
      showToast('Load error', err.message, 'error');
    }
  };

  /* Load attendance data for current employee */
  const loadAttendance = async () => {
    setAttendanceLoading(true);
    try {
      const [todayRes, weeklyRes, histRes] = await Promise.all([
        api.getTodayStatus(),
        api.getWeeklySummary(),
        api.getMyHistory({ limit: 60 }),
      ]);
      setTodayRecord(todayRes.record || null);
      setWeeklyData(weeklyRes);
      setHistoryRecords(histRes.records || []);
    } catch (err) {
      showToast('Attendance load error', err.message, 'error');
    } finally {
      setAttendanceLoading(false);
    }
  };

  /* Initial mount */
  useEffect(() => {
    (async () => {
      await loadUser();
      await loadAttendance();
      setAppLoading(false);
    })();
  }, []);

  /* User persona switch */
  const handleUserChange = async (newUserId) => {
    setAppLoading(true);
    await loadUser(newUserId);
    await loadAttendance();
    setAppLoading(false);
    const u = usersList.find(u => u.id === newUserId);
    if (u) showToast('Persona switched', `Now viewing as ${u.name}`, 'info');
  };

  /* Punch success callback */
  const handlePunchSuccess = async () => {
    await loadAttendance();
  };

  const isAdmin = currentUser?.role === 'admin';

  /* ---- PAGE HEADER metadata per tab ---- */
  const PAGE_META = {
    attendance: {
      title: 'My Attendance',
      desc:  `Welcome back, ${currentUser?.name?.split(' ')[0] || 'there'}. Manage your daily shifts and view your history.`,
    },
    admin: {
      title: 'Attendance Monitor',
      desc:  'Real-time attendance tracking for all employees, shift compliance and workforce logs.',
    },
    analytics: {
      title: 'Workforce Analytics',
      desc:  'Key metrics, punctuality benchmarks, absenteeism analysis, and monthly trends.',
    },
  };

  const meta = PAGE_META[activeTab] || PAGE_META.attendance;

  return (
    <>
      <ToastStack toasts={toasts} />

      <AppShell
        currentUser={currentUser}
        usersList={usersList}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onUserChange={handleUserChange}
      >
        {appLoading ? (
          /* Full-page skeleton */
          <div>
            <div style={{ marginBottom:'var(--sp-8)' }}>
              <div className="skeleton skeleton-line tall" style={{ width:'35%', height:32, marginBottom:'var(--sp-2)' }} />
              <div className="skeleton skeleton-line" style={{ width:'55%', height:18 }} />
            </div>
            <div className="stat-strip">
              {[1,2,3,4].map(i => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton skeleton-line short mb-2" />
                  <div className="skeleton skeleton-line tall" style={{ height:40, width:'60%' }} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Page header */}
            <div className="page-header">
              <div className="page-header-left">
                <h1>{meta.title}</h1>
                <p>{meta.desc}</p>
              </div>
            </div>

            {/* ── EMPLOYEE ATTENDANCE TAB ── */}
            {activeTab === 'attendance' && (
              <>
                <PunchWidget
                  todayRecord={todayRecord}
                  onPunchSuccess={handlePunchSuccess}
                  showToast={showToast}
                  loading={attendanceLoading}
                />
                <WeeklyView  weeklyData={weeklyData}    loading={attendanceLoading} />
                <CalendarView records={historyRecords}  loading={attendanceLoading} />
                <HistoryTable records={historyRecords}  loading={attendanceLoading} />
              </>
            )}

            {/* ── ADMIN MONITOR TAB ── */}
            {activeTab === 'admin' && isAdmin && (
              <AdminMonitor showToast={showToast} />
            )}

            {/* ── ANALYTICS TAB ── */}
            {activeTab === 'analytics' && (
              <AnalyticsView showToast={showToast} />
            )}
          </>
        )}
      </AppShell>
    </>
  );
}

export default App;
