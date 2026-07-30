import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Phone, Mail, Clock, Send, Check } from 'lucide-react';
import { cmsApi } from '../../api';
import { mediaUrl } from '../../lib/utils';

export function Footer() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const { data: config = {} } = useQuery({
    queryKey: ['cms-config'],
    queryFn: () => cmsApi.getConfig().then((r) => r.data),
  });

  const slogan = config.school_slogan || t('footer.description');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-200 border-t border-slate-800 mt-auto transition-colors duration-300">
      {/* Main Footer Body */}
      <div className="mx-auto max-w-7xl px-4 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand & Slogan Column */}
        <div className="lg:col-span-2 space-y-5">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={config.school_logo_url ? mediaUrl(config.school_logo_url) : '/logo.png'}
              alt="Manhattan Language School logo"
              className="h-12 w-auto object-contain"
            />
          </Link>

          <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
            {slogan}
          </p>

          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            {config.social_facebook && (
              <a
                href={config.social_facebook}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-full bg-slate-900 hover:bg-blue-600 text-slate-300 hover:text-white transition-colors"
                aria-label="Facebook"
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
                className="p-2.5 rounded-full bg-slate-900 hover:bg-pink-600 text-slate-300 hover:text-white transition-colors"
                aria-label="Instagram"
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
                className="p-2.5 rounded-full bg-slate-900 hover:bg-emerald-600 text-slate-300 hover:text-white transition-colors"
                aria-label="WhatsApp"
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
                className="p-2.5 rounded-full bg-slate-900 hover:bg-red-600 text-slate-300 hover:text-white transition-colors"
                aria-label="YouTube"
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
                className="p-2.5 rounded-full bg-slate-900 hover:bg-blue-600 text-slate-300 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            )}
            {config.social_tiktok && (
              <a
                href={config.social_tiktok}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-full bg-slate-900 hover:bg-neutral-700 text-slate-300 hover:text-white transition-colors"
                aria-label="TikTok"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.29-2.67.75-5.34 2.76-7.07 1.42-1.24 3.29-1.92 5.17-1.89.02 1.34.01 2.68.01 4.02-1.35-.04-2.72.45-3.63 1.41-.95.96-1.34 2.37-1.07 3.69.25 1.25 1.16 2.29 2.38 2.68 1.25.43 2.68.17 3.68-.66.86-.68 1.37-1.74 1.38-2.83.01-4.27.01-8.54.01-12.81z" />
                </svg>
              </a>
            )}
            {config.social_twitter && (
              <a
                href={config.social_twitter}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-full bg-slate-900 hover:bg-sky-500 text-slate-300 hover:text-white transition-colors"
                aria-label="X (Twitter)"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            )}
          </div>
        </div>

        {/* Quick Links Column */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400">
            {t('footer.quickLinks')}
          </h4>
          <ul className="space-y-2.5 text-sm text-slate-400">
            <li>
              <Link to="/" className="hover:text-white transition-colors">
                {t('nav.home')}
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-white transition-colors">
                {t('nav.about')}
              </Link>
            </li>
            <li>
              <Link to="/academics" className="hover:text-white transition-colors">
                {t('nav.academics')}
              </Link>
            </li>
            <li>
              <Link to="/admissions" className="hover:text-white transition-colors">
                {t('nav.admissions')}
              </Link>
            </li>
            <li>
              <Link to="/student-life" className="hover:text-white transition-colors">
                {t('nav.studentLife')}
              </Link>
            </li>
            <li>
              <Link to="/news" className="hover:text-white transition-colors">
                {t('nav.news')}
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-white transition-colors">
                {t('nav.contact')}
              </Link>
            </li>
          </ul>
        </div>

        {/* Parents & Policies Column */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400">
            {t('footer.parentsSection')}
          </h4>
          <ul className="space-y-2.5 text-sm text-slate-400">
            <li>
              <Link to="/portal/parent" className="hover:text-white transition-colors">
                {t('nav.portal')}
              </Link>
            </li>
            <li>
              <Link to="/parents/calendar" className="hover:text-white transition-colors">
                {t('footer.calendar')}
              </Link>
            </li>
            <li>
              <Link to="/parents/policies" className="hover:text-white transition-colors">
                {t('footer.policies')}
              </Link>
            </li>
            <li>
              <Link to="/parents/forms" className="hover:text-white transition-colors">
                {t('footer.forms')}
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Info & Newsletter Column */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400">
            {t('footer.contactUs')}
          </h4>
          <ul className="space-y-3 text-sm text-slate-400">
            <li className="flex items-start gap-2.5">
              <MapPin className="h-4 w-4 text-amber-400 shrink-0 mt-1" />
              <span>
                {config.contact_address_ar || config.contact_address || t('footer.address')}
              </span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 text-amber-400 shrink-0" />
              <span dir="ltr">
                {[config.contact_phone, config.contact_phone_secondary, config.contact_phone_tertiary]
                  .filter(Boolean)
                  .join(' / ') || '+20 123 456 7890'}
              </span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-amber-400 shrink-0" />
              <span>
                {[config.contact_email, config.contact_email_secondary].filter(Boolean).join(' / ') ||
                  'info@manhattanschool.edu.eg'}
              </span>
            </li>
            <li className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 text-amber-400 shrink-0" />
              <span>
                {config.working_hours_ar || config.working_hours || t('footer.workingHoursValue')}
              </span>
            </li>
          </ul>

          {/* Newsletter Form */}
          <div className="pt-2">
            <p className="text-xs font-semibold text-slate-200 mb-2">
              {t('footer.newsletterTitle')}
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-800">
                <Check className="h-4 w-4" />
                <span>{t('footer.subscribedSuccess')}</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('footer.emailPlaceholder')}
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors flex items-center justify-center shrink-0"
                  aria-label={t('footer.subscribe')}
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-900 py-6 bg-slate-950/80">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} {t('app.name')}. {t('footer.rights')}
          </div>
          <div className="flex gap-6">
            <Link to="/parents/policies" className="hover:text-slate-300">
              {t('footer.policies')}
            </Link>
            <Link to="/contact" className="hover:text-slate-300">
              {t('footer.contactUs')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
