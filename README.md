# Dayflow HRMS — Enterprise Human Resource Management System

> **Every workday, perfectly aligned.**  
> *Odoo Hackathon 2026 Official Repository*

[![CI](https://github.com/Ajai2006/Odoo_Hackthon/actions/workflows/test.yml/badge.svg)](https://github.com/Ajai2006/Odoo_Hackthon/actions/workflows/test.yml)

Dayflow HRMS is a production-grade, enterprise Human Resource & Attendance Management System featuring **Real-time Shift Clocking**, **Leave Management & Attendance Auto-Sync**, **Workforce Anomaly & Leave Risk Engine**, **Role-Tailored AI Analytics**, **Interactive HR Notifications**, **Detailed Multi-Section CSV Audit Exports**, and a **Floating Offline AI Assistant**.

---

## 🏗️ Project Structure & Active Stack

```
Odoo_Hackthon/                      ← Repo root
├── client/                         ← ✅ ACTIVE — React 18 + Vite frontend (port 3000)
│   ├── src/
│   │   ├── components/             AppShell, PunchWidget, AdminMonitor, AnalyticsView,
│   │   │                           LeaveManager, WorkforceRiskWidget, WeeklyView,
│   │   │                           CalendarView, AIAssistantWidget, LoginPortal,
│   │   │                           StatCard, StatusBadge, Navbar
│   │   ├── services/api.js         Axios-free API client with JWT & httpOnly cookie handling
│   │   ├── App.jsx                 Root session manager and tab router
│   │   └── index.css               Enterprise CSS design system with tokens & utilities
│   ├── index.html
│   └── vite.config.js
│
├── server/                         ← ✅ ACTIVE — Node.js + Express backend (port 5000)
│   ├── src/
│   │   ├── db/                     Native SQLite (node:sqlite), seed.js, schema, migrations
│   │   ├── middleware/             JWT auth context + RBAC role guards
│   │   ├── routes/                 attendance.js, users.js, leaves.js
│   │   └── server.js               Express entry point, CORS, helmet security
│   ├── tests/                      21 native Node test suites (SQL injection, security, RBAC)
│   └── .env.example
│
├── .github/
│   └── workflows/test.yml          ← GitHub Actions CI: runs on push/PR to main
│
├── .env.example                    All required environment variables (see env config below)
├── dev.js                          Concurrent process orchestrator (spawns server + client)
└── package.json                    Root scripts: setup, dev, seed, test, build
```

> **No legacy stacks exist in this repository.** The `archive/` folder (earlier Next.js and Django prototypes) was removed in a prior cleanup commit. All active code lives exclusively in `client/` (React 18 + Vite) and `server/` (Express + Node.js + SQLite).

---

## ⚡ Quick Start — Installation & Running

### Prerequisites
- **Node.js** v18+ (v20 recommended)
- **npm** v9+

### 1. Clone the Repository
```bash
git clone https://github.com/Ajai2006/Odoo_Hackthon.git
cd Odoo_Hackthon
```

### 2. Install All Dependencies (Server + Client)
```bash
npm run setup
```

### 3. Configure Environment Variables
```bash
# Copy the example file and edit if needed
cp .env.example .env
cp server/.env.example server/.env
```

See the [**Environment Configuration**](#-environment-configuration) section below for all required variables.

### 4. Seed the Database (20 Demo Members)
```bash
npm run seed
```

### 5. Start the Development Server
```bash
# Concurrently starts Express API (:5000) and React Vite (:3000)
npm run dev
```

Open **http://localhost:3000** in your browser.

### 6. Run the Automated Test Suite
```bash
npm test
```
Expected: **21 tests pass, 0 fail.**

---

## 🐳 Docker Deploy (One Command)

**Prerequisites:** Docker + Docker Compose installed.

```bash
# Clone and deploy the full stack (API + frontend) in one command
git clone https://github.com/Ajai2006/Odoo_Hackthon.git
cd Odoo_Hackthon
docker compose up --build
```

| Service | Container | URL |
|:---|:---|:---|
| Express API | `dayflow-server` | http://localhost:5000 |
| React Frontend (nginx) | `dayflow-client` | http://localhost:3000 |

The SQLite database is persisted in a named Docker volume (`dayflow_db`) and survives container restarts.

To stop and clean up:
```bash
docker compose down
```

---

## 🔐 Environment Configuration

### Root `.env` (copy from `.env.example`)
| Variable | Default | Description |
|:---|:---|:---|
| `PORT` | `5000` | Express backend port |
| `NODE_ENV` | `development` | `development` / `production` / `test` |
| `JWT_SECRET` | *(see example)* | Strong random secret for JWT signing |
| `DB_PATH` | `dayflow.db` | SQLite database file path (relative to `server/`) |
| `CORS_ORIGINS` | *(see example)* | Comma-separated allowed frontend origins |
| `VITE_API_BASE_URL` | `http://localhost:5000` | Backend API base URL for Vite client |

### Server `.env` (`server/.env`, copy from `server/.env.example`)
Same variables as root, scoped to the server process. `VITE_*` vars are only needed in the root `.env` for the Vite dev server.

> ⚠️ **Never commit `.env` files.** They are already listed in `.gitignore`.

---

## 🌟 Feature Overview

### 🔒 1. Security-First Authentication
- **Login Portal with Canvas Captcha**: Visual HTML5 captcha challenge on each login.
- **Role-Based Access Control (RBAC)**: `admin`, `manager`, `employee` route guards.
- **bcrypt Passwords**: All passwords hashed at rest.
- **Account Lockout**: 5 consecutive failed login attempts triggers account lock.
- **JWT via httpOnly Cookie**: Tokens stored in `httpOnly` cookies; never exposed to JavaScript.
- **SQL Injection Immunity**: All queries use parameterized statements (verified by 3 dedicated test suites).

### ⏰ 2. Shift & Attendance Management
- **Live Shift Clock Hero**: Real-time clock-in / clock-out with elapsed timer.
- **Punctuality Tracking**: Server-enforced timestamps, late arrival detection (>09:30 AM).
- **Weekly Target Progress Bar**: Visual tracker against 40-hour weekly goal.
- **Monthly Calendar View**: Color-coded shift status calendar with hover popovers.

### 📅 3. Leave Management & Auto-Sync
- **Live Leave Balances**: 20 Paid, 10 Sick, 30 Unpaid days per employee.
- **Time-Off Applications**: Date pickers with duration calculation.
- **HR Review Queue**: 1-click approve/reject with mandatory reviewer notes.
- **Auto-Sync**: Approving leave auto-converts matching attendance records to `Leave` status.

### 🛡️ 4. Workforce Anomaly & Risk Engine
- Real-time anomaly detection: Monday/Friday absence spikes, sick leave surges, leave cluster conflicts.
- Risk level classifications: `LOW`, `MEDIUM`, `HIGH` with actionable recommendations.

### 🔮 5. AI Workforce Analytics (Role-Tailored)
- **Employees**: Personal shift logs, personal AI Productivity Coach.
- **Admins & Managers**: Department breakdowns, 6-week trends, AI Manager Recommendations.

### 📥 6. Multi-Section HR CSV Audit Exports
- **Section 1**: Overall workforce summary metrics with target benchmarks.
- **Section 2**: Individual employee shift-by-shift breakdown with overtime & punctuality ratings.
- **Section 3**: 6-week historical trend analysis.

### 🔔 7. Interactive Notifications Drawer
- Bell icon notifications for live check-in, late arrivals, leave requests, and risk alerts.

### 🤖 8. Floating Offline AI Assistant
- Compact floating AI badge available on all pages. 100% offline — no external API required.
- Contextual quick actions: Risk Radar, Punctuality Analysis, Leave Conflict Check.
- Natural language Q&A about shift status, attendance analytics, leave balances.

---

## 👥 20 Pre-Seeded Demo Accounts

Standard password for all accounts: **`Password123!`**

| Role | Email | Department |
|:---|:---|:---|
| 🛡️ Admin | `sarah.jenkins@dayflow.io` | HR & People |
| 🛡️ Admin | `jonathan.hayes@dayflow.io` | Finance |
| 🛡️ Admin | `vikram.malhotra@dayflow.io` | Operations |
| 👔 Manager | `marcus.vance@dayflow.io` | Design |
| 👔 Manager | `maria.santos@dayflow.io` | Engineering |
| 👔 Manager | `liam.oconnor@dayflow.io` | Sales |
| 👔 Manager | `aisha.khan@dayflow.io` | Marketing |
| 👔 Manager | `robert.taylor@dayflow.io` | Operations |
| 💻 Employee | `alex.chen@dayflow.io` | Engineering |
| 💻 Employee | `priya.patel@dayflow.io` | Engineering |
| 💻 Employee | `fatima.m@dayflow.io` | Engineering |
| 💻 Employee | `hiroshi.tanaka@dayflow.io` | Engineering |
| 💻 Employee | `elena.rostova@dayflow.io` | HR & People |
| 💻 Employee | `sophie.dubois@dayflow.io` | Design |
| 💻 Employee | `david.kim@dayflow.io` | Sales |
| 💻 Employee | `lucas.silva@dayflow.io` | Sales |
| 💻 Employee | `nina.gupta@dayflow.io` | Marketing |
| 💻 Employee | `carlos.mendez@dayflow.io` | Finance |
| 💻 Employee | `hannah.schmidt@dayflow.io` | Finance |
| 💻 Employee | `chloe.bennet@dayflow.io` | Operations |

---

## 🔌 API Reference

| Method | Endpoint | Access | Description |
|:---|:---|:---|:---|
| `POST` | `/api/users/login` | Public | Authenticate; issue JWT via `httpOnly` cookie |
| `POST` | `/api/users/logout` | Public | Clear auth cookie |
| `POST` | `/api/users/register` | Public | Register user + employee + leave balances |
| `GET` | `/api/users/me` | Authenticated | Current user & employee profile |
| `GET` | `/api/attendance/today` | Employee | Today's active shift status |
| `POST` | `/api/attendance/checkin` | Employee | Clock in (server-enforced time) |
| `POST` | `/api/attendance/checkout` | Employee | Clock out; compute work hours |
| `GET` | `/api/attendance/all` | Admin/Manager | Live attendance roster across departments |
| `GET` | `/api/attendance/analytics` | Authenticated | Department breakdown + 6-week trend metrics |
| `GET` | `/api/attendance/analytics/workforce-risk` | Admin/Manager | Workforce anomaly & risk evaluation |
| `GET` | `/api/leaves/balance` | Employee | Leave balances (Paid, Sick, Unpaid) |
| `POST` | `/api/leaves` | Employee | Submit time-off application |
| `GET` | `/api/leaves` | Admin/Manager | HR review queue |
| `PATCH` | `/api/leaves/:id/approve` | Admin/Manager | Approve leave; auto-sync attendance |
| `PATCH` | `/api/leaves/:id/reject` | Admin/Manager | Reject leave with reviewer notes |

---

## 🧪 Automated Test Suite

Run `npm test` — all 21 suites pass:

```
✔ Attendance API - Duplicate check-in rejected with 409
✔ Attendance API - Checkout timestamp must be > check-in
✔ Attendance API - Work hours and status calculation
✔ Attendance Analytics - Metric calculations consistent
✔ RBAC - 3-Tier roles (admin, manager, employee)
✔ RBAC - Department scoping for managers
✔ User Registration - Creates user, employee, and leave balances
✔ Leave Module - View balance and apply for leave
✔ Leave Module - Rejects if balance insufficient
✔ Leave Approval - Auto-updates attendance records
✔ Workforce Risk Engine - Evaluates risk indicators
✔ Security - Unauthenticated requests rejected with 401
✔ Security - Valid JWT sets httpOnly cookie
✔ Security - RBAC enforces admin privileges
✔ Security - Timestamp spoofing blocked
✔ Security - Admin debug flag for testing
✔ Security - bcrypt password verification
✔ Security - Account lockout after 5 failed attempts
✔ SQL Injection - Login endpoint safe
✔ SQL Injection - Search params treated as literals
✔ SQL Injection - Department/status filters treated as literals
```

CI runs automatically on every push and pull request to `main` via GitHub Actions.

---

## 📄 License

Built for **Odoo Hackathon 2026**. All rights reserved.
