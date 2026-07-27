import { cn } from '../../lib/utils';

export function Input({
  className,
  label,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) {
  return (
    <label className="block space-y-1">
      {label && <span className="text-sm font-medium text-neutral-dark">{label}</span>}
      <input
        className={cn(
          'w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
          error && 'border-accent',
          className,
        )}
        {...props}
      />
      {error && <span className="text-xs text-accent">{error}</span>}
    </label>
  );
}

export function Textarea({
  className,
  label,
  error,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }) {
  return (
    <label className="block space-y-1">
      {label && <span className="text-sm font-medium text-neutral-dark">{label}</span>}
      <textarea
        className={cn(
          'w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-[120px]',
          error && 'border-accent',
          className,
        )}
        {...props}
      />
      {error && <span className="text-xs text-accent">{error}</span>}
    </label>
  );
}

export function Select({
  className,
  label,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <label className="block space-y-1">
      {label && <span className="text-sm font-medium text-neutral-dark">{label}</span>}
      <select
        className={cn(
          'w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none',
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
