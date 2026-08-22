import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { calculateSLA } from '@/lib/slaTracker';
import { getDepartmentConflicts } from '@/lib/conflictResolver';
import { LeaveRequest } from '@/types';

const VALID_STATUSES = ['pending', 'approved', 'rejected', 'all'];
const VALID_TYPES = ['paid', 'sick', 'unpaid', 'all'];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'all';
    const leaveType = searchParams.get('leave_type') || 'all';
    const department = searchParams.get('department') || 'all';
    const search = searchParams.get('search');

    // Validate enum inputs (security: prevent unexpected filter values)
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ success: false, message: 'Invalid status filter.' }, { status: 400 });
    }
    if (!VALID_TYPES.includes(leaveType)) {
      return NextResponse.json({ success: false, message: 'Invalid leave_type filter.' }, { status: 400 });
    }

    const db = await getDb();
    let query = `
      SELECT 
        l.*,
        e.name as employee_name,
        e.email as employee_email,
        e.department,
        e.avatar_url as employee_avatar,
        rev.name as reviewer_name
      FROM leave_requests l
      JOIN employees e ON l.employee_id = e.id
      LEFT JOIN employees rev ON l.reviewed_by = rev.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status !== 'all') {
      query += ` AND l.status = ?`;
      params.push(status);
    }
    if (leaveType !== 'all') {
      query += ` AND l.leave_type = ?`;
      params.push(leaveType);
    }
    if (department !== 'all') {
      query += ` AND e.department = ?`;
      params.push(department);
    }
    if (search) {
      // Parameterized LIKE — safe against injection
      query += ` AND (e.name LIKE ? OR l.reason LIKE ? OR e.department LIKE ?)`;
      const s = `%${search.slice(0, 100)}%`; // Cap length to prevent DOS
      params.push(s, s, s);
    }

    query += ` ORDER BY l.created_at DESC LIMIT 500`; // Hard upper limit

    const rawLeaves = db.prepare(query).all(...params) as any[];

    const leaves: LeaveRequest[] = [];
    for (const l of rawLeaves) {
      const sla = calculateSLA(l.created_at, l.status);
      const { conflicts } = await getDepartmentConflicts(l.employee_id, l.start_date, l.end_date, l.id);
      leaves.push({ ...l, sla, conflicts });
    }

    return NextResponse.json({ success: true, total: leaves.length, leaves });
  } catch (error: any) {
    console.error('Error in GET /api/leaves:', error);
    return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 });
  }
}
