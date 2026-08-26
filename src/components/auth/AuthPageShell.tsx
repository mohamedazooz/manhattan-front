import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface AuthPageShellProps {
  variant: 'parent' | 'applicant';
  title: string;
  subtitle?: string;
  heroTitle: string;
  heroDesc: string;
  heroExtra?: ReactNode;
  children: ReactNode;
}

export function AuthPageShell({
  variant,
  title,
  subtitle,
  heroTitle,
  heroDesc,
  heroExtra,
  children,
}: AuthPageShellProps) {
  const { t } = useTranslation();
  const isApplicant = variant === 'applicant';

  return (
    <div className="min-h-[85vh] grid lg:grid-cols-2">
      <div
        className={`hidden lg:flex flex-col justify-center px-12 text-white ${isApplicant ? 'bg-slate-900' : 'bg-primary'}`}
      >
        <p className="text-gold text-sm font-bold uppercase tracking-widest mb-3">{t('app.name', 'مدرسة منهاتن للغات')}</p>
        <h1 className="text-4xl font-extrabold mb-4">{heroTitle}</h1>
        <p className="text-white/80 text-lg leading-relaxed">{heroDesc}</p>
        {heroExtra && <div className="mt-8">{heroExtra}</div>}
      </div>

      <div className="flex items-center justify-center px-4 py-12 bg-slate-50">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-xl space-y-6">
          <div className="flex flex-col items-center text-center">
            <img src="/logo.png" alt="MLS" className="h-12 w-auto mb-3" />
            <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
