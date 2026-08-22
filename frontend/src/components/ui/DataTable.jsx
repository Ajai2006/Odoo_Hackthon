/**
 * DataTable — Dayflow Design System
 *
 * Props:
 *   columns     {Array}     — [{ key, label, render?, sortable?, width? }]
 *   data        {Array}     — array of row objects
 *   onRowClick  {function}  — (row) => void, optional
 *   actions     {function}  — (row) => ReactNode, optional action column
 *   searchable  {bool}      — show global search (default true)
 *   pageSize    {number}    — rows per page (default 10)
 *   loading     {bool}      — show skeleton rows
 *   emptyText   {string}    — message when no rows
 */
import React, { useState, useMemo } from 'react'
import { Search, ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { clsx } from 'clsx'

function SortIcon({ direction }) {
  if (direction === 'asc')  return <ChevronUp size={14} className="text-primary-500" />
  if (direction === 'desc') return <ChevronDown size={14} className="text-primary-500" />
  return <ChevronsUpDown size={14} className="text-text-secondary opacity-40" />
}

export function DataTable({
  columns = [],
  data = [],
  onRowClick,
  actions,
  searchable = true,
  pageSize = 10,
  loading = false,
  emptyText = 'No records found.',
}) {
  const [search, setSearch]         = useState('')
  const [sortKey, setSortKey]       = useState(null)
  const [sortDir, setSortDir]       = useState('asc')
  const [page, setPage]             = useState(1)

  // ── Filter ──────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search.trim()) return data
    const q = search.toLowerCase()
    return data.filter((row) =>
      columns.some((col) => {
        const val = row[col.key]
        return val != null && String(val).toLowerCase().includes(q)
      })
    )
  }, [data, search, columns])

  // ── Sort ─────────────────────────────────────────────────────
  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    return [...filtered].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey]
      if (av == null) return 1
      if (bv == null) return -1
      const cmp = typeof av === 'number'
        ? av - bv
        : String(av).localeCompare(String(bv))
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [filtered, sortKey, sortDir])

  // ── Paginate ─────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const paged = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
    setPage(1)
  }

  const handleSearch = (e) => { setSearch(e.target.value); setPage(1) }

  // ── Skeleton rows ────────────────────────────────────────────
  const skeletonRows = Array.from({ length: pageSize })

  const colCount = columns.length + (actions ? 1 : 0)

  return (
    <div className="bg-bg-surface rounded-card border border-border shadow-card overflow-hidden animate-fade-in">
      {/* Toolbar */}
      {searchable && (
        <div className="px-4 py-3 border-b border-border">
          <div className="relative max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={handleSearch}
              placeholder="Search…"
              className={clsx(
                'w-full pl-9 pr-4 py-2 text-sm rounded-input border border-border bg-bg-primary',
                'text-text-primary placeholder:text-text-secondary',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                'transition-all duration-200',
              )}
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-bg-primary border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={clsx(
                    'px-4 py-3 text-left font-semibold text-text-secondary uppercase tracking-wide text-xs select-none',
                    col.sortable !== false && 'cursor-pointer hover:text-text-primary transition-colors',
                    col.width && `w-[${col.width}]`,
                  )}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable !== false && (
                      <SortIcon direction={sortKey === col.key ? sortDir : null} />
                    )}
                  </span>
                </th>
              ))}
              {actions && (
                <th className="px-4 py-3 text-right font-semibold text-text-secondary uppercase tracking-wide text-xs">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              skeletonRows.map((_, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  {Array.from({ length: colCount }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="skeleton h-4 rounded" style={{ width: `${60 + Math.random() * 30}%` }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : paged.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="px-4 py-12 text-center text-text-secondary">
                  {emptyText}
                </td>
              </tr>
            ) : (
              paged.map((row, i) => (
                <tr
                  key={row.id ?? i}
                  onClick={() => onRowClick?.(row)}
                  className={clsx(
                    'border-b border-border last:border-0 transition-colors duration-150',
                    onRowClick && 'cursor-pointer hover:bg-primary-500/5',
                  )}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-text-primary">
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3 text-right">
                      {actions(row)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && sorted.length > pageSize && (
        <div className="px-4 py-3 border-t border-border flex items-center justify-between gap-4 text-sm">
          <span className="text-text-secondary">
            Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, sorted.length)} of {sorted.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setPage((p) => p - 1)}
              className={clsx(
                'flex items-center justify-center w-8 h-8 rounded-btn border border-border',
                'hover:bg-bg-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
              )}
            >
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…')
                acc.push(p)
                return acc
              }, [])
              .map((p, idx) =>
                p === '…' ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-text-secondary">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={clsx(
                      'w-8 h-8 rounded-btn text-sm font-medium transition-colors',
                      p === currentPage
                        ? 'bg-primary-700 text-white'
                        : 'border border-border hover:bg-bg-primary text-text-primary',
                    )}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className={clsx(
                'flex items-center justify-center w-8 h-8 rounded-btn border border-border',
                'hover:bg-bg-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
              )}
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataTable
