import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { Employee } from '@/types';

export async function GET() {
  try {
    const db = getDb();
    const employees = db.prepare('SELECT * FROM employees ORDER BY id ASC').all() as Employee[];

    return NextResponse.json({
      success: true,
      employees,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch employees.', error: error.message },
      { status: 500 }
    );
  }
}
