import { useTranslation } from 'react-i18next';
import { setAppLanguage } from '../../i18n';
import { cn } from '../../lib/utils';

export function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n } = useTranslation();
  const current = i18n.language === 'ar' ? 'ar' : 'en';

  return (
    <div className={cn('flex rounded-xl border border-slate-300 dark:border-slate-700 overflow-hidden text-xs bg-slate-100 dark:bg-slate-900 shadow-2xs shrink-0', className)}>
      {(['en', 'ar'] as const).map((lang) => (
        <button
          key={lang}
          onClick={() => setAppLanguage(lang)}
          className={cn(
            'px-2.5 py-1 font-bold transition-all cursor-pointer select-none',
            current === lang
              ? 'bg-amber-400 text-slate-950 font-extrabold shadow-2xs'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white',
          )}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
