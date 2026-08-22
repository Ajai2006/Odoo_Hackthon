import initSqlJs from 'sql.js';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'dayflow.db');

interface PreparedQuery {
  all: (...params: any[]) => any[];
  get: (...params: any[]) => any | undefined;
  run: (...params: any[]) => { changes: number; lastInsertRowid: number };
}

export interface DbInterface {
  exec: (sql: string) => void;
  prepare: (sql: string) => PreparedQuery;
}

let dbInstance: any = null;
let initPromise: Promise<any> | null = null;

function saveDbToDisk() {
  if (dbInstance) {
    try {
      const data = dbInstance.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(DB_PATH, buffer);
    } catch (e) {
      console.error('Failed to save SQLite DB to disk', e);
    }
  }
}

async function initializeDatabase() {
  if (dbInstance) return dbInstance;

  const SQL = await initSqlJs({
    locateFile: (file: string) => path.join(process.cwd(), 'node_modules/sql.js/dist', file),
  });

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    dbInstance = new SQL.Database(fileBuffer);
  } else {
    dbInstance = new SQL.Database();
  }

  initSchema();
  return dbInstance;
}

export async function getDb(): Promise<DbInterface> {
  if (!dbInstance) {
    if (!initPromise) {
      initPromise = initializeDatabase();
    }
    await initPromise;
  }

  return {
    exec: (sql: string) => {
      dbInstance.run(sql);
      saveDbToDisk();
    },
    prepare: (sql: string): PreparedQuery => {
      return {
        all: (...params: any[]) => {
          const stmt = dbInstance.prepare(sql);
          if (params.length > 0) {
            stmt.bind(params);
          }
          const results: any[] = [];
          while (stmt.step()) {
            results.push(stmt.getAsObject());
          }
          stmt.free();
          return results;
        },
        get: (...params: any[]) => {
          const stmt = dbInstance.prepare(sql);
          if (params.length > 0) {
            stmt.bind(params);
          }
          let result: any = undefined;
          if (stmt.step()) {
            result = stmt.getAsObject();
          }
          stmt.free();
          return result;
        },
        run: (...params: any[]) => {
          if (params.length > 0) {
            dbInstance.run(sql, params);
          } else {
            dbInstance.run(sql);
          }
          saveDbToDisk();

          // Get last insert row id
          const idRow = dbInstance.exec('SELECT last_insert_rowid() as id');
          const lastId = idRow.length > 0 && idRow[0].values.length > 0 ? (idRow[0].values[0][0] as number) : 0;

          // Get changes
          const changesRow = dbInstance.exec('SELECT changes() as count');
          const changes = changesRow.length > 0 && changesRow[0].values.length > 0 ? (changesRow[0].values[0][0] as number) : 1;

          return { changes, lastInsertRowid: lastId };
        },
      };
    },
  };
}

function initSchema() {
  if (!dbInstance) return;

  const schemaPath = path.join(process.cwd(), 'src/lib/db/schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    dbInstance.run(schemaSql);
  }

  // Check if seeding is required
  const res = dbInstance.exec('SELECT count(*) as count FROM employees');
  const count = res.length > 0 && res[0].values.length > 0 ? (res[0].values[0][0] as number) : 0;
  
  if (count === 0) {
    seedDatabase();
  }
}

