import React from 'react';
import { LeaveRequest, Employee } from '@/types';
import { ShieldAlert, Users, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';

interface ConflictRadarProps {
  allLeaves: LeaveRequest[];
  employees: Employee[];
}

export const ConflictRadar: React.FC<ConflictRadarProps> = ({ allLeaves, employees }) => {
  // Group employees by department
  const deptMap: Record<string, Employee[]> = {};
  for (const emp of employees) {
    if (!deptMap[emp.department]) deptMap[emp.department] = [];
    deptMap[emp.department].push(emp);
  }

  // Active leaves (approved or pending)
  const activeLeaves = allLeaves.filter((l) => l.status === 'approved' || l.status === 'pending');

  const deptStats = Object.keys(deptMap).map((dept) => {
    const members = deptMap[dept];
    const deptLeaves = activeLeaves.filter((l) => l.department === dept);
    const uniqueAbsentEmpIds = new Set(deptLeaves.map((l) => l.employee_id));
    const absentCount = uniqueAbsentEmpIds.size;
    const totalCount = members.length;
    const activeStaff = Math.max(0, totalCount - absentCount);
    const coveragePct = Math.round((activeStaff / totalCount) * 100);

    let warningLevel: 'safe' | 'caution' | 'critical' = 'safe';
    if (coveragePct < 50 || absentCount >= 2) {
      warningLevel = 'critical';
    } else if (coveragePct < 80 || absentCount >= 1) {
      warningLevel = 'caution';
    }

    return {
      department: dept,
      totalCount,
      absentCount,
      activeStaff,
      coveragePct,
      warningLevel,
      leaves: deptLeaves,
    };
  });

  return (
    <div className="card radar-card">
      <div className="card-header flex-between">
        <div className="card-title-group">
          <div className="icon-wrapper icon-accent">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="card-title">Smart Leave Conflict Radar</h3>
            <p className="card-subtitle">
              Live department coverage heat-map and schedule congestion analysis
            </p>
          </div>
        </div>
      </div>

      <div className="radar-grid">
        {deptStats.map((stat) => (
          <div key={stat.department} className={`radar-dept-card status-${stat.warningLevel}`}>
            <div className="flex-between">
              <div>
                <h4 className="dept-card-name">{stat.department}</h4>
                <span className="text-caption text-muted">
                  {stat.activeStaff} of {stat.totalCount} Staff Available
                </span>
              </div>
              <span className={`coverage-badge badge-${stat.warningLevel}`}>
                {stat.coveragePct}% Coverage
              </span>
            </div>

            <div className="coverage-bar-track mt-3">
              <div
                className={`coverage-bar-fill fill-${stat.warningLevel}`}
                style={{ width: `${stat.coveragePct}%` }}
              />
            </div>

            <div className="dept-leaves-preview mt-3">
              {stat.leaves.length === 0 ? (
                <div className="flex-align-center gap-1 text-emerald text-caption">
                  <CheckCircle2 size={12} />
                  <span>100% capacity • No active leaves</span>
                </div>
              ) : (
                <div className="active-dept-leaves-list">
                  {stat.leaves.map((l) => (
                    <div key={l.id} className="mini-leave-tag">
                      <span className="font-semibold">{l.employee_name}</span>: {l.start_date} to {l.end_date} ({l.status})
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConflictRadar;
