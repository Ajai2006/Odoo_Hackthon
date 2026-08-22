import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { calculateSLA } from '@/lib/slaTracker';
import { getDepartmentConflicts } from '@/lib/conflictResolver';
import { LeaveRequest } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const leaveType = searchParams.get('leave_type');
    const department = searchParams.get('department');
    const search = searchParams.get('search');

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

    if (status && status !== 'all') {
      query += ` AND l.status = ?`;
      params.push(status);
    }
    if (leaveType && leaveType !== 'all') {
      query += ` AND l.leave_type = ?`;
      params.push(leaveType);
    }
    if (department && department !== 'all') {
      query += ` AND e.department = ?`;
      params.push(department);
    }
    if (search) {
      query += ` AND (e.name LIKE ? OR l.reason LIKE ? OR e.department LIKE ?)`;
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    query += ` ORDER BY l.created_at DESC`;

    const rawLeaves = db.prepare(query).all(...params) as any[];

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

    return NextResponse.json({
      success: true,
      total: leaves.length,
      leaves,
    });
  } catch (error: any) {
    console.error('Error in GET /api/leaves:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error.', error: error.message },
      { status: 500 }
    );
  }
}
