import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { cmsApi } from '../../api';

export function Footer() {
  const { t } = useTranslation();
  const { data: config = {} } = useQuery({
    queryKey: ['cms-config'],
    queryFn: () => cmsApi.getConfig().then((r) => r.data),
  });

  const slogan = config.school_slogan || 'Empowering Minds, Building Futures.';

  return (
    <footer className="bg-primary-dark text-white mt-auto">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-primary font-bold text-lg mb-4">
            MS
          </div>
          <p className="text-sm text-white/80 mb-4">{slogan}</p>
          <div className="flex gap-3 text-sm">
            {config.social_facebook && <a href={config.social_facebook} target="_blank" rel="noreferrer" className="hover:text-gold">FB</a>}
            {config.social_instagram && <a href={config.social_instagram} target="_blank" rel="noreferrer" className="hover:text-gold">IG</a>}
            {config.social_youtube && <a href={config.social_youtube} target="_blank" rel="noreferrer" className="hover:text-gold">YT</a>}
            {config.social_linkedin && <a href={config.social_linkedin} target="_blank" rel="noreferrer" className="hover:text-gold">LI</a>}
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-4">{t('footer.quickLinks')}</h4>
          <ul className="space-y-2 text-sm text-white/80">
            <li><Link to="/" className="hover:text-white">{t('nav.home')}</Link></li>
            <li><Link to="/about" className="hover:text-white">{t('nav.about')}</Link></li>
            <li><Link to="/academics" className="hover:text-white">{t('nav.academics')}</Link></li>
            <li><Link to="/admissions" className="hover:text-white">{t('nav.admissions')}</Link></li>
            <li><Link to="/student-life" className="hover:text-white">{t('nav.studentLife')}</Link></li>
            <li><Link to="/contact" className="hover:text-white">{t('nav.contact')}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4">{t('footer.parentsSection')}</h4>
          <ul className="space-y-2 text-sm text-white/80">
            <li><Link to="/portal" className="hover:text-white">{t('nav.portal')}</Link></li>
            <li><Link to="/parents/calendar" className="hover:text-white">{t('footer.calendar')}</Link></li>
            <li><Link to="/parents/policies" className="hover:text-white">{t('footer.policies')}</Link></li>
            <li><Link to="/parents/forms" className="hover:text-white">{t('footer.forms')}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4">{t('footer.contactUs')}</h4>
          <ul className="space-y-2 text-sm text-white/80">
            <li>{config.contact_address}</li>
            <li>{config.contact_phone}</li>
            <li>{config.contact_email}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/60">
        © {new Date().getFullYear()} Manhattan Language School. All rights reserved.
      </div>
    </footer>
  );
}
