import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/utils';

export function PasswordInput({
  className,
  containerClassName,
  label,
  error,
  hint,
  id: idProp,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: string;
  error?: string;
  /**
   * Requirements / helper copy describing a valid password. Announced to
   * screen readers via `aria-describedby`. When omitted, a localized default is
   * derived from `minLength` so password fields always describe their rules.
   */
  hint?: string;
  containerClassName?: string;
}) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);

  const reactId = useId();
  const inputId = idProp ?? `password-${reactId}`;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;

  const minLength = typeof props.minLength === 'number' ? props.minLength : undefined;
  const resolvedHint =
    hint ??
    (minLength
      ? t('auth.passwordRequirements', {
          defaultValue: 'Must be at least {{count}} characters.',
          count: minLength,
        })
      : undefined);

  // Order matters: requirements are announced before the validation error.
  const describedBy = [resolvedHint ? hintId : null, error ? errorId : null]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cn('block space-y-1 w-full', containerClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-neutral-dark dark:text-slate-200"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type={showPassword ? 'text' : 'password'}
          tabIndex={0}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          className={cn(
            'w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 pe-10 text-sm text-neutral-dark dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors',
            error && 'border-accent dark:border-red-500',
            className,
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute inset-y-0 end-0 flex items-center px-3 text-neutral-medium hover:text-neutral-dark dark:text-slate-400 dark:hover:text-slate-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-e-lg"
          aria-label={showPassword ? t('auth.hidePassword', 'إخفاء كلمة المرور') : t('auth.showPassword', 'إظهار كلمة المرور')}
          aria-pressed={showPassword}
          aria-controls={inputId}
          tabIndex={0}
        >
          {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>
      {resolvedHint && (
        <span id={hintId} className="block text-xs text-neutral-medium dark:text-slate-400">
          {resolvedHint}
        </span>
      )}
      {error && (
        <span id={errorId} className="text-xs text-accent dark:text-red-400">
          {error}
        </span>
      )}
    </div>
  );
}
