import React from 'react';
import { LeaveRequest, Employee } from '../types';
import { ShieldAlert, Users, CheckCircle2, Sparkles, TrendingUp } from 'lucide-react';

interface ConflictRadarProps {
  allLeaves: LeaveRequest[];
  employees: Employee[];
}

export const ConflictRadar: React.FC<ConflictRadarProps> = ({ allLeaves, employees }) => {
  const deptMap: Record<string, Employee[]> = {};
  for (const emp of employees) {
    if (!deptMap[emp.department]) deptMap[emp.department] = [];
    deptMap[emp.department].push(emp);
  }

  const activeLeaves = allLeaves.filter((l) => l.status === 'approved' || l.status === 'pending');

  const deptStats = Object.keys(deptMap).map((dept) => {
    const members = deptMap[dept];
    const deptLeaves = activeLeaves.filter((l) => l.department === dept);
    const uniqueAbsentEmpIds = new Set(deptLeaves.map((l) => l.employee_id));
    const absentCount = uniqueAbsentEmpIds.size;
    const totalCount = members.length;
    const activeStaff = Math.max(0, totalCount - absentCount);
    const coveragePct = Math.round((activeStaff / totalCount) * 100);

    let statusType: 'safe' | 'caution' | 'critical' = 'safe';
    if (coveragePct < 50 || absentCount >= 2) {
      statusType = 'critical';
    } else if (coveragePct < 80 || absentCount >= 1) {
      statusType = 'caution';
    }

    return {
      department: dept,
      totalCount,
      absentCount,
      activeStaff,
      coveragePct,
      statusType,
      leaves: deptLeaves,
    };
  });

  return (
    <div className="card-panel">
      <div className="card-panel-header">
        <div className="flex-align-center gap-2">
          <div className="brand-icon-box" style={{ width: '28px', height: '28px' }}>
            <Sparkles size={15} />
          </div>
          <div>
            <h3>Smart Leave Conflict Radar</h3>
            <p className="text-caption">Real-time team coverage monitoring and scheduling overlap analysis</p>
          </div>
        </div>
      </div>

      <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {deptStats.map((stat) => {
          const isCritical = stat.statusType === 'critical';
          const isCaution = stat.statusType === 'caution';

          let bannerBg = 'var(--success-bg)';
          let bannerBorder = 'var(--success-border)';
          let bannerColor = '#047857';

          if (isCritical) {
            bannerBg = 'var(--danger-bg)';
            bannerBorder = 'var(--danger-border)';
            bannerColor = '#BE123C';
          } else if (isCaution) {
            bannerBg = 'var(--warning-bg)';
            bannerBorder = 'var(--warning-border)';
            bannerColor = '#B45309';
          }

          return (
            <div
              key={stat.department}
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-card)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--primary-900)' }}>{stat.department}</h4>
                  <span className="text-caption">{stat.activeStaff} of {stat.totalCount} staff available</span>
                </div>
                <span
                  style={{
                    backgroundColor: bannerBg,
                    border: `1px solid ${bannerBorder}`,
                    color: bannerColor,
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-badge)'
                  }}
                  className="tabular-nums"
                >
                  {stat.coveragePct}% Coverage
                </span>
              </div>

              {/* Coverage bar */}
              <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border)', borderRadius: '9999px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${stat.coveragePct}%`,
                    backgroundColor: isCritical ? 'var(--danger)' : isCaution ? 'var(--warning)' : 'var(--success)',
                    borderRadius: '9999px'
                  }}
                />
              </div>

              {/* Leaves detail list */}
              <div style={{ marginTop: '4px' }}>
                {stat.leaves.length === 0 ? (
                  <div className="flex-align-center gap-1" style={{ fontSize: '12px', color: '#047857' }}>
                    <CheckCircle2 size={13} />
                    <span>100% capacity • No active leaves</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {stat.leaves.map((l) => (
                      <div
                        key={l.id}
                        style={{
                          backgroundColor: 'var(--bg-primary)',
                          border: '1px solid var(--border)',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          display: 'flex',
                          justifyContent: 'space-between'
                        }}
                      >
                        <span style={{ fontWeight: 500 }}>{l.employee_name}</span>
                        <span className="text-caption">{l.start_date} to {l.end_date}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConflictRadar;
