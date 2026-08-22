# Dayflow HRMS — Enterprise Human Resource Management System

> **Every workday, perfectly aligned.**  
> *Odoo Hackathon 2026 Official Repository*

Dayflow HRMS is a production-grade, enterprise Human Resource & Attendance Management System featuring **Real-time Shift Clocking**, **Leave Management & Attendance Auto-Sync**, **Workforce Anomaly & Leave Risk Engine**, **Role-Tailored AI Analytics & Productivity Coaching**, **Interactive Live HR Activity Notifications**, and **Detailed CSV Audit Exports**.

---

## 🏗️ Architecture & Project Structure

```
Odoo_Hackthon/
├── client/                 React 18 + Vite (Production Web Frontend on port 3000 / 3001)
│   ├── src/
│   │   ├── components/     AppShell, PunchWidget, AdminMonitor, AnalyticsView, LeaveManager, 
│   │   │                   WorkforceRiskWidget, WeeklyView, LoginPortal, StatCard, StatusBadge
│   │   ├── services/       API client with JWT & httpOnly cookie handling
│   │   ├── App.jsx         Root application orchestrator & session manager
│   │   └── index.css       Enterprise Vanilla CSS design tokens & theme utilities
├── server/                 Node.js + Express (Production Backend API on port 5000)
│   ├── src/
│   │   ├── db/             Native SQLite (`node:sqlite`) with WAL mode & busy timeout
│   │   ├── middleware/     JWT Auth Context & Role-Based Access Control (RBAC) guards
│   │   ├── routes/         Attendance, Users, Leaves, and Workforce Risk API routes
│   │   └── server.js       Express application entry point & CORS configuration
│   └── tests/              21 Native automated test suites
├── archive/                Archived legacy prototype stacks (Unused; preserved for reference)
├── dev.js                  Full-stack concurrent dev process orchestrator
└── README.md
```

---

## 🌟 Key Features & Functional Modules

### 🔒 1. Enterprise Security & Privacy-First Authentication
- **Guaranteed Login Page First**: Enforces Login Page display on fresh tab load/session open.
- **Visual Captcha Verification**: HTML5 Canvas-rendered distorted security Captcha challenge with background noise lines.
- **Strict Role-Based Access Control (RBAC)**: Enforces `admin`, `manager`, and `employee` route and data visibility guards.
- **Password & Account Security**: `bcrypt` password hashing, account lockout protection after 5 failed attempts, SQL injection immunity.

### ⏰ 2. Shift & Attendance Management (`My Attendance`)
- **Live Shift Clock Hero**: Real-time clock-in / clock-out buttons with live elapsed shift timer.
- **Punctuality Tracking**: Server-enforced clock timestamps calculating late arrival minutes (`>09:30 AM`).
- **Weekly Target Progress Bar**: Visual progress tracker against the standard 40-hour weekly target goal.
- **Historical Attendance Log**: Calendar view and paginated shift history table with status badges (`Present`, `Half Day`, `Leave`, `Absent`).

### 📅 3. Leave Management & Attendance Auto-Sync (`My Leaves` / `Leave Approvals`)
- **Real-Time Leave Balances**: 20 Paid Annual days, 10 Sick days, 30 Unpaid days.
- **Employee Time-Off Applications**: Date pickers with automated duration calculation and mandatory reason notes.
- **HR Review Queue**: Admin & Manager review interface with 1-click **Approve** or **Reject with Comments**.
- **Attendance Auto-Sync**: Approving a leave application automatically converts matching employee attendance records to **`Leave`** status.

### 🛡️ 4. Workforce Attendance & Leave Risk Engine
- **Department Anomaly Detection**: Real-time evaluation of attendance risk indicators across departments.
- **Risk Level Classifications**: Renders **LOW**, **MEDIUM**, or **HIGH** risk badges.
- **Anomaly Detection Patterns**:
  - **Monday/Friday Absence Spikes**: Identifies long-weekend extension attempts.
  - **Sick Leave Surges**: Detects abnormal health absence clusters.
  - **Overlapping Leave Clusters**: Alerts HR when multiple key team members apply for leave on identical dates.

