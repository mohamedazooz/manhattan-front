import { cn } from '../../lib/utils';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'text-center py-16 px-6 rounded-2xl border-2 border-dashed border-[var(--color-border-subtle)] bg-white dark:bg-slate-900',
        className,
      )}
    >
      {icon && <div className="mb-4 flex justify-center text-primary opacity-60">{icon}</div>}
      <h3 className="text-lg font-semibold text-neutral-dark mb-2">{title}</h3>
      {description && <p className="text-sm text-neutral-medium mb-6 max-w-md mx-auto">{description}</p>}
      {actionLabel && actionTo && <Button to={actionTo}>{actionLabel}</Button>}
      {actionLabel && onAction && !actionTo && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}
