import React from 'react';
import { LeaveBalances } from '../types';
import { CalendarHeart, Stethoscope, CalendarMinus } from 'lucide-react';

interface LeaveBalanceCardsProps {
  balances?: LeaveBalances;
}

export const LeaveBalanceCards: React.FC<LeaveBalanceCardsProps> = ({ balances }) => {
  if (!balances) {
    return (
      <div className="stat-cards-grid">
        <div className="skeleton skeleton-card" />
        <div className="skeleton skeleton-card" />
        <div className="skeleton skeleton-card" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Paid Annual Leave',
      data: balances.paid,
      icon: CalendarHeart,
      pillClass: 'stat-pill-paid',
      label: 'Paid',
    },
    {
      title: 'Sick & Medical Leave',
      data: balances.sick,
      icon: Stethoscope,
      pillClass: 'stat-pill-sick',
      label: 'Sick',
    },
    {
      title: 'Unpaid / Sabbatical',
      data: balances.unpaid,
      icon: CalendarMinus,
      pillClass: 'stat-pill-unpaid',
      label: 'Unpaid',
    },
  ];

  return (
    <div className="stat-cards-grid">
      {statCards.map((card) => {
        const Icon = card.icon;
        const remaining = card.data.remaining;
        const used = card.data.used;
        const pending = card.data.pending;
        const total = card.data.total;

        return (
          <div key={card.title} className="stat-card">
            <div className="stat-card-header">
              <span className={`stat-type-pill ${card.pillClass}`}>
                <Icon size={13} aria-hidden="true" />
                <span>{card.label}</span>
              </span>
              {pending > 0 && (
                <span className="text-label" style={{ color: 'var(--warning)' }}>
                  {pending}d pending
                </span>
              )}
            </div>

            <div className="stat-figure-row">
              <span className="stat-big-num tabular-nums">{remaining}</span>
              <span className="stat-subtext">days remaining</span>
            </div>

            <div className="stat-footer-bar tabular-nums">
              <span>Used: <strong>{used}d</strong></span>
              <span>Allowance: <strong>{total}d</strong></span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LeaveBalanceCards;
