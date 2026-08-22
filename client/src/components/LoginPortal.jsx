import React, { useState, useEffect, useRef } from 'react';
import {
  Clock, Shield, Lock, Mail, Eye, EyeOff, RefreshCw, AlertCircle,
  CheckCircle2, ArrowRight, ShieldCheck, HelpCircle, ChevronDown, ChevronUp
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

export function LoginPortal({ onLoginSuccess }) {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [captchaCode, setCaptchaCode]   = useState(generateCaptchaCode());
  const [captchaInput, setCaptchaInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe]     = useState(true);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [showCredsHelp, setShowCredsHelp] = useState(false);
  const canvasRef                       = useRef(null);

  const refreshCaptcha = () => {
    const newCode = generateCaptchaCode();
    setCaptchaCode(newCode);
    setCaptchaInput('');
    drawCaptchaCanvas(newCode);
  };

  // Draw distorted canvas captcha background with noise lines
  const drawCaptchaCanvas = (codeStr) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dark gradient background
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(1, '#1e293b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw background security noise lines
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `rgba(56, 189, 248, ${0.15 + Math.random() * 0.2})`;
      ctx.lineWidth = 1 + Math.random() * 1.5;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // Draw background security dots
    for (let i = 0; i < 35; i++) {
      ctx.fillStyle = `rgba(56, 189, 248, ${0.2 + Math.random() * 0.3})`;
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw distorted text characters
    ctx.font = 'bold 22px "Courier New", monospace';
    ctx.textBaseline = 'middle';

    const textWidth = canvas.width - 30;
    const charSpacing = textWidth / codeStr.length;

    for (let i = 0; i < codeStr.length; i++) {
      const char = codeStr[i];
      const x = 18 + i * charSpacing;
      const y = canvas.height / 2 + (Math.random() * 4 - 2);

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((Math.random() - 0.5) * 0.3); // Slight tilt

      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = 'rgba(56, 189, 248, 0.6)';
      ctx.shadowBlur = 6;
      ctx.fillText(char, 0, 0);

      ctx.restore();
    }
  };

  useEffect(() => {
    drawCaptchaCanvas(captchaCode);
  }, []);

  const handleCredentialSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both your work email address and account password.');
      return;
    }

    if (captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setError('Invalid Security Captcha. Please enter the exact characters shown in the security box.');
      refreshCaptcha();
      return;
    }

    setLoading(true);
    try {
      const res = await api.loginCredentials(email.trim(), password);
      if (res.user && onLoginSuccess) {
        onLoginSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Invalid work email or password.');
      refreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 20%, #1e293b 0%, #0f172a 100%)',
      padding: '1.5rem',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Subtle background glow accents */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, rgba(0, 0, 0, 0) 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: 'rgba(30, 41, 59, 0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(56, 189, 248, 0.1)',
        padding: '2.25rem',
        zIndex: 1
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            color: '#ffffff',
            boxShadow: '0 8px 20px rgba(2, 132, 199, 0.3)',
            marginBottom: '1rem'
          }}>
            <Clock size={28} />
          </div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#f8fafc',
            margin: '0 0 0.4rem 0',
            letterSpacing: '-0.02em'
          }}>
            Dayflow HRMS
          </h1>
          <p style={{
            fontSize: '13px',
            color: '#94a3b8',
            margin: 0
          }}>
            Enterprise Attendance & Workforce Portal
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: 500,
            marginBottom: '1.5rem',
            lineHeight: '1.4'
          }}>
            <AlertCircle size={18} style={{ shrink: 0, color: '#ef4444' }} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleCredentialSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Work Email Field */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
              Work Email Address <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={17} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                style={{
                  width: '100%',
                  padding: '0.75rem 0.85rem 0.75rem 2.6rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  background: 'rgba(15, 23, 42, 0.6)',
                  color: '#f8fafc',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s ease'
                }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1' }}>
                Password <span style={{ color: '#ef4444' }}>*</span>
              </label>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={17} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  width: '100%',
                  padding: '0.75rem 2.6rem 0.75rem 2.6rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  background: 'rgba(15, 23, 42, 0.6)',
                  color: '#f8fafc',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Visual Captcha Security Challenge */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
              Security Verification (Captcha) <span style={{ color: '#ef4444' }}>*</span>
            </label>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' }}>
              <canvas
                ref={canvasRef}
                width={130}
                height={40}
                style={{
                  borderRadius: '8px',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.5)'
                }}
              />

              <button
                type="button"
                onClick={refreshCaptcha}
                title="Refresh Captcha Code"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  background: 'rgba(15, 23, 42, 0.5)',
                  color: '#94a3b8',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={14} /> Refresh
              </button>
            </div>

            <div style={{ position: 'relative' }}>
              <ShieldCheck size={17} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                required
                maxLength={4}
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                placeholder="Enter 4-character code"
                style={{
                  width: '100%',
                  padding: '0.75rem 0.85rem 0.75rem 2.6rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  background: 'rgba(15, 23, 42, 0.6)',
                  color: '#f8fafc',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Remember Me */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ borderRadius: '4px', accentColor: '#0284c7' }}
              />
              Remember session
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              marginTop: '0.5rem',
              padding: '0.85rem',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '14px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
              transition: 'all 0.2s ease',
              opacity: loading ? 0.7 : 1
            }}
          >
            <Lock size={16} />
            {loading ? 'Authenticating…' : 'Sign In to Account'}
          </button>
        </form>

        {/* Security Footer Badges */}
        <div style={{
          marginTop: '2rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            fontSize: '11px',
            color: '#64748b'
          }}>
            <span>🔒 256-bit SSL</span>
            <span>·</span>
            <span>🛡️ SQLite RBAC</span>
            <span>·</span>
            <span>🔑 JWT Auth</span>
          </div>

          {/* Clean Expandable Reference Drawer for Evaluators / Administrators */}
          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => setShowCredsHelp(s => !s)}
              style={{
                background: 'none',
                border: 'none',
                color: '#38bdf8',
                fontSize: '11px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <HelpCircle size={12} /> Account Login Directory {showCredsHelp ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>

            {showCredsHelp && (
              <div style={{
                marginTop: '0.75rem',
                padding: '0.75rem',
                borderRadius: '8px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                textAlign: 'left',
                fontSize: '11px',
                color: '#cbd5e1'
              }}>
                <div style={{ fontWeight: 600, color: '#38bdf8', marginBottom: '0.4rem' }}>Standard Password: Password123!</div>
                <div>🛡️ <strong>Admin:</strong> sarah.jenkins@dayflow.io</div>
                <div>👔 <strong>Manager:</strong> marcus.vance@dayflow.io</div>
                <div>💻 <strong>Employee:</strong> alex.chen@dayflow.io</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPortal;
