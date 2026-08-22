import React, { useState, useEffect } from 'react';
import { AppShell }     from './components/Navbar';
import { PunchWidget }  from './components/PunchWidget';
import { WeeklyView }   from './components/WeeklyView';
import { CalendarView } from './components/CalendarView';
import { HistoryTable } from './components/HistoryTable';
import { AdminMonitor } from './components/AdminMonitor';
import { AnalyticsView }from './components/AnalyticsView';
import { LoginPortal }  from './components/LoginPortal';
import { api } from './services/api';
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
  const [currentUser,       setCurrentUser]       = useState(null);
  const [usersList,         setUsersList]         = useState([]);
  const [activeTab,         setActiveTab]         = useState('attendance');
  const [appLoading,        setAppLoading]        = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [isSignedOut,       setIsSignedOut]       = useState(false);

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
      const personasRes = await api.getDemoPersonas();
      const list        = personasRes.personas || [];
      setUsersList(list);

      if (userIdOverride) {
        await api.login(userIdOverride);
      }
      
      let meRes;
      try {
        meRes = await api.getCurrentUser();
      } catch (e) {
        // Default initial session to Alex Chen (Employee) via JWT login
        meRes = await api.login(2);
      }

      if (meRes.user) {
        const fullUser = { ...meRes.user, employee: meRes.employee };
        setCurrentUser(fullUser);
        setIsSignedOut(false);
        return fullUser;
      } else {
        setCurrentUser(null);
        return null;
      }
    } catch (err) {
      showToast('Load error', err.message, 'error');
      return null;
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
      const u = await loadUser();
      if (u) {
        await loadAttendance();
      }
      setAppLoading(false);
    })();
  }, []);

  /* User persona / role switch */
  const handleUserChange = async (newUserId) => {
    setAppLoading(true);
    const updatedUser = await loadUser(newUserId);
    if (updatedUser) {
      await loadAttendance();
      // If regular employee, make sure they don't remain on restricted monitor tab
      if (updatedUser.role === 'employee' && activeTab === 'admin') {
        setActiveTab('attendance');
      }
    }
    setAppLoading(false);
    const u = usersList.find(item => item.id === newUserId);
    if (u) showToast('Account Active', `Logged in as ${u.name} (${u.role.toUpperCase()})`, 'success');
  };

  /* Sign in from portal */
  const handleLoginUser = async (userId) => {
    setAppLoading(true);
    setIsSignedOut(false);
    await handleUserChange(userId);
  };

  /* Sign out */
  const handleSignOut = async () => {
    try {
      await api.logout();
    } catch (e) {
      // Ignore network errors on logout
    }
    setCurrentUser(null);
    setIsSignedOut(true);
    showToast('Signed Out', 'You have been safely signed out of Dayflow HRMS.', 'info');
  };

  /* Punch success callback */
  const handlePunchSuccess = async () => {
    await loadAttendance();
  };

  const isAdmin = currentUser?.role === 'admin';
  const isManager = currentUser?.role === 'manager';
  const canAccessMonitor = isAdmin || isManager;

  /* ---- PAGE HEADER metadata per tab & role ---- */
  const PAGE_META = {
    attendance: {
      title: 'My Attendance & Shift Clock',
      desc:  `Welcome back, ${currentUser?.name?.split(' ')[0] || 'there'}. Clock in, manage your daily shift, and review your performance history.`,
    },
    admin: {
      title: isAdmin 
        ? 'Company Attendance Monitor' 
        : `Team Attendance Monitor (${currentUser?.employee?.department || 'Design'})`,
      desc:  isAdmin 
        ? 'Real-time attendance tracking across all company departments and employee records.'
        : `Real-time shift compliance and attendance roster for ${currentUser?.employee?.department || 'your'} team.`,
    },
    analytics: {
      title: isAdmin 
        ? 'Workforce Intelligence & Analytics' 
        : isManager 
          ? `Team Analytics (${currentUser?.employee?.department || 'Design'})` 
          : 'Personal Attendance Insights',
      desc:  isAdmin 
        ? 'Company-wide attendance rate, absenteeism trends, and department benchmarks.'
        : isManager
          ? `Key attendance metrics, punctuality benchmarks, and logs for ${currentUser?.employee?.department || 'your'} team.`
          : 'Your personal attendance rates, shift completions, punctuality track record, and monthly targets.',
    },
  };

  const meta = PAGE_META[activeTab] || PAGE_META.attendance;

  // Show Login Portal if signed out or no authenticated user
  if (!appLoading && (isSignedOut || !currentUser)) {
    return (
      <>
        <ToastStack toasts={toasts} />
        <LoginPortal 
          usersList={usersList} 
          onSelectUser={handleLoginUser} 
        />
      </>
    );
  }

  return (
    <>
      <ToastStack toasts={toasts} />

      <AppShell
        currentUser={currentUser}
        usersList={usersList}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onUserChange={handleUserChange}
        onSignOut={handleSignOut}
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

            {/* ── ADMIN / MANAGER MONITOR TAB ── */}
            {activeTab === 'admin' && canAccessMonitor && (
              <AdminMonitor 
                currentUser={currentUser} 
                showToast={showToast} 
              />
            )}

            {/* ── ANALYTICS TAB ── */}
            {activeTab === 'analytics' && (
              <AnalyticsView 
                currentUser={currentUser} 
                showToast={showToast} 
              />
            )}
          </>
        )}
      </AppShell>
    </>
  );
}

export default App;
