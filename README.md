# Dayflow HRMS — Attendance Module

[![Dayflow Architecture](https://img.shields.io/badge/Dayflow-Attendance%20Module-indigo)](https://github.com)
[![Status](https://img.shields.io/badge/Branch-feature%2Fattendance-emerald)](https://github.com)
[![Tests](https://img.shields.io/badge/Tests-Passing%20(100%25)-green)](https://github.com)

Welcome to the **Attendance Module** of the **Dayflow HRMS** platform, built autonomously for a 4-person hackathon team.

---

## 🏗️ Architecture & Integrations

### Database & Relational Schema (SQLite Pure Native)
- **`attendance` Table (Core Scope)**:
  - `id` (INTEGER PK AUTOINCREMENT)
  - `employee_id` (INTEGER NOT NULL FK -> `employees.id` ON DELETE CASCADE)
  - `date` (DATE NOT NULL)
  - `check_in` (TEXT timestamp `YYYY-MM-DD HH:MM:SS`)
  - `check_out` (TEXT timestamp `YYYY-MM-DD HH:MM:SS`)
  - `status` (CHECK in `'present', 'absent', 'half_day', 'leave', 'incomplete'`)
  - `work_hours` (REAL calculated shift duration)
  - `late_minutes` (INTEGER delta past 09:30 AM)
  - `notes` (TEXT)
  - `created_at` (DATETIME)
  - `CONSTRAINT uq_employee_date UNIQUE(employee_id, date)`

### Shared Team Contracts (Stubs for Teammates)
1. **Member 1 Contract (Auth & Employees)**:
   - `users` table (`id`, `name`, `email`, `role`, `avatar`)
   - `employees` table matching `{ id, user_id, employee_code, department, designation, joining_date }`
   - `authContext` & `requireRole('admin' | 'employee')` middleware.
2. **Member 4 Contract (Shared StatCard)**:
   - `StatCard.jsx` (`title`, `value`, `icon`, `change`, `changeType`, `subtitle`, `variant`)

---

## ⚡ API Endpoints

| Method | Endpoint | Access | Description & Validation |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/attendance/checkin` | Employee | Clock in for today. Server-side rejection for duplicate check-ins (`409 Conflict`). Computes punctuality/late delta. |
| `POST` | `/api/attendance/checkout` | Employee | Clock out for today. Validates `check_out > check_in` (`400 Bad Request`). Calculates work hours and determines `present` / `half_day` / `incomplete`. |
| `GET` | `/api/attendance/today` | Employee | Returns today's active punch and shift status for live widget. |
| `GET` | `/api/attendance` | Employee | Personal historical attendance records with date/month filtering. |
| `GET` | `/api/attendance/weekly` | Employee | Current week (Mon-Sun) hours breakdown vs 40h target. |
| `GET` | `/api/attendance/all` | Admin Only | Real-time attendance monitor across all employees with Date, Department, Status, and Search filters. |
| `GET` | `/api/attendance/analytics` | All | Differentiator analytics: Attendance %, present/absent/leave counts, late-arrival count, department breakdown, and weekly trend. |

---

## 🚀 Quick Start Guide

### 1. Install & Seed
```bash
# Seed realistic 30-day attendance history & employees
npm run seed
```

### 2. Start Full-Stack Dev Server
```bash
# Concurrently runs Express API (:5000) and React Vite (:3000)
npm run dev
```

### 3. Run Automated Tests
```bash
# Executes native test suite for server validation rules
npm test
```

---

## 🎯 End-to-End Demo Workflow

1. **Employee Experience**:
   - Open `http://localhost:3000` (defaults to **Alex Chen - Senior Software Engineer**).
   - Click the green **CHECK IN** button in the Live Punch Hero.
   - Observe live digital clock and active elapsed shift timer start counting up.
   - Attempt duplicate check-in (button transitions smoothly, backend rejects duplicate).
   - Click **CHECK OUT** to conclude shift.
   - See work hours calculated and immediately reflected in the **Weekly Breakdown Bar View**, **Monthly Calendar Matrix**, and **Personal History Table**.

2. **Admin Experience**:
   - Switch persona in top right dropdown to **Sarah Jenkins (Admin / HR Lead)**.
   - Navigate to **Attendance Monitor** tab.
   - See live organizational headcount, clocked-in count, late arrivals, and on-leave staff.
   - Filter by **Department** (Engineering, HR, Sales, Design) or **Date**.
   - Search by employee name or code.

3. **Workforce Analytics (Differentiator)**:
   - Navigate to **Workforce Analytics** tab.
   - Review overall attendance %, present/half-day distribution, punctuality metrics, department-wise comparisons, and weekly historical trend logs.
