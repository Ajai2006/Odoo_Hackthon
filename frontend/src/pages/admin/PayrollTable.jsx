/**
 * PayrollTable — Admin payroll management
 * Route: /admin/payroll
 */
import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Edit2, Eye, AlertCircle, CheckCircle } from 'lucide-react'
import { clsx } from 'clsx'
import api from '@/services/api'
import { DataTable, Modal, StatusBadge } from '@/components/ui'

const MONTHS = ['','January','February','March','April','May','June',
  'July','August','September','October','November','December']

function fmt(n) {
  return Number(n ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const EMPTY_FORM = {
  employee: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(),
  base_salary: '', house_allowance: '0', medical_allowance: '0', transport_allowance: '0',
  tax_deduction: '0', provident_fund: '0', reason: '',
}

function FieldRow({ label, name, value, onChange, type = 'number', required = false, min = '0', as }) {
  return (
    <div>
      <label htmlFor={`pf-${name}`} className="block text-xs font-medium text-text-secondary mb-1">
        {label}{required && <span className="text-danger ml-0.5">*</span>}
      </label>
      {as === 'textarea' ? (
        <textarea
          id={`pf-${name}`} name={name} value={value} onChange={onChange} required={required} rows={3}
          placeholder="Describe the reason for this change…"
          className="w-full px-3 py-2 text-sm rounded-input border border-border bg-bg-primary focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
        />
      ) : (
        <input
          id={`pf-${name}`} type={type} name={name} value={value} onChange={onChange}
          required={required} min={min} step={type === 'number' ? '0.01' : undefined}
          className="w-full px-3 py-2 text-sm rounded-input border border-border bg-bg-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      )}
    </div>
  )
}

export default function PayrollTable() {
  const [records, setRecords] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalMode, setModalMode] = useState(null)   // 'create' | 'edit' | 'view'
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [formError, setFormError] = useState('')
  const [auditLogs, setAuditLogs] = useState([])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/payroll/')
      setRecords(data)
    } catch { showToast('Failed to load payroll records', 'error') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const openCreate = () => { setForm(EMPTY_FORM); setFormError(''); setModalMode('create') }

  const openEdit = async (row) => {
    setSelected(row)
    setForm({
      employee: row.employee, month: row.month, year: row.year,
      base_salary: row.base_salary, house_allowance: row.house_allowance,
      medical_allowance: row.medical_allowance, transport_allowance: row.transport_allowance,
      tax_deduction: row.tax_deduction, provident_fund: row.provident_fund, reason: '',
    })
    // Fetch audit logs
    try {
      const { data } = await api.get(`/api/payroll/${row.id}/audit/`)
      setAuditLogs(data)
    } catch { setAuditLogs([]) }
    setFormError('')
    setModalMode('edit')
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true); setFormError('')
    try {
      if (modalMode === 'create') {
        await api.post('/api/payroll/', form)
        showToast('Payroll record created successfully.')
      } else {
        await api.put(`/api/payroll/${selected.id}/`, form)
        showToast('Payroll record updated successfully.')
      }
      setModalMode(null)
      fetchAll()
    } catch (err) {
      const detail = err.response?.data
      if (typeof detail === 'object') {
        const msgs = Object.entries(detail).map(([k,v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
        setFormError(msgs.join(' | '))
      } else {
        setFormError('An error occurred. Please check the form and try again.')
      }
    } finally { setSaving(false) }
  }

  // ── Columns ────────────────────────────────────────────────
  const columns = [
    { key: 'employee_name', label: 'Employee' },
    { key: 'employee_id',   label: 'ID', sortable: false },
    { key: 'month', label: 'Month', render: (v) => MONTHS[v] },
    { key: 'year',  label: 'Year' },
    { key: 'base_salary',  label: 'Base', render: (v) => <span className="tabular-nums">₹ {fmt(v)}</span> },
    { key: 'gross_salary', label: 'Gross', render: (v) => <span className="tabular-nums font-medium">₹ {fmt(v)}</span> },
    { key: 'total_deductions', label: 'Deductions', render: (v) => <span className="tabular-nums text-danger">₹ {fmt(v)}</span> },
    { key: 'net_salary', label: 'Net Pay', render: (v) => <span className="tabular-nums font-bold text-success">₹ {fmt(v)}</span> },
  ]

  const actions = (row) => (
    <div className="flex items-center gap-1 justify-end">
      <button onClick={() => openEdit(row)} className="p-1.5 rounded-btn hover:bg-primary-500/10 text-text-secondary hover:text-primary-500 transition-colors" title="Edit">
        <Edit2 size={14} />
      </button>
    </div>
  )

  const previewNet = () => {
    const g = (+form.base_salary||0)+(+form.house_allowance||0)+(+form.medical_allowance||0)+(+form.transport_allowance||0)
    const d = (+form.tax_deduction||0)+(+form.provident_fund||0)
    return { gross: g, deductions: d, net: g - d }
  }

  const preview = previewNet()

  return (
    <div className="animate-fade-in">
      {/* Toast */}
      {toast && (
        <div className={clsx(
          'fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-card shadow-modal text-sm font-medium animate-scale-in',
          toast.type === 'success' ? 'bg-success/10 border border-success/20 text-success' : 'bg-danger/10 border border-danger/20 text-danger',
        )}>
          {toast.type === 'success' ? <CheckCircle size={16}/> : <AlertCircle size={16}/>}
          {toast.msg}
        </div>
      )}

      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-h2 text-primary-900">Payroll</h1>
          <p className="text-caption text-text-secondary mt-0.5">{records.length} records</p>
        </div>
        <button
          id="payroll-create-btn"
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-btn bg-primary-700 hover:bg-primary-900 text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-200"
        >
          <Plus size={16}/> Add Record
        </button>
      </div>

      <DataTable
        columns={columns}
        data={records}
        loading={loading}
        actions={actions}
        pageSize={12}
        emptyText="No payroll records yet. Click 'Add Record' to create one."
      />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalMode === 'create' || modalMode === 'edit'}
        onClose={() => setModalMode(null)}
        title={modalMode === 'create' ? 'Add Payroll Record' : `Edit — ${selected?.employee_name}`}
        size="lg"
        footer={
          <>
            <button type="button" onClick={() => setModalMode(null)} className="px-4 py-2 rounded-btn border border-border text-sm font-medium hover:bg-bg-primary transition-colors">
              Cancel
            </button>
            <button
              form="payroll-form" type="submit" disabled={saving}
              className="px-5 py-2 rounded-btn bg-primary-700 hover:bg-primary-900 text-white text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {saving ? 'Saving…' : modalMode === 'create' ? 'Create' : 'Save Changes'}
            </button>
          </>
        }
      >
        {formError && (
          <div className="flex items-start gap-2 bg-danger/10 border border-danger/20 text-danger rounded-input px-4 py-3 mb-4 text-xs animate-fade-in">
            <AlertCircle size={14} className="mt-0.5 shrink-0"/>
            <span>{formError}</span>
          </div>
        )}

        <form id="payroll-form" onSubmit={handleSubmit} className="space-y-4">
          {/* Employee + Period */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label htmlFor="pf-employee" className="block text-xs font-medium text-text-secondary mb-1">
                Employee ID<span className="text-danger ml-0.5">*</span>
              </label>
              <input
                id="pf-employee" type="number" name="employee" value={form.employee}
                onChange={handleFormChange} required min="1"
                placeholder="Employee ID"
                className="w-full px-3 py-2 text-sm rounded-input border border-border bg-bg-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label htmlFor="pf-month" className="block text-xs font-medium text-text-secondary mb-1">Month<span className="text-danger ml-0.5">*</span></label>
              <select id="pf-month" name="month" value={form.month} onChange={handleFormChange} required
                className="w-full px-3 py-2 text-sm rounded-input border border-border bg-bg-primary focus:outline-none focus:ring-2 focus:ring-primary-500">
                {MONTHS.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
              </select>
            </div>
            <FieldRow label="Year" name="year" value={form.year} onChange={handleFormChange} required min="2000" />
          </div>

          {/* Earnings */}
          <div className="border-t border-border pt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3">Earnings</p>
            <div className="grid grid-cols-2 gap-4">
              <FieldRow label="Base Salary"         name="base_salary"         value={form.base_salary}         onChange={handleFormChange} required />
              <FieldRow label="House Allowance"     name="house_allowance"     value={form.house_allowance}     onChange={handleFormChange} />
              <FieldRow label="Medical Allowance"   name="medical_allowance"   value={form.medical_allowance}   onChange={handleFormChange} />
              <FieldRow label="Transport Allowance" name="transport_allowance" value={form.transport_allowance} onChange={handleFormChange} />
            </div>
          </div>

          {/* Deductions */}
          <div className="border-t border-border pt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3">Deductions</p>
            <div className="grid grid-cols-2 gap-4">
              <FieldRow label="Tax Deduction"  name="tax_deduction"  value={form.tax_deduction}  onChange={handleFormChange} />
              <FieldRow label="Provident Fund" name="provident_fund" value={form.provident_fund} onChange={handleFormChange} />
            </div>
          </div>

          {/* Live preview */}
          <div className="bg-bg-primary rounded-input p-3 text-sm tabular-nums flex items-center justify-between gap-4 flex-wrap">
            <span className="text-text-secondary">Gross: <strong>₹ {fmt(preview.gross)}</strong></span>
            <span className="text-danger">Deductions: <strong>₹ {fmt(preview.deductions)}</strong></span>
            <span className={clsx('font-bold', preview.net > 0 ? 'text-success' : 'text-danger')}>
              Net: ₹ {fmt(preview.net)}
            </span>
          </div>

          {/* Reason (required on edit) */}
          {modalMode === 'edit' && (
            <div className="border-t border-border pt-4">
              <FieldRow
                label="Reason for change"
                name="reason"
                value={form.reason}
                onChange={handleFormChange}
                required as="textarea"
              />
            </div>
          )}
        </form>

        {/* Audit log (edit only) */}
        {modalMode === 'edit' && auditLogs.length > 0 && (
          <div className="mt-6 border-t border-border pt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3">Change History</p>
            <div className="space-y-2 max-h-36 overflow-y-auto">
              {auditLogs.map((log) => (
                <div key={log.id} className="text-xs flex items-start gap-2 text-text-secondary">
                  <span className="shrink-0 text-text-secondary/60">{new Date(log.changed_at).toLocaleString('en-IN')}</span>
                  <span className="text-primary-700 font-medium">{log.changed_by_name}:</span>
                  <span className="truncate">{log.reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
