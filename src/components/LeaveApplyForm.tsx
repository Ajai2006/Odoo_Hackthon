import React, { useState, useEffect } from 'react';
import { LeaveType, LeaveBalances, LeaveConflict, DepartmentCoverage } from '../types';
import { CalendarHeart, Stethoscope, CalendarMinus, AlertCircle, CheckCircle2, ShieldAlert, Sparkles, Send } from 'lucide-react';

interface LeaveApplyFormProps {
  employeeId: number;
  employeeName: string;
  department: string;
  balances?: LeaveBalances;
  onSuccess: () => void;
}

export const LeaveApplyForm: React.FC<LeaveApplyFormProps> = ({
  employeeId,
  employeeName,
  department,
  balances,
  onSuccess,
}) => {
  const [leaveType, setLeaveType] = useState<LeaveType>('paid');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  
  // Field touched states for onBlur validation
  const [touched, setTouched] = useState<{ startDate?: boolean; endDate?: boolean; reason?: boolean }>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [loading, setLoading] = useState(false);
  const [conflictData, setConflictData] = useState<{
    conflicts: LeaveConflict[];
    coverage: DepartmentCoverage;
  } | null>(null);
  const [checkingConflicts, setCheckingConflicts] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  // Calculate live working days
  const calculateDays = () => {
    if (!startDate || !endDate || endDate < startDate) return 0;
    const s = new Date(startDate + 'T00:00:00Z');
    const e = new Date(endDate + 'T00:00:00Z');
    let count = 0;
    const curr = new Date(s);
    while (curr <= e) {
      const d = curr.getUTCDay();
      if (d !== 0 && d !== 6) count++;
      curr.setUTCDate(curr.getUTCDate() + 1);
    }
    return count === 0 ? 1 : count;
  };

  const workingDays = calculateDays();

  // Validate on field change or blur
  const validateField = (field: 'startDate' | 'endDate' | 'reason', val?: string) => {
    const newErrors = { ...errors };
    const curStart = field === 'startDate' ? val : startDate;
    const curEnd = field === 'endDate' ? val : endDate;
    const curReason = field === 'reason' ? val : reason;

    if (field === 'startDate') {
      if (!curStart) {
        newErrors.start_date = 'Start date is required.';
      } else if (curStart < todayStr) {
        newErrors.start_date = `Start date cannot be in the past (on or after ${todayStr}).`;
      } else {
        delete newErrors.start_date;
      }
    }

    if (field === 'endDate') {
      if (!curEnd) {
        newErrors.end_date = 'End date is required.';
      } else if (curStart && curEnd < curStart) {
        newErrors.end_date = 'End date cannot be earlier than start date.';
      } else {
        delete newErrors.end_date;
      }
    }

    if (field === 'reason') {
      if (!curReason || curReason.trim().length < 10) {
        newErrors.reason = 'Reason must be at least 10 characters long.';
      } else {
        delete newErrors.reason;
      }
    }

    setErrors(newErrors);
  };

  // Real-time conflict preview when dates change
  useEffect(() => {
    if (startDate && endDate && endDate >= startDate && employeeId) {
      setCheckingConflicts(true);
      const timer = setTimeout(async () => {
        try {
          const res = await fetch(
            `/api/conflicts/check?employee_id=${employeeId}&start_date=${startDate}&end_date=${endDate}`
          );
          const data = await res.json();
          if (data.success) {
            setConflictData({ conflicts: data.conflicts, coverage: data.coverage });
          }
        } catch (err) {
          console.error('Failed to check conflicts', err);
        } finally {
          setCheckingConflicts(false);
        }
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setConflictData(null);
    }
  }, [startDate, endDate, employeeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ startDate: true, endDate: true, reason: true });

    // Validate all fields
    const newErrors: Record<string, string> = {};
    if (!startDate) newErrors.start_date = 'Start date is required.';
    else if (startDate < todayStr) newErrors.start_date = 'Start date cannot be in the past.';
    
    if (!endDate) newErrors.end_date = 'End date is required.';
    else if (startDate && endDate < startDate) newErrors.end_date = 'End date cannot be earlier than start date.';
    
    if (!reason || reason.trim().length < 10) newErrors.reason = 'Reason must be at least 10 characters long.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/leaves/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: employeeId,
          leave_type: leaveType,
          start_date: startDate,
          end_date: endDate,
          reason: reason.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ general: data.message || 'Failed to submit leave application.' });
        }
      } else {
        // Reset form & notify parent
        setStartDate('');
        setEndDate('');
        setReason('');
        setTouched({});
        setErrors({});
        setConflictData(null);
        onSuccess();
      }
    } catch (err: any) {
      setErrors({ general: 'Network error submitting leave request.' });
    } finally {
      setLoading(false);
    }
  };

  const getQuotaLabel = (type: LeaveType) => {
    if (!balances) return null;
    return `${balances[type].remaining}d left`;
  };

  return (
    <div className="card-panel">
      <div className="card-panel-header">
        <div>
          <h3>Apply for Leave</h3>
          <p className="text-caption">Submit a leave request for managerial approval</p>
        </div>
      </div>

      <div className="card-panel-body">
        {errors.general && (
          <div className="inline-field-error" style={{ marginBottom: '16px' }}>
            <AlertCircle size={16} />
            <span>{errors.general}</span>
          </div>
        )}

        {errors.conflict && (
          <div className="inline-field-error" style={{ marginBottom: '16px' }}>
            <AlertCircle size={16} />
            <span>{errors.conflict}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Segmented Control for Leave Type */}
          <div className="form-field">
            <label className="field-label">Leave Type</label>
            <div className="segmented-control">
              <button
                type="button"
                className={`segment-btn ${leaveType === 'paid' ? 'active' : ''}`}
                onClick={() => setLeaveType('paid')}
              >
                <div className="flex-align-center gap-1">
                  <CalendarHeart size={14} />
                  <span>Paid</span>
                </div>
                <span className="segment-quota">{getQuotaLabel('paid')}</span>
              </button>

              <button
                type="button"
                className={`segment-btn ${leaveType === 'sick' ? 'active' : ''}`}
                onClick={() => setLeaveType('sick')}
              >
                <div className="flex-align-center gap-1">
                  <Stethoscope size={14} />
                  <span>Sick</span>
                </div>
                <span className="segment-quota">{getQuotaLabel('sick')}</span>
              </button>

              <button
                type="button"
                className={`segment-btn ${leaveType === 'unpaid' ? 'active' : ''}`}
                onClick={() => setLeaveType('unpaid')}
              >
                <div className="flex-align-center gap-1">
                  <CalendarMinus size={14} />
                  <span>Unpaid</span>
                </div>
                <span className="segment-quota">{getQuotaLabel('unpaid')}</span>
              </button>
            </div>
          </div>

          {/* Date Range Inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-field">
              <label className="field-label" htmlFor="applyStartDate">Start Date</label>
              <input
                id="applyStartDate"
                type="date"
                className={`form-input ${touched.startDate && errors.start_date ? 'input-has-error' : ''}`}
                min={todayStr}
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (touched.startDate) validateField('startDate', e.target.value);
                }}
                onBlur={(e) => {
                  setTouched((prev) => ({ ...prev, startDate: true }));
                  validateField('startDate', e.target.value);
                }}
                required
              />
              {touched.startDate && errors.start_date && (
                <div className="inline-field-error">
                  <AlertCircle size={13} />
                  <span>{errors.start_date}</span>
                </div>
              )}
            </div>

            <div className="form-field">
              <label className="field-label" htmlFor="applyEndDate">End Date</label>
              <input
                id="applyEndDate"
                type="date"
                className={`form-input ${touched.endDate && errors.end_date ? 'input-has-error' : ''}`}
                min={startDate || todayStr}
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  if (touched.endDate) validateField('endDate', e.target.value);
                }}
                onBlur={(e) => {
                  setTouched((prev) => ({ ...prev, endDate: true }));
                  validateField('endDate', e.target.value);
                }}
                required
              />
              {touched.endDate && errors.end_date && (
                <div className="inline-field-error">
                  <AlertCircle size={13} />
                  <span>{errors.end_date}</span>
                </div>
              )}
            </div>
          </div>

          {/* Live Calculated Days Badge */}
          {workingDays > 0 && (
            <div className="days-calc-banner">
              <span>Duration Calculated:</span>
              <strong className="tabular-nums">
                {workingDays} {workingDays === 1 ? 'day selected' : 'days selected'} (excluding weekends)
              </strong>
            </div>
          )}

          {/* Smart Conflict Resolver Inline Warning */}
          {checkingConflicts && (
            <div className="text-caption text-secondary" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} className="text-primary" />
              <span>Checking team coverage schedule...</span>
            </div>
          )}

          {!checkingConflicts && conflictData && conflictData.conflicts.length > 0 && (
            <div style={{
              backgroundColor: 'var(--warning-bg)',
              border: '1px solid var(--warning-border)',
              padding: '10px 12px',
              borderRadius: 'var(--radius-input)',
              marginBottom: '16px',
              fontSize: '13px',
              color: '#B45309'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, marginBottom: '2px' }}>
                <ShieldAlert size={15} />
                <span>Team Schedule Notice ({department})</span>
              </div>
              <p style={{ fontSize: '12px' }}>
                {conflictData.conflicts.length === 1
                  ? `${conflictData.conflicts[0].employee_name} has active leave during these dates.`
                  : `${conflictData.conflicts.length} team members are already on leave during this timeframe.`}
                {' '}Department coverage: <strong>{conflictData.coverage.coverage_percentage}%</strong>.
              </p>
            </div>
          )}

          {/* Remarks Textarea */}
          <div className="form-field">
            <div className="form-label-row">
              <label className="field-label" htmlFor="applyReason">Remarks / Reason</label>
              <span className={`char-count-tag tabular-nums ${reason.trim().length >= 10 ? 'count-valid' : 'count-invalid'}`}>
                {reason.trim().length} / min 10 chars
              </span>
            </div>
            <textarea
              id="applyReason"
              rows={3}
              className={`form-textarea ${touched.reason && errors.reason ? 'input-has-error' : ''}`}
              placeholder="State the purpose of your leave (minimum 10 characters)..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (touched.reason) validateField('reason', e.target.value);
              }}
              onBlur={(e) => {
                setTouched((prev) => ({ ...prev, reason: true }));
                validateField('reason', e.target.value);
              }}
              required
            />
            {touched.reason && errors.reason && (
              <div className="inline-field-error">
                <AlertCircle size={13} />
                <span>{errors.reason}</span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || reason.trim().length < 10 || workingDays === 0}
            className="btn btn-primary btn-block"
          >
            {loading ? (
              <span>Submitting Request...</span>
            ) : (
              <>
                <Send size={15} />
                <span>Submit Leave Request</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LeaveApplyForm;
