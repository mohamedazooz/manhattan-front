import { cn } from '../../lib/utils';

export function Input({
  className,
  containerClassName,
  label,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  containerClassName?: string;
}) {
  return (
    <label className={cn('block space-y-1 w-full', containerClassName)}>
      {label && <span className="text-sm font-medium text-neutral-dark dark:text-slate-200">{label}</span>}
      <input
        className={cn(
          'w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-neutral-dark dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors',
          error && 'border-accent dark:border-red-500',
          className,
        )}
        {...props}
      />
      {error && <span className="text-xs text-accent dark:text-red-400">{error}</span>}
    </label>
  );
}

export function Textarea({
  className,
  containerClassName,
  label,
  error,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  containerClassName?: string;
}) {
  return (
    <label className={cn('block space-y-1 w-full', containerClassName)}>
      {label && <span className="text-sm font-medium text-neutral-dark dark:text-slate-200">{label}</span>}
      <textarea
        className={cn(
          'w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-neutral-dark dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-[120px] transition-colors',
          error && 'border-accent dark:border-red-500',
          className,
        )}
        {...props}
      />
      {error && <span className="text-xs text-accent dark:text-red-400">{error}</span>}
    </label>
  );
}

export function Select({
  className,
  containerClassName,
  label,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  containerClassName?: string;
}) {
  return (
    <label className={cn('block space-y-1 w-full', containerClassName)}>
      {label && <span className="text-sm font-medium text-neutral-dark dark:text-slate-200">{label}</span>}
      <select
        className={cn(
          'w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-neutral-dark dark:text-slate-100 focus:border-primary focus:outline-none transition-colors',
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
