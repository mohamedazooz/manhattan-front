import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GraduationCap, Briefcase, UserPlus, LogIn } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { getPostLoginRedirect } from '../../components/auth/RoleRoute';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { getApiErrorMessage } from '../../lib/api-error';
import { PasswordInput } from '../../components/ui/PasswordInput';

interface RegisterPageProps {
  accountType: 'parent' | 'applicant';
}

export function RegisterPage({ accountType }: RegisterPageProps) {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isParent = accountType === 'parent';
  const redirect = searchParams.get('redirect');

  const redirectQuery = redirect ? `?redirect=${encodeURIComponent(redirect)}` : '';
  const loginUrl = `/login?accountType=${accountType}${redirect ? `&redirect=${encodeURIComponent(redirect)}` : ''}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(form.email, form.password, form.fullName, accountType);
      navigate(getPostLoginRedirect(user.role, redirect ?? undefined));
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          t('auth.registerFailed', 'فشل إنشاء الحساب، يرجى المحاولة مرة أخرى'),
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[85vh] grid lg:grid-cols-2">
      <div className={`hidden lg:flex flex-col justify-center px-12 text-white ${isParent ? 'bg-primary' : 'bg-slate-900'}`}>
        {isParent ? <GraduationCap className="w-14 h-14 text-gold mb-4" /> : <Briefcase className="w-14 h-14 text-emerald-400 mb-4" />}
        <h1 className="text-3xl font-extrabold mb-4">
          {isParent ? t('auth.registerParentTitle', 'منظومة التقديم والقبول الإلكتروني') : t('auth.registerApplicantTitle', 'بوابة التوظيف والانضمام لفريق التدريس')}
        </h1>
        <p className="text-white/80 leading-relaxed text-base">
          {isParent ? t('auth.registerParentDesc', 'قم بإنشاء حساب ولي أمر للبدء في تقديم طلب التحاق جديد لمدرسة منهاتن للغات ومتابعة حالة القبول خطوة بخطوة.') : t('auth.registerApplicantDesc', 'سجل حسابك كمعلم أو كادر تعليمي للتقديم على الفرص المتاحة ومتابعة نتائج التقديم.')}
        </p>
      </div>

      <div className="flex items-center justify-center px-4 py-12 bg-slate-50">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-xl space-y-6">
          <div className="flex flex-col items-center text-center">
            <img src="/logo.png" alt="MLS" className="h-12 w-auto mb-3" />
            <h2 className="text-2xl font-bold text-slate-800">
              {isParent ? 'تسجيل طلب التحاق جديد' : 'انضمام كادر تعليمي'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isParent ? 'أنشئ حسابك لبدء نموذج تقديم الطالب' : 'أنشئ حسابك لإرسال سيرتك الذاتية'}
            </p>
          </div>

          {/* Seamless Auth Tab Selector */}
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-sm font-semibold">
            <Link
              to={`/register/${accountType}${redirectQuery}`}
              className="flex-1 py-2 text-center rounded-lg bg-white text-primary shadow-xs flex items-center justify-center gap-1.5"
            >
              <UserPlus className="h-4 w-4 text-primary" />
              <span>إنشاء حساب (Sign Up)</span>
            </Link>
            <Link
              to={loginUrl}
              className="flex-1 py-2 text-center rounded-lg text-slate-600 hover:text-slate-900 transition-colors flex items-center justify-center gap-1.5"
            >
              <LogIn className="h-4 w-4" />
              <span>تسجيل الدخول (Sign In)</span>
            </Link>
          </div>

          {error && <p className="text-red-600 text-sm font-medium text-center bg-red-50 p-3 rounded-lg border border-red-200">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="الاسم بالكامل" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required placeholder="مثال: أحمد محمد علي" />
            <Input label={t('auth.email', 'البريد الإلكتروني')} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="name@example.com" />
            <PasswordInput label={t('auth.password', 'كلمة المرور')} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} placeholder="••••••••" />

            <Button type="submit" variant="gold" className="w-full py-3 font-bold shadow-md text-base" disabled={loading}>
              {loading ? 'جاري الإنشاء والتحويل...' : 'إنشاء الحساب والبدء في التقديم →'}
            </Button>
          </form>

          <div className="pt-2 text-center space-y-2 border-t text-xs text-slate-500">
            <p>
              لديك حساب بالفعل؟{' '}
              <Link to={loginUrl} className="text-primary font-bold hover:underline">
                تسجيل الدخول مباشرة
              </Link>
            </p>
            <p>
              {isParent ? (
                <Link to={`/register/applicant${redirectQuery}`} className="text-emerald-700 font-semibold hover:underline">
                  التسجيل كـ معلم / كادر تعليمي
                </Link>
              ) : (
                <Link to={`/register/parent${redirectQuery}`} className="text-primary font-semibold hover:underline">
                  التسجيل كـ ولي أمر طالب
                </Link>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
