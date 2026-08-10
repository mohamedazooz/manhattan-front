import { LoadingSpinner } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
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
  emptyTitle: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
}

export function AdminDataTable({
  columns,
  data,
  isLoading = false,
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
}: AdminDataTableProps) {
  if (isLoading) {
    return <LoadingSpinner />;
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
      <DataTable columns={columns} data={data} />
    </div>
  );
}
