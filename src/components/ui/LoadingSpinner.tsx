import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';

const sizeMap = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-4',
  lg: 'h-12 w-12 border-4',
} as const;

export interface LoadingSpinnerProps {
  /** Visual size of the spinner. Defaults to `md` to preserve legacy appearance. */
  size?: keyof typeof sizeMap;
  /** Accessible label announced to screen readers. Defaults to the localized "Loading…" string. */
  label?: string;
  /** Render a visible caption under the spinner. */
  showLabel?: boolean;
  /** Extra classes for the outer wrapper. */
  className?: string;
  /** Extra classes for the spinning circle itself. */
  spinnerClassName?: string;
}

/**
 * Accessible loading indicator.
 *
 * The default rendering is intentionally identical to the previous inline
 * spinner (`flex justify-center py-12` + `h-8 w-8 border-4`) so that every
 * existing call site keeps its exact layout, while gaining `role="status"`
 * and a screen-reader announcement.
 */
export function LoadingSpinner({
  size = 'md',
  label,
  showLabel = false,
  className,
  spinnerClassName,
}: LoadingSpinnerProps = {}) {
  const { t } = useTranslation();
  const resolvedLabel = label ?? t('states.loading', 'Loading…');

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn('flex flex-col items-center justify-center gap-3 py-12', className)}
    >
      <div
        className={cn(
          'animate-spin rounded-full border-primary border-t-transparent',
          sizeMap[size],
          spinnerClassName,
        )}
       />
      {showLabel ? (
        <span className="text-sm text-neutral-medium dark:text-slate-400">{resolvedLabel}</span>
      ) : (
        <span className="sr-only">{resolvedLabel}</span>
      )}
    </div>
  );
}
