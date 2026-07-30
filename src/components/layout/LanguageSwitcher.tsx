import { useTranslation } from 'react-i18next';
import { setAppLanguage } from '../../i18n';
import { cn } from '../../lib/utils';

export function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n } = useTranslation();
  const current = i18n.language === 'ar' ? 'ar' : 'en';

  return (
    <div className={cn('flex rounded-lg border border-white/20 overflow-hidden text-xs bg-white/5 backdrop-blur-xs', className)}>
      {(['en', 'ar'] as const).map((lang) => (
        <button
          key={lang}
          onClick={() => setAppLanguage(lang)}
          className={cn(
            'px-2.5 py-1 font-semibold transition-colors',
            current === lang ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-200 hover:bg-white/10 hover:text-white',
          )}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
