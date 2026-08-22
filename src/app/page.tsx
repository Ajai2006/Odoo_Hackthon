'use client';

import React, { useState, useEffect } from 'react';
import { Employee, LeaveRequest, LeaveBalances } from '../types';
import PersonaSwitcher from '../components/PersonaSwitcher';
import LeaveBalanceCards from '../components/LeaveBalanceCards';
import LeaveApplyForm from '../components/LeaveApplyForm';
import LeaveHistoryTable from '../components/LeaveHistoryTable';
import AdminApprovalQueue from '../components/AdminApprovalQueue';
import AttendanceCalendar from '../components/AttendanceCalendar';
import ConflictRadar from '../components/ConflictRadar';
import {
  CalendarDays,
  ShieldAlert,
  ClipboardList,
  Flame,
  CheckCircle2,
  Users,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';

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
    setTimeout(() => setToast(null), 5000);
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
      showToast(`Switched to ${emp.name} (Admin Mode)`, 'info');
    } else {
      setActiveTab('employee');
      showToast(`Switched to ${emp.name} (Employee Self-Service)`, 'info');
    }
  };

  const handleLeaveApplied = () => {
    if (currentPersona) {
      fetchEmployeeData(currentPersona.id);
    }
    fetchAdminData();
    showToast('🎉 Leave application submitted successfully! Status: Pending review.');
  };

  const handleLeaveReviewed = (updated: LeaveRequest) => {
    if (currentPersona) {
      fetchEmployeeData(currentPersona.id);
    }
    fetchAdminData();
    showToast(
      `✅ Leave request #${updated.id} has been ${updated.status}. Attendance calendar updated!`,
      'success'
    );
  };

  const urgentPendingCount = pendingLeaves.filter((l) => l.sla?.urgency === 'urgent').length;

  return (
    <div className="app-container">
      {/* Top Header Navbar */}
      <header className="top-navbar">
        <div className="nav-wrapper">
          {/* Brand Logo & Name */}
          <div className="brand-group">
            <div className="brand-logo-box">
              <Layers size={22} />
            </div>
            <div className="brand-title-wrap">
              <h1 className="brand-title">DAYFLOW HRMS</h1>
              <span className="brand-tag">Leave Management & Attendance Sync</span>
            </div>
          </div>

          {/* Persona Switcher */}
          <PersonaSwitcher
            employees={employees}
            currentPersona={currentPersona}
            isAdminMode={isAdminMode}
            onSelectPersona={handleSelectPersona}
            pendingCount={pendingLeaves.length}
          />
        </div>
      </header>

      {/* Main Container */}
      <main className="main-content">
        {/* Toast Notification */}
        {toast && (
          <div
            className={`alert-banner ${
              toast.type === 'success' ? 'alert-success' : 'alert-error'
            }`}
          >
            <CheckCircle2 size={18} />
            <span>{toast.message}</span>
          </div>
        )}

        {/* Current Active Persona Banner */}
        {currentPersona && (
          <div className="persona-banner">
            <div className="banner-left">
              <img
                src={currentPersona.avatar_url}
                alt={currentPersona.name}
                className="banner-avatar"
              />
              <div>
                <h2 className="banner-name">{currentPersona.name}</h2>
                <p className="banner-role-sub">
                  {currentPersona.role} • <strong>{currentPersona.department}</strong> Team • {currentPersona.email}
                </p>
              </div>
            </div>

            <div className="banner-stats-row">
              {isAdminMode ? (
                <>
                  <div className="banner-stat-box">
                    <span className="banner-stat-num">{pendingLeaves.length}</span>
                    <span className="banner-stat-label">Pending Queue</span>
                  </div>
                  {urgentPendingCount > 0 && (
                    <div className="banner-stat-box">
                      <span className="banner-stat-num text-warning">{urgentPendingCount}</span>
                      <span className="banner-stat-label">Urgent SLA Breaches</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="banner-stat-box">
                    <span className="banner-stat-num">{myBalances?.paid.remaining || 0}d</span>
                    <span className="banner-stat-label">Paid Balance</span>
                  </div>
                  <div className="banner-stat-box">
                    <span className="banner-stat-num">{myBalances?.sick.remaining || 0}d</span>
                    <span className="banner-stat-label">Sick Balance</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* View Navigation Tabs */}
        <div className="view-tabs-bar">
          <button
            className={`view-tab-btn ${activeTab === 'employee' ? 'active' : ''}`}
            onClick={() => setActiveTab('employee')}
          >
            <ClipboardList size={16} />
            <span>Employee Self-Service</span>
          </button>

          <button
            className={`view-tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            <ShieldAlert size={16} />
            <span>Admin Approvals</span>
            {pendingLeaves.length > 0 && (
              <span className="tab-badge">{pendingLeaves.length}</span>
            )}
          </button>

          <button
            className={`view-tab-btn ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveTab('calendar')}
          >
            <CalendarDays size={16} />
            <span>Attendance Calendar</span>
          </button>

          <button
            className={`view-tab-btn ${activeTab === 'radar' ? 'active' : ''}`}
            onClick={() => setActiveTab('radar')}
          >
            <Sparkles size={16} />
            <span>Conflict & Coverage Radar</span>
          </button>
        </div>

        {/* TAB 1: EMPLOYEE SELF-SERVICE */}
        {activeTab === 'employee' && currentPersona && (
          <div className="tab-pane">
            {/* Live Balance Cards */}
            <LeaveBalanceCards balances={myBalances} />

            {/* Application Form + Leave History */}
            <div className="employee-view-grid mt-4">
              <LeaveApplyForm
                employeeId={currentPersona.id}
                employeeName={currentPersona.name}
                department={currentPersona.department}
                balances={myBalances}
                onSuccess={handleLeaveApplied}
              />

              <LeaveHistoryTable leaves={myLeaves} loading={employeeLoading} />
            </div>
          </div>
        )}

        {/* TAB 2: ADMIN APPROVAL QUEUE */}
        {activeTab === 'admin' && (
          <div className="tab-pane">
            <AdminApprovalQueue
              pendingLeaves={pendingLeaves}
              adminId={currentPersona?.id || 6}
              onLeaveReviewed={handleLeaveReviewed}
              refreshLeaves={fetchAdminData}
            />
          </div>
        )}

        {/* TAB 3: ATTENDANCE CALENDAR (Member 2 Sync) */}
        {activeTab === 'calendar' && (
          <div className="tab-pane">
            <AttendanceCalendar
              currentEmployee={currentPersona || undefined}
              allEmployees={employees}
            />
          </div>
        )}

        {/* TAB 4: SMART CONFLICT RADAR */}
        {activeTab === 'radar' && (
          <div className="tab-pane">
            <ConflictRadar allLeaves={allLeaves} employees={employees} />
          </div>
        )}
      </main>
    </div>
  );
}
