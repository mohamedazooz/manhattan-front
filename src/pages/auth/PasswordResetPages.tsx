import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '../../api';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await authApi.requestPasswordReset({ email });
      setMessage('If an account exists, password reset instructions have been sent.');
    } catch {
      setMessage('If an account exists, password reset instructions have been sent.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12 bg-neutral-light dark:bg-slate-950">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-primary-dark dark:text-slate-100 mb-2">
          Reset your password
        </h1>
        <p className="text-sm text-neutral-medium dark:text-slate-400 mb-6">
          Enter your MLS account email and we will send a secure reset link.
        </p>
        {message && <p className="text-sm text-primary mb-4">{message}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Sending...' : 'Send reset link'}
          </Button>
        </form>
        <p className="mt-4 text-sm text-center text-neutral-medium">
          <Link to="/login" className="text-primary font-medium">{t('auth.backToSignIn')}</Link>
        </p>
      </Card>
    </div>
  );
}

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!token) {
      setError('Password reset link is missing its token.');
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword({ token, password });
      setMessage('Password updated successfully. Redirecting to sign in...');
      setTimeout(() => navigate('/login'), 1200);
    } catch {
      setError('Password reset link is invalid or expired.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12 bg-neutral-light dark:bg-slate-950">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-primary-dark dark:text-slate-100 mb-6">
          Choose a new password
        </h1>
        {error && <p className="text-accent text-sm mb-4">{error}</p>}
        {message && <p className="text-primary text-sm mb-4">{message}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="New password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          <Input label="Confirm password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} />
          <Button type="submit" className="w-full" disabled={loading || !token}>
            {loading ? 'Updating...' : 'Update password'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
