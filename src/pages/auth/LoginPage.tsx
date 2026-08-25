import { useState } from 'react';
import { Link, Navigate, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../lib/auth';
import { getPortalHomeForRole, getPostLoginRedirect } from '../../components/auth/RoleRoute';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LogIn, UserPlus } from 'lucide-react';
import { getAccessToken } from '../../api/client';
import { LoadingSpinner } from '../../components/ui/Badge';

export function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: string })?.from || searchParams.get('redirect') || undefined;
  const targetType = searchParams.get('accountType') || (from?.includes('applicant') || from?.includes('careers') ? 'applicant' : 'parent');
  const redirectQuery = from ? `?redirect=${encodeURIComponent(from)}` : '';
  const registerUrl = `/register/${targetType}${redirectQuery}`;
  const loginUrl = `/login?accountType=${targetType}${from ? `&redirect=${encodeURIComponent(from)}` : ''}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(getPostLoginRedirect(user.role, from));
    } catch {
      setError(t('auth.invalidCredentials', 'البريد الإلكتروني أو كلمة المرور غير صحيحة'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[85vh] grid lg:grid-cols-2">
      <div className={`hidden lg:flex flex-col justify-center px-12 text-white ${targetType === 'applicant' ? 'bg-slate-900' : 'bg-primary'}`}>
        <p className="text-gold text-sm font-bold uppercase tracking-widest mb-3">{t('app.name')}</p>
        <h1 className="text-4xl font-extrabold mb-4">
          {targetType === 'applicant'
            ? 'بوابة التوظيف والانضمام لفريق التدريس'
            : t('auth.loginHeroTitle', 'مرحباً بك في بوابة خدمات مدرسة منهاتن')}
        </h1>
        <p className="text-white/80 text-lg leading-relaxed">
          {targetType === 'applicant'
            ? 'سجل دخولك لمتابعة طلبات التوظيف والفرص التعليمية المتاحة.'
            : t('auth.loginHeroDesc', 'سجل دخولك لمتابعة طلبات التقديم والقبول الخاصة بأبنائك أو متابعة طلبات التوظيف.')}
        </p>
        <div className="mt-8 space-y-2 text-sm font-medium">
          <Link to={`/register/parent${redirectQuery}`} className="block text-gold hover:underline">← التقديم كـ ولي أمر طالب جديد</Link>
          <Link to={`/register/applicant${redirectQuery}`} className="block text-emerald-300 hover:underline">← التقديم كـ معلم / كادر تعليمي</Link>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-12 bg-slate-50">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-xl space-y-6">
          <div className="flex flex-col items-center text-center">
            <img src="/logo.png" alt="MLS" className="h-12 w-auto mb-3" />
            <h2 className="text-2xl font-bold text-slate-800">
              {targetType === 'applicant' ? 'تسجيل دخول كادر تعليمي' : 'تسجيل دخول ولي أمر'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">{t('auth.loginSubtitle')}</p>
          </div>

          {/* Seamless Auth Tab Selector */}
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-sm font-semibold">
            <Link
              to={registerUrl}
              className="flex-1 py-2 text-center rounded-lg text-slate-600 hover:text-slate-900 transition-colors flex items-center justify-center gap-1.5"
            >
              <UserPlus className="h-4 w-4" />
              <span>إنشاء حساب (Sign Up)</span>
            </Link>
            <Link
              to={loginUrl}
              className="flex-1 py-2 text-center rounded-lg bg-white text-primary shadow-xs flex items-center justify-center gap-1.5"
            >
              <LogIn className="h-4 w-4 text-primary" />
              <span>تسجيل الدخول (Sign In)</span>
            </Link>
          </div>

          {error && <p className="text-red-600 text-sm font-medium text-center bg-red-50 p-3 rounded-lg border border-red-200">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label={t('auth.email', 'البريد الإلكتروني')} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="name@example.com" />
            <Input label={t('auth.password', 'كلمة المرور')} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
            <Button type="submit" variant="gold" className="w-full py-3 font-bold shadow-md text-base" disabled={loading}>
              {loading ? 'جاري الدخول...' : 'تسجيل الدخول والمتابعة →'}
            </Button>
          </form>

          <div className="pt-2 text-center space-y-2 border-t text-xs text-slate-500">
            <p>
              <Link to="/forgot-password" className="text-primary font-bold hover:underline">
                نسيت كلمة المرور؟
              </Link>
            </p>
            <p>
              ليس لديك حساب؟{' '}
              <Link to={registerUrl} className="text-primary font-bold hover:underline">
                {targetType === 'applicant' ? 'إنشاء حساب معلم جديد' : 'إنشاء حساب ولي أمر جديد'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminLoginPage() {
  const { t } = useTranslation();
  const { login, user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectTo = searchParams.get('redirect');

  if (authLoading) return <LoadingSpinner />;

  if (user && isAdmin && getAccessToken()) {
    const destination =
      redirectTo && redirectTo.startsWith('/admin') ? redirectTo : '/admin';
    return <Navigate to={destination} replace />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      const destination =
        redirectTo && redirectTo.startsWith('/admin')
          ? redirectTo
          : getPortalHomeForRole(user.role);
      navigate(destination);
    } catch {
      setError(t('auth.invalidCredentials', 'بيانات الدخول غير صحيحة'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-dark px-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-xl border border-gold/20">
        <div className="flex flex-col items-center mb-6 text-center">
          <img src="/logo.png" alt="MLS" className="h-12 w-auto mb-3" />
          <h1 className="text-2xl font-bold text-primary-dark dark:text-white">{t('auth.adminLogin', 'دخول لوحة التحكم بالإدارة')}</h1>
          <p className="text-xs text-neutral-medium mt-1">{t('auth.portalSubtitle')}</p>
        </div>

        <div className="mb-6 p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
          <p>استخدم بيانات حساب الإدارة المُعرّفة في بيئة التطوير أو المُوفّرة من مسؤول النظام.</p>
        </div>

        {error && <p className="text-accent text-sm mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label={t('auth.email', 'البريد الإلكتروني')} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label={t('auth.password', 'كلمة المرور')} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit" variant="gold" className="w-full font-bold py-3" disabled={loading}>
            {loading ? 'جاري الدخول...' : t('auth.loginBtn', 'دخول الأدمن')}
          </Button>
        </form>
      </div>
    </div>
  );
}
