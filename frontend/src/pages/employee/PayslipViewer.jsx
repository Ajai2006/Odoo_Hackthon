/**
 * PayslipViewer — Employee view of their monthly payslip
 * Route: /employee/payslip
 */
import React, { useState, useEffect, useCallback } from 'react'
import { FileText, ChevronLeft, ChevronRight, TrendingUp, Minus } from 'lucide-react'
import { clsx } from 'clsx'
import api from '@/services/api'
import { useAuth } from '@/contexts/AuthContext'
import { StatCard } from '@/components/ui'

const MONTHS = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function fmt(n) {
  return Number(n ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function Row({ label, value, sub = false, bold = false, separator = false }) {
  return (
    <>
      {separator && <tr><td colSpan={2}><hr className="border-border my-1" /></td></tr>}
      <tr className={clsx(bold && 'font-semibold', sub && 'text-text-secondary')}>
        <td className={clsx('py-2 pr-4', sub && 'pl-4')}>{label}</td>
        <td className="py-2 text-right tabular-nums">{value}</td>
      </tr>
    </>
  )
}

export default function PayslipViewer() {
  const { user } = useAuth()
  const today    = new Date()
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [year,  setYear]  = useState(today.getFullYear())
  const [slip,  setSlip]  = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const fetchSlip = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const { data } = await api.get('/api/payroll/my/', { params: { month, year } })
      setSlip(data[0] ?? null)
    } catch {
      setError('Could not load payslip. Please try again.')
    } finally { setLoading(false) }
  }, [month, year])

  useEffect(() => { fetchSlip() }, [fetchSlip])

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear((y) => y - 1) }
    else setMonth((m) => m - 1)
  }
  const nextMonth = () => {
    const now = new Date()
    if (year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1)) return
    if (month === 12) { setMonth(1); setYear((y) => y + 1) }
    else setMonth((m) => m + 1)
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-h2 text-primary-900">My Payslip</h1>
          <p className="text-caption text-text-secondary mt-0.5">
            {user?.first_name ? `${user.first_name} ${user.last_name ?? ''}`.trim() : user?.username}
          </p>
        </div>
        {/* Month picker */}
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-btn border border-border hover:bg-bg-primary transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-semibold text-text-primary min-w-[110px] text-center">
            {MONTHS[month]} {year}
          </span>
          <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-btn border border-border hover:bg-bg-primary transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* StatCards */}
      {slip && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard title="Gross Salary"     value={`₹ ${fmt(slip.gross_salary)}`}     icon={<TrendingUp size={18}/>} color="primary" />
          <StatCard title="Total Deductions" value={`₹ ${fmt(slip.total_deductions)}`} icon={<Minus size={18}/>}      color="danger"  />
          <StatCard title="Net Salary"       value={`₹ ${fmt(slip.net_salary)}`}        icon={<TrendingUp size={18}/>} color="success" />
        </div>
      )}

      {/* Main slip card */}
      <div className="bg-bg-surface rounded-card border border-border shadow-card overflow-hidden">
        {/* Slip header */}
        <div className="bg-primary-900 px-6 py-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 bg-primary-500 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">D</span>
              </div>
              <span className="text-white font-bold text-sm">Dayflow HRMS</span>
            </div>
            <p className="text-slate-400 text-xs">Payslip for {MONTHS[month]} {year}</p>
          </div>
          <div className="text-right">
            <p className="text-white text-sm font-semibold">
              {user?.first_name ? `${user.first_name} ${user.last_name ?? ''}`.trim() : user?.username}
            </p>
            <p className="text-slate-400 text-xs">Employee</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && (
            <div className="space-y-3">
              {Array.from({length: 8}).map((_, i) => (
                <div key={i} className="skeleton h-5 rounded" style={{width: `${50 + ((i * 13) % 40)}%`}} />
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-8 text-text-secondary">
              <FileText size={40} className="mx-auto mb-3 opacity-30" />
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && !slip && (
            <div className="text-center py-8 text-text-secondary">
              <FileText size={40} className="mx-auto mb-3 opacity-30" />
              <p>No payslip found for {MONTHS[month]} {year}.</p>
              <p className="text-xs mt-1">Contact HR if this seems incorrect.</p>
            </div>
          )}

          {!loading && slip && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Earnings */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3 pb-2 border-b border-border">
                  Earnings
                </h3>
                <table className="w-full text-sm tabular-nums">
                  <tbody>
                    <Row label="Basic Salary"        value={`₹ ${fmt(slip.base_salary)}`} />
                    <Row label="House Allowance"     value={`₹ ${fmt(slip.house_allowance)}`}     sub />
                    <Row label="Medical Allowance"   value={`₹ ${fmt(slip.medical_allowance)}`}   sub />
                    <Row label="Transport Allowance" value={`₹ ${fmt(slip.transport_allowance)}`} sub />
                    <Row label="Gross Salary"        value={`₹ ${fmt(slip.gross_salary)}`} bold separator />
                  </tbody>
                </table>
              </div>

              {/* Deductions */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3 pb-2 border-b border-border">
                  Deductions
                </h3>
                <table className="w-full text-sm tabular-nums">
                  <tbody>
                    <Row label="Tax (TDS)"       value={`₹ ${fmt(slip.tax_deduction)}`} />
                    <Row label="Provident Fund"  value={`₹ ${fmt(slip.provident_fund)}`} sub />
                    <Row label="Total Deductions" value={`₹ ${fmt(slip.total_deductions)}`} bold separator />
                  </tbody>
                </table>

                {/* Net salary box */}
                <div className="mt-6 p-4 bg-success/10 border border-success/20 rounded-input">
                  <p className="text-xs font-semibold text-success uppercase tracking-wider mb-1">Net Salary</p>
                  <p className="text-2xl font-bold text-success tabular-nums">₹ {fmt(slip.net_salary)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
