/**
 * NotFound — 404 & Auth Guard Redirect Screen
 *
 * Route: * (catch-all)
 */
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FileQuestion, ArrowLeft, Home, LayoutDashboard } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function NotFound() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const destination = user ? (user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard') : '/'

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="bg-bg-surface rounded-modal border border-border shadow-lg p-8 max-w-md w-full animate-scale-in">
        <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-700 mx-auto flex items-center justify-center mb-5 shadow-sm">
          <FileQuestion size={32} />
        </div>

        <span className="px-3 py-1 text-xs font-bold bg-primary-100 text-primary-700 rounded-full inline-block mb-3">
          Error 404
        </span>

        <h1 className="text-h2 text-primary-900 mb-2">Page Not Found</h1>
        <p className="text-caption text-text-secondary mb-8 leading-relaxed">
          The screen or resource you are looking for doesn't exist, has been moved, or requires higher access permissions.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2.5 rounded-btn border border-border text-text-primary text-xs font-semibold hover:bg-bg-primary flex items-center justify-center gap-1.5 transition-colors"
          >
            <ArrowLeft size={15} />
            Go Back
          </button>

          <Link
            to={destination}
            className="px-5 py-2.5 rounded-btn bg-primary-700 hover:bg-primary-900 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            {user ? <LayoutDashboard size={15} /> : <Home size={15} />}
            {user ? 'Return to Dashboard' : 'Return to Homepage'}
          </Link>
        </div>
      </div>

      <div className="mt-8 text-xs text-text-secondary">
        Dayflow HRMS · Every workday, perfectly aligned.
      </div>
    </div>
  )
}
