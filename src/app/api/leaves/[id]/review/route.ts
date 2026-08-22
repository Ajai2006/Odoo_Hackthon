import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { syncLeaveToAttendance, clearLeaveFromAttendance } from '@/lib/attendanceSync';
import { calculateSLA } from '@/lib/slaTracker';
import { LeaveRequest, ReviewLeavePayload } from '@/types';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const leaveId = parseInt(id, 10);

    if (isNaN(leaveId) || leaveId <= 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid leave request ID.' },
        { status: 400 }
      );
    }

    const body = (await req.json()) as ReviewLeavePayload;

    if (!body.status || !['approved', 'rejected'].includes(body.status)) {
      return NextResponse.json(
        { success: false, message: "Status must be either 'approved' or 'rejected'." },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Check if leave request exists
    const existing = db.prepare(`
      SELECT 
        l.*,
        e.name as employee_name,
        e.email as employee_email,
        e.department
      FROM leave_requests l
      JOIN employees e ON l.employee_id = e.id
      WHERE l.id = ?
    `).get(leaveId) as LeaveRequest | undefined;

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Leave request not found.' },
        { status: 404 }
      );
    }

    const reviewerId = typeof body.reviewer_id === 'number' && body.reviewer_id > 0
      ? body.reviewer_id
      : 6; // Default to Marcus Vance (HR Admin)
    const adminComment = body.admin_comment
      ? body.admin_comment.trim().slice(0, 1000) // Cap at 1000 chars
      : null;

    // Enforce: rejection requires a comment
    if (body.status === 'rejected' && !adminComment) {
      return NextResponse.json(
        { success: false, message: 'A reason/comment is required when rejecting a leave request.' },
        { status: 400 }
      );
    }

    // Update leave request
    const updateStmt = db.prepare(`
      UPDATE leave_requests
      SET 
        status = ?,
        admin_comment = ?,
        reviewed_by = ?,
        reviewed_at = datetime('now'),
        updated_at = datetime('now')
      WHERE id = ?
    `);

    updateStmt.run(body.status, adminComment, reviewerId, leaveId);

    let syncedAttendance: any[] = [];

    // On Approval: Wire up attendance sync hook immediately!
    if (body.status === 'approved') {
      syncedAttendance = await syncLeaveToAttendance({
        id: leaveId,
        employee_id: existing.employee_id,
        start_date: existing.start_date,
        end_date: existing.end_date,
        leave_type: existing.leave_type,
      });
    } else {
      // If rejected, clear any prior attendance sync
      await clearLeaveFromAttendance(leaveId);
    }

    // Fetch updated record with reviewer info
    const updatedLeave = db.prepare(`
      SELECT 
        l.*,
        e.name as employee_name,
        e.email as employee_email,
        e.department,
        rev.name as reviewer_name
      FROM leave_requests l
      JOIN employees e ON l.employee_id = e.id
      LEFT JOIN employees rev ON l.reviewed_by = rev.id
      WHERE l.id = ?
    `).get(leaveId) as LeaveRequest;

    updatedLeave.sla = calculateSLA(updatedLeave.created_at, updatedLeave.status);

    return NextResponse.json({
      success: true,
      message: `Leave request #${leaveId} has been ${body.status}.`,
      data: updatedLeave,
      synced_attendance_count: syncedAttendance.length,
      synced_attendance: syncedAttendance,
    });
  } catch (error: any) {
    console.error('Error in PUT /api/leaves/[id]/review:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
