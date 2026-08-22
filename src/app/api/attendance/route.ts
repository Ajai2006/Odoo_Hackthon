import { NextRequest, NextResponse } from 'next/server';
import { getAttendanceRecords, updateAttendanceStatus } from '@/lib/attendanceSync';
import { AttendanceStatus } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get('employee_id') ? parseInt(searchParams.get('employee_id')!, 10) : undefined;
    const startDate = searchParams.get('start_date') || undefined;
    const endDate = searchParams.get('end_date') || undefined;
    const department = searchParams.get('department') || undefined;

    const records = await getAttendanceRecords({
      employee_id: employeeId,
      start_date: startDate,
      end_date: endDate,
      department: department,
    });

    return NextResponse.json({
      success: true,
      total: records.length,
      records,
    });
  } catch (error: any) {
    console.error('Error in GET /api/attendance:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error.', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { employee_id, date, status, notes } = body;

    if (!employee_id || !date || !status) {
      return NextResponse.json(
        { success: false, message: 'employee_id, date, and status are required.' },
        { status: 400 }
      );
    }

    const updated = await updateAttendanceStatus(
      employee_id,
      date,
      status as AttendanceStatus,
      null,
      notes
    );

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to update attendance.', error: error.message },
      { status: 500 }
    );
  }
}
