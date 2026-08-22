/**
 * Login — Dayflow Authentication Screen
 *
 * Route: /login
 * Specs:
 *   - Centered card on bg-primary background
 *   - Username/Email + Password fields with inline blur validation
 *   - Forgot password modal
 *   - Primary action button in primary-700
 *   - Non-scary inline error alert
 *   - Link to /register
 */
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Eye, EyeOff, LogIn, AlertCircle, HelpCircle } from 'lucide-react'
import { clsx } from 'clsx'
import { Modal } from '@/components/ui'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ username: '', password: '' })
  const [touched, setTouched] = useState({ username: false, password: false })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSubmitted, setForgotSubmitted] = useState(false)

  // Field validation logic
  const getErrors = () => {
    const errors = {}
    if (!form.username.trim()) {
      errors.username = 'Username or email is required'
    }
    if (!form.password) {
      errors.password = 'Password is required'
    } else if (form.password.length < 4) {
      errors.password = 'Password must be at least 4 characters'
    }
    return errors
  }

  const fieldErrors = getErrors()

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({ username: true, password: true })
    const errors = getErrors()
    if (Object.keys(errors).length > 0) return

    setError('')
    setLoading(true)
    try {
      const user = await login(form.username, form.password)
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard', { replace: true })
    } catch {
      setError('Invalid username or password. Please check your credentials and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotSubmit = (e) => {
    e.preventDefault()
    if (!forgotEmail) return
    setForgotSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col justify-between p-4 sm:p-6 font-sans">
      {/* Top Brand bar */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between py-2">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-btn bg-primary-700 flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg select-none">D</span>
          </div>
          <div>
            <span className="text-lg font-bold text-primary-900 leading-none block">Dayflow</span>
            <span className="text-[11px] text-text-secondary leading-none font-medium">HRMS</span>
          </div>
        </Link>
      </div>

      {/* Main Centered Card Container */}
      <div className="w-full max-w-md mx-auto my-auto animate-scale-in">
        <div className="bg-bg-surface rounded-modal border border-border shadow-lg p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-h2 text-primary-900 mb-1">Welcome back</h1>
            <p className="text-caption text-text-secondary">
              Sign in to your Dayflow HR account
            </p>
          </div>

          {/* Non-scary Inline Error State */}
          {error && (
            <div className="flex items-start gap-2.5 bg-danger/10 border border-danger/20 text-danger rounded-input px-3.5 py-2.5 mb-5 text-xs font-medium animate-fade-in">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Username/Email */}
            <div>
              <label htmlFor="username" className="block text-xs font-semibold text-text-primary mb-1">
                Username or Email <span className="text-danger">*</span>
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={form.username}
                onChange={handleChange}
                onBlur={() => handleBlur('username')}
                placeholder="e.g. arjun.sharma"
                className={clsx(
                  'w-full px-3.5 py-2.5 rounded-input border bg-bg-primary text-text-primary placeholder:text-text-secondary text-sm',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-bg-surface transition-all duration-200',
                  touched.username && fieldErrors.username ? 'border-danger focus:ring-danger' : 'border-border'
                )}
              />
              {touched.username && fieldErrors.username && (
                <p className="text-xs text-danger font-medium mt-1 animate-fade-in">
                  {fieldErrors.username}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-xs font-semibold text-text-primary">
                  Password <span className="text-danger">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => { setShowForgotModal(true); setForgotSubmitted(false); setForgotEmail(''); }}
                  className="text-xs font-medium text-primary-500 hover:text-primary-700 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur('password')}
                  placeholder="Enter your password"
                  className={clsx(
                    'w-full pl-3.5 pr-10 py-2.5 rounded-input border bg-bg-primary text-text-primary placeholder:text-text-secondary text-sm',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-bg-surface transition-all duration-200',
                    touched.password && fieldErrors.password ? 'border-danger focus:ring-danger' : 'border-border'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors p-1"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {touched.password && fieldErrors.password && (
                <p className="text-xs text-danger font-medium mt-1 animate-fade-in">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className={clsx(
                'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-btn',
                'bg-primary-700 hover:bg-primary-900 active:bg-primary-900 text-white font-semibold text-sm',
                'transition-all duration-200 shadow-sm hover:shadow-md mt-2',
                'disabled:opacity-60 disabled:cursor-not-allowed'
              )}
            >
              <LogIn size={16} />
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Register Link Footer */}
          <div className="mt-6 pt-4 border-t border-border text-center text-xs text-text-secondary">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-primary-700 hover:text-primary-900 hover:underline">
              Register employee account
            </Link>
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="text-center py-2 text-xs text-text-secondary">
        Dayflow HRMS · Every workday, perfectly aligned.
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        title="Reset Your Password"
        size="sm"
      >
        {forgotSubmitted ? (
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-success/10 text-success mx-auto flex items-center justify-center">
              <HelpCircle size={24} />
            </div>
            <h3 className="text-sm font-bold text-primary-900">Reset instructions sent!</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              If an account exists for <span className="font-semibold text-text-primary">{forgotEmail}</span>, HR reset instructions have been dispatched.
            </p>
            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full mt-2 py-2 rounded-btn bg-primary-700 text-white text-xs font-semibold"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleForgotSubmit} className="space-y-4 py-2">
            <p className="text-xs text-text-secondary leading-relaxed">
              Enter your registered work email address below and our HR team will send you a password reset link.
            </p>
            <div>
              <label htmlFor="forgot-email" className="block text-xs font-semibold text-text-primary mb-1">
                Work Email <span className="text-danger">*</span>
              </label>
              <input
                id="forgot-email"
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-3.5 py-2 text-sm rounded-input border border-border bg-bg-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="px-3.5 py-2 text-xs font-semibold rounded-btn border border-border text-text-secondary hover:bg-bg-primary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold rounded-btn bg-primary-700 text-white hover:bg-primary-900"
              >
                Send Link
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
