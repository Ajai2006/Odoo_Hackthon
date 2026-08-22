import React, { useState, useEffect } from 'react';
import {
  Clock, Shield, Users, UserCheck, ArrowRight, Sparkles,
  Building2, Briefcase, CheckCircle2, Lock, KeyRound, RefreshCw, Eye, EyeOff, AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

// Generate a random 4-character alphanumeric captcha code
function generateCaptchaCode() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function LoginPortal({ usersList, onSelectUser, onLoginSuccess }) {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [captchaCode, setCaptchaCode]   = useState(generateCaptchaCode());
  const [captchaInput, setCaptchaInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [selectedRoleTab, setSelectedRoleTab] = useState('login'); // 'login' | 'personas'

  const refreshCaptcha = () => {
    setCaptchaCode(generateCaptchaCode());
    setCaptchaInput('');
  };

  const handleAutofill = (demoUser) => {
    setEmail(demoUser.email);
    setPassword('Password123!');
    setCaptchaInput(captchaCode);
    setError('');
  };

  const handleCredentialSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both your work email address and password.');
      return;
    }

    if (captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setError('Incorrect Captcha code. Please enter the characters shown in the security box.');
      refreshCaptcha();
      return;
    }

    setLoading(true);
    try {
      const res = await api.loginCredentials(email.trim(), password);
      if (res.user) {
        if (onLoginSuccess) {
          onLoginSuccess(res.user);
        } else if (onSelectUser) {
          onSelectUser(res.user.id);
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
      refreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-portal-container">
      {/* Background ambient accents */}
      <div className="login-ambient-blur blur-1" />
      <div className="login-ambient-blur blur-2" />

      <div className="login-card-wrapper">
        {/* Brand Header */}
        <div className="login-brand-header">
          <div className="login-logo-badge">
            <Clock size={28} />
          </div>
          <h1>Dayflow HRMS</h1>
          <p className="login-subtitle">Enterprise Attendance, Payroll & Workforce Management Platform</p>
        </div>

        {/* Navigation Mode Switcher */}
        <div className="login-role-tabs" style={{ marginBottom: '1.25rem' }}>
          <button
            className={`login-role-tab ${selectedRoleTab === 'login' ? 'active' : ''}`}
            onClick={() => setSelectedRoleTab('login')}
          >
            <Lock size={14} /> Secure Login
          </button>
          <button
            className={`login-role-tab ${selectedRoleTab === 'personas' ? 'active' : ''}`}
            onClick={() => setSelectedRoleTab('personas')}
          >
            <Users size={14} /> Quick Persona Switcher ({usersList.length})
          </button>
        </div>

        {/* MODE 1: CREDENTIALS + CAPTCHA LOGIN */}
        {selectedRoleTab === 'login' ? (
          <div className="login-form-card" style={{ background: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--radius-modal)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)' }}>
            
            {/* Quick Demo Autofill Chips */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                Quick Demo Autofill
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => handleAutofill({ email: 'sarah.jenkins@dayflow.io', name: 'Sarah Jenkins' })}
                  className="role-pill badge-admin"
                  style={{ cursor: 'pointer', border: 'none', padding: '4px 10px', fontSize: '11px' }}
                >
                  🛡️ Admin (Sarah Jenkins)
                </button>
                <button
                  type="button"
                  onClick={() => handleAutofill({ email: 'marcus.vance@dayflow.io', name: 'Marcus Vance' })}
                  className="role-pill badge-manager"
                  style={{ cursor: 'pointer', border: 'none', padding: '4px 10px', fontSize: '11px' }}
                >
                  👔 Manager (Marcus Vance)
                </button>
                <button
                  type="button"
                  onClick={() => handleAutofill({ email: 'alex.chen@dayflow.io', name: 'Alex Chen' })}
                  className="role-pill badge-employee"
                  style={{ cursor: 'pointer', border: 'none', padding: '4px 10px', fontSize: '11px' }}
                >
                  💻 Employee (Alex Chen)
                </button>
              </div>
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#dc2626', padding: '0.75rem', borderRadius: 'var(--radius-input)', fontSize: '12px', fontWeight: 500, marginBottom: '1.25rem' }}>
                <AlertCircle size={16} style={{ shrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCredentialSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Work Email Field */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  Work Email Address <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. sarah.jenkins@dayflow.io"
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-input)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
                />
              </div>

              {/* Password Field */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  Password <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter account password"
                    style={{ width: '100%', padding: '0.65rem 2.5rem 0.65rem 0.85rem', borderRadius: 'var(--radius-input)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Visual Captcha Security Section */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  Security Verification (Captcha) <span style={{ color: '#dc2626' }}>*</span>
                </label>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  {/* Styled Captcha Display Badge */}
                  <div style={{
                    padding: '0.5rem 1.25rem',
                    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                    color: '#38bdf8',
                    fontFamily: 'monospace',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    letterSpacing: '6px',
                    borderRadius: 'var(--radius-input)',
                    userSelect: 'none',
                    fontStyle: 'italic',
                    textDecoration: 'line-through',
                    boxShadow: 'inset 0 0 8px rgba(56, 189, 248, 0.3)',
                    border: '1px solid rgba(56, 189, 248, 0.4)'
                  }}>
                    {captchaCode}
                  </div>

                  <button
                    type="button"
                    onClick={refreshCaptcha}
                    title="Refresh Captcha Code"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-btn)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-secondary)', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    <RefreshCw size={14} /> Refresh
                  </button>
                </div>

                <input
                  type="text"
                  required
                  maxLength={4}
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  placeholder="Enter 4-character code shown above"
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-input)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  marginTop: '0.5rem',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-btn)',
                  background: 'var(--primary-700)',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '14px',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease',
                  opacity: loading ? 0.7 : 1
                }}
              >
                <Lock size={16} />
                {loading ? 'Authenticating Credentials…' : 'Sign In to Portal'}
              </button>
            </form>
          </div>
        ) : (
          /* MODE 2: QUICK PERSONA SELECTOR GRID */
          <>
            <div className="login-rbac-banner">
              <div className="rbac-tier">
                <span className="badge-admin">Admin</span>
                <span>Full company monitor, all departments, workforce analytics & records</span>
              </div>
              <div className="rbac-tier">
                <span className="badge-manager">Manager</span>
                <span>Department-level team monitor (Design), team analytics, self punch</span>
              </div>
              <div className="rbac-tier">
                <span className="badge-employee">Employee</span>
                <span>Personal punch in/out, shift tracker, weekly targets & personal history</span>
              </div>
            </div>

            <div className="login-users-grid">
              {usersList.map(user => {
                const roleBadgeClass = user.role === 'admin' 
                  ? 'badge-admin' 
                  : user.role === 'manager' 
                    ? 'badge-manager' 
                    : 'badge-employee';

                return (
                  <div
                    key={user.id}
                    className={`login-user-card ${user.role}`}
                    onClick={() => {
                      setEmail(user.email);
                      setPassword('Password123!');
                      setSelectedRoleTab('login');
                      setCaptchaInput(captchaCode);
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="user-card-top">
                      <div className="user-card-avatar-wrap">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="user-card-avatar" />
                        ) : (
                          <div className="user-card-avatar fallback">{user.name?.[0]}</div>
                        )}
                        <span className={`status-indicator ${user.role}`} />
                      </div>
                      <div className="user-card-info">
                        <div className="user-card-name">{user.name}</div>
                        <div className="user-card-designation">{user.designation || 'Staff Member'}</div>
                        <div className="user-card-dept">
                          <Building2 size={12} /> {user.department || 'Dayflow Staff'}
                        </div>
                      </div>
                    </div>

                    <div className="user-card-bottom">
                      <span className={`role-pill ${roleBadgeClass}`}>
                        {user.role.toUpperCase()}
                      </span>
                      <button className="login-action-btn">
                        <span>Select Account</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Security Notice */}
        <div className="login-footer-notice" style={{ marginTop: '1.25rem' }}>
          <Lock size={13} />
          <span>Role-Based Access Control (RBAC) & Captcha security enforced via Express & SQLite backend.</span>
        </div>
      </div>
    </div>
  );
}

export default LoginPortal;
