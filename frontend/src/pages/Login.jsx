import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react'
import { clsx } from 'clsx'

export default function Login() {
  const { login }  = useAuth()
  const navigate   = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPw, setShowPw]   = useState(false)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(form.username, form.password)
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard', { replace: true })
    } catch {
      setError('Invalid username or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-scale-in">
        {/* Card */}
        <div className="bg-white rounded-modal shadow-modal p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-card bg-primary-500 flex items-center justify-center mb-4 shadow-lg">
              <span className="text-white font-bold text-2xl select-none">D</span>
            </div>
            <h1 className="text-h2 text-primary-900 text-center mb-1">Welcome back</h1>
            <p className="text-caption text-text-secondary text-center">
              Every workday, perfectly aligned.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-danger/10 border border-danger/20 text-danger rounded-input px-4 py-3 mb-4 text-sm animate-fade-in">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-text-primary mb-1.5">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={form.username}
                onChange={handleChange}
                placeholder="Enter your username"
                className={clsx(
                  'w-full px-4 py-2.5 rounded-input border border-border bg-bg-primary',
                  'text-text-primary placeholder:text-text-secondary text-sm',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                  'transition-all duration-200',
                )}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={clsx(
                    'w-full px-4 py-2.5 pr-11 rounded-input border border-border bg-bg-primary',
                    'text-text-primary placeholder:text-text-secondary text-sm',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                    'transition-all duration-200',
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className={clsx(
                'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-btn',
                'bg-primary-700 hover:bg-primary-900 text-white font-semibold text-sm',
                'transition-all duration-200 shadow-sm hover:shadow-md',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                'disabled:opacity-60 disabled:cursor-not-allowed',
                loading && 'animate-pulse-soft',
              )}
            >
              <LogIn size={16} />
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-white/50 text-xs mt-6">
          Dayflow HRMS · Every workday, perfectly aligned.
        </p>
      </div>
    </div>
  )
}
