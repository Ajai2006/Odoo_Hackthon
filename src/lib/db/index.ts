import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'dayflow.db');

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!dbInstance) {
    dbInstance = new Database(DB_PATH);
    dbInstance.pragma('journal_mode = WAL');
    dbInstance.pragma('foreign_keys = ON');
    initSchema(dbInstance);
  }
  return dbInstance;
}

function initSchema(db: Database.Database) {
  const schemaPath = path.join(process.cwd(), 'src/lib/db/schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schemaSql);
  }

  // Check if seeding is required
  const empCount = db.prepare('SELECT count(*) as count FROM employees').get() as { count: number };
  if (empCount.count === 0) {
    seedDatabase(db);
  }
}

function seedDatabase(db: Database.Database) {
  const insertEmp = db.prepare(`
    INSERT INTO employees (name, email, department, role, avatar_url, paid_balance, sick_balance, unpaid_balance)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const employees = [
    ['Sarah Chen', 'sarah.chen@dayflow.internal', 'Engineering', 'Senior Frontend Engineer', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 12.0, 8.0, 20.0],
    ['Alex Kumar', 'alex.kumar@dayflow.internal', 'Engineering', 'Backend Architect', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 14.0, 10.0, 20.0],
    ['Maria Garcia', 'maria.garcia@dayflow.internal', 'Design', 'Lead Product Designer', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 10.5, 7.0, 20.0],
    ['James Wilson', 'james.wilson@dayflow.internal', 'Engineering', 'QA Engineer', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 15.0, 9.5, 20.0],
    ['Priya Patel', 'priya.patel@dayflow.internal', 'Marketing', 'Growth Marketing Lead', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 13.0, 6.0, 20.0],
    ['Marcus Vance', 'marcus.vance@dayflow.internal', 'Human Resources', 'HR Director (Admin)', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 20.0, 10.0, 20.0],
  ];

  for (const emp of employees) {
    insertEmp.run(...emp);
  }

  // Seed Leave Requests
  const insertLeave = db.prepare(`
    INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, total_days, reason, status, admin_comment, reviewed_by, reviewed_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?))
  `);

  // 1. Approved Leave for Alex (Engineering) in the coming week (creates conflict baseline for Engineering)
  insertLeave.run(
    2, // Alex
    'paid',
    '2026-08-25',
    '2026-08-28',
    4.0,
    'Annual family road trip and family reunion in the mountains.',
    'approved',
    'Approved. Ensure backend PRs are reviewed before leaving.',
    6, // Marcus Vance
    new Date().toISOString(),
    '-5 days'
  );

  // 2. Pending Request from Sarah (Engineering) - Overlapping with Alex (conflict trigger)
  // Created 4 days ago -> triggers Urgency SLA Breach (>3 days)
  insertLeave.run(
    1, // Sarah
    'paid',
    '2026-08-26',
    '2026-08-29',
    4.0,
    'Attending React Summit conference and taking personal rejuvenation days.',
    'pending',
    null,
    null,
    null,
    '-4 days'
  );

  // 3. Pending Request from Maria (Design) - Created 1.5 days ago -> triggers Warning SLA (1-3 days)
  insertLeave.run(
    3, // Maria
    'sick',
    '2026-08-24',
    '2026-08-25',
    2.0,
    'Scheduled minor dental surgery and recovery period recommended by dentist.',
    'pending',
    null,
    null,
    null,
    '-36 hours'
  );

  // 4. Pending Request from James (Engineering) - Created 2 hours ago -> Normal SLA (<24h)
  insertLeave.run(
    4, // James
    'paid',
    '2026-09-01',
    '2026-09-02',
    2.0,
    'Short weekend extension for personal family errands.',
    'pending',
    null,
    null,
    null,
    '-2 hours'
  );

  // 5. Past Rejected Leave for Priya
  insertLeave.run(
    5, // Priya
    'unpaid',
    '2026-08-10',
    '2026-08-12',
    3.0,
    'Extended vacation for friend wedding overseas.',
    'rejected',
    'Product launch blackout period during the week of Aug 10.',
    6,
    new Date().toISOString(),
    '-14 days'
  );

  // Seed Attendance Records for past week + sync Alex's approved leave
  const insertAtt = db.prepare(`
    INSERT OR REPLACE INTO attendance (employee_id, date, status, leave_request_id, notes)
    VALUES (?, ?, ?, ?, ?)
  `);

  // Seed normal attendance for current month dates (Aug 15 - Aug 22)
  for (let empId = 1; empId <= 6; empId++) {
    for (let day = 15; day <= 22; day++) {
      const dateStr = `2026-08-${day.toString().padStart(2, '0')}`;
      const dayOfWeek = new Date(dateStr).getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Weekdays only
        insertAtt.run(empId, dateStr, 'Present', null, 'Regular check-in');
      }
    }
  }

  // Alex's approved leave synced to attendance (Aug 25 to Aug 28)
  for (let day = 25; day <= 28; day++) {
    const dateStr = `2026-08-${day.toString().padStart(2, '0')}`;
    insertAtt.run(2, dateStr, 'Leave', 1, 'Approved Paid Leave (#1)');
  }
}
