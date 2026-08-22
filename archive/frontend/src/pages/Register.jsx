/**
 * Register — Dayflow Employee Account Registration
 *
 * Route: /register
 * Specs:
 *   - Employee ID, Email, Password with live strength checklist (ticks green as met)
 *   - Role selector (segmented control: Employee / HR Admin)
 *   - Inline field validation on blur
 *   - Submit button with loading state
 *   - Link back to Login screen
 */
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, X, UserPlus, Eye, EyeOff, AlertCircle, Shield } from 'lucide-react'
import { clsx } from 'clsx'

export default function Register() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    employee_id: '',
    email: '',
    username: '',
    password: '',
    role: 'employee',
  })

  const [touched, setTouched] = useState({})
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  // Password strength checklist rules
  const pwChecks = {
    length: form.password.length >= 8,
    uppercase: /[A-Z]/.test(form.password),
    number: /[0-9]/.test(form.password),
    special: /[^A-Za-z0-9]/.test(form.password),
  }

  const allPwMet = Object.values(pwChecks).every(Boolean)

  const getErrors = () => {
    const errs = {}
    if (!form.employee_id.trim()) {
      errs.employee_id = 'Employee ID is required (e.g. EMP001)'
    }
    if (!form.email.trim()) {
      errs.email = 'Work email is required'
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errs.email = 'Please enter a valid email address'
    }
    if (!form.username.trim()) {
      errs.username = 'Username is required'
    }
    if (!form.password) {
      errs.password = 'Password is required'
    } else if (!allPwMet) {
      errs.password = 'Password does not meet all security requirements'
    }
    return errs
  }

  const errors = getErrors()

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (serverError) setServerError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({ employee_id: true, email: true, username: true, password: true })
    if (Object.keys(errors).length > 0) return

    setLoading(true)
    setServerError('')

    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.username,
          email: form.email,
          password: form.password,
          role: form.role,
          department: 'Engineering'
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      if (data.token) {
        localStorage.setItem('auth_token', data.token)
      }
      navigate('/login', { replace: true, state: { message: 'Registration successful! Please log in.' } })
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please try again or contact your HR Administrator.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col justify-between p-4 sm:p-6 font-sans">
      {/* Top Brand header */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between py-2">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-btn bg-primary-700 flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg select-none">D</span>
          </div>
          <div>
            <span className="text-lg font-bold text-primary-900 leading-none block">Dayflow</span>
            <span className="text-[11px] text-text-secondary leading-none font-medium">HRMS Platform</span>
          </div>
        </Link>
      </div>

      {/* Main Form Container */}
      <div className="w-full max-w-lg mx-auto my-auto py-4 animate-scale-in">
        <div className="bg-bg-surface rounded-modal border border-border shadow-lg p-6 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="text-h2 text-primary-900 mb-1">Create Account</h1>
            <p className="text-caption text-text-secondary">
              Register your staff or HR profile on Dayflow
            </p>
          </div>

          {serverError && (
            <div className="flex items-start gap-2.5 bg-danger/10 border border-danger/20 text-danger rounded-input px-3.5 py-2.5 mb-5 text-xs font-medium animate-fade-in">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Segmented Control for Role Selection */}
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1.5">
                Account Role <span className="text-danger">*</span>
              </label>
              <div className="grid grid-cols-2 p-1 bg-bg-primary rounded-input border border-border">
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, role: 'employee' }))}
                  className={clsx(
                    'py-2 text-xs font-semibold rounded-btn transition-all duration-200 flex items-center justify-center gap-1.5',
                    form.role === 'employee'
                      ? 'bg-bg-surface text-primary-700 shadow-sm border border-border'
                      : 'text-text-secondary hover:text-text-primary'
                  )}
                >
                  <UserPlus size={14} />
                  Employee
                </button>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, role: 'admin' }))}
                  className={clsx(
                    'py-2 text-xs font-semibold rounded-btn transition-all duration-200 flex items-center justify-center gap-1.5',
                    form.role === 'admin'
                      ? 'bg-bg-surface text-primary-700 shadow-sm border border-border'
                      : 'text-text-secondary hover:text-text-primary'
                  )}
                >
                  <Shield size={14} />
                  HR Administrator
                </button>
              </div>
            </div>

            {/* Grid row: Employee ID & Username */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="employee_id" className="block text-xs font-semibold text-text-primary mb-1">
                  Employee ID <span className="text-danger">*</span>
                </label>
                <input
                  id="employee_id"
                  name="employee_id"
                  type="text"
                  value={form.employee_id}
                  onChange={handleChange}
                  onBlur={() => handleBlur('employee_id')}
                  placeholder="e.g. EMP042"
                  className={clsx(
                    'w-full px-3.5 py-2.5 rounded-input border bg-bg-primary text-text-primary placeholder:text-text-secondary text-sm',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-bg-surface transition-all',
                    touched.employee_id && errors.employee_id ? 'border-danger focus:ring-danger' : 'border-border'
                  )}
                />
                {touched.employee_id && errors.employee_id && (
                  <p className="text-xs text-danger font-medium mt-1">{errors.employee_id}</p>
                )}
              </div>

              <div>
                <label htmlFor="username" className="block text-xs font-semibold text-text-primary mb-1">
                  Username <span className="text-danger">*</span>
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={form.username}
                  onChange={handleChange}
                  onBlur={() => handleBlur('username')}
                  placeholder="e.g. arjun_sharma"
                  className={clsx(
                    'w-full px-3.5 py-2.5 rounded-input border bg-bg-primary text-text-primary placeholder:text-text-secondary text-sm',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-bg-surface transition-all',
                    touched.username && errors.username ? 'border-danger focus:ring-danger' : 'border-border'
                  )}
                />
                {touched.username && errors.username && (
                  <p className="text-xs text-danger font-medium mt-1">{errors.username}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-text-primary mb-1">
                Work Email Address <span className="text-danger">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
                placeholder="arjun@company.com"
                className={clsx(
                  'w-full px-3.5 py-2.5 rounded-input border bg-bg-primary text-text-primary placeholder:text-text-secondary text-sm',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-bg-surface transition-all',
                  touched.email && errors.email ? 'border-danger focus:ring-danger' : 'border-border'
                )}
              />
              {touched.email && errors.email && (
                <p className="text-xs text-danger font-medium mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-text-primary mb-1">
                Password <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur('password')}
                  placeholder="Create a strong password"
                  className={clsx(
                    'w-full pl-3.5 pr-10 py-2.5 rounded-input border bg-bg-primary text-text-primary placeholder:text-text-secondary text-sm',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-bg-surface transition-all',
                    touched.password && errors.password ? 'border-danger focus:ring-danger' : 'border-border'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors p-1"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password Requirements Checklist */}
              <div className="mt-2.5 p-3 rounded-input bg-bg-primary border border-border space-y-1.5">
                <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1">
                  Password Requirements
                </p>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                  <div className={clsx('flex items-center gap-1.5', pwChecks.length ? 'text-success font-medium' : 'text-text-secondary')}>
                    {pwChecks.length ? <Check size={14} className="shrink-0" /> : <X size={14} className="shrink-0 text-slate-300" />}
                    <span>At least 8 characters</span>
                  </div>
                  <div className={clsx('flex items-center gap-1.5', pwChecks.uppercase ? 'text-success font-medium' : 'text-text-secondary')}>
                    {pwChecks.uppercase ? <Check size={14} className="shrink-0" /> : <X size={14} className="shrink-0 text-slate-300" />}
                    <span>1 uppercase letter</span>
                  </div>
                  <div className={clsx('flex items-center gap-1.5', pwChecks.number ? 'text-success font-medium' : 'text-text-secondary')}>
                    {pwChecks.number ? <Check size={14} className="shrink-0" /> : <X size={14} className="shrink-0 text-slate-300" />}
                    <span>1 number (0-9)</span>
                  </div>
                  <div className={clsx('flex items-center gap-1.5', pwChecks.special ? 'text-success font-medium' : 'text-text-secondary')}>
                    {pwChecks.special ? <Check size={14} className="shrink-0" /> : <X size={14} className="shrink-0 text-slate-300" />}
                    <span>1 special character</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className={clsx(
                'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-btn',
                'bg-primary-700 hover:bg-primary-900 active:bg-primary-900 text-white font-semibold text-sm',
                'transition-all duration-200 shadow-sm hover:shadow-md mt-4',
                'disabled:opacity-60 disabled:cursor-not-allowed'
              )}
            >
              <UserPlus size={16} />
              {loading ? 'Creating Account…' : 'Register Account'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-border text-center text-xs text-text-secondary">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-primary-700 hover:text-primary-900 hover:underline">
              Sign in to your account
            </Link>
          </div>
        </div>
      </div>

      <div className="text-center py-2 text-xs text-text-secondary">
        Dayflow HRMS · Every workday, perfectly aligned.
      </div>
    </div>
  )
}
