import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AppRoutes } from './routes/AppRoutes';
import { ThemeProvider } from './lib/theme';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './i18n';

export default function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const lang = i18n.language?.startsWith('ar') ? 'ar' : 'en';
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
  }, [i18n.language]);

  return (
    <ThemeProvider>
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
    </ThemeProvider>
  );
}
