import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { validateLeaveApplication } from '@/lib/leaveValidation';
import { getDepartmentConflicts } from '@/lib/conflictResolver';
import { calculateSLA } from '@/lib/slaTracker';
import { ApplyLeavePayload, LeaveRequest } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ApplyLeavePayload;

    // 1. Server-side validation on every field
    const validation = validateLeaveApplication(body);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed. Please review the errors.',
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    const db = getDb();
    const totalDays = validation.totalDays || 1;

    // 2. Conflict Analysis
    const conflictReport = getDepartmentConflicts(body.employee_id, body.start_date, body.end_date);

    // 3. Database Insertion
    const stmt = db.prepare(`
      INSERT INTO leave_requests (
        employee_id,
        leave_type,
        start_date,
        end_date,
        total_days,
        reason,
        status,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending', datetime('now'), datetime('now'))
    `);

    const result = stmt.run(
      body.employee_id,
      body.leave_type,
      body.start_date,
      body.end_date,
      totalDays,
      body.reason.trim()
    );

    const newId = result.lastInsertRowid;

    // 4. Fetch the inserted record with joined employee info
    const createdLeave = db.prepare(`
      SELECT 
        l.*,
        e.name as employee_name,
        e.email as employee_email,
        e.department,
        e.avatar_url as employee_avatar
      FROM leave_requests l
      JOIN employees e ON l.employee_id = e.id
      WHERE l.id = ?
    `).get(newId) as LeaveRequest;

    // Enrich with SLA and conflicts
    createdLeave.sla = calculateSLA(createdLeave.created_at, createdLeave.status);
    createdLeave.conflicts = conflictReport.conflicts;

    return NextResponse.json(
      {
        success: true,
        message: 'Leave application submitted successfully.',
        data: createdLeave,
        coverage_impact: conflictReport.coverage,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/leaves/apply:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error processing leave application.',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
