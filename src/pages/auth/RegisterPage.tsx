import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../lib/auth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

export function RegisterPage() {
  const { t } = useTranslation();
  const { register, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await register(form.email, form.password, form.fullName);
      await login(form.email, form.password);
      navigate('/portal');
    } catch {
      setError('Registration failed. Email may already be in use.');
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12 bg-neutral-light">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-primary-dark mb-6">{t('auth.registerTitle')}</h1>
        {error && <p className="text-accent text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label={t('auth.fullName')} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
          <Input label={t('auth.email')} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label={t('auth.password')} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
          <Button type="submit" className="w-full">{t('auth.registerBtn')}</Button>
        </form>
        <p className="mt-4 text-sm text-center text-neutral-medium">
          {t('auth.hasAccount')} <Link to="/login" className="text-primary font-medium">{t('auth.loginBtn')}</Link>
        </p>
      </Card>
    </div>
  );
}
