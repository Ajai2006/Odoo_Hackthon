import React, { useState, useEffect } from 'react';
import { AppShell }     from './components/Navbar';
import { PunchWidget }  from './components/PunchWidget';
import { WeeklyView }   from './components/WeeklyView';
import { CalendarView } from './components/CalendarView';
import { HistoryTable } from './components/HistoryTable';
import { AdminMonitor } from './components/AdminMonitor';
import { AnalyticsView }from './components/AnalyticsView';
import { LeaveManager } from './components/LeaveManager';
import { WorkforceRiskWidget } from './components/WorkforceRiskWidget';
import { AIAssistantWidget } from './components/AIAssistantWidget';
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
      
      let meRes = null;
      try {
        meRes = await api.getCurrentUser();
      } catch (e) {
        // No active session — show login page first
        meRes = null;
      }

      if (meRes && meRes.user) {
        const fullUser = { ...meRes.user, employee: meRes.employee };
        setCurrentUser(fullUser);
        setIsSignedOut(false);
        return fullUser;
      } else {
        setCurrentUser(null);
        return null;
      }
    } catch (err) {
      setCurrentUser(null);
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
      const isAuthSession = sessionStorage.getItem('is_authenticated_session');
      if (isAuthSession === 'true') {
        const u = await loadUser();
        if (u) {
          await loadAttendance();
        } else {
          setCurrentUser(null);
        }
      } else {
        try { await api.logout(); } catch (e) {}
        setCurrentUser(null);
      }
      setAppLoading(false);
    })();
  }, []);

  /* User persona / role switch */
  const handleUserChange = async (newUserId) => {
    setAppLoading(true);
    sessionStorage.setItem('is_authenticated_session', 'true');
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
    sessionStorage.setItem('is_authenticated_session', 'true');
    await handleUserChange(userId);
  };

  /* Sign out */
  const handleSignOut = async () => {
    sessionStorage.removeItem('is_authenticated_session');
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
    leaves: {
      title: canAccessMonitor
        ? 'Leave Approvals Queue & Attendance Auto-Sync'
        : 'My Leave Balances & Time Off Applications',
      desc: canAccessMonitor
        ? 'Review pending time off applications across your team. Approved leaves automatically update employee attendance calendars.'
        : 'Check your remaining paid, sick, and unpaid leave balances and submit time off applications.',
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

  const handleLoginSuccess = async (user) => {
    setAppLoading(true);
    setIsSignedOut(false);
    sessionStorage.setItem('is_authenticated_session', 'true');
    const updatedUser = await loadUser();
    if (updatedUser) {
      await loadAttendance();
      if (updatedUser.role === 'admin' || updatedUser.role === 'manager') {
        setActiveTab('admin');
      } else {
        setActiveTab('attendance');
      }
      showToast('Authentication Successful', `Welcome back, ${updatedUser.name}! (${updatedUser.role.toUpperCase()})`, 'success');
    }
    setAppLoading(false);
  };

  // Show Login Portal if signed out or no authenticated user
  if (!appLoading && (isSignedOut || !currentUser)) {
    return (
      <>
        <ToastStack toasts={toasts} />
        <LoginPortal 
          onLoginSuccess={handleLoginSuccess}
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
              <>
                <WorkforceRiskWidget department={isManager ? currentUser?.employee?.department : ''} />
                <AdminMonitor 
                  currentUser={currentUser} 
                  showToast={showToast} 
                />
              </>
            )}

            {/* ── LEAVE MANAGEMENT TAB ── */}
            {activeTab === 'leaves' && (
              <LeaveManager
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

        {/* 🔮 Floating Dayflow AI Assistant Widget */}
        <AIAssistantWidget
          currentUser={currentUser}
          todayRecord={todayRecord}
        />
      </AppShell>
    </>
  );
}

export default App;
