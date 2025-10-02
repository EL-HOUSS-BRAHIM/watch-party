'use client'

interface ErrorMessageProps {
  message: string
  onDismiss?: () => void
  type?: 'error' | 'warning' | 'info'
}

/**
 * ErrorMessage - Inline error display component
 * Replaces alert() popups with better UX
 */
export function ErrorMessage({ message, onDismiss, type = 'error' }: ErrorMessageProps) {
  const styles = {
    error: 'bg-red-500/10 border-red-500/30 text-red-300',
    warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300',
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
  }

  const icons = {
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  }

  return (
    <div className={`rounded-lg border p-4 ${styles[type]} flex items-start gap-3`}>
      <span className="text-xl flex-shrink-0">{icons[type]}</span>
      <p className="flex-1 text-sm">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
          aria-label="Dismiss"
        >
          <span className="text-lg">×</span>
        </button>
      )}
    </div>
  )
}

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  variant?: 'danger' | 'warning' | 'info'
}

/**
 * ConfirmDialog - Modal confirmation dialog
 * Replaces window.confirm() with better UX
 */
export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger',
}: ConfirmDialogProps) {
  if (!isOpen) return null

  const variants = {
    danger: {
      icon: '⚠️',
      confirmBg: 'bg-red-600 hover:bg-red-700',
    },
    warning: {
      icon: '⚠️',
      confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
    },
    info: {
      icon: 'ℹ️',
      confirmBg: 'bg-blue-600 hover:bg-blue-700',
    },
  }

  const config = variants[variant]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-gray-900 border border-white/10 p-6 shadow-2xl">
        <div className="mb-4 flex items-start gap-3">
          <span className="text-3xl">{config.icon}</span>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-white/70">{message}</p>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-white font-semibold transition-colors ${config.confirmBg}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

interface FormErrorProps {
  error: string | null
}

/**
 * FormError - Error display for forms
 * Shows below form inputs
 */
export function FormError({ error }: FormErrorProps) {
  if (!error) return null

  return (
    <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3">
      <p className="text-sm text-red-300 flex items-center gap-2">
        <span>❌</span>
        {error}
      </p>
    </div>
  )
}

interface LoadingStateProps {
  message?: string
}

/**
 * LoadingState - Loading indicator
 */
export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
        <p className="text-white/70">{message}</p>
      </div>
    </div>
  )
}

interface EmptyStateProps {
  icon: string
  title: string
  message: string
  actionLabel?: string
  onAction?: () => void
}

/**
 * EmptyState - Display when no data available
 */
export function EmptyState({ icon, title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center max-w-md">
        <div className="mb-4 text-6xl">{icon}</div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-white/70 mb-6">{message}</p>
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 font-semibold text-white hover:shadow-lg transition-all"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  )
}
