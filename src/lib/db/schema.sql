-- Dayflow HRMS Database Schema

-- Employees Table (Member 1 Module)
CREATE TABLE IF NOT EXISTS employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  department TEXT NOT NULL,
  role TEXT NOT NULL,
  avatar_url TEXT,
  paid_balance REAL NOT NULL DEFAULT 15.0,
  sick_balance REAL NOT NULL DEFAULT 10.0,
  unpaid_balance REAL NOT NULL DEFAULT 20.0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Leave Requests Table (Member 3 - Our Module)
CREATE TABLE IF NOT EXISTS leave_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL CHECK(leave_type IN ('paid', 'sick', 'unpaid')),
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  total_days REAL NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  admin_comment TEXT DEFAULT NULL,
  reviewed_by INTEGER REFERENCES employees(id) ON DELETE SET NULL,
  reviewed_at TEXT DEFAULT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Attendance Table (Member 2 Module)
CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('Present', 'Absent', 'Leave', 'Half-day', 'Holiday')),
  leave_request_id INTEGER REFERENCES leave_requests(id) ON DELETE SET NULL,
  notes TEXT DEFAULT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(employee_id, date)
);

-- Indices for rapid queries and conflict lookups
CREATE INDEX IF NOT EXISTS idx_leave_emp ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_dates ON leave_requests(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_att_emp_date ON attendance(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_att_date ON attendance(date);
