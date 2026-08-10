import type { ReactNode } from 'react';
import { Search } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AdminListToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  resultCount?: number;
  totalCount?: number;
  resultLabel?: string;
  filters?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function AdminListToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search…',
  resultCount,
  totalCount,
  resultLabel,
  filters,
  actions,
  className,
}: AdminListToolbarProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs space-y-4',
        className,
      )}
    >
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search
            className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 start-3 pointer-events-none"
          />
          <input
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full py-2.5 ps-10 pe-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {resultCount !== undefined && (
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums px-2">
              {resultLabel ?? `${resultCount}${totalCount !== undefined ? ` / ${totalCount}` : ''}`}
            </span>
          )}
          {actions}
        </div>
      </div>

      {filters && <div className="flex flex-wrap items-center gap-2">{filters}</div>}
    </div>
  );
}

interface StatusChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
  variant?: 'default' | 'warning' | 'critical';
}

export function AdminStatusChip({
  label,
  active,
  onClick,
  count,
  variant = 'default',
}: StatusChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border',
        active
          ? variant === 'critical'
            ? 'bg-rose-600 text-white border-rose-600'
            : variant === 'warning'
              ? 'bg-amber-600 text-white border-amber-600'
              : 'bg-primary-dark text-white border-primary-dark dark:bg-primary dark:border-primary'
          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700',
      )}
    >
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={cn(
            'min-w-[1.25rem] rounded-full px-1.5 py-0.5 text-[10px] tabular-nums',
            active ? 'bg-white/20' : 'bg-white dark:bg-slate-900 text-slate-500',
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
