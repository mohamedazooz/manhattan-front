import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { cmsApi, contactApi } from '../../api';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { PageHeader } from '../../components/ui/Badge';
import { MapPin, Phone, Mail } from 'lucide-react';
import { SeoHead } from '../../components/common/SeoHead';

export function ContactPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', subject: '', message: '' });
  const [success, setSuccess] = useState(false);

  const { data: config = {} } = useQuery({
    queryKey: ['cms-config'],
    queryFn: () => cmsApi.getConfig().then((r) => r.data),
  });

  const mutation = useMutation({
    mutationFn: () => contactApi.submit(form),
    onSuccess: () => {
      setSuccess(true);
      setForm({ fullName: '', email: '', phone: '', subject: '', message: '' });
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <SeoHead
        title="Contact Us"
        description="Get in touch with Manhattan Language School. Find our address, phone numbers, email, and location map."
      />
      <PageHeader title={t('contact.title')} subtitle="We'd love to hear from you" />
      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="flex gap-3 items-start">
            <MapPin className="h-5 w-5 text-primary mt-1" />
            <div>
              <div className="font-medium">Address</div>
              <div className="text-sm text-neutral-medium">{config.contact_address}</div>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <Phone className="h-5 w-5 text-primary mt-1" />
            <div>
              <div className="font-medium">Phone</div>
              <div className="text-sm text-neutral-medium">{config.contact_phone}</div>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <Mail className="h-5 w-5 text-primary mt-1" />
            <div>
              <div className="font-medium">Email</div>
              <div className="text-sm text-neutral-medium">{config.contact_email}</div>
            </div>
          </div>
          <div className="rounded-lg overflow-hidden h-64 bg-primary-light flex items-center justify-center text-neutral-medium">
            Sheikh Zayed, Giza, Egypt
          </div>
        </div>
        <div className="bg-neutral-light rounded-lg p-6">
          {success ? (
            <p className="text-green-700 font-medium">{t('contact.success')}</p>
          ) : (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                mutation.mutate();
              }}
            >
              <Input label={t('auth.fullName')} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
              <Input label={t('auth.email')} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              <Input label={t('contact.phone')} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <Input label={t('contact.subject')} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
              <Textarea label={t('contact.message')} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
              <Button type="submit" disabled={mutation.isPending}>{t('common.submit')}</Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
