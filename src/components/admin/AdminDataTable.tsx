import { LoadingSpinner } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { ErrorState } from '../ui/ErrorState';
import { DataTable } from '../ui/DataTable';
import { Inbox } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = any;

interface Column {
  key: string;
  header: string;
  align?: 'start' | 'center' | 'end';
  render: (row: AnyRow) => React.ReactNode;
}

interface AdminDataTableProps {
  columns: Column[];
  data: AnyRow[];
  isLoading?: boolean;
  /** Renders an ErrorState instead of the table when the query failed. */
  isError?: boolean;
  /** Adds a "Try again" button to the error state. */
  onRetry?: () => void;
  errorTitle?: string;
  errorDescription?: string;
  emptyTitle: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  /** Visually hidden table caption for screen readers. */
  caption?: string;
}

export function AdminDataTable({
  columns,
  data,
  isLoading = false,
  isError = false,
  onRetry,
  errorTitle,
  errorDescription,
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  caption,
}: AdminDataTableProps) {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <ErrorState
        title={errorTitle}
        description={errorDescription}
        onRetry={onRetry}
        className="border-red-200 dark:border-red-900/60"
      />
    );
  }

  if (!data.length) {
    return (
      <EmptyState
        icon={<Inbox className="h-10 w-10" />}
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
        className="border-slate-200 dark:border-slate-800"
      />
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
      <DataTable columns={columns} data={data} caption={caption ?? emptyTitle} />
    </div>
  );
}