### 🔮 5. AI Workforce Analytics & Productivity Coach (`My Analytics`)
- **Role-Tailored Privacy Scoping**:
  - **Employees**: See **Personal Shift Logs** & **Personal Productivity Coach Insights** (company department breakdowns hidden for privacy).
  - **Admins & Managers**: See **Executive Department Performance Breakdowns**, 6-Week Trends, and AI Manager Action Recommendations.

### 📥 6. Detailed CSV Audit Report Exports
- **1-Click CSV Exports** on Admin Monitor and Analytics views.
- **Rich Header Metadata**: Title, generated timestamp, user role, report date, department scope, and total records count.
- **Comprehensive Columns**: Employee code, name, email, department, designation, shift date, status, clock-in, clock-out, work hours, overtime hours, late minutes, punctuality status, and manager remarks.

### 🔔 7. Interactive HR Notifications Drawer & Activity Feed
- Interactive **Notifications Drawer** accessible via the Bell icon in the header.
- Displays live check-in events, late arrival alerts, leave application submissions, and workforce risk warnings.

---

## 👥 20 Pre-Seeded Demo Persona Directory

All pre-seeded demo accounts use the standard password: **`Password123!`**

| # | Name | Work Email | Role | Department | Designation |
|:---|:---|:---|:---|:---|:---|
| 1 | **Sarah Jenkins** | `sarah.jenkins@dayflow.io` | 🛡️ Admin | HR & People | VP of People / Admin |
| 2 | **Alex Chen** | `alex.chen@dayflow.io` | 💻 Employee | Engineering | Senior Full Stack Engineer |
| 3 | **Priya Patel** | `priya.patel@dayflow.io` | 💻 Employee | Engineering | Frontend Architect |
| 4 | **Marcus Vance** | `marcus.vance@dayflow.io` | 👔 Manager | Design | Lead Product Designer |
| 5 | **Elena Rostova** | `elena.rostova@dayflow.io` | 💻 Employee | HR & People | Talent Acquisition Partner |
| 6 | **David Kim** | `david.kim@dayflow.io` | 💻 Employee | Sales | Enterprise Account Executive |
| 7 | **Fatima Al-Mansoor** | `fatima.m@dayflow.io` | 💻 Employee | Engineering | Staff Cloud & DevOps |
| 8 | **Jonathan Hayes** | `jonathan.hayes@dayflow.io` | 🛡️ Admin | Finance | VP of Finance / Admin |
| 9 | **Maria Santos** | `maria.santos@dayflow.io` | 👔 Manager | Engineering | Engineering Director |
| 10 | **Liam O'Connor** | `liam.oconnor@dayflow.io` | 👔 Manager | Sales | VP of Global Sales |
| 11 | **Aisha Khan** | `aisha.khan@dayflow.io` | 👔 Manager | Marketing | Head of Growth Marketing |
| 12 | **Robert Taylor** | `robert.taylor@dayflow.io` | 👔 Manager | Operations | Director of Operations |
| 13 | **Sophie Dubois** | `sophie.dubois@dayflow.io` | 💻 Employee | Design | Senior UI/UX Designer |
| 14 | **Carlos Mendez** | `carlos.mendez@dayflow.io` | 💻 Employee | Finance | Senior Financial Analyst |
| 15 | **Nina Gupta** | `nina.gupta@dayflow.io` | 💻 Employee | Marketing | Content Strategy Lead |
| 16 | **Hiroshi Tanaka** | `hiroshi.tanaka@dayflow.io` | 💻 Employee | Engineering | Backend Systems Engineer |
| 17 | **Chloe Bennet** | `chloe.bennet@dayflow.io` | 💻 Employee | Operations | Logistics & HR Coordinator |
| 18 | **Vikram Malhotra** | `vikram.malhotra@dayflow.io` | 🛡️ Admin | Operations | Chief Operating Officer / Admin |
| 19 | **Hannah Schmidt** | `hannah.schmidt@dayflow.io` | 💻 Employee | Finance | Payroll Specialist |
| 20 | **Lucas Silva** | `lucas.silva@dayflow.io` | 💻 Employee | Sales | Business Development Rep |

---

## ⚡ Setup & Execution Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 1. Clone Repository & Install Dependencies
```bash
git clone https://github.com/Ajai2006/Odoo_Hackthon.git
cd Odoo_Hackthon

# Installs server and client dependencies concurrently
npm run setup
```

