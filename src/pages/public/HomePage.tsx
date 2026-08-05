import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  BookOpen,
  GraduationCap,
  Shield,
  Star,
  Users,
  Calendar,
  ArrowRight,
  Megaphone,
  Target,
  HeartHandshake,
  Phone,
  Mail,
  Sparkles,
  Quote,
} from 'lucide-react';
import { landingApi, blogApi, educationApi, requirementsApi, cmsApi } from '../../api';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/Badge';
import { getBilingualText, mediaUrl } from '../../lib/utils';
import { useAppLanguage } from '../../i18n';
import { SeoHead } from '../../components/common/SeoHead';
import { Link, useNavigate } from 'react-router-dom';
import { HeroSlideshow } from '../../components/home/HeroSlideshow';
import { PhotoGallery } from '../../components/home/PhotoGallery';
import { SchoolMap } from '../../components/common/SchoolMap';
import { useAuth } from '../../lib/auth';

const trustIcons = [
  { key: 'bilingual', icon: BookOpen, count: '100% Dual Curriculum' },
  { key: 'classrooms', icon: GraduationCap, count: 'Smart Classrooms' },
  { key: 'safe', icon: Shield, count: 'Safe Campus' },
  { key: 'teachers', icon: Users, count: 'Top Educators' },
  { key: 'future', icon: Star, count: 'Future Leaders' },
];

interface Announcement {
  title: string;
  body?: string;
  date?: string;
}

function parseAnnouncements(value?: string): Announcement[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as Announcement[];
    return Array.isArray(parsed) ? parsed.filter((item) => item.title) : [];
  } catch {
    return [];
  }
}

