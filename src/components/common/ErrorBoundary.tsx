import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '../ui/Button';
import { logger } from '../../lib/logger';
import i18n from '../../i18n';

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
    logger.error('Application error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
          <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-lg p-8 text-center space-y-4">
            <h1 className="text-2xl font-bold text-slate-900">{i18n.t('states.errorTitle', 'حدث خطأ غير متوقع')}</h1>
            <p className="text-sm text-slate-600">
              {i18n.t('states.errorDesc', 'واجه التطبيق مشكلة أثناء عرض هذه الصفحة. يمكنك المحاولة مرة أخرى أو العودة للصفحة الرئيسية.')}
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => window.location.reload()}>
                {i18n.t('common.retry', 'إعادة المحاولة')}
              </Button>
              <Button variant="gold" onClick={() => (window.location.href = '/')}>
                {i18n.t('notFoundPage.backHome', 'الصفحة الرئيسية')}
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
