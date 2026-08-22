import React from 'react';
import { LeaveBalances } from '@/types';
import { Sun, HeartPulse, Sparkles } from 'lucide-react';

interface LeaveBalanceCardsProps {
  balances?: LeaveBalances;
}

export const LeaveBalanceCards: React.FC<LeaveBalanceCardsProps> = ({ balances }) => {
  if (!balances) return null;

  const cards = [
    {
      title: 'Paid Annual Leave',
      data: balances.paid,
      icon: Sun,
      colorClass: 'balance-paid',
      badgeClass: 'badge-paid',
    },
    {
      title: 'Sick & Medical Leave',
      data: balances.sick,
      icon: HeartPulse,
      colorClass: 'balance-sick',
      badgeClass: 'badge-sick',
    },
    {
      title: 'Unpaid / Sabbatical',
      data: balances.unpaid,
      icon: Sparkles,
      colorClass: 'balance-unpaid',
      badgeClass: 'badge-unpaid',
    },
  ];

  return (
    <div className="balance-cards-grid">
      {cards.map((c) => {
        const Icon = c.icon;
        const remaining = c.data.remaining;
        const total = c.data.total;
        const pct = Math.min(100, Math.round((remaining / (total || 1)) * 100));

        return (
          <div key={c.title} className={`balance-card ${c.colorClass}`}>
            <div className="balance-card-header">
              <div className="balance-icon-box">
                <Icon size={20} />
              </div>
              <span className={`balance-type-badge ${c.badgeClass}`}>
                {c.data.pending > 0 ? `${c.data.pending}d pending` : 'Active'}
              </span>
            </div>

            <div className="balance-card-body">
              <div className="balance-days-group">
                <span className="balance-remaining-val">{remaining}</span>
                <span className="balance-unit">days left</span>
              </div>
              <p className="balance-title">{c.title}</p>
            </div>

            <div className="balance-card-footer">
              <div className="balance-progress-track">
                <div
                  className="balance-progress-fill"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="balance-stat-row">
                <span>Used: <strong>{c.data.used}d</strong></span>
                <span>Total: <strong>{total}d</strong></span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LeaveBalanceCards;
