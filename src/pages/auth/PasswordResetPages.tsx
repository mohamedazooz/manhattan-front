import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '../../api';
import { AuthPageShell } from '../../components/auth/AuthPageShell';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { PasswordInput } from '../../components/ui/PasswordInput';

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const accountType = searchParams.get('accountType') === 'applicant' ? 'applicant' : 'parent';
  const loginUrl = `/login?accountType=${accountType}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await authApi.requestPasswordReset({ email });
      setMessage(t('auth.resetEmailSent', 'إذا كان الحساب موجوداً، تم إرسال التعليمات'));
    } catch {
      setMessage(t('auth.resetEmailSent', 'إذا كان الحساب موجوداً، تم إرسال التعليمات'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageShell
      variant={accountType}
      title={t('auth.forgotPasswordTitle', 'استعادة كلمة المرور')}
      subtitle={t('auth.forgotPasswordDesc', 'أدخل بريدك وسنرسل رابطاً آمناً')}
      heroTitle={t('auth.loginHeroTitle', 'مرحباً بك في بوابة خدمات مدرسة منهاتن')}
      heroDesc={t('auth.loginHeroDesc', 'سجل دخولك لمتابعة طلبات التقديم والقبول الخاصة بأبنائك أو متابعة طلبات التوظيف.')}
    >
      {message && (
        <p className="text-sm font-medium text-center bg-emerald-50 text-emerald-800 p-3 rounded-lg border border-emerald-200">
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t('auth.email', 'البريد الإلكتروني')}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="name@example.com"
        />
        <Button type="submit" variant="gold" className="w-full py-3 font-bold shadow-md text-base" disabled={loading}>
          {loading ? t('auth.sendingResetLink', 'جاري الإرسال...') : t('auth.sendResetLink', 'إرسال رابط الاستعادة')}
        </Button>
      </form>

      <div className="pt-2 text-center border-t text-xs text-slate-500">
        <Link to={loginUrl} className="text-primary font-bold hover:underline">
          {t('auth.backToLogin', 'العودة لتسجيل الدخول')}
        </Link>
      </div>
    </AuthPageShell>
  );
}

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);
  const accountType = searchParams.get('accountType') === 'applicant' ? 'applicant' : 'parent';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const forgotUrl = `/forgot-password?accountType=${accountType}`;
  const loginUrl = `/login?accountType=${accountType}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError(t('auth.passwordsMismatch', 'كلمتا المرور غير متطابقتين'));
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword({ token, password });
      setMessage(t('auth.resetSuccess', 'تم تحديث كلمة المرور بنجاح'));
      setTimeout(() => navigate(loginUrl), 1500);
    } catch {
      setError(t('auth.resetTokenExpired', 'انتهت صلاحية الرابط'));
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <AuthPageShell
        variant={accountType}
        title={t('auth.resetPasswordTitle', 'تعيين كلمة مرور جديدة')}
        heroTitle={t('auth.loginHeroTitle', 'مرحباً بك في بوابة خدمات مدرسة منهاتن')}
        heroDesc={t('auth.loginHeroDesc', 'سجل دخولك لمتابعة طلبات التقديم والقبول الخاصة بأبنائك أو متابعة طلبات التوظيف.')}
      >
        <p className="text-red-600 text-sm font-medium text-center bg-red-50 p-3 rounded-lg border border-red-200">
          {t('auth.resetTokenMissing', 'رابط الاستعادة غير صالح')}
        </p>
        <div className="space-y-2 text-center text-xs text-slate-500">
          <p>
            <Link to={forgotUrl} className="text-primary font-bold hover:underline">
              {t('auth.sendResetLink', 'إرسال رابط الاستعادة')}
            </Link>
          </p>
          <p>
            <Link to={loginUrl} className="text-primary font-bold hover:underline">
              {t('auth.backToLogin', 'العودة لتسجيل الدخول')}
            </Link>
          </p>
        </div>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell
      variant={accountType}
      title={t('auth.resetPasswordTitle', 'تعيين كلمة مرور جديدة')}
      subtitle={t('auth.resetPasswordDesc', 'اختر كلمة مرور قوية لحسابك')}
      heroTitle={t('auth.loginHeroTitle', 'مرحباً بك في بوابة خدمات مدرسة منهاتن')}
      heroDesc={t('auth.loginHeroDesc', 'سجل دخولك لمتابعة طلبات التقديم والقبول الخاصة بأبنائك أو متابعة طلبات التوظيف.')}
    >
      {error && (
        <p className="text-red-600 text-sm font-medium text-center bg-red-50 p-3 rounded-lg border border-red-200">
          {error}
        </p>
      )}
      {message && (
        <p className="text-sm font-medium text-center bg-emerald-50 text-emerald-800 p-3 rounded-lg border border-emerald-200">
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <PasswordInput
          label={t('auth.newPassword', 'كلمة المرور الجديدة')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          placeholder="••••••••"
        />
        <PasswordInput
          label={t('auth.confirmPassword', 'تأكيد كلمة المرور')}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={8}
          placeholder="••••••••"
          error={password && confirmPassword && password !== confirmPassword ? t('auth.passwordsMismatch', 'كلمتا المرور غير متطابقتين') : undefined}
        />
        <Button
          type="submit"
          variant="gold"
          className="w-full py-3 font-bold shadow-md text-base"
          disabled={loading || password !== confirmPassword}
        >
          {loading ? t('auth.updatingPassword', 'جاري التحديث...') : t('auth.updatePassword', 'تحديث كلمة المرور')}
        </Button>
      </form>

      <div className="pt-2 text-center border-t text-xs text-slate-500">
        <Link to={loginUrl} className="text-primary font-bold hover:underline">
          {t('auth.backToLogin', 'العودة لتسجيل الدخول')}
        </Link>
      </div>
    </AuthPageShell>
  );
}
