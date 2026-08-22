/**
 * ═══════════════════════════════════════════════════════════════
 * DAYFLOW HRMS — Shared UI Component Library
 * Version: 1.0.0
 *
 * Exports: StatCard, DataTable, StatusBadge, Modal, Sidebar, Toast
 *
 * Usage:
 *   import { StatCard, DataTable, StatusBadge, Modal, Sidebar } from './components/ui/index.js';
 *
 * Or in plain HTML (no bundler):
 *   <script type="module" src="./components/ui/index.js"></script>
 *   Then call: DayflowUI.StatCard({ ... }) etc.
 * ═══════════════════════════════════════════════════════════════
 */

'use strict';

// ──────────────────────────────────────────────────────────────
// SVG Icon Library (inline, no external deps)
// ──────────────────────────────────────────────────────────────
const Icons = {
  users:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  clock:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  calendar:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  trending_up: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
  trending_dn: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>`,
  dollar:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  check:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
  x:           `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  alert:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  info:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  home:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  dashboard:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
  payroll:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>`,
  attendance:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>`,
  leave:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="14" x2="16" y2="14"/></svg>`,
  settings:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  logout:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  edit:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  trash:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  eye:         `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  download:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  chevron_l:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>`,
  chevron_r:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>`,
  chevron_u:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>`,
  chevron_d:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>`,
  search:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  filter:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
  plus:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  menu:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
  bell:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  activity:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  percent:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>`,
  star:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  file_text:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  shield:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
};

// ──────────────────────────────────────────────────────────────
// Utility helpers
// ──────────────────────────────────────────────────────────────

/** Create a DOM element with props and children */
function el(tag, props = {}, ...children) {
  const elem = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class')      elem.className = v;
    else if (k === 'html')  elem.innerHTML  = v;
    else if (k.startsWith('on')) elem.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v !== null && v !== undefined) elem.setAttribute(k, v);
  }
  children.flat(Infinity).forEach(c => {
    if (c == null) return;
    elem.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  });
  return elem;
}

/** Escape HTML to prevent XSS */
function escHtml(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/** Format number with commas */
function fmtNumber(n) {
  return Number(n).toLocaleString('en-IN');
}

/** Format currency (INR) */
function fmtCurrency(n) {
  return '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 0 });
}

/** Format date */
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ──────────────────────────────────────────────────────────────
// StatusBadge
// ──────────────────────────────────────────────────────────────

const STATUS_META = {
  present:    { icon: Icons.check,    label: 'Present'    },
  absent:     { icon: Icons.x,        label: 'Absent'     },
  late:       { icon: Icons.clock,    label: 'Late'       },
  approved:   { icon: Icons.check,    label: 'Approved'   },
  rejected:   { icon: Icons.x,        label: 'Rejected'   },
  pending:    { icon: Icons.alert,    label: 'Pending'    },
  active:     { icon: Icons.check,    label: 'Active'     },
  inactive:   { icon: Icons.x,        label: 'Inactive'   },
  'on-leave': { icon: Icons.calendar, label: 'On Leave'   },
  paid:       { icon: Icons.dollar,   label: 'Paid'       },
  processing: { icon: Icons.clock,    label: 'Processing' },
  draft:      { icon: Icons.file_text,label: 'Draft'      },
};

/**
 * StatusBadge — always color + icon + label together
 * @param {string} status - e.g. 'present', 'absent', 'pending'
 * @param {string} [size] - 'sm' | '' | 'lg'
 * @param {string} [customLabel] - override the default label
 * @returns HTMLElement
 */
function StatusBadge({ status, size = '', customLabel } = {}) {
  const key = (status || '').toLowerCase().replace(/\s+/g, '-');
  const meta = STATUS_META[key] || { icon: Icons.info, label: status || 'Unknown' };
  const label = customLabel || meta.label;

  const badge = el('span', { class: `status-badge ${key} ${size}`.trim() });
  badge.innerHTML = meta.icon + `<span>${escHtml(label)}</span>`;
  return badge;
}

// ──────────────────────────────────────────────────────────────
// StatCard
// ──────────────────────────────────────────────────────────────

/**
 * StatCard — metric card with icon, value, trend
 * @param {string} title
 * @param {string|number} value
 * @param {string} icon - key from Icons object (e.g. 'users')
 * @param {{ value: string, direction: 'up'|'down'|'neutral' }} [trend]
 * @param {'primary'|'success'|'warning'|'danger'|'info'} [color]
 * @param {string} [subtitle] - small text below value
 * @param {boolean} [loading]
 * @returns HTMLElement
 */
function StatCard({ title, value, icon = 'dashboard', trend, color = 'primary', subtitle, loading = false } = {}) {
  const card = el('div', {
    class: `stat-card animate-slideUp ${loading ? 'loading' : ''}`,
    'data-color': color
  });

  if (loading) {
    card.innerHTML = `
      <div class="stat-card-header">
        <div class="skeleton" style="height:14px;width:120px;"></div>
        <div class="skeleton" style="width:44px;height:44px;border-radius:8px;"></div>
      </div>
      <div class="skeleton" style="height:40px;width:100px;margin-bottom:8px;"></div>
      <div class="skeleton" style="height:22px;width:80px;border-radius:999px;"></div>`;
    return card;
  }

  const iconSvg = Icons[icon] || Icons.dashboard;

  card.innerHTML = `
    <div class="stat-card-header">
      <span class="stat-card-title">${escHtml(title)}</span>
      <div class="stat-card-icon">${iconSvg}</div>
    </div>
    <div class="stat-card-value tabular">${escHtml(String(value))}</div>
    ${subtitle ? `<div class="caption" style="margin-bottom:8px;">${escHtml(subtitle)}</div>` : ''}
    ${trend ? `
      <span class="stat-card-trend ${trend.direction || 'neutral'}">
        ${trend.direction === 'up' ? Icons.trending_up : trend.direction === 'down' ? Icons.trending_dn : ''}
        ${escHtml(trend.value)}
      </span>` : ''}`;

  return card;
}

// ──────────────────────────────────────────────────────────────
// Modal
// ──────────────────────────────────────────────────────────────

/**
 * Modal — accessible dialog with focus trap
 * @param {boolean} isOpen
 * @param {Function} onClose
 * @param {string} title
 * @param {HTMLElement|string} children
 * @param {'sm'|''|'lg'|'xl'} [size]
 * @param {HTMLElement[]} [footerButtons]
 * @returns {{ open: Function, close: Function, element: HTMLElement, setContent: Function }}
 */
function Modal({ title, children, size = '', footerButtons = [], onClose } = {}) {
  let isOpen = false;

  const backdrop = el('div', { class: 'modal-backdrop', style: 'display:none;' });
  const dialog   = el('div', { class: `modal ${size ? 'modal-' + size : ''}`, role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'modal-title' });

  // Header
  const closeBtn = el('button', { class: 'modal-close', 'aria-label': 'Close modal', html: '×' });
  const header   = el('div', { class: 'modal-header' }, [
    el('h3', { class: 'modal-title', id: 'modal-title' }, title),
    closeBtn
  ]);

  // Body
  const body = el('div', { class: 'modal-body' });
  if (typeof children === 'string') body.innerHTML = children;
  else if (children instanceof HTMLElement) body.appendChild(children);

  // Footer
  const footer = el('div', { class: 'modal-footer' });
  footerButtons.forEach(b => footer.appendChild(b));
  if (!footerButtons.length) footer.style.display = 'none';

  dialog.append(header, body, footer);
  backdrop.appendChild(dialog);
  document.body.appendChild(backdrop);

  function close() {
    isOpen = false;
    backdrop.style.display = 'none';
    document.removeEventListener('keydown', handleKey);
    if (onClose) onClose();
  }

  function open() {
    isOpen = true;
    backdrop.style.display = 'flex';
    document.addEventListener('keydown', handleKey);
    setTimeout(() => { const first = dialog.querySelector('input,select,textarea,button'); if (first) first.focus(); }, 100);
  }

  function handleKey(e) {
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') trapFocus(e, dialog);
  }

  function trapFocus(e, container) {
    const focusable = [...container.querySelectorAll('a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter(el => !el.disabled);
    if (!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', e => { if (e.target === backdrop) close(); });

  return {
    open,
    close,
    element: backdrop,
    isOpen: () => isOpen,
    setContent(html) { body.innerHTML = html; },
    setTitle(t) { dialog.querySelector('#modal-title').textContent = t; },
    getBody: () => body,
  };
}

// ──────────────────────────────────────────────────────────────
// DataTable
// ──────────────────────────────────────────────────────────────

/**
 * DataTable — sortable, searchable, paginated table
 * @param {Array<{key, label, sortable?, render?}>} columns
 * @param {Array<object>} data
 * @param {Function} [onRowClick]
 * @param {Function} [actions] - (row) => HTMLElement[]
 * @param {string} [emptyMessage]
 * @param {number} [pageSize]
 * @param {HTMLElement[]} [toolbarActions] - extra buttons for toolbar
 * @returns {{ element: HTMLElement, setData: Function, refresh: Function }}
 */
function DataTable({ columns = [], data = [], onRowClick, actions, emptyMessage = 'No records found.', pageSize = 10, toolbarActions = [] } = {}) {
  let filteredData  = [...data];
  let sortedData    = [...filteredData];
  let currentPage   = 1;
  let sortCol       = null;
  let sortDir       = 'asc';
  let searchQuery   = '';

  const wrapper = el('div', { class: 'data-table-wrapper' });

  // ── Toolbar
  const searchBox = el('div', { class: 'data-table-search' });
  searchBox.innerHTML = `<span class="data-table-search-icon">${Icons.search}</span>`;
  const searchInput = el('input', { type: 'text', placeholder: 'Search...', 'aria-label': 'Search table' });
  searchBox.appendChild(searchInput);

  const countEl = el('span', { class: 'data-table-count' });

  const toolbarRight = el('div', { class: 'data-table-toolbar-actions' });
  toolbarActions.forEach(b => toolbarRight.appendChild(b));

  const toolbar = el('div', { class: 'data-table-toolbar' }, [searchBox, countEl, toolbarRight]);

  // ── Table
  const scrollDiv = el('div', { class: 'data-table-scroll' });
  const table     = el('table', { class: 'data-table', role: 'grid' });
  const thead     = el('thead');
  const tbody     = el('tbody');
  table.append(thead, tbody);
  scrollDiv.appendChild(table);

  // ── Footer / Pagination
  const pageInfo    = el('span', { class: 'data-table-count' });
  const pagination  = el('div', { class: 'pagination' });
  const footer      = el('div', { class: 'data-table-footer' }, [pageInfo, pagination]);

  wrapper.append(toolbar, scrollDiv, footer);

  // Build header
  function buildHeader() {
    thead.innerHTML = '';
    const tr = el('tr');
    columns.forEach(col => {
      const isSorted   = sortCol === col.key;
      const sortClass  = isSorted ? (sortDir === 'asc' ? 'sorted-asc' : 'sorted-desc') : '';
      const sortIcon   = col.sortable ? `<span class="sort-icon">${isSorted ? (sortDir === 'asc' ? Icons.chevron_u : Icons.chevron_d) : Icons.chevron_d}</span>` : '';
      const th = el('th', { class: `${col.sortable ? 'sortable' : ''} ${sortClass}`.trim() });
      th.innerHTML = `${escHtml(col.label)}${sortIcon}`;
      if (col.sortable) th.addEventListener('click', () => handleSort(col.key));
      tr.appendChild(th);
    });
    if (actions) {
      const th = el('th');
      th.textContent = 'Actions';
      th.style.textAlign = 'right';
      tr.appendChild(th);
    }
    thead.appendChild(tr);
  }

  // Build rows for current page
  function buildRows() {
    tbody.innerHTML = '';
    const start  = (currentPage - 1) * pageSize;
    const end    = start + pageSize;
    const paged  = sortedData.slice(start, end);

    if (!paged.length) {
      const td = el('td', { colspan: columns.length + (actions ? 1 : 0) });
      td.style.padding = '48px 24px';
      td.innerHTML = `<div class="empty-state">${Icons.file_text}<p>${escHtml(emptyMessage)}</p></div>`;
      tbody.appendChild(el('tr', {}, [td]));
      return;
    }

    paged.forEach(row => {
      const tr = el('tr', { class: onRowClick ? 'clickable' : '' });
      if (onRowClick) tr.addEventListener('click', () => onRowClick(row));

      columns.forEach(col => {
        const td  = el('td');
        const val = row[col.key];
        if (col.render) {
          const rendered = col.render(val, row);
          if (rendered instanceof HTMLElement) td.appendChild(rendered);
          else td.innerHTML = rendered ?? '';
        } else {
          td.textContent = val ?? '—';
        }
        tr.appendChild(td);
      });

      if (actions) {
        const td  = el('td');
        const div = el('div', { class: 'table-actions' });
        const btns = actions(row);
        if (Array.isArray(btns)) btns.forEach(b => div.appendChild(b));
        else if (btns instanceof HTMLElement) div.appendChild(btns);
        td.appendChild(div);
        tr.appendChild(td);
      }

      tbody.appendChild(tr);
    });
  }

  // Build pagination
  function buildPagination() {
    pagination.innerHTML = '';
    const total     = sortedData.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const start      = Math.min((currentPage - 1) * pageSize + 1, total);
    const end        = Math.min(currentPage * pageSize, total);

    pageInfo.textContent = `${start}–${end} of ${total}`;
    countEl.textContent  = `${total} record${total !== 1 ? 's' : ''}`;

    const prevBtn = el('button', { class: 'pagination-btn', 'aria-label': 'Previous page', html: Icons.chevron_l });
    if (currentPage <= 1) prevBtn.disabled = true;
    prevBtn.addEventListener('click', () => { if (currentPage > 1) { currentPage--; render(); } });
    pagination.appendChild(prevBtn);

    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage   = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1) startPage = Math.max(1, endPage - maxVisible + 1);

    for (let p = startPage; p <= endPage; p++) {
      const btn = el('button', { class: `pagination-btn ${p === currentPage ? 'active' : ''}`, html: String(p) });
      const pg  = p;
      btn.addEventListener('click', () => { currentPage = pg; render(); });
      pagination.appendChild(btn);
    }

    const nextBtn = el('button', { class: 'pagination-btn', 'aria-label': 'Next page', html: Icons.chevron_r });
    if (currentPage >= totalPages) nextBtn.disabled = true;
    nextBtn.addEventListener('click', () => { if (currentPage < totalPages) { currentPage++; render(); } });
    pagination.appendChild(nextBtn);
  }

  function applyFilters() {
    const q = searchQuery.toLowerCase().trim();
    filteredData = q
      ? data.filter(row => columns.some(col => String(row[col.key] ?? '').toLowerCase().includes(q)))
      : [...data];
    applySort();
  }

  function applySort() {
    sortedData = [...filteredData];
    if (sortCol) {
      sortedData.sort((a, b) => {
        const va = a[sortCol] ?? '', vb = b[sortCol] ?? '';
        const cmp = typeof va === 'number' && typeof vb === 'number'
          ? va - vb
          : String(va).localeCompare(String(vb));
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    currentPage = 1;
  }

  function handleSort(key) {
    if (sortCol === key) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
    else { sortCol = key; sortDir = 'asc'; }
    applySort();
    buildHeader();
    buildRows();
    buildPagination();
  }

  function render() {
    buildHeader();
    buildRows();
    buildPagination();
  }

  searchInput.addEventListener('input', e => {
    searchQuery = e.target.value;
    applyFilters();
    render();
  });

  // Initial render
  applyFilters();
  render();

  return {
    element: wrapper,
    setData(newData) {
      data = newData;
      applyFilters();
      render();
    },
    refresh() { render(); },
    getFilteredData: () => filteredData,
  };
}

// ──────────────────────────────────────────────────────────────
// Sidebar
// ──────────────────────────────────────────────────────────────

const NAV_CONFIG = {
  admin: [
    { section: 'Overview' },
    { key: 'admin-dashboard', label: 'Dashboard',  icon: 'dashboard',   href: 'admin-dashboard.html' },
    { section: 'Management' },
    { key: 'employees',       label: 'Employees',  icon: 'users',       href: 'employees.html' },
    { key: 'attendance',      label: 'Attendance', icon: 'attendance',  href: 'attendance.html' },
    { key: 'leave-admin',     label: 'Leave Mgmt', icon: 'leave',       href: 'leave-admin.html', badge: '3' },
    { key: 'admin-payroll',   label: 'Payroll',    icon: 'payroll',     href: 'admin-payroll.html' },
    { section: 'System' },
    { key: 'settings',        label: 'Settings',   icon: 'settings',    href: 'settings.html' },
  ],
  employee: [
    { section: 'Overview' },
    { key: 'dashboard',       label: 'Dashboard',  icon: 'dashboard',   href: 'dashboard.html' },
    { section: 'My Records' },
    { key: 'my-attendance',   label: 'Attendance', icon: 'attendance',  href: 'my-attendance.html' },
    { key: 'my-leave',        label: 'Leave',      icon: 'leave',       href: 'my-leave.html' },
    { key: 'my-payroll',      label: 'Payslips',   icon: 'payroll',     href: 'payroll.html' },
    { section: 'Account' },
    { key: 'settings',        label: 'Settings',   icon: 'settings',    href: 'settings.html' },
  ]
};

/**
 * Sidebar — role-aware, collapsible navigation
 * @param {'admin'|'employee'} role
 * @param {string} [activeKey] - key of currently active page
 * @param {object} [user] - { name, department, avatarInitials }
 * @returns {{ element: HTMLElement, setActive: Function }}
 */
function Sidebar({ role = 'employee', activeKey = '', user = {} } = {}) {
  const sidebar   = el('div', { class: 'sidebar', id: 'app-sidebar' });
  let isCollapsed = false;
  let isMobileOpen = false;

  // Brand
  const brand = el('div', { class: 'sidebar-brand' });
  brand.innerHTML = `
    <div class="sidebar-logo">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:20px;height:20px;">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
    </div>
    <div class="sidebar-brand-text">
      <div class="sidebar-brand-name">Dayflow</div>
      <div class="sidebar-brand-tagline">Every workday, perfectly aligned.</div>
    </div>`;
  sidebar.appendChild(brand);

  // Nav
  const nav   = el('div', { class: 'sidebar-nav', role: 'navigation', 'aria-label': 'Main navigation' });
  const items = NAV_CONFIG[role] || NAV_CONFIG.employee;

  items.forEach(item => {
    if (item.section) {
      nav.appendChild(el('div', { class: 'sidebar-section-label' }, item.section));
      return;
    }
    const link = el('a', {
      class:        `nav-item ${item.key === activeKey ? 'active' : ''}`,
      href:         item.href || '#',
      'data-key':   item.key,
      'data-tooltip': item.label,
    });
    link.innerHTML = `
      <span class="nav-item-icon">${Icons[item.icon] || Icons.dashboard}</span>
      <span class="nav-item-label">${escHtml(item.label)}</span>
      ${item.badge ? `<span class="nav-badge">${escHtml(item.badge)}</span>` : ''}`;
    nav.appendChild(link);
  });

  sidebar.appendChild(nav);

  // Profile
  const initials = user.avatarInitials || (user.name || 'U').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
  const profile  = el('div', { class: 'sidebar-profile' });
  profile.innerHTML = `
    <div class="avatar">${escHtml(initials)}</div>
    <div class="sidebar-profile-info">
      <div class="sidebar-profile-name">${escHtml(user.name || 'User')}</div>
      <div class="sidebar-profile-role">${escHtml(role === 'admin' ? 'Administrator' : user.department || 'Employee')}</div>
    </div>
    <button class="btn-ghost btn-icon" title="Logout" style="color:rgba(255,255,255,0.4);" onclick="DayflowAuth.logout()">
      ${Icons.logout}
    </button>`;
  sidebar.appendChild(profile);

  document.body.insertBefore(sidebar, document.body.firstChild);

  // Desktop toggle
  const toggleBtn = el('button', {
    class: 'sidebar-toggle',
    'aria-label': 'Toggle sidebar',
    'aria-controls': 'app-sidebar',
    html: Icons.chevron_l
  });
  toggleBtn.addEventListener('click', () => {
    isCollapsed = !isCollapsed;
    sidebar.classList.toggle('collapsed', isCollapsed);
    const mc = document.querySelector('.main-content');
    if (mc) mc.classList.toggle('sidebar-collapsed', isCollapsed);
  });
  document.body.insertBefore(toggleBtn, sidebar.nextSibling);

  // Mobile overlay + hamburger
  const overlay = el('div', { class: 'sidebar-overlay', onclick: closeMobile });
  document.body.appendChild(overlay);

  const hamburger = el('button', { class: 'hamburger', 'aria-label': 'Open menu', html: Icons.menu });
  hamburger.addEventListener('click', () => {
    isMobileOpen = true;
    sidebar.classList.add('mobile-open');
    overlay.classList.add('active');
  });
  document.body.appendChild(hamburger);

  function closeMobile() {
    isMobileOpen = false;
    sidebar.classList.remove('mobile-open');
    overlay.classList.remove('active');
  }

  return {
    element: sidebar,
    setActive(key) {
      nav.querySelectorAll('.nav-item').forEach(a => {
        a.classList.toggle('active', a.dataset.key === key);
      });
    },
  };
}

// ──────────────────────────────────────────────────────────────
// Toast Notification System
// ──────────────────────────────────────────────────────────────

let toastContainer = null;

function getToastContainer() {
  if (!toastContainer) {
    toastContainer = el('div', { class: 'toast-container', 'aria-live': 'polite' });
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

/**
 * Show a toast notification
 * @param {string} message
 * @param {'success'|'error'|'warning'|'info'} [type]
 * @param {number} [duration] ms
 */
function showToast(message, type = 'info', duration = 4000) {
  const container = getToastContainer();
  const iconMap   = { success: Icons.check, error: Icons.x, warning: Icons.alert, info: Icons.info };
  const colorMap  = { success: 'var(--success)', error: 'var(--danger)', warning: 'var(--warning)', info: 'var(--info)' };

  const toast = el('div', { class: `toast ${type}`, role: 'alert' });
  toast.innerHTML = `
    <span style="color:${colorMap[type]};flex-shrink:0;">${iconMap[type] || Icons.info}</span>
    <span style="flex:1;font-size:var(--text-sm);color:var(--text-primary);">${escHtml(message)}</span>
    <button style="background:none;border:none;cursor:pointer;color:var(--text-tertiary);padding:2px;" onclick="this.closest('.toast').remove()">×</button>`;

  container.appendChild(toast);
  if (duration > 0) setTimeout(() => toast.remove(), duration);
  return toast;
}

// ──────────────────────────────────────────────────────────────
// Auth Context (simple role switcher for hackathon)
// ──────────────────────────────────────────────────────────────

const DayflowAuth = {
  MOCK_USERS: {
    admin: {
      id: 'admin_001',
      employee_id: null,
      name: 'Arjun Sharma',
      role: 'admin',
      department: 'HR',
      email: 'arjun@dayflow.io',
    },
    employee: {
      id: 'emp_001',
      employee_id: 'EMP001',
      name: 'Priya Nair',
      role: 'employee',
      department: 'Engineering',
      email: 'priya@dayflow.io',
    }
  },

  getUser() {
    try {
      const stored = sessionStorage.getItem('df_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  },

  login(role) {
    const user = this.MOCK_USERS[role] || this.MOCK_USERS.employee;
    sessionStorage.setItem('df_user', JSON.stringify(user));
    return user;
  },

  logout() {
    sessionStorage.removeItem('df_user');
    window.location.href = 'index.html';
  },

  requireAuth(redirectTo = 'index.html') {
    const user = this.getUser();
    if (!user) { window.location.href = redirectTo; return null; }
    return user;
  },

  requireRole(role, redirectTo = 'index.html') {
    const user = this.requireAuth(redirectTo);
    if (user && user.role !== role) { window.location.href = redirectTo; return null; }
    return user;
  }
};

// ──────────────────────────────────────────────────────────────
// Database Layer (IndexedDB with SQLite-like API for standalone)
// ──────────────────────────────────────────────────────────────

const DayflowDB = {
  db: null,
  DB_NAME: 'DayflowHRMS',
  DB_VERSION: 1,

  async init() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      req.onupgradeneeded = e => {
        const db = e.target.result;

        // Employees store
        if (!db.objectStoreNames.contains('employees')) {
          const es = db.createObjectStore('employees', { keyPath: 'employee_id' });
          es.createIndex('email',      'email',      { unique: true });
          es.createIndex('department', 'department', { unique: false });
          es.createIndex('status',     'status',     { unique: false });
        }

        // Payroll store
        if (!db.objectStoreNames.contains('payroll')) {
          const ps = db.createObjectStore('payroll', { keyPath: 'id', autoIncrement: true });
          ps.createIndex('employee_id', 'employee_id', { unique: false });
          ps.createIndex('month_year',  ['month', 'year'], { unique: false });
        }

        // Attendance store
        if (!db.objectStoreNames.contains('attendance')) {
          const as = db.createObjectStore('attendance', { keyPath: 'id', autoIncrement: true });
          as.createIndex('employee_id', 'employee_id', { unique: false });
          as.createIndex('date',        'date',        { unique: false });
        }

        // Leave requests store
        if (!db.objectStoreNames.contains('leave_requests')) {
          const ls = db.createObjectStore('leave_requests', { keyPath: 'id', autoIncrement: true });
          ls.createIndex('employee_id', 'employee_id', { unique: false });
          ls.createIndex('status',      'status',      { unique: false });
        }

        // Audit log store
        if (!db.objectStoreNames.contains('audit_log')) {
          const al = db.createObjectStore('audit_log', { keyPath: 'id', autoIncrement: true });
          al.createIndex('entity_type', 'entity_type', { unique: false });
          al.createIndex('entity_id',   'entity_id',   { unique: false });
          al.createIndex('created_at',  'created_at',  { unique: false });
        }
      };

      req.onsuccess = async e => {
        this.db = e.target.result;
        await this._seed();
        resolve(this);
      };

      req.onerror = () => reject(req.error);
    });
  },

  // Generic helpers
  async _put(store, record) {
    return new Promise((resolve, reject) => {
      const tx  = this.db.transaction(store, 'readwrite');
      const req = tx.objectStore(store).put(record);
      req.onsuccess = () => resolve(req.result);
      req.onerror   = () => reject(req.error);
    });
  },

  async _add(store, record) {
    return new Promise((resolve, reject) => {
      const tx  = this.db.transaction(store, 'readwrite');
      const req = tx.objectStore(store).add(record);
      req.onsuccess = () => resolve(req.result);
      req.onerror   = () => reject(req.error);
    });
  },

  async _get(store, key) {
    return new Promise((resolve, reject) => {
      const tx  = this.db.transaction(store, 'readonly');
      const req = tx.objectStore(store).get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror   = () => reject(req.error);
    });
  },

  async _getAll(store) {
    return new Promise((resolve, reject) => {
      const tx  = this.db.transaction(store, 'readonly');
      const req = tx.objectStore(store).getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror   = () => reject(req.error);
    });
  },

  async _getByIndex(store, indexName, value) {
    return new Promise((resolve, reject) => {
      const tx    = this.db.transaction(store, 'readonly');
      const index = tx.objectStore(store).index(indexName);
      const req   = index.getAll(value);
      req.onsuccess = () => resolve(req.result);
      req.onerror   = () => reject(req.error);
    });
  },

  async _delete(store, key) {
    return new Promise((resolve, reject) => {
      const tx  = this.db.transaction(store, 'readwrite');
      const req = tx.objectStore(store).delete(key);
      req.onsuccess = () => resolve();
      req.onerror   = () => reject(req.error);
    });
  },

  // ── Employee CRUD
  async getEmployees()        { return this._getAll('employees'); },
  async getEmployee(id)       { return this._get('employees', id); },
  async saveEmployee(emp)     { return this._put('employees', emp); },

  // ── Payroll CRUD
  async getAllPayroll()        { return this._getAll('payroll'); },
  async getPayrollById(id)    { return this._get('payroll', id); },
  async getPayrollByEmployee(empId) { return this._getByIndex('payroll', 'employee_id', empId); },

  async savePayroll(record) {
    // Auto-calculate derived fields
    const gross = (record.base_salary || 0)
      + (record.house_allowance || 0)
      + (record.medical_allowance || 0)
      + (record.transport_allowance || 0);
    const deductions = (record.tax_deduction || 0) + (record.provident_fund || 0);
    const net = gross - deductions;

    if (net <= 0) throw new Error('Net salary must be positive.');

    const now = new Date().toISOString();
    const enriched = {
      ...record,
      gross_salary:      gross,
      total_deductions:  deductions,
      net_salary:        net,
      updated_at:        now,
      created_at:        record.created_at || now,
    };

    const id = await (enriched.id ? this._put('payroll', enriched) : this._add('payroll', enriched));
    return { ...enriched, id: enriched.id || id };
  },

  async updatePayrollWithAudit(id, updates, { reason, updatedBy }) {
    const existing = await this.getPayrollById(id);
    if (!existing) throw new Error('Payroll record not found.');

    const updated = await this.savePayroll({ ...existing, ...updates, id });

    // Write audit log
    await this._add('audit_log', {
      entity_type: 'payroll',
      entity_id:   id,
      action:      'UPDATE',
      changed_by:  updatedBy || 'admin',
      reason:      reason,
      old_value:   JSON.stringify({ net_salary: existing.net_salary, base_salary: existing.base_salary }),
      new_value:   JSON.stringify({ net_salary: updated.net_salary,  base_salary: updated.base_salary  }),
      created_at:  new Date().toISOString(),
    });

    return updated;
  },

  // ── Attendance
  async getTodayAttendance(empId) {
    const all = await this._getByIndex('attendance', 'employee_id', empId);
    const today = new Date().toISOString().split('T')[0];
    return all.find(a => a.date === today) || null;
  },

  async getMonthAttendance(empId, month, year) {
    const all = await this._getByIndex('attendance', 'employee_id', empId);
    return all.filter(a => a.month === month && a.year === year);
  },

  async getAllTodayAttendance() {
    const all   = await this._getAll('attendance');
    const today = new Date().toISOString().split('T')[0];
    return all.filter(a => a.date === today);
  },

  // ── Leave Requests
  async getLeaveRequests(empId)  { return this._getByIndex('leave_requests', 'employee_id', empId); },
  async getAllLeaveRequests()     { return this._getAll('leave_requests'); },
  async saveLeaveRequest(lr)     { return lr.id ? this._put('leave_requests', lr) : this._add('leave_requests', lr); },

  // ── Audit Log
  async getAuditLog(entityType, entityId) {
    const all = await this._getAll('audit_log');
    return all.filter(a => (!entityType || a.entity_type === entityType) && (!entityId || a.entity_id === entityId))
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  // ── Seed demo data
  async _seed() {
    const existing = await this.getEmployees();
    if (existing.length > 0) return; // Already seeded

    const employees = [
      { employee_id: 'EMP001', name: 'Priya Nair',       email: 'priya@dayflow.io',   department: 'Engineering', designation: 'Senior Engineer',    status: 'active', joining_date: '2022-03-15', phone: '9876543210', leave_balance: 12 },
      { employee_id: 'EMP002', name: 'Rahul Mehta',      email: 'rahul@dayflow.io',   department: 'Product',     designation: 'Product Manager',     status: 'active', joining_date: '2021-07-01', phone: '9876543211', leave_balance: 8  },
      { employee_id: 'EMP003', name: 'Ananya Krishnan',  email: 'ananya@dayflow.io',  department: 'Design',      designation: 'UI/UX Designer',      status: 'active', joining_date: '2023-01-10', phone: '9876543212', leave_balance: 15 },
      { employee_id: 'EMP004', name: 'Vikram Rao',       email: 'vikram@dayflow.io',  department: 'Engineering', designation: 'DevOps Engineer',     status: 'active', joining_date: '2022-09-20', phone: '9876543213', leave_balance: 10 },
      { employee_id: 'EMP005', name: 'Deepa Sharma',     email: 'deepa@dayflow.io',   department: 'HR',          designation: 'HR Specialist',       status: 'active', joining_date: '2020-11-05', phone: '9876543214', leave_balance: 5  },
      { employee_id: 'EMP006', name: 'Karthik Iyer',     email: 'karthik@dayflow.io', department: 'Finance',     designation: 'Finance Analyst',     status: 'active', joining_date: '2023-06-15', phone: '9876543215', leave_balance: 18 },
      { employee_id: 'EMP007', name: 'Sneha Patel',      email: 'sneha@dayflow.io',   department: 'Marketing',   designation: 'Marketing Executive', status: 'inactive', joining_date: '2021-04-22', phone: '9876543216', leave_balance: 0 },
      { employee_id: 'EMP008', name: 'Arun Kumar',       email: 'arun@dayflow.io',    department: 'Engineering', designation: 'Junior Engineer',     status: 'active', joining_date: '2024-01-08', phone: '9876543217', leave_balance: 21 },
    ];

    for (const emp of employees) await this._put('employees', emp);

    // Payroll seed (Aug 2026)
    const payrollSeed = [
      { employee_id: 'EMP001', month: 8, year: 2026, base_salary: 85000, house_allowance: 20000, medical_allowance: 5000, transport_allowance: 3000, tax_deduction: 8500, provident_fund: 10200 },
      { employee_id: 'EMP002', month: 8, year: 2026, base_salary: 95000, house_allowance: 22000, medical_allowance: 5000, transport_allowance: 3500, tax_deduction: 10000, provident_fund: 11400 },
      { employee_id: 'EMP003', month: 8, year: 2026, base_salary: 70000, house_allowance: 16000, medical_allowance: 4000, transport_allowance: 2500, tax_deduction: 6500,  provident_fund: 8400  },
      { employee_id: 'EMP004', month: 8, year: 2026, base_salary: 80000, house_allowance: 18000, medical_allowance: 5000, transport_allowance: 3000, tax_deduction: 7500,  provident_fund: 9600  },
      { employee_id: 'EMP005', month: 8, year: 2026, base_salary: 55000, house_allowance: 12000, medical_allowance: 3500, transport_allowance: 2000, tax_deduction: 4500,  provident_fund: 6600  },
      { employee_id: 'EMP006', month: 8, year: 2026, base_salary: 65000, house_allowance: 14000, medical_allowance: 4000, transport_allowance: 2500, tax_deduction: 5800,  provident_fund: 7800  },
      { employee_id: 'EMP007', month: 8, year: 2026, base_salary: 50000, house_allowance: 10000, medical_allowance: 3000, transport_allowance: 1500, tax_deduction: 3500,  provident_fund: 6000  },
      { employee_id: 'EMP008', month: 8, year: 2026, base_salary: 45000, house_allowance: 8000,  medical_allowance: 2500, transport_allowance: 1500, tax_deduction: 3000,  provident_fund: 5400  },
    ];
    for (const p of payrollSeed) await this.savePayroll(p);

    // Attendance seed (today)
    const today = new Date().toISOString().split('T')[0];
    const [yr, mo, dy] = today.split('-').map(Number);
    const attendanceSeed = [
      { employee_id: 'EMP001', date: today, month: mo, year: yr, check_in: '09:02', check_out: null, status: 'present' },
      { employee_id: 'EMP002', date: today, month: mo, year: yr, check_in: '09:45', check_out: null, status: 'late'    },
      { employee_id: 'EMP003', date: today, month: mo, year: yr, check_in: null,    check_out: null, status: 'absent'  },
      { employee_id: 'EMP004', date: today, month: mo, year: yr, check_in: '08:55', check_out: null, status: 'present' },
      { employee_id: 'EMP005', date: today, month: mo, year: yr, check_in: null,    check_out: null, status: 'on-leave'},
      { employee_id: 'EMP006', date: today, month: mo, year: yr, check_in: '09:10', check_out: null, status: 'present' },
      { employee_id: 'EMP008', date: today, month: mo, year: yr, check_in: '09:00', check_out: null, status: 'present' },
    ];
    for (const a of attendanceSeed) await this._add('attendance', a);

    // Leave requests seed
    const leaveSeed = [
      { employee_id: 'EMP003', type: 'Casual Leave',    start_date: today, end_date: today, reason: 'Personal work', status: 'approved', applied_at: new Date().toISOString() },
      { employee_id: 'EMP002', type: 'Sick Leave',      start_date: '2026-08-25', end_date: '2026-08-26', reason: 'Fever', status: 'pending',  applied_at: new Date().toISOString() },
      { employee_id: 'EMP004', type: 'Earned Leave',    start_date: '2026-09-01', end_date: '2026-09-05', reason: 'Vacation', status: 'pending', applied_at: new Date().toISOString() },
      { employee_id: 'EMP001', type: 'Casual Leave',    start_date: '2026-08-18', end_date: '2026-08-18', reason: 'Family event', status: 'approved', applied_at: new Date(Date.now()-5*86400000).toISOString() },
      { employee_id: 'EMP006', type: 'Work From Home',  start_date: '2026-08-28', end_date: '2026-08-28', reason: 'Internet issue', status: 'pending', applied_at: new Date().toISOString() },
    ];
    for (const l of leaveSeed) await this._add('leave_requests', l);

    // Audit log seed
    await this._add('audit_log', {
      entity_type: 'payroll', entity_id: 1, action: 'CREATE', changed_by: 'admin',
      reason: 'Initial salary setup', old_value: null, new_value: '{"net_salary":94300}',
      created_at: new Date(Date.now()-7*86400000).toISOString()
    });
  }
};

// ──────────────────────────────────────────────────────────────
// Exports
// ──────────────────────────────────────────────────────────────

// Expose globally (for non-module HTML scripts)
window.DayflowUI    = { StatCard, DataTable, StatusBadge, Modal, Sidebar, showToast, Icons, el, escHtml, fmtCurrency, fmtNumber, fmtDate };
window.DayflowDB    = DayflowDB;
window.DayflowAuth  = DayflowAuth;

// ES module exports (for bundler usage)
export { StatCard, DataTable, StatusBadge, Modal, Sidebar, showToast, Icons, el, escHtml, fmtCurrency, fmtNumber, fmtDate, DayflowDB, DayflowAuth };
