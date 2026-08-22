import { NextRequest, NextResponse } from 'next/server';
import { getDepartmentConflicts } from '@/lib/conflictResolver';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const empIdStr = searchParams.get('employee_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    const employeeId = parseInt(empIdStr || '0', 10);

    // Validate inputs
    if (!empIdStr || isNaN(employeeId) || employeeId <= 0) {
      return NextResponse.json(
        { success: false, message: 'Valid employee_id is required.' },
        { status: 400 }
      );
    }
    if (!startDate || !DATE_REGEX.test(startDate)) {
      return NextResponse.json(
        { success: false, message: 'start_date is required in YYYY-MM-DD format.' },
        { status: 400 }
      );
    }
    if (!endDate || !DATE_REGEX.test(endDate)) {
      return NextResponse.json(
        { success: false, message: 'end_date is required in YYYY-MM-DD format.' },
        { status: 400 }
      );
    }
    if (endDate < startDate) {
      return NextResponse.json(
        { success: false, message: 'end_date cannot be before start_date.' },
        { status: 400 }
      );
    }

    const result = await getDepartmentConflicts(employeeId, startDate, endDate);

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Error in GET /api/conflicts/check:', error);
    return NextResponse.json({ success: false, message: 'Failed to evaluate conflicts.' }, { status: 500 });
  }
}
