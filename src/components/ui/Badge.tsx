import { cn } from '../../lib/utils';

const colors: Record<string, string> = {
  PUBLISHED: 'bg-green-100 text-green-800',
  DRAFT: 'bg-gray-100 text-gray-700',
  OPEN: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-700',
  SUBMITTED: 'bg-blue-100 text-blue-800',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
  ACCEPTED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  NEW: 'bg-blue-100 text-blue-800',
  READ: 'bg-gray-100 text-gray-700',
  REPLIED: 'bg-green-100 text-green-800',
  ARCHIVED: 'bg-gray-100 text-gray-500',
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  SPAM: 'bg-red-100 text-red-800',
  ACTIVE: 'bg-green-100 text-green-800',
  SUSPENDED: 'bg-red-100 text-red-800',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-block rounded-full px-2.5 py-0.5 text-xs font-medium',
        colors[status] || 'bg-gray-100 text-gray-700',
      )}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex justify-center py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-primary-dark font-[family-name:var(--font-heading)]">
        {title}
      </h1>
      {subtitle && <p className="mt-2 text-neutral-medium">{subtitle}</p>}
    </div>
  );
}
