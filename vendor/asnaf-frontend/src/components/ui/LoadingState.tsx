import { useTranslation } from 'react-i18next'

type LoadingStateProps = {
  variant?: 'inline' | 'page' | 'fullscreen'
  showLabel?: boolean
  className?: string
}

export function LoadingSpinner({ size = 'md' }: { size?: 'xs' | 'sm' | 'md' | 'lg' }) {
  const sizeClass =
    size === 'xs' ? 'size-5' : size === 'sm' ? 'size-9' : size === 'lg' ? 'size-16' : 'size-12'

  return (
    <div
      className={`relative ${sizeClass}`}
      role="presentation"
      aria-hidden
    >
      <span className="absolute inset-0 rounded-full border-2 border-teal-100" />
      <span className="absolute inset-0 animate-loading-spin rounded-full border-2 border-transparent border-t-teal-500 border-r-teal-400" />
      <span className="absolute inset-[28%] animate-loading-pulse rounded-full bg-teal-500/25" />
      <span className="absolute inset-[38%] rounded-full bg-teal-500/80" />
    </div>
  )
}

export function LoadingState({
  variant = 'page',
  showLabel = true,
  className = '',
}: LoadingStateProps) {
  const { t } = useTranslation()

  const variantClass =
    variant === 'inline'
      ? 'py-10'
      : variant === 'fullscreen'
        ? 'min-h-svh'
        : 'py-16'

  const spinnerSize = variant === 'inline' ? 'sm' : 'md'

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 text-ink-500 ${variantClass} ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <LoadingSpinner size={spinnerSize} />
      {showLabel ? (
        <p className="text-sm tracking-wide text-ink-400">{t('common.loading')}</p>
      ) : null}
    </div>
  )
}
