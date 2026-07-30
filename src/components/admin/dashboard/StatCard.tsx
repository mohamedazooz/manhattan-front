import { Link } from 'react-router-dom';
import { cn } from '../../../lib/utils';

type StatVariant = 'primary' | 'accent' | 'gold' | 'success' | 'warning' | 'danger' | 'neutral';

const variantStyles: Record<StatVariant, string> = {
  primary: 'text-primary',
  accent: 'text-accent',
  gold: 'text-amber-600',
  success: 'text-emerald-600',
  warning: 'text-amber-500',
  danger: 'text-red-600',
  neutral: 'text-slate-700',
};

export function StatCard({
  title,
  value,
  variant = 'primary',
  to,
  subtitle,
}: {
  title: string;
  value: number | string;
  variant?: StatVariant;
  to?: string;
  subtitle?: string;
}) {
  const content = (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className={cn('text-3xl font-bold tabular-nums', variantStyles[variant])}>{value}</div>
      <div className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400">{title}</div>
      {subtitle && <div className="mt-0.5 text-xs text-slate-400">{subtitle}</div>}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl">
        {content}
      </Link>
    );
  }

  return content;
}
