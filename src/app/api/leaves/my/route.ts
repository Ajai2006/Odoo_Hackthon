import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { calculateSLA } from '@/lib/slaTracker';
import { LeaveRequest, Employee } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeIdStr = searchParams.get('employeeId') || req.headers.get('x-employee-id') || '1';
    const employeeId = parseInt(employeeIdStr, 10);

    if (isNaN(employeeId) || employeeId <= 0) {
      return NextResponse.json(
        { success: false, message: 'Valid employeeId parameter is required.' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 1. Fetch employee
    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(employeeId) as Employee | undefined;
    if (!employee) {
      return NextResponse.json(
        { success: false, message: 'Employee not found.' },
        { status: 404 }
      );
    }

    // 2. Fetch leave requests
    const rawLeaves = db.prepare(`
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
      WHERE l.employee_id = ?
      ORDER BY l.created_at DESC
    `).all(employeeId) as any[];

    const leaves: LeaveRequest[] = rawLeaves.map((l) => ({
      ...l,
      sla: calculateSLA(l.created_at, l.status),
    }));

    // 3. Compute usage stats
    const approvedUsage = db.prepare(`
      SELECT 
        leave_type,
        COALESCE(SUM(total_days), 0) as used_days
      FROM leave_requests
      WHERE employee_id = ? AND status = 'approved'
      GROUP BY leave_type
    `).all(employeeId) as { leave_type: string; used_days: number }[];

    const pendingUsage = db.prepare(`
      SELECT 
        leave_type,
        COALESCE(SUM(total_days), 0) as pending_days
      FROM leave_requests
      WHERE employee_id = ? AND status = 'pending'
      GROUP BY leave_type
    `).all(employeeId) as { leave_type: string; pending_days: number }[];

    const usedMap = { paid: 0, sick: 0, unpaid: 0 };
    for (const u of approvedUsage) {
      if (u.leave_type in usedMap) (usedMap as any)[u.leave_type] = u.used_days;
    }

    const pendingMap = { paid: 0, sick: 0, unpaid: 0 };
    for (const p of pendingUsage) {
      if (p.leave_type in pendingMap) (pendingMap as any)[p.leave_type] = p.pending_days;
    }

    const balances = {
      paid: {
        total: employee.paid_balance + usedMap.paid,
        used: usedMap.paid,
        pending: pendingMap.paid,
        remaining: Math.max(0, employee.paid_balance - usedMap.paid),
      },
      sick: {
        total: employee.sick_balance + usedMap.sick,
        used: usedMap.sick,
        pending: pendingMap.sick,
        remaining: Math.max(0, employee.sick_balance - usedMap.sick),
      },
      unpaid: {
        total: employee.unpaid_balance + usedMap.unpaid,
        used: usedMap.unpaid,
        pending: pendingMap.unpaid,
        remaining: Math.max(0, employee.unpaid_balance - usedMap.unpaid),
      },
    };

    return NextResponse.json({
      success: true,
      employee,
      balances,
      leaves,
    });
  } catch (error: any) {
    console.error('Error in GET /api/leaves/my:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
