import { AppRoutes } from './routes/AppRoutes';
import { ThemeProvider } from './lib/theme';
import './i18n';

export default function App() {
  return (
    <ThemeProvider>
      <AppRoutes />
    </ThemeProvider>
  );
}