export function HomePage() {
  const { t } = useTranslation();
  const lang = useAppLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: landingData, isLoading: isLandingLoading } = useQuery({
    queryKey: ['landing', lang],
    queryFn: () => landingApi.get(lang).then((r) => r.data),
  });

  const { data: latestPosts = [] } = useQuery({
    queryKey: ['latest-posts', lang],
    queryFn: () => blogApi.list(lang).then((r) => r.data.slice(0, 3)),
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['home-programs', lang],
    queryFn: () => educationApi.list(lang).then((r) => r.data.slice(0, 4)),
  });

  const { data: requirements = [] } = useQuery({
    queryKey: ['home-requirements'],
    queryFn: () => requirementsApi.list(false).then((r) => (Array.isArray(r.data) ? r.data : [])),
  });

  const { data: config = {} } = useQuery({
    queryKey: ['cms-config'],
    queryFn: () => cmsApi.getConfig().then((r) => r.data),
  });

  const [selectedGrade, setSelectedGrade] = useState<string>('');

  const handleStudentApply = () => {
    if (user && user.role === 'PARENT') {
      navigate('/portal/parent/admissions/new');
    } else if (user) {
      navigate('/portal/parent/admissions/new');
    } else {
      navigate('/register/parent?redirect=/portal/parent/admissions/new');
    }
  };

  const handleTeacherApply = () => {
    if (user && user.role === 'APPLICANT') {
      navigate('/careers');
    } else if (user) {
      navigate('/careers');
    } else {
      navigate('/register/applicant?redirect=/careers');
    }
  };

  if (isLandingLoading) return <LoadingSpinner />;

  const hero = landingData?.hero;
  const sections = landingData?.sections || [];

  const isSectionPublished = (key: string) => sections.some((s) => s.key === key);

  const trustBarSection = isSectionPublished('trust-bar');
  const pathwaysSection = isSectionPublished('pathways-hub');
  const chairmanSection = sections.find((s) => s.key === 'quote-chairman');
  const philosophySection = sections.find((s) => s.key === 'educational-philosophy' || s.key === 'about-preview');
  const visionSection = sections.find((s) => s.key === 'vision');
  const missionSection = sections.find((s) => s.key === 'mission');
  const coreValuesSection = isSectionPublished('core-values');
  const academicsSection = isSectionPublished('academics-card');
  const requirementsSection = isSectionPublished('requirements-widget');
  const newsFeedSection = isSectionPublished('achievements-card') || isSectionPublished('news-feed');
  const contactSection = isSectionPublished('contact-section');
  const announcements = parseAnnouncements(landingData?.announcements);

  const currentReq = requirements.find((r: { gradeLevel: string }) => r.gradeLevel === selectedGrade);

  return (
    <>
      <SeoHead
        title={hero?.title || t('app.name')}
        description={hero?.subtitle || t('footer.description')}
        ogImage={hero?.imageUrl ? mediaUrl(hero.imageUrl) : undefined}
      />

      {/* Hero Section with Dynamic Slideshow */}
      {hero && <HeroSlideshow cmsHero={hero} />}

      {/* Interactive Trust Bar */}
      {trustBarSection && (
        <section className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 py-8 shadow-xs relative z-10 transition-colors">
        <div className="mx-auto max-w-7xl px-4 grid grid-cols-2 md:grid-cols-5 gap-6">
          {trustIcons.map(({ key, icon: Icon, count }, idx) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="flex flex-col items-center text-center p-3 rounded-xl hover:bg-primary-light/50 dark:hover:bg-slate-800 transition-colors group cursor-pointer"
            >
              <div className="p-3 bg-primary-light dark:bg-slate-800 text-primary dark:text-blue-400 rounded-xl group-hover:scale-110 transition-transform mb-2">
                <Icon className="h-6 w-6" />
              </div>
              <span className="text-sm font-semibold text-neutral-dark dark:text-slate-100">{t(`trust.${key}`)}</span>
              <span className="text-[11px] text-neutral-medium dark:text-slate-400">{count}</span>
            </motion.div>
          ))}
        </div>
      </section>
      )}

      {/* Applicant Pathways Hub (Students & Teachers) */}
      {pathwaysSection && (
        <section className="py-16 bg-primary text-white border-b border-primary-dark relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 grid md:grid-cols-2 gap-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group relative rounded-3xl p-8 bg-white/10 border border-white/20 shadow-2xl hover:border-gold/60 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <GraduationCap className="h-40 w-40 text-gold" />
              </div>
              <div>
                <span className="inline-block px-3.5 py-1 rounded-full bg-gold/20 text-gold text-xs font-bold uppercase tracking-wider mb-4 border border-gold/40">
                  {t('applicantFlows.studentTitle', 'تقديم طلب التحاق طالب جديد')}
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
                  {t('applicantFlows.studentTitle', 'تقديم طلب التحاق طالب جديد')}
                </h3>
                <p className="text-white/80 text-sm leading-relaxed mb-6">
                  {t('applicantFlows.studentSubtitle', 'منظومة قبول إلكترونية سهلة ومباشرة للانضمام لعائلة مدرسة منهاتن للغات')}
                </p>
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleStudentApply}
                  variant="gold"
                  showArrow
                  className="py-3.5 px-8 text-sm font-bold shadow-lg justify-center"
                >
                  {t('portal.parent.btn', 'بوابة ولي الأمر')}
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="group relative rounded-3xl p-8 bg-white/10 border border-white/20 shadow-2xl hover:border-emerald-400/60 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Users className="h-40 w-40 text-emerald-400" />
              </div>
              <div>
                <span className="inline-block px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-400/40">
                  {t('applicantFlows.teacherTitle', 'التقديم على وظيفة معلم / كادر تعليمي')}
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
                  {t('applicantFlows.teacherTitle', 'التقديم على وظيفة معلم / كادر تعليمي')}
                </h3>
                <p className="text-white/80 text-sm leading-relaxed mb-6">
                  {t('applicantFlows.teacherSubtitle', 'انضم لنخبة المعلمين في مدرسة مانهاتن للغات (رياض الأطفال والابتدائي والإعدادي)')}
                </p>
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleTeacherApply}
                  variant="secondary"
                  showArrow
                  className="py-3.5 px-8 text-sm font-bold shadow-lg justify-center bg-emerald-600 hover:bg-emerald-700 text-white border-none"
                >
                  {t('portal.applicant.btn', 'بوابة المتقدمين للوظائف')}
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Chairman Inspiring Quote Banner */}
      {chairmanSection && (
        <section className="py-20 bg-gradient-to-br from-slate-950 via-primary-dark to-slate-900 text-white relative overflow-hidden border-y border-white/10">
          {/* Subtle radial glow behind the content */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(212,175,55,0.08) 0%, transparent 70%)',
            }}
          />

          <div className="mx-auto max-w-4xl px-4 relative z-10 space-y-8">
            {/* Header Badge */}
            <div className="flex items-center justify-center gap-3">
              <span className="h-px w-12 bg-gradient-to-r from-transparent to-gold/60" />
              <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-gold/10 text-gold border border-gold/30 tracking-wider uppercase flex items-center gap-2 shadow-xs backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5" />
                {t('quotes.directorMessage', lang === 'ar' ? 'رسالة إدارة المدرسة' : "School Director's Message")}
              </span>
              <span className="h-px w-12 bg-gradient-to-l from-transparent to-gold/60" />
            </div>

            {/* Letter / Message Card */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative bg-slate-900/70 border border-gold/20 rounded-3xl p-8 sm:p-12 shadow-2xl backdrop-blur-md space-y-8"
            >
              {/* Decorative top quote mark */}
              <div className="flex items-center justify-start text-gold/30">
                <Quote className="w-10 h-10 rotate-180" />
              </div>

              {/* Message Content */}
              <blockquote className="text-xl sm:text-2xl md:text-3xl font-semibold leading-relaxed text-slate-100 italic">
                {(lang === 'ar' ? chairmanSection.contentAr : chairmanSection.content) ||
                  t(
                    'quotes.chairman',
                    lang === 'ar'
                      ? 'هدفنا هو ربط النقاط لتنمية العقول، والتي تتيح لكل طفل أن ينمو ليصبح بالغاً فخوراً بذاته وقادراً على اتخاذ القرار.'
                      : 'Our goal is to connect the dots to nurture minds, allowing every child to grow into a proud, confident adult.',
                  )}
              </blockquote>

              {/* End of Message Divider & Signature Block */}
              <div className="pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4">
                {/* School Name Label */}
                <div className="text-start space-y-1">
                  <span className="text-xs font-bold text-gold/90 tracking-widest uppercase block">
                    {(lang === 'ar' ? chairmanSection.titleAr : chairmanSection.title) ||
                      t('app.name')}
                  </span>
                  <p className="text-[11px] text-slate-400">
                    {t('quotes.schoolSubName', lang === 'ar' ? 'مدرسة منهاتن للغات' : 'Manhattan Language School')}
                  </p>
                </div>

                {/* Signature */}
                <div className="text-center sm:text-end space-y-0.5">
                  <div className="text-[11px] text-slate-400 font-medium">
                    {t('quotes.regards', lang === 'ar' ? 'مع خالص التحية والتقدير،' : 'With warm regards,')}
                  </div>

                  <p className="text-base sm:text-lg font-semibold text-gold">
                    {t('quotes.directorName', lang === 'ar' ? 'إبراهيم عزوز' : 'Ibrahim Azzouz')}
                  </p>

                  <p className="text-[11px] font-medium text-slate-300 tracking-wide">
                    {t('quotes.directorRole', lang === 'ar' ? 'رئيس مجلس الإدارة ومدير المدرسة' : 'Chairman & School Director')}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Educational Philosophy & Excellence */}
      {philosophySection && (
        <section className="py-20 bg-white dark:bg-slate-950 transition-colors">
          <div className="mx-auto max-w-7xl px-4 grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-5"
            >
              <span className="text-xs font-bold uppercase tracking-wider text-accent bg-accent-soft dark:bg-red-950/60 dark:text-red-300 px-3.5 py-1.5 rounded-full border border-accent/20">
                {t('philosophy.badge', 'Educational Philosophy')}
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-primary-dark dark:text-slate-100">
                {(lang === 'ar' ? philosophySection.titleAr : philosophySection.title) || t('philosophy.title', 'Academics & Educational Excellence')}
              </h2>
              <p className="text-neutral-medium dark:text-slate-300 leading-relaxed text-sm sm:text-base">
                {(lang === 'ar' ? philosophySection.contentAr : philosophySection.content) || t('philosophy.p1')}
              </p>
              <p className="text-neutral-medium dark:text-slate-300 leading-relaxed text-sm sm:text-base font-medium text-primary dark:text-blue-400">
                {t('philosophy.p2')}
              </p>
              <p className="text-neutral-medium dark:text-slate-300 leading-relaxed text-sm sm:text-base">
                {t('philosophy.p3')}
              </p>
              <div className="pt-2">
                <Button to="/about" variant="primary" showArrow>
                  {t('common.readMore')}
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-slate-800"
            >
              <img
                src={mediaUrl(philosophySection.imageUrl || '/photos/photo6.jpeg')}
                alt="Educational Excellence"
                className="w-full h-full object-cover max-h-[420px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-8">
                <div className="text-white space-y-1">
                  <span className="text-xs font-bold text-gold uppercase tracking-widest">{t('app.name')}</span>
                  <p className="text-sm font-semibold text-slate-200">{t('quotes.teachers')}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Foundation: Vision & Mission + Core Values */}
      {(visionSection || missionSection || coreValuesSection) && (
        <section className="py-20 bg-slate-900 text-white relative overflow-hidden transition-colors">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="mx-auto max-w-7xl px-4 relative z-10">
            {(visionSection || missionSection) && (
              <>
                <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3.5 py-1.5 rounded-full">
                    {t('foundation.badge', 'MLS Foundation')}
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                    {t('foundation.title', 'Vision & Mission')}
                  </h2>
                  <p className="text-slate-300 font-light">
                    {t('foundation.subtitle', 'Clear commitments guide every family touchpoint, from admissions to classroom learning.')}
                  </p>
                </div>
                <div className="grid lg:grid-cols-2 gap-8">
                  {visionSection && (
                    <motion.article
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="rounded-3xl border border-white/10 bg-slate-950/80 p-8 sm:p-10 shadow-2xl backdrop-blur-md hover:border-amber-400/40 transition-all duration-300 group"
                    >
                      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-lg group-hover:scale-110 transition-transform">
                        <Target className="h-7 w-7" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-4">
                        {(lang === 'ar' ? visionSection.titleAr : visionSection.title) || t('foundation.visionTitle', 'Our Vision')}
                      </h3>
                      <p className="text-slate-300 leading-relaxed text-base font-light">
                        {(lang === 'ar' ? visionSection.contentAr : visionSection.content) || t('foundation.visionDefault')}
                      </p>
                    </motion.article>
                  )}

                  {missionSection && (
                    <motion.article
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 }}
                      className="rounded-3xl border border-white/10 bg-slate-950/80 p-8 sm:p-10 shadow-2xl backdrop-blur-md hover:border-blue-400/40 transition-all duration-300 group"
                    >
                      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg group-hover:scale-110 transition-transform">
                        <HeartHandshake className="h-7 w-7" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-4">
                        {(lang === 'ar' ? missionSection.titleAr : missionSection.title) || t('foundation.missionTitle', 'Our Mission')}
                      </h3>
                      <p className="text-slate-300 leading-relaxed text-base font-light">
                        {(lang === 'ar' ? missionSection.contentAr : missionSection.content) || t('foundation.missionDefault')}
                      </p>
                    </motion.article>
                  )}
                </div>
              </>
            )}

            {/* Core Values 5 Cards */}
            {coreValuesSection && (
              <div className="mt-16 pt-12 border-t border-white/10">
                <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full">
                    {t('coreValues.badge', 'Our Core Values')}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white">{t('coreValues.title', 'What Defines Manhattan Language School')}</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-gold/50 transition-all space-y-2">
                    <div className="text-2xl text-gold">💡</div>
                    <h4 className="font-bold text-white text-base">{t('coreValues.genius.title')}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{t('coreValues.genius.desc')}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-300/50 transition-all space-y-2">
                    <div className="text-2xl text-amber-300">🛡️</div>
                    <h4 className="font-bold text-white text-base">{t('coreValues.confidence.title')}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{t('coreValues.confidence.desc')}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-400/50 transition-all space-y-2">
                    <div className="text-2xl text-emerald-400">🌱</div>
                    <h4 className="font-bold text-white text-base">{t('coreValues.resilience.title')}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{t('coreValues.resilience.desc')}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-300/50 transition-all space-y-2">
                    <div className="text-2xl text-cyan-300">🤝</div>
                    <h4 className="font-bold text-white text-base">{t('coreValues.empathy.title')}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{t('coreValues.empathy.desc')}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-300/50 transition-all sm:col-span-2 lg:col-span-1 space-y-2">
                    <div className="text-2xl text-purple-300">🔥</div>
                    <h4 className="font-bold text-white text-base">{t('coreValues.passion.title')}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{t('coreValues.passion.desc')}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Announcements */}
      {announcements.length > 0 && (
        <section className="py-16 bg-neutral-light/80 dark:bg-slate-900/80 transition-colors">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
              <div>
                <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent bg-accent-soft dark:bg-red-950/60 dark:text-red-300 px-3 py-1 rounded-full">
                  <Megaphone className="h-3.5 w-3.5" />
                  {t('announcements.badge', 'Announcements')}
                </span>
                <h2 className="text-3xl font-bold text-primary-dark dark:text-slate-100 mt-2">
                  {t('announcements.title', 'Latest MLS Updates')}
                </h2>
              </div>
              <Button to="/contact" variant="outline" showArrow>
                {t('announcements.contactBtn', 'Contact us')}
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {announcements.map((item) => (
                <article key={`${item.title}-${item.date || ''}`} className="rounded-2xl bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-800 p-6 shadow-sm">
                  {item.date && (
                    <div className="mb-3 flex items-center gap-2 text-xs text-neutral-medium dark:text-slate-400">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>{new Date(item.date).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}</span>
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-primary-dark dark:text-slate-100">
                    {getBilingualText(item, 'title', lang)}
                  </h3>
                  {getBilingualText(item, 'body', lang) && (
                    <p className="mt-2 text-sm text-neutral-medium dark:text-slate-300 leading-relaxed">
                      {getBilingualText(item, 'body', lang)}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Educational Programs Showcase */}
      {academicsSection && programs.length > 0 && (
        <section className="py-20 bg-white dark:bg-slate-950 transition-colors">
          <div className="mx-auto max-w-7xl px-4">
            <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-accent bg-accent-soft dark:bg-red-950/60 dark:text-red-300 px-3 py-1 rounded-full">
                {t('programs.badge', 'Our Programs')}
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-primary-dark dark:text-slate-100">{t('programs.title', 'Educational Programs')}</h2>
              <p className="text-neutral-medium dark:text-slate-400">{t('programs.subtitle', 'Tailored educational stages designed to build confidence, knowledge, and leadership.')}</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {programs.map((prog, idx) => (
                <motion.div
                  key={prog.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="glass-card rounded-2xl p-6 flex flex-col justify-between space-y-4"
                >
                  <div>
                    <span className="text-xs font-bold text-primary dark:text-blue-400 bg-primary-light dark:bg-slate-800 px-2.5 py-1 rounded-md">
                      {prog.level}
                    </span>
                    <h3 className="text-xl font-bold text-neutral-dark dark:text-slate-100 mt-3">{prog.title}</h3>
                    <p className="text-sm text-neutral-medium dark:text-slate-400 line-clamp-3 mt-2">{prog.summary || prog.content}</p>
                  </div>
                  <Link
                    to={`/academics/${prog.slug}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-primary dark:text-blue-400 hover:text-primary-dark group"
                  >
                    <span>{t('hero.discover', 'DISCOVER MORE')}</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Interactive Admission Requirements Checker Widget */}
      {requirementsSection && requirements.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-primary-dark via-slate-900 to-primary text-white">
          <div className="mx-auto max-w-7xl px-4 grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300 bg-amber-400/10 border border-amber-400/30 px-3 py-1 rounded-full">
                {t('requirementsWidget.badge', 'Admissions')}
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold">{t('requirementsWidget.title', 'Check Admission Requirements by Grade')}</h2>
              <p className="text-slate-200">{t('requirementsWidget.subtitle', "Select your child's targeted grade level to instantly view age criteria and required application documents.")}</p>
            </div>

            <div className="lg:col-span-7 bg-white dark:bg-slate-900 text-neutral-dark dark:text-slate-100 p-6 sm:p-8 rounded-2xl shadow-2xl space-y-4 border border-gray-200 dark:border-slate-800">
              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-dark dark:text-slate-200">{t('requirementsWidget.selectLabel', 'Select Grade Level')}</label>
                <select
                  className="w-full border rounded-xl p-3 text-sm bg-neutral-light dark:bg-slate-800 border-gray-300 dark:border-slate-700 font-medium focus:ring-2 focus:ring-primary dark:text-slate-100"
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                >
                  <option value="">{t('requirementsWidget.choosePlaceholder', '-- Choose Grade Level --')}</option>
                  {requirements.map((r: { id: string; gradeLevel: string; title: string; titleAr?: string }) => (
                    <option key={r.id} value={r.gradeLevel}>
                      {String(t(`grades.${r.gradeLevel}`, r.gradeLevel))} — {getBilingualText(r, 'title', lang)}
                    </option>
                  ))}
                </select>
              </div>

              {currentReq ? (
                <div className="p-4 bg-primary-light/40 dark:bg-slate-800/80 rounded-xl space-y-3 border border-primary/20 animate-fade-in">
                  <h4 className="font-bold text-primary-dark dark:text-blue-400">
                    {getBilingualText(currentReq, 'title', lang)}
                  </h4>
                  {(getBilingualText(currentReq, 'description', lang)) && (
                    <p className="text-xs text-neutral-medium dark:text-slate-400">
                      {getBilingualText(currentReq, 'description', lang)}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-4 text-xs font-semibold text-neutral-dark dark:text-slate-200">
                    {currentReq.minAge && <div>{t('requirementsWidget.minAge', 'Min Age:')} <span className="text-primary dark:text-blue-400">{currentReq.minAge} {t('requirementsWidget.years', 'yrs')}</span></div>}
                    {currentReq.maxAge && <div>{t('requirementsWidget.maxAge', 'Max Age:')} <span className="text-primary dark:text-blue-400">{currentReq.maxAge} {t('requirementsWidget.years', 'yrs')}</span></div>}
                  </div>
                  {currentReq.requiredDocumentTypes?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-neutral-dark dark:text-slate-200 mb-1">{t('requirementsWidget.requiredDocs', 'Required Documents:')}</p>
                      <div className="flex flex-wrap gap-1">
                        {currentReq.requiredDocumentTypes.map((doc: string) => (
                          <span key={doc} className="text-[11px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-neutral-dark dark:text-slate-300 px-2 py-0.5 rounded shadow-xs font-semibold">
                            📄 {doc.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="pt-2">
                    <Button onClick={handleStudentApply} variant="primary" showArrow className="w-full justify-center">
                      {t('portal.parent.title', 'بوابة ولي الأمر والتقديم الإلكتروني')}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-neutral-medium dark:text-slate-400 italic">{t('requirementsWidget.prompt', 'Please select a grade level above to view requirements.')}</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Latest Blog & News Feed Preview */}
      {newsFeedSection && latestPosts.length > 0 && (
        <section className="py-20 bg-neutral-light/80 dark:bg-slate-900/80 transition-colors">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary dark:text-blue-400 bg-primary-light dark:bg-slate-800 px-3 py-1 rounded-full">
                  {t('newsFeed.badge', 'School News')}
                </span>
                <h2 className="text-3xl font-bold text-primary-dark dark:text-slate-100 mt-2">{t('newsFeed.title', 'Latest News & Blog Posts')}</h2>
              </div>
              <Button to="/news" variant="outline" showArrow>
                {t('common.readMore')}
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {latestPosts.map((post, idx) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between"
                >
                  {post.coverImageUrl && (
                    <img
                      src={mediaUrl(post.coverImageUrl)}
                      alt={post.title}
                      className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-neutral-medium dark:text-slate-400 mb-2">
                        <Calendar className="h-3.5 w-3.5 text-primary dark:text-blue-400" />
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        {post.category && (
                          <span className="bg-primary-light dark:bg-slate-800 text-primary dark:text-blue-400 font-medium px-2 py-0.5 rounded text-[10px]">
                            {post.category.name}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-neutral-dark dark:text-slate-100 line-clamp-2">{post.title}</h3>
                      <p className="text-xs text-neutral-medium dark:text-slate-400 line-clamp-3 mt-2">{post.content}</p>
                    </div>

                    <Link
                      to={`/news/${post.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary dark:text-blue-400 hover:underline pt-2"
                    >
                      {t('common.readMore')} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Photo Gallery Showcase */}
      {isSectionPublished('student-life-card') && <PhotoGallery />}

      {/* Contact Us */}
      {contactSection && (
        <section className="py-20 bg-white dark:bg-slate-950 transition-colors">
          <div className="mx-auto max-w-7xl px-4">
            <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-blue-700 text-white shadow-2xl">
              <div className="grid lg:grid-cols-2">
                <div className="p-8 sm:p-12 space-y-5">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-200 bg-white/10 px-3 py-1 rounded-full">
                    {t('contactSection.badge', 'Contact MLS')}
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-bold">{t('contactSection.title', 'Speak with Manhattan Languages School')}</h2>
                  <p className="text-blue-50 leading-relaxed">
                    {t('contactSection.subtitle', 'Admissions and school information are one step away. Reach out by phone, email, or Facebook.')}
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3 pt-2">
                    <a href={`tel:${config.contact_phone || ''}`} className="rounded-2xl bg-white/10 p-4 hover:bg-white/15 transition-colors">
                      <Phone className="h-5 w-5 text-amber-200 mb-2" />
                      <div className="text-xs text-blue-100">{t('contactSection.phone', 'الهاتف الرئيسي')}</div>
                      <div className="font-semibold" dir="ltr">{config.contact_phone || '+201120714411'}</div>
                    </a>
                    <a href={`tel:${config.contact_phone_secondary || ''}`} className="rounded-2xl bg-white/10 p-4 hover:bg-white/15 transition-colors">
                      <Phone className="h-5 w-5 text-amber-200 mb-2" />
                      <div className="text-xs text-blue-100">{t('contactSection.phone2', 'هاتف ثاني')}</div>
                      <div className="font-semibold" dir="ltr">{config.contact_phone_secondary || '+201143992505'}</div>
                    </a>
                    {config.contact_phone_tertiary && (
                      <a href={`tel:${config.contact_phone_tertiary}`} className="rounded-2xl bg-white/10 p-4 hover:bg-white/15 transition-colors">
                        <Phone className="h-5 w-5 text-amber-200 mb-2" />
                        <div className="text-xs text-blue-100">هاتف القبول</div>
                        <div className="font-semibold" dir="ltr">{config.contact_phone_tertiary}</div>
                      </a>
                    )}
                    <a href={`mailto:${config.contact_email || ''}`} className={`rounded-2xl bg-white/10 p-4 hover:bg-white/15 transition-colors ${config.contact_phone_tertiary ? '' : 'sm:col-span-2'}`}>
                      <Mail className="h-5 w-5 text-amber-200 mb-2" />
                      <div className="text-xs text-blue-100">{t('contactSection.email', 'البريد الإلكتروني')}</div>
                      <div className="font-semibold break-all">{config.contact_email || 'MANHATTNSCHOOL4@GMAIL.COM'}</div>
                    </a>
                  </div>
                  <div className="flex flex-wrap gap-2.5 pt-2">
                    <Button to="/contact" variant="secondary" showArrow>
                      {t('contactSection.sendMessage', 'تواصل معنا')}
                    </Button>

                    {config.social_facebook && (
                      <a
                        href={config.social_facebook}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-3.5 py-2 text-xs font-semibold hover:bg-white/10 transition-colors"
                      >
                        <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                        </svg>
                        Facebook
                      </a>
                    )}
                    {config.social_instagram && (
                      <a
                        href={config.social_instagram}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-3.5 py-2 text-xs font-semibold hover:bg-white/10 transition-colors"
                      >
                        <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 2.156 4.919 5.406.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 5.234-4.919 5.419-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-2.199-4.919-5.42-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-5.234 4.919-5.419 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                        Instagram
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
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs font-bold transition-colors shadow-sm"
                      >
                        <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                        </svg>
                        WhatsApp
                      </a>
                    )}
                    {config.social_youtube && (
                      <a
                        href={config.social_youtube}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-3.5 py-2 text-xs font-semibold hover:bg-white/10 transition-colors"
                      >
                        <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                        YouTube
                      </a>
                    )}
                  </div>
                </div>
                <div className="min-h-[380px] h-full w-full relative">
                  <SchoolMap
                    googleMapsUrl={config.google_maps_url}
                    embedUrl={config.google_maps_embed_url}
                    address={config.contact_address_ar || config.contact_address || 'مدرسة مانهاتن للغات، مدينة الشيخ زايد، محافظة الجيزة، مصر'}
                    className="h-full w-full min-h-[380px]"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Call to Action Bar */}
      <section className="bg-primary-dark dark:bg-slate-900 py-16 text-white text-center relative overflow-hidden transition-colors">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/40 rounded-full blur-3xl pointer-events-none" />
        <div className="mx-auto max-w-3xl px-4 relative z-10 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold">{t('cta.title', 'Enroll Your Child Today')}</h2>
          <p className="text-slate-200 text-lg leading-relaxed">
            {t('cta.subtitle', 'Join Manhattan Language School today and give your child the best foundation for future success.')}
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <Button onClick={handleStudentApply} variant="primary" className="py-3 px-8 text-base shadow-xl font-bold" showArrow>
              {t('portal.parent.title', 'بوابة ولي الأمر والتقديم الإلكتروني')}
            </Button>
            <Button to="/contact" variant="white" className="py-3 px-8 text-base shadow-xl">
              {t('cta.contactBtn', 'CONTACT US')}
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
