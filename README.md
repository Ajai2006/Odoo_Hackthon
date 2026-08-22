# Dayflow HRMS

> **Every workday, perfectly aligned.**

Full-stack HRMS built with Django 5 + DRF (backend) and React 18 + Vite + Tailwind CSS (frontend).

---

## 🏗️ Project Structure

```
HRM/
├── backend/          Django 5 + DRF + Simple JWT
│   ├── core/         Settings, URLs, WSGI
│   ├── accounts/     User, Employee models + permissions (Member 1)
│   └── payroll/      Payroll model, serializers, views, admin
└── frontend/         React 18 + Vite + Tailwind CSS
    └── src/
        ├── components/ui/   Shared design system (5 components)
        ├── contexts/        AuthContext (JWT)
        ├── services/        Axios API client
        └── pages/
            ├── Login.jsx
            ├── employee/    Dashboard, PayslipViewer
            └── admin/       Dashboard, PayrollTable
```

---

## 🚀 Quick Start

### Backend

```bash
cd backend

# 1. Install dependencies (first time)
pip install -r requirements.txt

# 2. Run migrations
python manage.py migrate

# 3. Create a superuser (admin)
python manage.py createsuperuser

# 4. Start the dev server
python manage.py runserver
# → API available at http://127.0.0.1:8000/
```

### Frontend

```bash
cd frontend

# 1. Install dependencies (first time)
npm install

# 2. Start the dev server
npm run dev
# → App available at http://localhost:5173/
```

---

## 🎨 Design System (Part A)

Components in `frontend/src/components/ui/`:

| Component | Props |
|---|---|
| `StatCard` | `title, value, icon, trend, color, loading` |
| `DataTable` | `columns, data, onRowClick, actions, searchable, pageSize, loading` |
| `StatusBadge` | `status, size` |
| `Modal` | `isOpen, onClose, title, children, size, footer` |
| `Sidebar` | `role` (reads from AuthContext) |

```js
import { StatCard, DataTable, StatusBadge, Modal, Sidebar } from '@/components/ui'
```

See [`src/components/ui/README.md`](frontend/src/components/ui/README.md) for full prop docs.

---

## 💰 Payroll API (Part B)

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

### Validation rules

- All monetary fields must be **≥ 0** (enforced by DRF serializer, not just UI)
- `net_salary` must be **> 0** (preview computed before save)
- `reason` is **required on PUT** — enforced server-side
- Employees have **zero write access** — enforced by `IsAdmin` permission class

---

## 📊 Dashboards (Part C)

### Employee (`/employee/dashboard`)
- StatCards: today's attendance, monthly attendance %, pending leaves, leave balance
- Recent activity feed
- Quick links (Payslip, Leave, Attendance)

### Admin (`/admin/dashboard`)
- StatCards: total employees, present/absent/on-leave today, pending approvals
- Searchable/sortable employee DataTable with attendance progress bars
- HR activity feed

> ⚠️ **Integration Note**: Dashboards use `MOCK_DATA` constants. When Member 2 (Attendance) and Member 3 (Leave) land their APIs, replace the mock `setTimeout` blocks with real `api.get()` calls. TODO comments mark every location.

---

## 🌿 Branches

- `main` — stable base
- `feature/payroll` — Part B: payroll Django app + React UI
- `feature/ui-polish` — Part A: shared design system

---

## 👥 Team Integration Notes

**For Member 1 (accounts)**
- Replace `backend/accounts/models.py` stub with full User/Employee implementation
- Keep `role` field and `employee_profile` related_name — payroll depends on them
- Keep `IsAdmin` / `IsEmployee` in `accounts/permissions.py`

**For Member 2 (attendance)**
- Admin dashboard expects: `GET /api/attendance/stats/today/` → `{ present_today, absent_today, on_leave_today }`
- Employee dashboard expects: `GET /api/attendance/my/today/` → `{ status: 'present'|'absent'|'on-leave'|'late' }` and `GET /api/attendance/my/summary/?month=&year=` → `{ percentage: 92.3 }`

**For Member 3 (leave)**
- Employee dashboard expects: `GET /api/leave/my/summary/` → `{ pending: 2, balance: 8 }`
- Admin dashboard expects: `GET /api/leave/pending/count/` → `{ count: 7 }`
