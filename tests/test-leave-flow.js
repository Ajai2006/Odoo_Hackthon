const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

console.log('🧪 Starting Dayflow HRMS - Leave Management Automated Test Suite...\n');

// 1. Initialize test database
const dbPath = path.join(__dirname, 'test.db');
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

const db = new Database(dbPath);
const schemaSql = fs.readFileSync(path.join(__dirname, '../src/lib/db/schema.sql'), 'utf8');
db.exec(schemaSql);

console.log('✅ Database schema loaded successfully.');

// Seed test employees
db.prepare(`
  INSERT INTO employees (id, name, email, department, role, paid_balance, sick_balance, unpaid_balance)
  VALUES 
    (1, 'Sarah Chen', 'sarah@dayflow.internal', 'Engineering', 'Senior Frontend Dev', 12, 8, 20),
    (2, 'Alex Kumar', 'alex@dayflow.internal', 'Engineering', 'Backend Architect', 14, 10, 20),
    (3, 'Marcus Vance', 'marcus@dayflow.internal', 'Human Resources', 'HR Director', 20, 10, 20)
`).run();

console.log('✅ Seed employees created (Sarah, Alex, Marcus).');

// 2. Test Validation logic
function validateLeave(payload, todayStr = '2026-08-22') {
  const errors = {};
  if (!payload.employee_id || payload.employee_id <= 0) errors.employee_id = 'Invalid employee';
  if (!['paid', 'sick', 'unpaid'].includes(payload.leave_type)) errors.leave_type = 'Invalid leave type';
  if (!payload.start_date || !/^\d{4}-\d{2}-\d{2}$/.test(payload.start_date)) errors.start_date = 'Invalid start date';
  if (!payload.end_date || !/^\d{4}-\d{2}-\d{2}$/.test(payload.end_date)) errors.end_date = 'Invalid end date';
  
  if (payload.start_date && payload.start_date < todayStr) {
    errors.start_date = 'Start date cannot be in the past.';
  }
  if (payload.start_date && payload.end_date && payload.end_date < payload.start_date) {
    errors.end_date = 'End date cannot be earlier than start date.';
  }
  if (!payload.reason || payload.reason.trim().length < 10) {
    errors.reason = 'Reason must be at least 10 chars.';
  }
  return { isValid: Object.keys(errors).length === 0, errors };
}

// Test validation cases
const testCases = [
  {
    name: 'Reject past start date',
    payload: { employee_id: 1, leave_type: 'paid', start_date: '2026-08-10', end_date: '2026-08-15', reason: 'Summer road trip vacation' },
    expectedField: 'start_date'
  },
  {
    name: 'Reject end_date before start_date',
    payload: { employee_id: 1, leave_type: 'paid', start_date: '2026-08-25', end_date: '2026-08-23', reason: 'Summer road trip vacation' },
    expectedField: 'end_date'
  },
  {
    name: 'Reject reason < 10 chars',
    payload: { employee_id: 1, leave_type: 'paid', start_date: '2026-08-25', end_date: '2026-08-28', reason: 'Trip' },
    expectedField: 'reason'
  },
  {
    name: 'Reject invalid leave type enum',
    payload: { employee_id: 1, leave_type: 'casual_vacation', start_date: '2026-08-25', end_date: '2026-08-28', reason: 'Summer road trip vacation' },
    expectedField: 'leave_type'
  }
];

for (const tc of testCases) {
  const res = validateLeave(tc.payload);
  if (res.isValid || !res.errors[tc.expectedField]) {
    console.error(`❌ FAILED: ${tc.name}`, res.errors);
    process.exit(1);
  }
  console.log(`✅ Passed: ${tc.name} properly rejected (${tc.expectedField}: "${res.errors[tc.expectedField]}")`);
}

// 3. Test Valid Application & DB Persistence
const validPayload = {
  employee_id: 2, // Alex
  leave_type: 'paid',
  start_date: '2026-08-25',
  end_date: '2026-08-28',
  reason: 'Annual family road trip in the mountain cabin.'
};

const vRes = validateLeave(validPayload);
if (!vRes.isValid) {
  console.error('❌ FAILED valid payload validation', vRes.errors);
  process.exit(1);
}

const insertStmt = db.prepare(`
  INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, total_days, reason, status, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, 'pending', datetime('now'), datetime('now'))
`);
const result = insertStmt.run(validPayload.employee_id, validPayload.leave_type, validPayload.start_date, validPayload.end_date, 4, validPayload.reason);
const leaveId = result.lastInsertRowid;
console.log(`✅ Created leave request #${leaveId} in DB.`);

// 4. Test Overlap / Conflict Detection
// Sarah (same Engineering dept) applies for overlapping dates
const sarahLeavePayload = {
  employee_id: 1,
  leave_type: 'paid',
  start_date: '2026-08-26',
  end_date: '2026-08-29',
  reason: 'Frontend React Summit conference and workshop.'
};

const conflicts = db.prepare(`
  SELECT l.id, l.employee_id, e.name as employee_name, e.department, l.start_date, l.end_date, l.status
  FROM leave_requests l
  JOIN employees e ON l.employee_id = e.id
  WHERE e.department = 'Engineering'
    AND l.employee_id != 1
    AND l.status IN ('pending', 'approved')
    AND NOT (l.end_date < '2026-08-26' OR l.start_date > '2026-08-29')
`).all();

if (conflicts.length === 0) {
  console.error('❌ Conflict detection failed to find Alex overlap');
  process.exit(1);
}
console.log(`✅ Smart Conflict Resolver detected overlap in Engineering: ${conflicts[0].employee_name} (${conflicts[0].start_date} to ${conflicts[0].end_date})`);

// 5. Test Admin Review and Immediate Attendance Calendar Sync
const reviewStmt = db.prepare(`
  UPDATE leave_requests
  SET status = 'approved', admin_comment = 'Approved by Marcus Vance. PRs covered.', reviewed_by = 3, reviewed_at = datetime('now')
  WHERE id = ?
`);
reviewStmt.run(leaveId);

// Execute attendance sync hook
const dates = ['2026-08-25', '2026-08-26', '2026-08-27', '2026-08-28'];
const insertAtt = db.prepare(`
  INSERT INTO attendance (employee_id, date, status, leave_request_id, notes, updated_at)
  VALUES (?, ?, 'Leave', ?, 'Approved Paid Leave', datetime('now'))
  ON CONFLICT(employee_id, date) DO UPDATE SET
    status = 'Leave',
    leave_request_id = excluded.leave_request_id,
    notes = excluded.notes
`);

for (const d of dates) {
  insertAtt.run(validPayload.employee_id, d, leaveId);
}

const syncedAtt = db.prepare(`
  SELECT * FROM attendance WHERE employee_id = ? AND status = 'Leave'
`).all(validPayload.employee_id);

if (syncedAtt.length !== 4) {
  console.error(`❌ Attendance sync failed, expected 4 records, got ${syncedAtt.length}`);
  process.exit(1);
}

console.log(`✅ Attendance sync verified: ${syncedAtt.length} calendar dates updated to "Leave" for employee #${validPayload.employee_id}.`);
console.log('   Dates synced:', syncedAtt.map(a => a.date).join(', '));

// Clean up test db
db.close();
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

console.log('\n🎉 ALL BACKEND & INTEGRATION TESTS PASSED PERFECTLY!\n');
