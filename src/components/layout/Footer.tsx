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
    <footer className="bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-300 border-t border-slate-800/80 mt-auto transition-colors duration-300">
      {/* Sleek Compact Footer Body */}
      <div className="mx-auto max-w-7xl px-4 py-8 md:py-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
        
        {/* Brand & Socials Column (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <img
              src={config.school_logo_url ? mediaUrl(config.school_logo_url) : '/logo.png'}
              alt="Manhattan Language School logo"
              className="h-10 sm:h-11 w-auto object-contain transition-transform group-hover:scale-105 duration-200"
            />
          </Link>

          <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
            {slogan}
          </p>

          {/* Social Icons - Sleek Compact Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {config.social_facebook && (
              <a
                href={config.social_facebook}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-slate-900/90 hover:bg-blue-600/90 text-slate-400 hover:text-white border border-slate-800 hover:border-blue-500 transition-all duration-200"
                aria-label="Facebook"
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
            )}
            {config.social_instagram && (
              <a
                href={config.social_instagram}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-slate-900/90 hover:bg-pink-600/90 text-slate-400 hover:text-white border border-slate-800 hover:border-pink-500 transition-all duration-200"
                aria-label="Instagram"
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
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
                className="p-2 rounded-lg bg-slate-900/90 hover:bg-emerald-600/90 text-slate-400 hover:text-white border border-slate-800 hover:border-emerald-500 transition-all duration-200"
                aria-label="WhatsApp"
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
              </a>
            )}
            {config.social_youtube && (
              <a
                href={config.social_youtube}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-slate-900/90 hover:bg-red-600/90 text-slate-400 hover:text-white border border-slate-800 hover:border-red-500 transition-all duration-200"
                aria-label="YouTube"
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            )}
            {config.social_linkedin && (
              <a
                href={config.social_linkedin}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-slate-900/90 hover:bg-blue-600/90 text-slate-400 hover:text-white border border-slate-800 hover:border-blue-500 transition-all duration-200"
                aria-label="LinkedIn"
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            )}
          </div>
        </div>

        {/* Quick Nav Links (2 Cols) */}
        <div className="lg:col-span-2 space-y-3">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
            {t('footer.quickLinks')}
          </h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>
              <Link to="/" className="hover:text-white transition-colors duration-150">
                {t('nav.home')}
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-white transition-colors duration-150">
                {t('nav.about')}
              </Link>
            </li>
            <li>
              <Link to="/academics" className="hover:text-white transition-colors duration-150">
                {t('nav.academics')}
              </Link>
            </li>
            <li>
              <Link to="/admissions" className="hover:text-white transition-colors duration-150">
                {t('nav.admissions')}
              </Link>
            </li>
            <li>
              <Link to="/student-life" className="hover:text-white transition-colors duration-150">
                {t('nav.studentLife')}
              </Link>
            </li>
            <li>
              <Link to="/news" className="hover:text-white transition-colors duration-150">
                {t('nav.news')}
              </Link>
            </li>
          </ul>
        </div>

        {/* Parents & Documents Portal (3 Cols) */}
        <div className="lg:col-span-3 space-y-3">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
            {t('footer.parentsSection')}
          </h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>
              <Link to="/portal/parent" className="hover:text-white transition-colors duration-150">
                {t('nav.portal')}
              </Link>
            </li>
            <li>
              <Link to="/parents/policies" className="hover:text-white transition-colors duration-150">
                {t('footer.policies')}
              </Link>
            </li>
            <li>
              <Link to="/careers" className="hover:text-white transition-colors duration-150">
                {t('nav.careers', 'الوظائف المتاحة')}
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-white transition-colors duration-150">
                {t('nav.contact')}
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Info & Newsletter (3 Cols) */}
        <div className="lg:col-span-3 space-y-3">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
            {t('footer.contactUs')}
          </h4>

          <ul className="space-y-2 text-xs text-slate-400">
            <li className="flex items-start gap-2">
              <MapPin className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span className="line-clamp-2">
                {config.contact_address_ar || config.contact_address || t('footer.address')}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span dir="ltr" className="text-slate-300">
                {[config.contact_phone, config.contact_phone_secondary].filter(Boolean).join(' / ') || '+20 123 456 7890'}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span className="text-slate-300">
                {config.contact_email || 'info@manhattanschool.edu.eg'}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span>
                {config.working_hours_ar || config.working_hours || t('footer.workingHoursValue')}
              </span>
            </li>
          </ul>

          {/* Newsletter Form */}
          <div className="pt-2">
            <p className="text-[11px] font-semibold text-slate-300 mb-1.5">
              {t('footer.newsletterTitle')}
            </p>
            {subscribed ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 p-2 rounded-lg border border-emerald-800/80">
                <Check className="h-3.5 w-3.5" />
                <span>{t('footer.subscribedSuccess')}</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-1.5">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('footer.emailPlaceholder')}
                  required
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors flex items-center justify-center shrink-0"
                  aria-label={t('footer.subscribe')}
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

      </div>

      {/* Sleek Bottom Bar */}
      <div className="border-t border-slate-900/90 py-4 bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} {t('app.name')}. {t('footer.rights')}
          </div>
          <div className="flex gap-4">
            <Link to="/parents/policies" className="hover:text-slate-300 transition-colors">
              {t('footer.policies')}
            </Link>
            <Link to="/contact" className="hover:text-slate-300 transition-colors">
              {t('footer.contactUs')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
