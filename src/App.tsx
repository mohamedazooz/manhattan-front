import { AppRoutes } from './routes/AppRoutes';
import { ThemeProvider } from './lib/theme';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './i18n';

export default function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
    </ThemeProvider>
  );
}
