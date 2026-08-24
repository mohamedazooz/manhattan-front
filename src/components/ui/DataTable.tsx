import { useEffect, useId } from 'react';
import { cn } from '../../lib/utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = any;

export function DataTable({
  columns,
  data,
  emptyMessage = 'No data',
  caption,
}: {
  columns: Array<{
    key: string;
    header: string;
    align?: 'start' | 'center' | 'end';
    render: (row: AnyRow) => React.ReactNode;
  }>;
  data: AnyRow[];
  emptyMessage?: string;
  /** Accessible description of the table, visually hidden. */
  caption?: string;
}) {
  if (!data.length) {
    return <p className="text-neutral-medium py-8 text-center">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-slate-800">
      <table role="table" className="min-w-full divide-y divide-gray-200 dark:divide-slate-800 text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="bg-neutral-light dark:bg-slate-800/90">
          <tr role="row">
            {columns.map((col) => {
              const alignClass =
                col.align === 'center'
                  ? 'text-center'
                  : col.align === 'end'
                    ? 'text-end'
                    : 'text-start';
              return (
                <th
                  key={col.key}
                  scope="col"
                  role="columnheader"
                  className={cn(
                    'px-4 py-3 font-semibold text-neutral-dark dark:text-slate-100 whitespace-nowrap',
                    alignClass,
                  )}
                >
                  {col.header}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900 text-neutral-dark dark:text-slate-200">
          {data.map((row: AnyRow) => (
            <tr key={row.id} role="row" className="hover:bg-neutral-light/50 dark:hover:bg-slate-800/50 transition-colors">
              {columns.map((col) => {
                const alignClass =
                  col.align === 'center'
                    ? 'text-center'
                    : col.align === 'end'
                      ? 'text-end'
                      : 'text-start';
                return (
                  <td
                    key={col.key}
                    role="cell"
                    className={cn(
                      'px-4 py-3 align-middle text-neutral-dark dark:text-slate-200',
                      alignClass,
                    )}
                  >
                    {col.render(row)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  const reactId = useId();
  const titleId = `modal-title-${reactId}`;

  // Close on Escape for keyboard users.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'max-h-[90vh] overflow-y-auto rounded-lg bg-white dark:bg-slate-900 text-neutral-dark dark:text-slate-100 border border-gray-200 dark:border-slate-800 p-6 shadow-xl',
          wide ? 'w-full max-w-3xl' : 'w-full max-w-lg',
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id={titleId} className="text-lg font-semibold text-neutral-dark dark:text-slate-100">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-neutral-medium dark:text-slate-400 hover:text-neutral-dark dark:hover:text-slate-100 transition-colors">
            <span aria-hidden="true">✕</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
