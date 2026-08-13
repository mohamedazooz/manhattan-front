import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/utils';

export function PasswordInput({
  className,
  containerClassName,
  label,
  error,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: string;
  error?: string;
  containerClassName?: string;
}) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <label className={cn('block space-y-1 w-full', containerClassName)}>
      {label && <span className="text-sm font-medium text-neutral-dark dark:text-slate-200">{label}</span>}
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
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
          className="absolute inset-y-0 end-0 flex items-center px-3 text-neutral-medium hover:text-neutral-dark dark:text-slate-400 dark:hover:text-slate-200"
          aria-label={showPassword ? t('auth.hidePassword', 'إخفاء كلمة المرور') : t('auth.showPassword', 'إظهار كلمة المرور')}
          tabIndex={-1}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <span className="text-xs text-accent dark:text-red-400">{error}</span>}
    </label>
  );
}
