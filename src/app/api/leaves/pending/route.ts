import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { calculateSLA } from '@/lib/slaTracker';
import { getDepartmentConflicts } from '@/lib/conflictResolver';
import { LeaveRequest } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const db = await getDb();
    
    const rawLeaves = db.prepare(`
      SELECT 
        l.*,
        e.name as employee_name,
        e.email as employee_email,
        e.department,
        e.avatar_url as employee_avatar
      FROM leave_requests l
      JOIN employees e ON l.employee_id = e.id
      WHERE l.status = 'pending'
      ORDER BY l.created_at ASC
    `).all() as any[];

    const leaves: LeaveRequest[] = [];
    for (const l of rawLeaves) {
      const sla = calculateSLA(l.created_at, l.status);
      const { conflicts } = await getDepartmentConflicts(l.employee_id, l.start_date, l.end_date, l.id);
      leaves.push({
        ...l,
        sla,
        conflicts,
      });
    }

    // Sort by SLA urgency: 'urgent' (breached) first, then 'warning', then 'normal'
    const urgencyOrder = { urgent: 0, warning: 1, normal: 2 };
    leaves.sort((a, b) => {
      const scoreA = urgencyOrder[a.sla?.urgency || 'normal'];
      const scoreB = urgencyOrder[b.sla?.urgency || 'normal'];
      if (scoreA !== scoreB) return scoreA - scoreB;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

    const urgentCount = leaves.filter((l) => l.sla?.urgency === 'urgent').length;
    const warningCount = leaves.filter((l) => l.sla?.urgency === 'warning').length;

    return NextResponse.json({
      success: true,
      total_pending: leaves.length,
      urgent_count: urgentCount,
      warning_count: warningCount,
      leaves,
    });
  } catch (error: any) {
    console.error('Error in GET /api/leaves/pending:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error.', error: error.message },
      { status: 500 }
    );
  }
}
