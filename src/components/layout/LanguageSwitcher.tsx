import { useTranslation } from 'react-i18next';
import { setAppLanguage } from '../../i18n';
import { cn } from '../../lib/utils';

export function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n } = useTranslation();
  const current = i18n.language === 'ar' ? 'ar' : 'en';

  return (
    <div className={cn('flex rounded border border-gray-200 overflow-hidden text-xs', className)}>
      {(['en', 'ar'] as const).map((lang) => (
        <button
          key={lang}
          onClick={() => setAppLanguage(lang)}
          className={cn(
            'px-3 py-1.5 font-medium transition-colors',
            current === lang ? 'bg-primary text-white' : 'bg-white text-neutral-medium hover:bg-primary-light',
          )}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
