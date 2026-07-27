import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../lib/auth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

export function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: string })?.from;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (from) {
        navigate(from);
      } else if (user.role === 'ADMIN' || user.role === 'TEACHER') {
        navigate('/admin');
      } else {
        navigate('/portal');
      }
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12 bg-neutral-light">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-primary-dark mb-6">{t('auth.loginTitle')}</h1>
        {error && <p className="text-accent text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label={t('auth.email')} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label={t('auth.password')} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit" className="w-full" disabled={loading}>{t('auth.loginBtn')}</Button>
        </form>
        <p className="mt-4 text-sm text-center text-neutral-medium">
          {t('auth.noAccount')} <Link to="/register" className="text-primary font-medium">{t('auth.registerBtn')}</Link>
        </p>
      </Card>
    </div>
  );
}

export function AdminLoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@manhattenschool.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/admin');
    } catch {
      setError('Invalid credentials');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-dark px-4">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-primary-dark mb-2">Admin Login</h1>
        <p className="text-sm text-neutral-medium mb-6">Manhattan Language School CMS</p>
        {error && <p className="text-accent text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label={t('auth.email')} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label={t('auth.password')} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit" className="w-full">{t('auth.loginBtn')}</Button>
        </form>
      </Card>
    </div>
  );
}
