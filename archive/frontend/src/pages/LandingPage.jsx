/**
 * LandingPage — Dayflow SaaS Landing Page
 *
 * Route: / (public)
 * Features:
 *   - Hero section with Dayflow wordmark/logo
 *   - Tagline: "Every workday, perfectly aligned."
 *   - Clear value-prop line
 *   - Primary action: Login (primary-700), Secondary action: Register (outline)
 *   - Clean feature grid & product highlights
 */
import React from 'react'
import { Link } from 'react-router-dom'
import {
  Users, Clock, Calendar, DollarSign, Shield, Zap,
  CheckCircle2, ArrowRight, Star, Lock
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col font-sans">
      {/* Header / Navbar */}
      <header className="h-20 border-b border-border bg-bg-surface sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-btn bg-primary-700 flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xl select-none">D</span>
            </div>
            <div>
              <span className="text-xl font-bold text-primary-900 leading-none block">Dayflow</span>
              <span className="text-xs text-text-secondary leading-none hidden sm:block mt-0.5 font-medium">HRMS Platform</span>
            </div>
          </div>

          {/* Navigation Actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold rounded-btn text-primary-700 border border-primary-700 hover:bg-primary-100 transition-colors shadow-sm"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-sm font-semibold rounded-btn bg-primary-700 hover:bg-primary-900 text-white transition-all shadow-sm hover:shadow-md"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center flex-1 flex flex-col items-center justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-100 border border-primary-500/20 text-primary-700 text-xs font-semibold mb-6 animate-fade-in">
          <Zap size={14} className="text-primary-500" />
          <span>Enterprise-Grade HR & Payroll Software</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-primary-900 tracking-tight leading-tight max-w-4xl mb-6">
          Every workday, <span className="text-primary-700">perfectly aligned.</span>
        </h1>

        <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mb-10 leading-relaxed">
          Unified workforce management designed for modern teams. Streamline attendance tracking, leave requests, employee profiles, and automated payroll in one trusted platform.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-16">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-3.5 rounded-btn bg-primary-700 hover:bg-primary-900 text-white font-bold text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            Get Started Free
            <ArrowRight size={18} />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-btn border-2 border-primary-700 text-primary-700 hover:bg-primary-100 font-semibold text-base flex items-center justify-center transition-colors shadow-sm"
          >
            Sign In to Dashboard
          </Link>
        </div>

        {/* Key Features Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full text-left">
          <div className="bg-bg-surface p-6 rounded-card border border-border shadow-card hover:shadow-lg transition-shadow">
            <div className="w-10 h-10 rounded-input bg-primary-100 text-primary-700 flex items-center justify-center mb-4">
              <Users size={20} />
            </div>
            <h3 className="text-base font-bold text-primary-900 mb-2">Employee Records</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Centralized staff database with role-based permissions and instant search capabilities.
            </p>
          </div>

          <div className="bg-bg-surface p-6 rounded-card border border-border shadow-card hover:shadow-lg transition-shadow">
            <div className="w-10 h-10 rounded-input bg-success/10 text-success flex items-center justify-center mb-4">
              <Clock size={20} />
            </div>
            <h3 className="text-base font-bold text-primary-900 mb-2">Attendance Tracking</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Real-time check-in logs, monthly attendance metrics, and automated tardiness reporting.
            </p>
          </div>

          <div className="bg-bg-surface p-6 rounded-card border border-border shadow-card hover:shadow-lg transition-shadow">
            <div className="w-10 h-10 rounded-input bg-info/10 text-info flex items-center justify-center mb-4">
              <Calendar size={20} />
            </div>
            <h3 className="text-base font-bold text-primary-900 mb-2">Leave Management</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Streamlined leave applications, multi-level approvals, and balance calculations.
            </p>
          </div>

          <div className="bg-bg-surface p-6 rounded-card border border-border shadow-card hover:shadow-lg transition-shadow">
            <div className="w-10 h-10 rounded-input bg-warning/10 text-warning flex items-center justify-center mb-4">
              <DollarSign size={20} />
            </div>
            <h3 className="text-base font-bold text-primary-900 mb-2">Automated Payroll</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Calculates allowances, tax, and net pay automatically with strict audit log tracking.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-900 text-slate-300 py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-btn bg-primary-700 flex items-center justify-center">
              <span className="text-white font-bold text-xs">D</span>
            </div>
            <span className="text-sm font-semibold text-white">Dayflow HRMS</span>
            <span className="text-xs text-slate-400">— Every workday, perfectly aligned.</span>
          </div>
          <p className="text-xs text-slate-400">
            © 2026 Dayflow Technologies Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
