# Dayflow UI Component Library

> Shared React components for the Dayflow HRMS. Import from `@/components/ui`.

```js
import { StatCard, DataTable, StatusBadge, Modal, Sidebar } from '@/components/ui'
```

---

## Design Tokens (Tailwind classes)

| Token | Value | Usage |
|---|---|---|
| `primary-900` | `#0F172A` | Headings, sidebar bg |
| `primary-700` | `#1E3A5F` | Buttons, active nav |
| `primary-500` | `#3B82F6` | Links, focus rings |
| `success` | `#10B981` | Present, Approved, Paid |
| `warning` | `#F59E0B` | Pending, Late, Draft |
| `danger` | `#F43F5E` | Absent, Rejected |
| `info` | `#06B6D4` | On Leave, informational |
| `bg-primary` | `#F8FAFC` | Page background |
| `bg-surface` | `#FFFFFF` | Cards, modals |
| `text-primary` | `#1E293B` | Body text |
| `text-secondary` | `#64748B` | Labels, captions |
| `border` | `#E2E8F0` | All borders |

**Typography:** Inter. H1 32/700 · H2 24/600 · H3 20/600 · Body 16/400 · Caption 14/400  
**Radius:** btn=6px · input=8px · card=12px · modal=16px  
**Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48px  

---

## `<StatCard>`

Displays a single KPI metric with optional trend indicator.

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | — | Label above the value |
| `value` | `string\|number` | — | The primary metric |
| `icon` | `ReactElement` | — | Lucide icon e.g. `<Users size={20} />` |
| `trend` | `{ value: number, label: string, up: bool\|null }` | `null` | Trend line below value |
| `color` | `'primary'\|'success'\|'warning'\|'danger'\|'info'` | `'primary'` | Accent color |
| `loading` | `bool` | `false` | Shows skeleton while true |

```jsx
<StatCard
  title="Total Employees"
  value={142}
  icon={<Users size={20} />}
  trend={{ value: 4.2, label: 'vs last month', up: true }}
  color="primary"
/>
```

---

## `<DataTable>`

Sortable, searchable, paginated table.

| Prop | Type | Default | Description |
|---|---|---|---|
| `columns` | `Array<{key, label, render?, sortable?, width?}>` | `[]` | Column definitions |
| `data` | `Array<object>` | `[]` | Row data |
| `onRowClick` | `(row) => void` | — | Called on row click |
| `actions` | `(row) => ReactNode` | — | Renders an "Actions" column |
| `searchable` | `bool` | `true` | Show global search input |
| `pageSize` | `number` | `10` | Rows per page |
| `loading` | `bool` | `false` | Show skeleton rows |
| `emptyText` | `string` | `'No records found.'` | Empty state message |

```jsx
<DataTable
  columns={[
    { key: 'name',   label: 'Name' },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'salary', label: 'Net Salary', sortable: true },
  ]}
  data={employees}
  onRowClick={(row) => navigate(`/admin/employees/${row.id}`)}
  actions={(row) => <EditButton row={row} />}
/>
```

---

## `<StatusBadge>`

Always renders **color + icon + label** together — never color alone.

| Prop | Type | Default | Description |
|---|---|---|---|
| `status` | `string` | — | See statuses below |
| `size` | `'sm'\|'md'\|'lg'` | `'md'` | Badge size |

**Supported statuses:**

| Status | Color | Icon | Context |
|---|---|---|---|
| `present` | success | ✓ | Attendance |
| `absent` | danger | ✗ | Attendance |
| `late` | warning | ⏰ | Attendance |
| `on-leave` | info | 📅 | Attendance |
| `pending` | warning | ⏱ | Leave requests |
| `approved` | success | ✓ | Leave requests |
| `rejected` | danger | ✗ | Leave requests |
| `paid` | success | $ | Payroll |
| `draft` | warning | 📄 | Payroll |
| `active` | success | 👤 | Employee |
| `inactive` | danger | 👤 | Employee |

```jsx
<StatusBadge status="approved" size="sm" />
```

---

## `<Modal>`

Accessible modal with focus trap, scroll lock, Escape-to-close.

| Prop | Type | Default | Description |
|---|---|---|---|
| `isOpen` | `bool` | — | Controls visibility |
| `onClose` | `() => void` | — | Called on backdrop click / Escape |
| `title` | `string` | — | Modal heading |
| `children` | `ReactNode` | — | Body content |
| `size` | `'sm'\|'md'\|'lg'\|'xl'` | `'md'` | Max width |
| `footer` | `ReactNode` | `null` | Footer (action buttons) |

```jsx
<Modal
  isOpen={open}
  onClose={() => setOpen(false)}
  title="Edit Salary"
  size="lg"
  footer={<><CancelBtn /><SaveBtn /></>}
>
  <SalaryForm />
</Modal>
```

---

## `<Sidebar>`

Role-aware navigation sidebar. Reads `user.role` from `AuthContext`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `role` | `'admin'\|'employee'` | from AuthContext | Override role |

**Responsive behaviour:**
- **Desktop `>1024px`** — persistent, always visible, expandable/collapsible
- **Tablet `640–1024px`** — auto-collapses to icon-only rail with tooltips
- **Mobile `<640px`** — hidden; toggle with `#sidebar-hamburger` button

**Admin nav:** Dashboard · Employees · Attendance · Leave · Payroll · Reports · Settings  
**Employee nav:** Dashboard · Attendance · Leave · My Payslip · Profile

```jsx
// In your layout:
<div className="page-layout">
  <Sidebar />
  <main className="main-content">
    <Outlet />
  </main>
</div>
```

---

## Responsive Breakpoints

| Breakpoint | Width | Layout |
|---|---|---|
| Mobile | `< 640px` | Stacked, hamburger nav |
| Tablet | `640 – 1023px` | 2-col, collapsible sidebar rail |
| Desktop | `≥ 1024px` | 4-col grid, persistent sidebar |

---

*Part of Dayflow HRMS · Design System v1.0*
