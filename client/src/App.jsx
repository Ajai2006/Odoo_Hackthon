import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PunchWidget } from './components/PunchWidget';
import { WeeklyView } from './components/WeeklyView';
import { CalendarView } from './components/CalendarView';
import { HistoryTable } from './components/HistoryTable';
import { AdminMonitor } from './components/AdminMonitor';
import { AnalyticsView } from './components/AnalyticsView';
import { api, getCurrentUserId, setCurrentUserId } from './services/api';
import { CheckCircle, AlertCircle, Info, Sparkles } from 'lucide-react';

export function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [activeTab, setActiveTab] = useState('employee');
  const [loading, setLoading] = useState(true);

  // Employee View Data
  const [todayRecord, setTodayRecord] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [historyRecords, setHistoryRecords] = useState([]);

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Load user list and active user
  const loadUsersAndSelf = async (userIdToSelect) => {
    try {
      const usersRes = await api.getUsers();
      setUsersList(usersRes.users || []);

      const activeId = userIdToSelect || getCurrentUserId();
      setCurrentUserId(activeId);

      const meRes = await api.getCurrentUser();
      setCurrentUser(meRes.user ? { ...meRes.user, employee: meRes.employee } : null);
      
      // Load attendance data for this user
      await loadEmployeeData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load employee attendance data (Today + Weekly + History)
  const loadEmployeeData = async () => {
    try {
      const [todayRes, weeklyRes, historyRes] = await Promise.all([
        api.getTodayStatus(),
        api.getWeeklySummary(),
        api.getMyHistory({ limit: 50 })
      ]);

      setTodayRecord(todayRes.record || null);
      setWeeklyData(weeklyRes);
      setHistoryRecords(historyRes.records || []);
    } catch (err) {
      console.error('Failed to load employee attendance data:', err);
    }
  };

  useEffect(() => {
    loadUsersAndSelf();
  }, []);

  // Handle switching personas
  const handleUserChange = async (newUserId) => {
    setLoading(true);
    await loadUsersAndSelf(newUserId);
    showToast(`Switched persona to ${usersList.find(u => u.id === newUserId)?.name}`, 'info');
  };

  // Handle punch event success (clock-in or clock-out)
  const handlePunchSuccess = async () => {
    await loadEmployeeData();
  };

  return (
    <div className="app-layout">
      {/* Toast Notification Container */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.type === 'success' && <CheckCircle size={18} />}
            {t.type === 'error' && <AlertCircle size={18} />}
            {t.type === 'info' && <Info size={18} />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <Navbar
        currentUser={currentUser}
        usersList={usersList}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onUserChange={handleUserChange}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: '#9ca3af' }}>
            <p>Initializing Dayflow Attendance Module...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: EMPLOYEE MY ATTENDANCE */}
            {activeTab === 'employee' && (
              <div>
                <div className="page-header">
                  <div className="header-title-group">
                    <h1>My Attendance Hub</h1>
                    <p>Welcome back, {currentUser?.name}. Manage daily shifts, review weekly hours, and view historical attendance logs.</p>
                  </div>
                </div>

                {/* 1. Live Punch Widget */}
                <PunchWidget
                  todayRecord={todayRecord}
                  onPunchSuccess={handlePunchSuccess}
                  showToast={showToast}
                />

                {/* 2. Weekly Table & Hours Breakdown */}
                <WeeklyView weeklyData={weeklyData} />

                {/* 3. Monthly Calendar Matrix */}
                <CalendarView records={historyRecords} />

                {/* 4. Full Attendance History Log */}
                <HistoryTable
                  records={historyRecords}
                  onRefresh={loadEmployeeData}
                />
              </div>
            )}

            {/* TAB 2: ADMIN ATTENDANCE MONITOR */}
            {activeTab === 'admin' && (
              <AdminMonitor showToast={showToast} />
            )}

            {/* TAB 3: WORKFORCE ATTENDANCE ANALYTICS */}
            {activeTab === 'analytics' && (
              <AnalyticsView showToast={showToast} />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
