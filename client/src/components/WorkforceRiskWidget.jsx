import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, TrendingUp, Users, Info } from 'lucide-react';
import { api } from '../services/api';

export function WorkforceRiskWidget({ department = '' }) {
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.getWorkforceRisk(department);
        setRiskData(res?.data || null);
      } catch (err) {
        console.error('Failed to load risk metrics:', err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [department]);

  if (loading) {
    return <div className="skeleton-card" style={{ height: 160, marginBottom: '1.5rem' }} />;
  }

  if (!riskData) return null;

  const { overallRiskLevel = 'LOW', indicators = [], metrics = {} } = riskData;

  const riskBadgeClass = overallRiskLevel === 'HIGH'
    ? 'badge-admin'
    : overallRiskLevel === 'MEDIUM'
      ? 'badge-manager'
      : 'badge-employee';

  return (
    <div className="panel mb-8" style={{ borderLeft: overallRiskLevel === 'HIGH' ? '4px solid #ef4444' : overallRiskLevel === 'MEDIUM' ? '4px solid #f59e0b' : '4px solid #10b981' }}>
      <div className="panel-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="panel-title">
          <ShieldAlert size={18} style={{ color: overallRiskLevel === 'HIGH' ? '#ef4444' : '#10b981' }} />
          Workforce Attendance & Leave Risk Engine
        </div>
        <span className={`role-pill ${riskBadgeClass}`} style={{ fontSize: '11px', padding: '4px 10px' }}>
          RISK LEVEL: {overallRiskLevel}
        </span>
      </div>

      <div className="panel-body">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-input)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>Mon/Fri Absence Spikes</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{metrics.monFriAbsences || 0}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Long-weekend extensions</div>
          </div>

          <div style={{ padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-input)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>Sick Leave Surges</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{metrics.sickLeaveCount || 0}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Recent health absences</div>
          </div>

          <div style={{ padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-input)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>Overlapping Clusters</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{metrics.overlappingClusters || 0}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Same-day team leaves</div>
          </div>
        </div>

        {/* Indicators List */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Anomaly Insights
          </div>
          {indicators.length === 0 ? (
            <div style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle size={14} /> Normal attendance distribution. No critical risk patterns detected.
            </div>
          ) : (
            indicators.map((ind, idx) => (
              <div key={idx} style={{ fontSize: '12px', padding: '0.4rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: idx < indicators.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                <AlertTriangle size={14} style={{ color: ind.severity === 'high' ? '#ef4444' : '#f59e0b' }} />
                <span>{ind.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default WorkforceRiskWidget;