### 2. Initialize & Seed Database
```bash
# Seeds 20 demo members, leave balances, and 28-day attendance logs
npm run seed
```

### 3. Launch Development Server
```bash
# Starts Express API (:5000) and React Vite (:3000 / :3001) concurrently
npm run dev
```
Open **http://localhost:3000** (or **http://localhost:3001**) in your browser.

### 4. Run Automated Unit & Integration Tests
```bash
# Runs native Node test runner across all 21 test suites
npm test
```

---

## 🔌 API Reference & Endpoints

| Method | Endpoint | Access | Description |
|:---|:---|:---|:---|
| `POST` | `/api/users/login` | Public | Authenticates work email & password; issues signed JWT via `httpOnly` cookie. |
| `POST` | `/api/users/logout` | Public | Clears authentication cookie and invalidates session. |
| `GET` | `/api/users/me` | Authenticated | Returns current authenticated user and employee record. |
| `GET` | `/api/users/demo-personas` | Public | Returns pre-seeded demo user directory. |
| `GET` | `/api/attendance/today` | Employee | Returns today's active shift status for live punch hero. |
| `POST` | `/api/attendance/checkin` | Employee | Clock in for today's shift. Enforces server time. |
| `POST` | `/api/attendance/checkout` | Employee | Clock out for today's shift. Computes work hours and overtime. |
| `GET` | `/api/attendance/all` | Admin / Manager | Real-time attendance roster monitor across departments. |
| `GET` | `/api/attendance/analytics` | Authenticated | Department breakdown, 6-week trend, and AI insights. |
| `GET` | `/api/attendance/analytics/workforce-risk` | Admin / Manager | Rule-based Workforce Risk Engine evaluating attendance anomalies. |
| `GET` | `/api/leaves/balance` | Employee | Returns employee leave balances (Paid, Sick, Unpaid). |
| `POST` | `/api/leaves` | Employee | Submits a time-off request with date bounds validation. |
| `GET` | `/api/leaves` | Admin / Manager | Returns pending and processed leave review queue. |
| `PATCH` | `/api/leaves/:id/approve` | Admin / Manager | Approves leave; auto-syncs employee attendance calendar to `Leave` status. |
| `PATCH` | `/api/leaves/:id/reject` | Admin / Manager | Rejects leave request with mandatory reviewer notes. |

---

## 🧪 Automated Testing Suite (21 Test Suites)

All 21 test suites pass with **0 failures**:
- `✔ Attendance API - Duplicate check-in is rejected with 409`
- `✔ Attendance API - Checkout timestamp must be > check-in timestamp`
- `✔ Attendance API - Work hours and status calculation`
- `✔ Attendance Analytics - Metric calculations return consistent aggregates`
- `✔ RBAC - Seed data establishes 3-Tier roles (admin, manager, employee)`
- `✔ RBAC - Department scoping filters records accurately for managers`
- `✔ User Registration - POST /api/users/register creates real user & balances`
- `✔ Leave Module - Employee can view leave balance and apply for leave`
- `✔ Leave Module - Rejects application if leave balance is insufficient`
- `✔ Leave Approval - Admin approval auto-updates attendance records`
- `✔ Workforce Risk Engine - GET /api/attendance/analytics/workforce-risk`
- `✔ Security - Unauthenticated requests without valid JWT are rejected with 401`
- `✔ Security - Valid JWT login sets httpOnly cookie and grants authenticated access`
- `✔ Security - Role-based route protection enforces admin privileges`
- `✔ Security - Timestamp spoofing on check-in is blocked`
- `✔ Security - Admin debug flag allows controlled timestamp overrides`
- `✔ Security - Password verification with bcrypt succeeds for correct password`
- `✔ Security - Account lockout triggers after 5 consecutive failed login attempts`
- `✔ SQL Injection - Login endpoint rejects injection payloads safely`
- `✔ SQL Injection - Search and filter query parameters treat injection as literal strings`
- `✔ SQL Injection - Department and status filters treat malicious strings as literal filters`

---

## 📄 License

This repository is built for the **Odoo Hackathon 2026**. All rights reserved.
