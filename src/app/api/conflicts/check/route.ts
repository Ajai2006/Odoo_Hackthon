import { NextRequest, NextResponse } from 'next/server';
import { getDepartmentConflicts } from '@/lib/conflictResolver';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeId = parseInt(searchParams.get('employee_id') || '0', 10);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    if (!employeeId || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, message: 'employee_id, start_date, and end_date are required.' },
        { status: 400 }
      );
    }

    const result = await getDepartmentConflicts(employeeId, startDate, endDate);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to evaluate conflicts.', error: error.message },
      { status: 500 }
    );
  }
}
