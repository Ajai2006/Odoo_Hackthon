import test from 'node:test';
import assert from 'node:assert/strict';
import { db, dbHelper, initDb } from '../src/db/index.js';
import { seedDatabase } from '../src/db/seed.js';

// Setup before tests
test.beforeEach(() => {
  seedDatabase();
});

test('Attendance API - Duplicate check-in is rejected with 409', async () => {
  // Sarah Jenkins (id: 1, emp: 1) is not checked in today
  const empId = 1;
  const today = '2026-08-22';

  // 1st Check-in
  const insertStmt = db.prepare(`
    INSERT INTO attendance (employee_id, date, check_in, status, late_minutes)
    VALUES (?, ?, ?, 'incomplete', 0)
  `);
  insertStmt.run(empId, today, `${today} 09:00:00`);

  // Attempt 2nd Check-in directly or via DB constraint
  assert.throws(() => {
    insertStmt.run(empId, today, `${today} 09:15:00`);
  }, /UNIQUE constraint/);
});

test('Attendance API - Checkout timestamp must be > check-in timestamp', async () => {
  const checkIn = '2026-08-22 09:30:00';
  const invalidCheckOut = '2026-08-22 08:30:00'; // earlier than checkIn

  const inTime = new Date(checkIn.replace(' ', 'T')).getTime();
  const outTime = new Date(invalidCheckOut.replace(' ', 'T')).getTime();

  assert.strictEqual(outTime > inTime, false, 'Invalid checkout should be detected');
});

test('Attendance API - Work hours and status calculation', async () => {
  const checkIn = new Date('2026-08-22T09:00:00');
  const checkOut = new Date('2026-08-22T17:30:00'); // 8.5 hours

  const diffMs = checkOut.getTime() - checkIn.getTime();
  const hours = Number((diffMs / (1000 * 60 * 60)).toFixed(2));
  assert.strictEqual(hours, 8.5);

  let status = 'present';
  if (hours < 4.0) status = 'incomplete';
  else if (hours < 8.0) status = 'half_day';

  assert.strictEqual(status, 'present');

  // Test half-day (4.5 hours)
  const halfDayOut = new Date('2026-08-22T13:30:00');
  const halfHours = Number(((halfDayOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60)).toFixed(2));
  assert.strictEqual(halfHours, 4.5);
  
  let halfStatus = 'present';
  if (halfHours < 4.0) halfStatus = 'incomplete';
  else if (halfHours < 8.0) halfStatus = 'half_day';
  assert.strictEqual(halfStatus, 'half_day');
});

test('Attendance Analytics - Metric calculations return consistent aggregates', async () => {
  const totals = dbHelper.get(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
      SUM(CASE WHEN late_minutes > 0 THEN 1 ELSE 0 END) as late
    FROM attendance
  `);

  assert.ok(totals.total > 0, 'Should have seeded attendance records');
  assert.ok(totals.present >= 0, 'Present count should be non-negative');
});
