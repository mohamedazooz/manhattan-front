import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  titleKey?: string;
  description?: string;
  descriptionKey?: string;
  actionLabel?: string;
  actionLabelKey?: string;
  actionTo?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  titleKey,
  description,
  descriptionKey,
  actionLabel,
  actionLabelKey,
  actionTo,
  onAction,
  icon,
  className,
}: EmptyStateProps) {
  const { t } = useTranslation();
  const resolvedTitle = titleKey ? t(titleKey) : title;
  const resolvedDescription = descriptionKey ? t(descriptionKey) : description;
  const resolvedActionLabel = actionLabelKey ? t(actionLabelKey) : actionLabel;

  return (
    <div
      className={cn(
        'text-center py-16 px-6 rounded-2xl border-2 border-dashed border-[var(--color-border-subtle)] bg-white dark:bg-slate-900',
        className,
      )}
      role="status"
    >
      {icon && <div className="mb-4 flex justify-center text-primary opacity-60">{icon}</div>}
      <h3 className="text-lg font-semibold text-neutral-dark mb-2">{resolvedTitle}</h3>
      {resolvedDescription && <p className="text-sm text-neutral-medium mb-6 max-w-md mx-auto">{resolvedDescription}</p>}
      {resolvedActionLabel && actionTo && <Button to={actionTo}>{resolvedActionLabel}</Button>}
      {resolvedActionLabel && onAction && !actionTo && (
        <Button onClick={onAction}>{resolvedActionLabel}</Button>
      )}
    </div>
  );
}
