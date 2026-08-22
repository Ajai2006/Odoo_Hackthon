# Dayflow HRMS

> **Every workday, perfectly aligned.**

Full-stack enterprise HRMS featuring **Attendance & Shift Management**, **JWT Authentication & RBAC**, **HttpOnly Cookie Security**, and **Workforce Analytics**.

---

## 🏗️ Architecture & Consolidated Stacks

```
HRM/
├── client/           React 18 + Vite (Production Attendance & Analytics UI)
├── server/           Express.js + Native Node SQLite (Production API & JWT Auth)
├── archive/          Archived prototypes & secondary stacks
│   ├── backend/      Django 5 + DRF (Accounts, Payroll prototype)
│   ├── frontend/     React 18 + Vite (Django frontend prototype)
│   ├── src/          Next.js 15 SQLite prototype
│   └── prototypes/   Standalone HTML/CSS prototypes
├── dev.js            Full-stack orchestrator
└── README.md
```

---

## 🚀 Quick Start (Production Module)

> **Evaluators: run these commands from the repo root, in order.**

### 1. Install dependencies (installs server/ and client/ automatically)
```bash
npm run setup
```

### 2. Seed the database
```bash
# Seed realistic attendance history, RBAC personas (Admin, Manager, Employee)
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
# Executes native test suite (Attendance validation, JWT auth bypass, and timestamp security)
npm test
```

---

## ⚡ Attendance, Auth & RBAC Endpoints

| Method | Endpoint | Access | Description & Security Validation |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/users/login` | Public | Authenticates user, issues signed JWT token, and sets `httpOnly` cookie (`auth_token`). |
| `POST` | `/api/users/logout` | Public | Clears `httpOnly` authentication cookie. |
| `GET` | `/api/users/me` | Authenticated | Returns current authenticated user and employee profile. |
| `GET` | `/api/users` | Admin | Returns full user roster. Enforced by `requireRole('admin')`. |
| `POST` | `/api/attendance/checkin` | Employee | Clock in for today. Date/time derived strictly from server clock (`new Date()`). Custom timestamp overrides require admin debug flag (`?debug=true`). |
| `POST` | `/api/attendance/checkout` | Employee | Clock out for today. Server clock enforced. Validates `check_out > check_in` (`400 Bad Request`). Calculates work hours and status. |
| `GET` | `/api/attendance/today` | Employee | Returns today's active punch and shift status for live widget. |
| `GET` | `/api/attendance` | Employee | Personal historical attendance records with date/month filtering. |
| `GET` | `/api/attendance/weekly` | Employee | Current week (Mon-Sun) hours breakdown vs 40h target. |
| `GET` | `/api/attendance/all` | Admin & Manager | Real-time attendance monitor (Admins see all departments; Managers scoped to team). |
| `GET` | `/api/attendance/analytics` | All Roles | Attendance %, present/absent/leave counts, late-arrival count, department breakdown, and trends. |
| `GET` | `/api/users/demo-personas` | Dev / Demo | Returns personas with designation, department, and role badges. |

---

## 🎯 End-to-End Demo Workflow

1. **Employee Experience**:
   - Open `http://localhost:3000` (defaults to **Alex Chen** or **Priya Patel**).
   - Click the green **CHECK IN** button in the Live Punch Hero.
   - Observe live digital clock and active elapsed shift timer start counting up.
   - Click **CHECK OUT** to conclude shift and view updated weekly & monthly charts.

2. **Manager Experience**:
   - Switch persona or log in as **Marcus Vance (Manager)**.
   - View **Team Attendance Monitor** locked to the **Design** team.
   - Review team analytics and punctuality logs.

3. **Admin Experience**:
   - Switch persona or log in as **Sarah Jenkins (Admin / HR Lead)**.
   - Access **Company Attendance Monitor** across all departments (Engineering, Design, HR, Sales).
   - Review organizational headcount, live clock-in roster, and executive analytics.

4. **Authentication & Security**:
   - Click top-right avatar and choose **Sign out** to clear the `httpOnly` cookie session.
   - All protected routes return `401 Unauthorized` if accessed without a valid signed JWT.
