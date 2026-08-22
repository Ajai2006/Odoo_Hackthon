# Dayflow UI Component Library

**Version 1.0.0** — Shared design system for Dayflow HRMS.

> 📢 **Team note:** Import from `./components/ui/index.js`. Design tokens live in `design-tokens.css`. Styles in `globals.css`, `sidebar.css`, `components.css`.

---

## Setup (no bundler needed)

```html
<!-- In any HTML page: -->
<link rel="stylesheet" href="./components/ui/design-tokens.css">
<link rel="stylesheet" href="./components/ui/globals.css">
<link rel="stylesheet" href="./components/ui/sidebar.css">   <!-- if using Sidebar -->
<link rel="stylesheet" href="./components/ui/components.css">

<script type="module">
  import { StatCard, DataTable, StatusBadge, Modal, Sidebar, showToast, DayflowDB, DayflowAuth } from './components/ui/index.js';
</script>
```

---

## Color Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--primary-900` | `#0F172A` | Headings, sidebar bg |
| `--primary-700` | `#1E3A5F` | Buttons, active nav |
| `--primary-500` | `#3B82F6` | Links, focus rings |
| `--success` | `#10B981` | Present, approved, positive |
| `--warning` | `#F59E0B` | Late, pending, caution |
| `--danger` | `#F43F5E` | Absent, rejected, error |
| `--info` | `#06B6D4` | On-leave, processing, info |
| `--bg-primary` | `#F8FAFC` | Page background |
| `--bg-surface` | `#FFFFFF` | Cards, modals |
| `--text-primary` | `#1E293B` | Body text |
| `--text-secondary` | `#64748B` | Subtitles, captions |
| `--border` | `#E2E8F0` | Dividers, card borders |

---

## Typography

| Class/Element | Size | Weight | Usage |
|---|---|---|---|
| `h1` | 32px / 2rem | 700 | Page titles |
| `h2` | 24px / 1.5rem | 600 | Section headings |
| `h3` | 20px / 1.25rem | 600 | Card titles |
| `Body` | 16px / 1rem | 400 | Paragraph text |
| `.caption` | 14px / 0.875rem | 400 | Metadata, timestamps |
| `.label` | 14px | 500 | Form labels |
| `.tabular` | — | — | Numbers with `tabular-nums` |

Font: **Inter** (Google Fonts, loaded in every page).

---

## Spacing Scale

`4px · 8px · 12px · 16px · 24px · 32px · 48px`

CSS vars: `--space-1` `--space-2` `--space-3` `--space-4` `--space-6` `--space-8` `--space-12`

---

## Border Radius

| Token | Value | Used on |
|---|---|---|
| `--radius-btn` | 6px | Buttons |
| `--radius-input` | 8px | Inputs, selects |
| `--radius-card` | 12px | Cards, panels |
| `--radius-modal` | 16px | Modals |
| `--radius-full` | 9999px | Badges, pills, avatars |

---

## Components

### `StatCard(props)` → `HTMLElement`

Metric card with icon, value, and optional trend indicator.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `title` | string | ✅ | Card label (e.g. "Present Today") |
| `value` | string \| number | ✅ | Metric value (e.g. `42` or `"86%"`) |
| `icon` | string | ✅ | Icon key from library (e.g. `'users'`, `'clock'`) |
| `color` | `'primary'` \| `'success'` \| `'warning'` \| `'danger'` \| `'info'` | — | Accent color. Default: `'primary'` |
| `trend` | `{ value: string, direction: 'up'|'down'|'neutral' }` | — | Trend badge below value |
| `subtitle` | string | — | Small text below value |
| `loading` | boolean | — | Renders skeleton loader |

```js
const card = StatCard({
  title: 'Present Today',
  value: 24,
  icon: 'attendance',
  color: 'success',
  trend: { value: '92% rate', direction: 'up' },
  subtitle: '2 late',
});
document.getElementById('stats').appendChild(card);
```

---

### `DataTable(props)` → `{ element, setData, refresh, getFilteredData }`

Sortable, searchable, paginated table.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `columns` | `Array<Column>` | ✅ | Column definitions |
| `data` | `Array<object>` | ✅ | Row data |
| `onRowClick` | `(row) => void` | — | Called on row click |
| `actions` | `(row) => HTMLElement[]` | — | Action buttons per row |
| `pageSize` | number | — | Rows per page. Default: `10` |
| `emptyMessage` | string | — | Text when no data |
| `toolbarActions` | `HTMLElement[]` | — | Extra buttons in toolbar |

**Column definition:**

```ts
{
  key: string,           // data key
  label: string,         // header label
  sortable?: boolean,    // enable sorting
  render?: (value, row) => HTMLElement | string  // custom cell renderer
}
```

```js
const table = DataTable({
  columns: [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'dept', label: 'Department' },
    { key: 'status', label: 'Status', render: (v) => StatusBadge({ status: v }) },
  ],
  data: employees,
  onRowClick: (row) => console.log(row),
  actions: (row) => [editBtn, deleteBtn],
});
document.body.appendChild(table.element);

// Update data later:
table.setData(newEmployees);
```

---

### `StatusBadge(props)` → `HTMLElement`

**Always renders color + icon + label together.** Never use color alone.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `status` | string | ✅ | Status key (see below) |
| `size` | `'sm'` \| `''` \| `'lg'` | — | Badge size. Default: medium |
| `customLabel` | string | — | Override default label |