function seedDatabase() {
  if (!dbInstance) return;

  const employees = [
    ['Sarah Chen', 'sarah.chen@dayflow.internal', 'Engineering', 'Senior Frontend Engineer', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 12.0, 8.0, 20.0],
    ['Alex Kumar', 'alex.kumar@dayflow.internal', 'Engineering', 'Backend Architect', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 14.0, 10.0, 20.0],
    ['Maria Garcia', 'maria.garcia@dayflow.internal', 'Design', 'Lead Product Designer', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 10.5, 7.0, 20.0],
    ['James Wilson', 'james.wilson@dayflow.internal', 'Engineering', 'QA Engineer', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 15.0, 9.5, 20.0],
    ['Priya Patel', 'priya.patel@dayflow.internal', 'Marketing', 'Growth Marketing Lead', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 13.0, 6.0, 20.0],
    ['Marcus Vance', 'marcus.vance@dayflow.internal', 'Human Resources', 'HR Director (Admin)', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 20.0, 10.0, 20.0],
  ];

  for (const emp of employees) {
    dbInstance.run(
      'INSERT INTO employees (name, email, department, role, avatar_url, paid_balance, sick_balance, unpaid_balance) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      emp
    );
  }

  // 1. Approved Leave for Alex (Engineering) in the coming week (creates conflict baseline for Engineering)
  dbInstance.run(`
    INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, total_days, reason, status, admin_comment, reviewed_by, reviewed_at, created_at)
    VALUES (2, 'paid', '2026-08-25', '2026-08-28', 4.0, 'Annual family road trip and family reunion in the mountains.', 'approved', 'Approved. Ensure backend PRs are reviewed before leaving.', 6, datetime('now'), datetime('now', '-5 days'))
  `);

  // 2. Pending Request from Sarah (Engineering) - Overlapping with Alex (conflict trigger)
  // Created 4 days ago -> triggers Urgency SLA Breach (>3 days)
  dbInstance.run(`
    INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, total_days, reason, status, admin_comment, reviewed_by, reviewed_at, created_at)
    VALUES (1, 'paid', '2026-08-26', '2026-08-29', 4.0, 'Attending React Summit conference and taking personal rejuvenation days.', 'pending', null, null, null, datetime('now', '-4 days'))
  `);

  // 3. Pending Request from Maria (Design) - Created 1.5 days ago -> triggers Warning SLA (1-3 days)
  dbInstance.run(`
    INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, total_days, reason, status, admin_comment, reviewed_by, reviewed_at, created_at)
    VALUES (3, 'sick', '2026-08-24', '2026-08-25', 2.0, 'Scheduled minor dental surgery and recovery period recommended by dentist.', 'pending', null, null, null, datetime('now', '-36 hours'))
  `);

  // 4. Pending Request from James (Engineering) - Created 2 hours ago -> Normal SLA (<24h)
  dbInstance.run(`
    INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, total_days, reason, status, admin_comment, reviewed_by, reviewed_at, created_at)
    VALUES (4, 'paid', '2026-09-01', '2026-09-02', 2.0, 'Short weekend extension for personal family errands.', 'pending', null, null, null, datetime('now', '-2 hours'))
  `);

  // 5. Past Rejected Leave for Priya
  dbInstance.run(`
    INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, total_days, reason, status, admin_comment, reviewed_by, reviewed_at, created_at)
    VALUES (5, 'unpaid', '2026-08-10', '2026-08-12', 3.0, 'Extended vacation for friend wedding overseas.', 'rejected', 'Product launch blackout period during the week of Aug 10.', 6, datetime('now'), datetime('now', '-14 days'))
  `);

  // Seed normal attendance for past week
  for (let empId = 1; empId <= 6; empId++) {
    for (let day = 15; day <= 22; day++) {
      const dateStr = `2026-08-${day.toString().padStart(2, '0')}`;
      const dayOfWeek = new Date(dateStr).getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        dbInstance.run(
          'INSERT OR REPLACE INTO attendance (employee_id, date, status, notes) VALUES (?, ?, ?, ?)',
          [empId, dateStr, 'Present', 'Regular check-in']
        );
      }
    }
  }

  // Alex's approved leave synced to attendance (Aug 25 to Aug 28)
  for (let day = 25; day <= 28; day++) {
    const dateStr = `2026-08-${day.toString().padStart(2, '0')}`;
    dbInstance.run(
      'INSERT OR REPLACE INTO attendance (employee_id, date, status, leave_request_id, notes) VALUES (?, ?, ?, ?, ?)',
      [2, dateStr, 'Leave', 1, 'Approved Paid Leave (#1)']
    );
  }

  saveDbToDisk();
}
