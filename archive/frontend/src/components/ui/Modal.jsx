/**
 * Modal — Dayflow Design System
 *
 * Props:
 *   isOpen   {bool}        — controls visibility
 *   onClose  {function}    — called on backdrop click or Escape
 *   title    {string}      — modal heading
 *   children {ReactNode}   — body content
 *   size     {string}      — 'sm'|'md'|'lg'|'xl'  (default 'md')
 *   footer   {ReactNode}   — optional footer (buttons etc.)
 */
import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { clsx } from 'clsx'

const SIZE_MAP = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export function Modal({ isOpen, onClose, title, children, size = 'md', footer = null }) {
  const dialogRef = useRef(null)

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  // Trap focus inside dialog
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      dialogRef.current.focus()
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-primary-900/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={clsx(
          'relative z-10 w-full bg-bg-surface rounded-modal shadow-modal',
          'animate-scale-in flex flex-col max-h-[90vh]',
          SIZE_MAP[size] ?? SIZE_MAP.md,
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 id="modal-title" className="text-h3 text-primary-900 m-0">
            {title}
          </h2>
          <button
            onClick={onClose}
            className={clsx(
              'flex items-center justify-center w-8 h-8 rounded-btn',
              'text-text-secondary hover:text-text-primary hover:bg-bg-primary',
              'transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
            )}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-border flex justify-end gap-3 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export default Modal