**Supported statuses:** `present` · `absent` · `late` · `approved` · `rejected` · `pending` · `active` · `inactive` · `on-leave` · `paid` · `processing` · `draft`

```js
const badge = StatusBadge({ status: 'approved', size: 'sm' });
td.appendChild(badge);
```

---

### `Modal(props)` → `{ open, close, element, setContent, setTitle, getBody, isOpen }`

Accessible dialog with focus trap, Escape-key close, and backdrop-click close.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `title` | string | ✅ | Modal heading |
| `children` | HTMLElement \| string | — | Modal body content |
| `size` | `'sm'` \| `''` \| `'lg'` \| `'xl'` | — | Max-width. Default: `560px` |
| `footerButtons` | `HTMLElement[]` | — | Footer action buttons |
| `onClose` | `() => void` | — | Called when modal closes |

```js
const modal = Modal({
  title: 'Confirm Action',
  size: 'sm',
  footerButtons: [cancelBtn, confirmBtn],
  onClose: () => console.log('closed'),
});

// Append anywhere — it goes to body automatically
modal.open();

// Update content dynamically:
modal.setContent('<p>New content</p>');
modal.setTitle('New title');
modal.close();
```

---

### `Sidebar(props)` → `{ element, setActive }`

Role-aware navigation sidebar. Appended directly to `document.body`.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `role` | `'admin'` \| `'employee'` | ✅ | Controls which nav items appear |
| `activeKey` | string | — | Key of currently active page |
| `user` | `{ name, department, avatarInitials }` | — | User info in profile area |

**Nav keys (employee):** `dashboard` · `my-attendance` · `my-leave` · `my-payroll` · `settings`

**Nav keys (admin):** `admin-dashboard` · `employees` · `attendance` · `leave-admin` · `admin-payroll` · `settings`

```js
Sidebar({ role: 'admin', activeKey: 'admin-payroll', user: { name: 'Arjun Sharma' } });
// Must also set margin on main content:
document.querySelector('.main-content').style.marginLeft = 'var(--sidebar-width)';
```

---

### `showToast(message, type, duration)` → void

| Arg | Type | Description |
|-----|------|-------------|
| `message` | string | Toast text |
| `type` | `'success'` \| `'error'` \| `'warning'` \| `'info'` | Style. Default: `'info'` |
| `duration` | number | Auto-dismiss ms. Default: `4000` |

```js
showToast('Payroll updated successfully!', 'success');
showToast('Net salary must be positive.', 'error');
```

---

## `DayflowDB` — Data Layer

IndexedDB wrapper with a SQLite-like API. Stores: `employees`, `payroll`, `attendance`, `leave_requests`, `audit_log`.

```js
// Initialize (run once, seeds demo data on first load)
await DayflowDB.init();

// Employees
const emps  = await DayflowDB.getEmployees();
const emp   = await DayflowDB.getEmployee('EMP001');

// Payroll
const all   = await DayflowDB.getAllPayroll();
const mine  = await DayflowDB.getPayrollByEmployee('EMP001');
const saved = await DayflowDB.savePayroll({ employee_id, month, year, base_salary, ... });
// Update with audit log (admin only):
await DayflowDB.updatePayrollWithAudit(id, updates, { reason: 'Annual increment', updatedBy: 'Arjun' });

// Attendance
const today = await DayflowDB.getTodayAttendance('EMP001');
const month = await DayflowDB.getMonthAttendance('EMP001', 8, 2026);
const todayAll = await DayflowDB.getAllTodayAttendance();

// Leave
const leaves    = await DayflowDB.getLeaveRequests('EMP001');
const allLeaves = await DayflowDB.getAllLeaveRequests();

// Audit log
const logs = await DayflowDB.getAuditLog('payroll', recordId);
```

**Payroll auto-calculation** (in `savePayroll`):
```
gross_salary     = base + house + medical + transport
total_deductions = tax + provident_fund
net_salary       = gross - deductions   ← must be > 0
```

---

## `DayflowAuth` — Auth Context

Simple role-based session using `sessionStorage`.

```js
// Login (saves to sessionStorage)
DayflowAuth.login('admin');    // or 'employee'

// Get current user
const user = DayflowAuth.getUser();
// → { id, employee_id, name, role, department, email }

// Guards (redirect if not authenticated)
DayflowAuth.requireAuth();           // any role
DayflowAuth.requireRole('admin');    // admin only

// Logout (clears session, redirects to index.html)
DayflowAuth.logout();
```

---

## Responsive Breakpoints

| Breakpoint | Behavior |
|---|---|
| `> 1024px` (desktop) | 4-col grid, persistent sidebar |
| `640–1024px` (tablet) | 2-col grid, collapsible sidebar |
| `< 640px` (mobile) | 1-col stacked, hamburger menu |

---

## Icon Keys

All icons from the built-in SVG library:

`users` · `clock` · `calendar` · `trending_up` · `trending_dn` · `dollar` · `check` · `x` · `alert` · `info` · `home` · `dashboard` · `payroll` · `attendance` · `leave` · `settings` · `logout` · `edit` · `trash` · `eye` · `download` · `search` · `filter` · `plus` · `menu` · `bell` · `activity` · `percent` · `file_text` · `shield` · `chevron_l` · `chevron_r` · `chevron_u` · `chevron_d`

```js
// Access raw SVG string:
import { Icons } from './components/ui/index.js';
element.innerHTML = Icons.users;
```
