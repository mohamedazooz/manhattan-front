import { cn } from '../../lib/utils';

export interface OpsCounterItem {
  id: string;
  label: string;
  value: number;
  highlight?: boolean;
  onClick?: () => void;
}

interface AdminOpsCountersProps {
  items: OpsCounterItem[];
  className?: string;
}

export function AdminOpsCounters({ items, className }: AdminOpsCountersProps) {
  if (items.length === 0) return null;

  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3', className)}>
      {items.map((item) => {
        const clickable = Boolean(item.onClick);
        const Wrapper = clickable ? 'button' : 'div';

        return (
          <Wrapper
            key={item.id}
            type={clickable ? 'button' : undefined}
            onClick={item.onClick}
            className={cn(
              'rounded-xl border p-3 text-left transition-colors',
              item.highlight
                ? 'border-amber-300 bg-amber-50/80 dark:border-amber-800 dark:bg-amber-950/30'
                : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900',
              clickable && 'hover:border-primary/40 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer',
            )}
          >
            <div
              className={cn(
                'text-2xl font-black tabular-nums',
                item.highlight ? 'text-amber-700 dark:text-amber-300' : 'text-slate-900 dark:text-slate-100',
              )}
            >
              {item.value}
            </div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
              {item.label}
            </div>
          </Wrapper>
        );
      })}
    </div>
  );
}
