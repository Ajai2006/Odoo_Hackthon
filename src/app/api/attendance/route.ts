import { NextRequest, NextResponse } from 'next/server';
import { getAttendanceRecords, updateAttendanceStatus } from '@/lib/attendanceSync';
import { AttendanceStatus } from '@/types';

const VALID_ATTENDANCE_STATUSES: AttendanceStatus[] = ['Present', 'Absent', 'Leave', 'Half-day', 'Holiday'];
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const empIdStr = searchParams.get('employee_id');
    const startDate = searchParams.get('start_date') || undefined;
    const endDate = searchParams.get('end_date') || undefined;
    const department = searchParams.get('department') || undefined;

    // Validate date format if provided
    if (startDate && !DATE_REGEX.test(startDate)) {
      return NextResponse.json({ success: false, message: 'Invalid start_date format. Use YYYY-MM-DD.' }, { status: 400 });
    }
    if (endDate && !DATE_REGEX.test(endDate)) {
      return NextResponse.json({ success: false, message: 'Invalid end_date format. Use YYYY-MM-DD.' }, { status: 400 });
    }

    let employeeId: number | undefined = undefined;
    if (empIdStr !== null) {
      employeeId = parseInt(empIdStr, 10);
      if (isNaN(employeeId) || employeeId <= 0) {
        return NextResponse.json({ success: false, message: 'Invalid employee_id parameter.' }, { status: 400 });
      }
    }

    const records = await getAttendanceRecords({
      employee_id: employeeId,
      start_date: startDate,
      end_date: endDate,
      department,
    });

    return NextResponse.json({ success: true, total: records.length, records });
  } catch (error: any) {
    console.error('Error in GET /api/attendance:', error);
    return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid JSON in request body.' }, { status: 400 });
  }

  try {
    const { employee_id, date, status, notes } = body;

    // Validate required fields
    if (!employee_id || !date || !status) {
      return NextResponse.json(
        { success: false, message: 'employee_id, date, and status are required.' },
        { status: 400 }
      );
    }

    const empId = parseInt(String(employee_id), 10);
    if (isNaN(empId) || empId <= 0) {
      return NextResponse.json({ success: false, message: 'Invalid employee_id.' }, { status: 400 });
    }

    if (!DATE_REGEX.test(date)) {
      return NextResponse.json({ success: false, message: 'Invalid date format. Use YYYY-MM-DD.' }, { status: 400 });
    }

    if (!VALID_ATTENDANCE_STATUSES.includes(status as AttendanceStatus)) {
      return NextResponse.json(
        { success: false, message: `Status must be one of: ${VALID_ATTENDANCE_STATUSES.join(', ')}.` },
        { status: 400 }
      );
    }

    const updated = await updateAttendanceStatus(empId, date, status as AttendanceStatus, null, notes);

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error in POST /api/attendance:', error);
    return NextResponse.json({ success: false, message: 'Failed to update attendance.' }, { status: 500 });
  }
}
