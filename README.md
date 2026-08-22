# Dayflow HRMS

> **Every workday, perfectly aligned.**

Full-stack enterprise HRMS featuring **Attendance & Shift Management**, **Leave Management Workflow**, **Workforce Risk & Anomaly Engine**, **JWT Authentication & RBAC**, **HttpOnly Cookie Security**, and **Offline SQLite Database Import**.

---

## 🏗️ Architecture & Stack Scope

```
HRM/
├── client/           React 18 + Vite (Live Production Frontend on port 3000)
├── server/           Express.js + Native SQLite (Live Production Backend API on port 5000)
├── archive/          Earlier prototype stacks & static UI drafts (Not part of running app)
├── dev.js            Full-stack orchestrator
└── README.md
```

> **Note:** `archive/` contains earlier prototype stacks (`backend/`, `frontend/`, `src/`, static HTML files) preserved for reference, and is NOT part of the running application.

---

## 🚀 Quick Start (Production Setup)

> **Evaluators: run these commands from the repo root, in order.**

### 1. Install dependencies (installs server/ and client/ automatically)
```bash
npm run setup
```

### 2. Import & seed the database (100% offline)
```bash
# Execute pure SQL schema & seed import offline
npm run db:import

# Seed realistic attendance history, leave requests, and RBAC personas
npm run seed
```

### 3. Start Full-Stack Dev Server
```bash
# Concurrently runs Express API (:5000) and React Vite (:3000)
npm run dev
```
Then open **http://localhost:3000** in your browser.

### 4. Run Automated Test Suite
```bash
# Executes native test suite (JWT auth, SQL injection prevention, leave workflow, workforce risk engine)
npm test
```

---

## ⚡ Core API & Security Endpoints

| Method | Endpoint | Access | Description & Security Validation |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/users/register` | Public | Real user & employee registration with `bcrypt` password hashing and leave balance initialization. |
| `POST` | `/api/users/login` | Public | Authenticates credentials with `bcrypt`, rate limiting (5 attempts/15m), account lockout, and signed JWT issuance via `httpOnly` cookie. |
| `POST` | `/api/users/logout` | Public | Clears `httpOnly` authentication cookie. |
| `GET` | `/api/users/me` | Authenticated | Returns current authenticated user and employee profile. |
| `GET` | `/api/users` | Admin | Returns full user roster. Enforced by `requireRole('admin')`. |
| `POST` | `/api/attendance/checkin` | Employee | Clock in for today. Server clock enforced (`new Date()`). Custom timestamp overrides require admin debug flag (`?debug=true`). |
| `POST` | `/api/attendance/checkout` | Employee | Clock out for today. Server clock enforced. Validates `check_out > check_in` (`400 Bad Request`). |
| `GET` | `/api/attendance/today` | Employee | Returns today's active punch and shift status for live widget. |
| `GET` | `/api/attendance/all` | Admin & Manager | Real-time attendance monitor (Admins see all departments; Managers scoped to team). |
| `GET` | `/api/leaves/balance` | Employee | Returns current employee's paid, sick, and unpaid leave balances. |
| `GET` | `/api/leaves/my` | Employee | Returns current employee's leave applications and status history. |
| `POST` | `/api/leaves` | Employee | Submits a new leave request. Validates date bounds and available balances. |
| `GET` | `/api/leaves` | Admin & Manager | Returns all pending and processed leave requests across department. |
| `PATCH` | `/api/leaves/:id/approve` | Admin & Manager | Approves leave request; auto-syncs employee's attendance records to `leave` status for approved dates. |
| `PATCH` | `/api/leaves/:id/reject` | Admin & Manager | Rejects leave request with mandatory reviewer comments. |
| `GET` | `/api/attendance/analytics/workforce-risk` | Admin & Manager | Transparent rule-based Workforce Risk Engine evaluating Monday/Friday absence spikes, sick leave surges, and leave clusters. |

---

## 🎯 End-to-End Demo Workflow

1. **Registration & Auth**:
   - Register a new account or log in via `http://localhost:3000`.
   - Passwords are verified via `bcrypt` with consecutive attempt lockouts.
   - JWT tokens are handled securely via `httpOnly` cookies and `Authorization: Bearer <token>`.

2. **Shift Clocking & Attendance**:
   - Click **CHECK IN** in the Live Punch Hero to start shift timer.
   - Click **CHECK OUT** to conclude shift and automatically compute work hours.

3. **Leave Management & Auto-Sync**:
   - Employee applies for leave via `/employee/leave` -> Server validates date range & leave balance.
   - Admin reviews pending request on Admin Dashboard -> Approves request.
   - System automatically marks matching calendar dates as `Leave` in the attendance records.

4. **Workforce Risk Engine**:
   - Admin views real-time department risk classification (`LOW`, `MEDIUM`, `HIGH`) and anomaly indicators on the Admin Dashboard.
