import { useTranslation } from 'react-i18next';
import { Home, Compass } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { SeoHead } from '../../components/common/SeoHead';

export function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <SeoHead title={t('notFoundPage.title')} description={t('notFoundPage.description')} />
      <div className="max-w-lg w-full text-center space-y-6">
        <div className="flex justify-center">
          <img
            src="/logo.png"
            alt={t('app.name')}
            className="h-16 w-auto object-contain mx-auto"
          />
        </div>
        <p className="text-6xl font-black text-primary/20" aria-hidden="true">
          {t('notFoundPage.code')}
        </p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {t('notFoundPage.title')}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          {t('notFoundPage.description')}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button variant="gold" to="/">
            <Home className="w-4 h-4" aria-hidden="true" />
            {t('notFoundPage.backHome')}
          </Button>
          <Button variant="outline" to="/search">
            <Compass className="w-4 h-4" aria-hidden="true" />
            {t('notFoundPage.browseSite')}
          </Button>
        </div>
      </div>
    </div>
  );
}
