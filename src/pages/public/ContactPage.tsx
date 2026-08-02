import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { cmsApi, contactApi } from '../../api';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { PageHeader } from '../../components/ui/Badge';
import { MapPin, Phone, Mail, Clock, CheckCircle2, ExternalLink } from 'lucide-react';
import { SeoHead } from '../../components/common/SeoHead';
import { SchoolMap } from '../../components/common/SchoolMap';

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
        title={t('contact.title')}
        description={t('contact.subtitle')}
      />
      <PageHeader title={t('contact.title')} subtitle={t('contact.subtitle')} />

      <div className="grid md:grid-cols-12 gap-10">
        {/* Info Column */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="md:col-span-5 space-y-6"
        >
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-md space-y-6">
            <h3 className="font-bold text-xl text-primary-dark dark:text-blue-400">
              {t('contact.getInTouch')}
            </h3>

            <div className="space-y-4">
              {/* Address */}
              <div className="flex gap-3.5 items-start">
                <div className="p-2.5 rounded-xl bg-primary-light dark:bg-slate-800 text-primary dark:text-blue-400 shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-neutral-dark dark:text-slate-100">
                    {t('contact.address')}
                  </div>
                  <a
                    href={config.google_maps_url || 'https://maps.app.goo.gl/aCF8oV9RvreCyaXu9'}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-neutral-medium dark:text-slate-400 hover:text-primary dark:hover:text-gold transition-colors mt-0.5 inline-block group"
                    title="فتح الموقع على خرائط جوجل"
                  >
                    <span>
                      {config.contact_address_ar || config.contact_address || 'مدرسة مانهاتن للغات، مدينة الشيخ زايد، محافظة الجيزة، مصر'}
                    </span>
                    <span className="ms-1.5 text-[10px] bg-primary-light dark:bg-slate-800 text-primary dark:text-gold px-1.5 py-0.5 rounded font-bold group-hover:bg-primary group-hover:text-white transition-all">
                      📍 Map
                    </span>
                  </a>
                </div>
              </div>

              {/* Phone Numbers */}
              <div className="flex gap-3.5 items-start">
                <div className="p-2.5 rounded-xl bg-primary-light dark:bg-slate-800 text-primary dark:text-blue-400 shrink-0">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-neutral-dark dark:text-slate-100">
                    {t('contact.phone')}
                  </div>
                  <div className="text-sm text-neutral-medium dark:text-slate-400 mt-0.5 space-y-1" dir="ltr">
                    {config.contact_phone && (
                      <div>
                        <a href={`tel:${config.contact_phone}`} className="hover:text-primary transition-colors font-medium">
                          {config.contact_phone}
                        </a>
                      </div>
                    )}
                    {config.contact_phone_secondary && (
                      <div>
                        <a href={`tel:${config.contact_phone_secondary}`} className="hover:text-primary transition-colors">
                          {config.contact_phone_secondary}
                        </a>
                      </div>
                    )}
                    {config.contact_phone_tertiary && (
                      <div>
                        <a href={`tel:${config.contact_phone_tertiary}`} className="hover:text-primary transition-colors text-xs text-slate-500">
                          {config.contact_phone_tertiary} ({t('contact.admissionsLabel')})
                        </a>
                      </div>
                    )}
                    {!config.contact_phone && !config.contact_phone_secondary && (
                      <div>+20 123 456 7890</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Emails */}
              <div className="flex gap-3.5 items-start">
                <div className="p-2.5 rounded-xl bg-primary-light dark:bg-slate-800 text-primary dark:text-blue-400 shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-neutral-dark dark:text-slate-100">
                    {t('contact.email')}
                  </div>
                  <div className="text-sm text-neutral-medium dark:text-slate-400 mt-0.5 space-y-0.5">
                    {config.contact_email && (
                      <div>
                        <a href={`mailto:${config.contact_email}`} className="hover:text-primary transition-colors font-medium">
                          {config.contact_email}
                        </a>
                      </div>
                    )}
                    {config.contact_email_secondary && (
                      <div>
                        <a href={`mailto:${config.contact_email_secondary}`} className="hover:text-primary transition-colors text-xs text-slate-500">
                          {config.contact_email_secondary} ({t('contact.admissionsEmail')})
                        </a>
                      </div>
                    )}
                    {!config.contact_email && <div>info@manhattanschool.edu.eg</div>}
                  </div>
                </div>
              </div>

              {/* Working Hours */}
              <div className="flex gap-3.5 items-start">
                <div className="p-2.5 rounded-xl bg-primary-light dark:bg-slate-800 text-primary dark:text-blue-400 shrink-0">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-neutral-dark dark:text-slate-100">
                    {t('contact.workingHours')}
                  </div>
                  <div className="text-sm text-neutral-medium dark:text-slate-400 mt-0.5">
                    {config.working_hours_ar || config.working_hours || t('footer.workingHoursValue')}
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links Banner */}
            <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
              <div className="font-semibold text-xs text-neutral-medium dark:text-slate-400 uppercase tracking-wider mb-3">
                {t('contact.socialTitle')}
              </div>
              <div className="flex flex-wrap gap-2">
                {config.social_facebook && (
                  <a
                    href={config.social_facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
                    title="Facebook"
                  >
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                    </svg>
                  </a>
                )}
                {config.social_instagram && (
                  <a
                    href={config.social_instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-pink-600 hover:bg-pink-600 hover:text-white transition-all"
                    title="Instagram"
                  >
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 2.156 4.919 5.406.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 5.234-4.919 5.419-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-2.199-4.919-5.42-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-5.234 4.919-5.419 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                )}
                {(config.social_whatsapp || config.contact_whatsapp) && (
                  <a
                    href={
                      config.social_whatsapp ||
                      `https://wa.me/${(config.contact_whatsapp || config.contact_phone || '').replace(/\D/g, '')}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all"
                    title="WhatsApp"
                  >
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                    </svg>
                  </a>
                )}
                {config.social_youtube && (
                  <a
                    href={config.social_youtube}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 hover:bg-red-600 hover:text-white transition-all"
                    title="YouTube"
                  >
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </a>
                )}
                {config.social_linkedin && (
                  <a
                    href={config.social_linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 hover:bg-blue-700 hover:text-white transition-all"
                    title="LinkedIn"
                  >
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Form Column */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="md:col-span-7 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-8 shadow-md"
        >
          {success ? (
            <div className="p-8 text-center space-y-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
              <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-300">{t('contact.success')}</h3>
              <p className="text-sm text-emerald-700 dark:text-emerald-400">{t('contact.successReply')}</p>
              <Button onClick={() => setSuccess(false)} variant="outline" className="mt-4">
                {t('contact.sendAnother')}
              </Button>
            </div>
          ) : (
            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                mutation.mutate();
              }}
            >
              <h3 className="font-bold text-xl text-neutral-dark dark:text-slate-100 mb-2">
                {t('contact.sendMessage')}
              </h3>
              <Input label={t('auth.fullName')} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
              <Input label={t('auth.email')} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              <Input label={t('contact.phone')} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <Input label={t('contact.subject')} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
              <Textarea label={t('contact.message')} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
              <Button type="submit" disabled={mutation.isPending} showArrow className="w-full justify-center py-3">
                {mutation.isPending ? t('common.loading') : t('common.submit')}
              </Button>
            </form>
          )}
        </motion.div>
      </div>

      {/* Full Width Location Map Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-12 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-neutral-dark dark:text-slate-100 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-amber-500" />
              <span>موقع المدرسة على الخريطة</span>
            </h3>
            <p className="text-xs text-neutral-medium dark:text-slate-400 mt-1">
              تفضل بزيارتنا في مقر المدرسة بمدينة الشيخ زايد - محافظة الجيزة
            </p>
          </div>
          <a
            href={config.google_maps_url || 'https://maps.app.goo.gl/aCF8oV9RvreCyaXu9'}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-dark transition-all shadow-sm"
          >
            <span>فتح في تطبيق الخرائط</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        <SchoolMap
          googleMapsUrl={config.google_maps_url}
          embedUrl={config.google_maps_embed_url}
          address={config.contact_address_ar || config.contact_address || 'مدرسة مانهاتن للغات، مدينة الشيخ زايد، محافظة الجيزة، مصر'}
          className="rounded-3xl border border-gray-100 dark:border-slate-800 shadow-lg min-h-[380px] h-[440px]"
        />
      </motion.div>
    </div>
  );
}
