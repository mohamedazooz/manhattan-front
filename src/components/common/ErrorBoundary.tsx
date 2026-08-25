import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '../ui/Button';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Application error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      const isAr = typeof window !== 'undefined' && (localStorage.getItem('lang') === 'ar' || document.documentElement.lang === 'ar');
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
          <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-lg p-8 text-center space-y-4">
            <h1 className="text-2xl font-bold text-slate-900">
              {isAr ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred'}
            </h1>
            <p className="text-sm text-slate-600">
              {isAr
                ? 'واجه التطبيق مشكلة أثناء عرض هذه الصفحة. يمكنك المحاولة مرة أخرى أو العودة للصفحة الرئيسية.'
                : 'The application encountered an issue while rendering this page. You can try again or return to the home page.'}
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => window.location.reload()}>
                {isAr ? 'إعادة المحاولة' : 'Retry'}
              </Button>
              <Button variant="gold" onClick={() => (window.location.href = '/')}>
                {isAr ? 'الصفحة الرئيسية' : 'Home Page'}
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
