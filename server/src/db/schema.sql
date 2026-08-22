-- Dayflow HRMS SQLite Schema
-- Enable Foreign Key constraints
PRAGMA foreign_keys = ON;

-- Users table (Stubbed for Member 1 auth dependency)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT CHECK(role IN ('admin', 'employee', 'manager')) NOT NULL DEFAULT 'employee',
    avatar TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Employees table (Stubbed for Member 1 dependency: {id, user_id, department, designation})
CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    employee_code TEXT UNIQUE NOT NULL,
    department TEXT NOT NULL,
    designation TEXT NOT NULL,
    joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Attendance table (Core Module Scope)
CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    date DATE NOT NULL,
    check_in TEXT,
    check_out TEXT,
    status TEXT CHECK(status IN ('present', 'absent', 'half_day', 'leave', 'incomplete')) NOT NULL DEFAULT 'incomplete',
    work_hours REAL DEFAULT 0.0,
    late_minutes INTEGER DEFAULT 0,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT uq_employee_date UNIQUE (employee_id, date)
);

-- Indexes for lightning fast lookups & analytical queries
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON attendance(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance(status);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
