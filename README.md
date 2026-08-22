# Dayflow HRMS

> **Every workday, perfectly aligned.**

Full-stack enterprise HRMS featuring **Attendance & Shift Management**, **Role-Based Access Control (RBAC)**, **Payroll**, **Leave Management**, and **Workforce Analytics**.

---

## 🏗️ Architecture & Modules

```
HRM/
├── client/           React 18 + Vite (Dayflow Attendance & Analytics UI)
├── server/           Express.js + Native SQLite (Attendance, RBAC & Analytics API)
├── backend/          Django 5 + DRF (Accounts, Payroll)
├── frontend/         React 18 + Vite + Tailwind CSS
├── components/       Shared design system UI components
└── dev.js            Full-stack orchestrator
```

---

## 🚀 Quick Start (Attendance & Analytics Module)

### 1. Install & Seed
```bash
# Seed realistic attendance history, RBAC personas (Admin, Manager, Employee)
npm run seed
```

### 2. Start Full-Stack Dev Server
```bash
# Concurrently runs Express API (:5000) and React Vite (:3000)
npm run dev
```

### 3. Run Automated Tests
```bash
# Executes native test suite for validation & RBAC rules
npm test
```

---

## ⚡ Attendance & RBAC Endpoints

| Method | Endpoint | Access | Description & Validation |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/attendance/checkin` | Employee | Clock in for today. Server-side rejection for duplicate check-ins (`409 Conflict`). Computes punctuality/late delta. |
| `POST` | `/api/attendance/checkout` | Employee | Clock out for today. Validates `check_out > check_in` (`400 Bad Request`). Calculates work hours and determines `present` / `half_day` / `incomplete`. |
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

4. **Authentication Portal**:
   - Click top-right avatar and choose **Sign out** to access the dedicated **Login Portal**.

---

## 💰 Payroll API

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| `GET` | `/api/payroll/my/?month=&year=` | Employee | Own payslip |
| `GET` | `/api/payroll/` | Admin | All records |
| `GET` | `/api/payroll/{id}/` | Admin | Specific record |
| `POST` | `/api/payroll/` | Admin | Create record |
| `PUT` | `/api/payroll/{id}/` | Admin | Update (requires `reason`) |
| `GET` | `/api/payroll/{id}/audit/` | Admin | Audit log |
| `GET` | `/api/payroll/stats/` | Admin | Dashboard stats |
| `GET` | `/api/accounts/me/` | Any auth | Current user info |
| `POST` | `/api/token/` | Public | Obtain JWT |
| `POST` | `/api/token/refresh/` | Public | Refresh JWT |
