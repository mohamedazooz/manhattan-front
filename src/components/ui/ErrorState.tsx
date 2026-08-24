import { useTranslation } from 'react-i18next';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

export interface ErrorStateProps {
  /** Heading. Falls back to the localized "Something went wrong". */
  title?: string;
  /** Supporting copy. Falls back to the localized generic description. */
  description?: string;
  /** When provided, a "Try again" button is rendered. */
  onRetry?: () => void;
  /** Overrides the retry button label. */
  retryLabel?: string;
  /** Hide the default warning icon. */
  hideIcon?: boolean;
  /** Compact variant for use inside cards / table bodies. */
  compact?: boolean;
  className?: string;
}

/**
 * Standard presentation for a failed data fetch or mutation.
 * Mirrors `EmptyState` styling so the two read as one design system.
 */
export function ErrorState({
  title,
  description,
  onRetry,
  retryLabel,
  hideIcon = false,
  compact = false,
  className,
}: ErrorStateProps) {
  const { t } = useTranslation();

  return (
    <div
      role="alert"
      className={cn(
        'text-center rounded-2xl border-2 border-dashed border-red-300 dark:border-red-900/60 bg-red-50/60 dark:bg-red-950/20',
        compact ? 'py-8 px-4' : 'py-16 px-6',
        className,
      )}
    >
      {!hideIcon && (
        <div className="mb-4 flex justify-center text-red-500 dark:text-red-400">
          <AlertTriangle className={compact ? 'h-8 w-8' : 'h-12 w-12'} aria-hidden="true" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-2">
        {title ?? t('states.errorTitle', 'Something went wrong')}
      </h3>
      <p className="text-sm text-red-800/80 dark:text-red-300/80 max-w-md mx-auto">
        {description ?? t('states.errorDesc', 'We could not load this content. Please check your connection and try again.')}
      </p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="mt-6">
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          {retryLabel ?? t('common.retry', 'Try again')}
        </Button>
      )}
    </div>
  );
}
