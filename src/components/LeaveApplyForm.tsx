import React, { useState, useEffect } from 'react';
import { LeaveType, LeaveBalances, LeaveConflict, DepartmentCoverage } from '@/types';
import { Calendar, AlertCircle, CheckCircle2, ShieldAlert, Sparkles, Send } from 'lucide-react';

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
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [conflictData, setConflictData] = useState<{
    conflicts: LeaveConflict[];
    coverage: DepartmentCoverage;
  } | null>(null);
  const [checkingConflicts, setCheckingConflicts] = useState(false);

  // Set default min date to today YYYY-MM-DD
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
    setErrors({});

    // Client-side quick checks
    const newErrors: Record<string, string> = {};
    if (!startDate) newErrors.start_date = 'Start date is required.';
    if (!endDate) newErrors.end_date = 'End date is required.';
    if (startDate && startDate < todayStr) newErrors.start_date = 'Start date cannot be in the past.';
    if (startDate && endDate && endDate < startDate) newErrors.end_date = 'End date cannot be earlier than start date.';
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
        setConflictData(null);
        onSuccess();
      }
    } catch (err: any) {
      setErrors({ general: 'Network error submitting leave request.' });
    } finally {
      setLoading(false);
    }
  };

  const getBalanceBadge = (type: LeaveType) => {
    if (!balances) return null;
    const b = balances[type];
    return (
      <span className="balance-pill">
        {b.remaining}d left
      </span>
    );
  };

  return (
    <div className="card leave-form-card">
      <div className="card-header">
        <div className="card-title-group">
          <div className="icon-wrapper icon-primary">
            <Calendar size={20} />
          </div>
          <div>
            <h3 className="card-title">Apply for Leave</h3>
            <p className="card-subtitle">Submit a leave request for managerial review</p>
          </div>
        </div>
      </div>

      {errors.general && (
        <div className="alert-banner alert-error">
          <AlertCircle size={18} />
          <span>{errors.general}</span>
        </div>
      )}

      {errors.conflict && (
        <div className="alert-banner alert-error">
          <AlertCircle size={18} />
          <span>{errors.conflict}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="leave-form">
        {/* Leave Type Selector */}
        <div className="form-group">
          <label className="form-label">Leave Type</label>
          <div className="leave-type-grid">
            {(['paid', 'sick', 'unpaid'] as LeaveType[]).map((type) => (
              <button
                type="button"
                key={type}
                className={`leave-type-btn ${leaveType === type ? 'active' : ''}`}
                onClick={() => setLeaveType(type)}
              >
                <span className="type-name">{type.toUpperCase()}</span>
                {getBalanceBadge(type)}
              </button>
            ))}
          </div>
          {errors.leave_type && <span className="field-error">{errors.leave_type}</span>}
        </div>

        {/* Date Range Picker */}
        <div className="form-row">
          <div className="form-group flex-1">
            <label className="form-label" htmlFor="startDate">Start Date</label>
            <input
              id="startDate"
              type="date"
              className={`form-input ${errors.start_date ? 'input-error' : ''}`}
              min={todayStr}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            {errors.start_date && <span className="field-error">{errors.start_date}</span>}
          </div>

          <div className="form-group flex-1">
            <label className="form-label" htmlFor="endDate">End Date</label>
            <input
              id="endDate"
              type="date"
              className={`form-input ${errors.end_date ? 'input-error' : ''}`}
              min={startDate || todayStr}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
            {errors.end_date && <span className="field-error">{errors.end_date}</span>}
          </div>
        </div>

        {/* Days Calculation Badge */}
        {workingDays > 0 && (
          <div className="calculated-days-pill">
            <span>Duration:</span>
            <strong>{workingDays} {workingDays === 1 ? 'Working Day' : 'Working Days'}</strong>
          </div>
        )}

        {/* Smart Conflict Resolver Live Radar */}
        {checkingConflicts && (
          <div className="conflict-box conflict-loading">
            <Sparkles size={16} className="animate-spin text-accent" />
            <span>Evaluating team coverage & schedule overlaps...</span>
          </div>
        )}

        {!checkingConflicts && conflictData && conflictData.conflicts.length > 0 && (
          <div className="conflict-box conflict-warning">
            <div className="conflict-header">
              <ShieldAlert size={18} className="text-warning" />
              <strong>Smart Conflict Radar: Overlap in {department} Team</strong>
            </div>
            <p className="conflict-desc">
              {conflictData.conflicts.length === 1
                ? `${conflictData.conflicts[0].employee_name} has an active ${conflictData.conflicts[0].status} leave during this period (${conflictData.conflicts[0].start_date} to ${conflictData.conflicts[0].end_date}).`
                : `${conflictData.conflicts.length} team members are already on leave during this timeframe.`}
            </p>
            <div className="conflict-coverage-bar">
              <span className="coverage-label">
                Department Coverage: <strong>{conflictData.coverage.coverage_percentage}%</strong> ({conflictData.coverage.total_members - conflictData.coverage.members_on_leave}/{conflictData.coverage.total_members} staff active)
              </span>
              <div className="progress-track">
                <div
                  className={`progress-fill ${
                    conflictData.coverage.warning_level === 'critical'
                      ? 'fill-red'
                      : 'fill-amber'
                  }`}
                  style={{ width: `${conflictData.coverage.coverage_percentage}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {!checkingConflicts && conflictData && conflictData.conflicts.length === 0 && startDate && endDate && (
          <div className="conflict-box conflict-safe">
            <CheckCircle2 size={16} className="text-emerald" />
            <span>Optimal timing! No team overlaps detected in {department}. Staffing at 100%.</span>
          </div>
        )}

        {/* Reason Textarea */}
        <div className="form-group">
          <div className="label-with-counter">
            <label className="form-label" htmlFor="leaveReason">Reason for Leave</label>
            <span
              className={`char-counter ${
                reason.trim().length >= 10 ? 'counter-valid' : 'counter-invalid'
              }`}
            >
              {reason.trim().length} / min 10 chars
            </span>
          </div>
          <textarea
            id="leaveReason"
            rows={3}
            className={`form-textarea ${errors.reason ? 'input-error' : ''}`}
            placeholder="Please explain the purpose of your leave (minimum 10 characters)..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
          {errors.reason && <span className="field-error">{errors.reason}</span>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || reason.trim().length < 10 || workingDays === 0}
          className="btn btn-primary btn-block"
        >
          {loading ? (
            <span>Submitting Application...</span>
          ) : (
            <>
              <Send size={16} />
              <span>Submit Leave Request</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default LeaveApplyForm;
