import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PermissionGuard } from '../../auth/ProtectedRoute';

export function DashboardSection({
  title,
  permission,
  manageLink,
  manageLabel,
  children,
}: {
  title: string;
  permission: string;
  manageLink?: string;
  manageLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <PermissionGuard permission={permission}>
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h2>
          {manageLink && manageLabel && (
            <Link
              to={manageLink}
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              {manageLabel} <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
        {children}
      </section>
    </PermissionGuard>
  );
}
