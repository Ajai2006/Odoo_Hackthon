'use client';

import React, { useState, useEffect } from 'react';
import { Employee, LeaveRequest, LeaveBalances } from '../types';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import LeaveBalanceCards from '../components/LeaveBalanceCards';
import LeaveApplyForm from '../components/LeaveApplyForm';
import LeaveHistoryTable from '../components/LeaveHistoryTable';
import AdminApprovalQueue from '../components/AdminApprovalQueue';
import AttendanceCalendar from '../components/AttendanceCalendar';
import ConflictRadar from '../components/ConflictRadar';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function DayflowLeaveDashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentPersona, setCurrentPersona] = useState<Employee | null>(null);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'employee' | 'admin' | 'calendar' | 'radar'>('employee');

  // Employee Data
  const [myLeaves, setMyLeaves] = useState<LeaveRequest[]>([]);
  const [myBalances, setMyBalances] = useState<LeaveBalances | undefined>(undefined);
  const [employeeLoading, setEmployeeLoading] = useState<boolean>(false);

  // Admin Data
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([]);
  const [allLeaves, setAllLeaves] = useState<LeaveRequest[]>([]);
  const [adminLoading, setAdminLoading] = useState<boolean>(false);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // 1. Initial Load: Fetch all employees
  useEffect(() => {
    fetch('/api/employees')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.employees.length > 0) {
          setEmployees(data.employees);
          // Default to Sarah Chen (Employee)
          setCurrentPersona(data.employees[0]);
        }
      })
      .catch((err) => console.error('Failed to load employees', err));
  }, []);

  // 2. Fetch Employee specific data
  const fetchEmployeeData = async (empId: number) => {
    setEmployeeLoading(true);
    try {
      const res = await fetch(`/api/leaves/my?employeeId=${empId}`);
      const data = await res.json();
      if (data.success) {
        setMyLeaves(data.leaves);
        setMyBalances(data.balances);
      }
    } catch (err) {
      console.error('Failed to fetch employee leaves', err);
    } finally {
      setEmployeeLoading(false);
    }
  };

  // 3. Fetch Admin specific data & all leaves for radar
  const fetchAdminData = async () => {
    setAdminLoading(true);
    try {
      const [pendingRes, allRes] = await Promise.all([
        fetch('/api/leaves/pending'),
        fetch('/api/leaves'),
      ]);
      const pendingData = await pendingRes.json();
      const allData = await allRes.json();

      if (pendingData.success) {
        setPendingLeaves(pendingData.leaves);
      }
      if (allData.success) {
        setAllLeaves(allData.leaves);
      }
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    if (currentPersona) {
      fetchEmployeeData(currentPersona.id);
    }
    fetchAdminData();
  }, [currentPersona]);

  const handleSelectPersona = (emp: Employee, isAdmin: boolean) => {
    setCurrentPersona(emp);
    setIsAdminMode(isAdmin);
    if (isAdmin) {
      setActiveTab('admin');
      showToast(`Switched persona: ${emp.name} (HR Admin Mode)`, 'info');
    } else {
      setActiveTab('employee');
      showToast(`Switched persona: ${emp.name} (Employee Mode)`, 'info');
    }
  };

  const handleLeaveApplied = () => {
    if (currentPersona) {
      fetchEmployeeData(currentPersona.id);
    }
    fetchAdminData();
    showToast('Leave request submitted successfully. Status: Pending review.');
  };

  const handleLeaveReviewed = (updated: LeaveRequest) => {
    if (currentPersona) {
      fetchEmployeeData(currentPersona.id);
    }
    fetchAdminData();
    showToast(
      `Leave request #${updated.id} ${updated.status}. Attendance calendar updated!`,
      'success'
    );
  };

  return (
    <div className="app-shell">
      {/* Persistent Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isAdminMode={isAdminMode}
        pendingCount={pendingLeaves.length}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        {/* Top Bar with search, notifications, persona switcher */}
        <TopBar
          employees={employees}
          currentPersona={currentPersona}
          isAdminMode={isAdminMode}
          onSelectPersona={handleSelectPersona}
          pendingCount={pendingLeaves.length}
        />

        {/* Page Container */}
        <main className="page-container">
          {/* Toast Notification */}
          {toast && (
            <div className="toast-bar">
              <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
              <span>{toast.message}</span>
            </div>
          )}

          {/* Context Banner */}
          {currentPersona && (
            <div className="hero-context-card">
              <div className="hero-left">
                <img
                  src={currentPersona.avatar_url}
                  alt={currentPersona.name}
                  className="hero-avatar"
                />
                <div>
                  <h2>{currentPersona.name}</h2>
                  <p className="text-caption">
                    {currentPersona.role} • <strong style={{ color: 'var(--primary-700)' }}>{currentPersona.department}</strong> Team • {currentPersona.email}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '24px' }}>
                <div style={{ textAlign: 'right' }}>
                  <span className="text-label">Active Role</span>
                  <p style={{ fontWeight: 600, color: 'var(--primary-900)', fontSize: '14px' }}>
                    {isAdminMode ? '🛡️ HR Administrator' : '👤 Employee Self-Service'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: EMPLOYEE SELF-SERVICE */}
          {activeTab === 'employee' && currentPersona && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Leave Balance Summary Row */}
              <LeaveBalanceCards balances={myBalances} />

              {/* Application Form + Leave History */}
              <div className="employee-layout-grid">
                <LeaveApplyForm
                  employeeId={currentPersona.id}
                  employeeName={currentPersona.name}
                  department={currentPersona.department}
                  balances={myBalances}
                  onSuccess={handleLeaveApplied}
                />

                <LeaveHistoryTable
                  leaves={myLeaves}
                  loading={employeeLoading}
                  onApplyClick={() => {
                    const el = document.getElementById('applyStartDate');
                    if (el) el.focus();
                  }}
                />
              </div>
            </div>
          )}

          {/* TAB 2: ADMIN APPROVAL QUEUE */}
          {activeTab === 'admin' && (
            <div>
              <AdminApprovalQueue
                pendingLeaves={pendingLeaves}
                allLeaves={allLeaves}
                adminId={currentPersona?.id || 6}
                loading={adminLoading}
                onLeaveReviewed={handleLeaveReviewed}
                refreshLeaves={fetchAdminData}
              />
            </div>
          )}

          {/* TAB 3: ATTENDANCE CALENDAR (Member 2 Sync) */}
          {activeTab === 'calendar' && (
            <div>
              <AttendanceCalendar
                currentEmployee={currentPersona || undefined}
                allEmployees={employees}
              />
            </div>
          )}

          {/* TAB 4: SMART CONFLICT RADAR */}
          {activeTab === 'radar' && (
            <div>
              <ConflictRadar allLeaves={allLeaves} employees={employees} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
