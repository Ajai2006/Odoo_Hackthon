/**
 * DataTable — Dayflow Design System Component
 *
 * Features:
 *   - Sticky table header on scroll
 *   - Light zebra striping (even:bg-[#FAFBFC])
 *   - Global search & column sorting
 *   - Designed empty state (Icon + message + optional action)
 *   - Skeleton loaders during async fetch
 */
import React, { useState, useMemo } from 'react'
import { Search, ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, Inbox } from 'lucide-react'
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
  emptyAction = null,
}) {
  const [search, setSearch]   = useState('')
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage]       = useState(1)

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

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const paged = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
    setPage(1)
  }

  const handleSearch = (e) => { setSearch(e.target.value); setPage(1) }

  const skeletonRows = Array.from({ length: pageSize })
  const colCount = columns.length + (actions ? 1 : 0)

  return (
    <div className="bg-bg-surface rounded-card border border-border shadow-card overflow-hidden animate-fade-in">
      {/* Search Toolbar */}
      {searchable && (
        <div className="px-4 py-3 border-b border-border bg-bg-surface">
          <div className="relative max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={handleSearch}
              placeholder="Search records…"
              className={clsx(
                'w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-input border border-border bg-bg-primary',
                'text-text-primary placeholder:text-text-secondary',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-bg-surface',
                'transition-all duration-200',
              )}
            />
          </div>
        </div>
      )}

      {/* Table Container with Scroll */}
      <div className="overflow-x-auto max-h-[600px]">
        <table className="w-full text-sm border-collapse text-left">
          {/* Sticky Header */}
          <thead className="sticky top-0 z-10 bg-bg-primary border-b border-border shadow-sm">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={clsx(
                    'px-4 py-3.5 font-semibold text-text-secondary uppercase tracking-wide text-xs select-none bg-bg-primary',
                    col.sortable !== false && 'cursor-pointer hover:text-primary-700 transition-colors',
                  )}
                  style={{ width: col.width }}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  <span className="flex items-center gap-1.5">
                    {col.label}
                    {col.sortable !== false && (
                      <SortIcon direction={sortKey === col.key ? sortDir : null} />
                    )}
                  </span>
                </th>
              ))}
              {actions && (
                <th className="px-4 py-3.5 text-right font-semibold text-text-secondary uppercase tracking-wide text-xs bg-bg-primary">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          {/* Table Body with Zebra Striping */}
          <tbody className="divide-y divide-border">
            {loading ? (
              skeletonRows.map((_, i) => (
                <tr key={i} className="even:bg-[#FAFBFC]">
                  {Array.from({ length: colCount }).map((__, j) => (
                    <td key={j} className="px-4 py-3.5">
                      <div className="skeleton h-4 rounded" style={{ width: `${50 + ((j * 17 + i * 11) % 40)}%` }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : paged.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                    <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center mb-3">
                      <Inbox size={24} />
                    </div>
                    <p className="text-sm font-semibold text-primary-900 mb-1">No Data Available</p>
                    <p className="text-xs text-text-secondary mb-4">{emptyText}</p>
                    {emptyAction}
                  </div>
                </td>
              </tr>
            ) : (
              paged.map((row, i) => (
                <tr
                  key={row.id ?? i}
                  onClick={() => onRowClick?.(row)}
                  className={clsx(
                    'even:bg-[#FAFBFC] transition-colors duration-150',
                    onRowClick && 'cursor-pointer hover:bg-primary-100/50',
                  )}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3.5 text-text-primary text-sm">
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3.5 text-right">
                      {actions(row)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!loading && sorted.length > pageSize && (
        <div className="px-4 py-3 border-t border-border bg-bg-surface flex items-center justify-between gap-4 text-xs sm:text-sm">
          <span className="text-text-secondary">
            Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, sorted.length)} of {sorted.length} records
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-1.5 rounded-btn border border-border hover:bg-bg-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Previous Page"
            >
              <ChevronLeft size={16} />
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
                      'w-7 h-7 rounded-btn text-xs font-semibold transition-colors',
                      p === currentPage
                        ? 'bg-primary-700 text-white shadow-sm'
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
              className="p-1.5 rounded-btn border border-border hover:bg-bg-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataTable
