import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { cmsApi } from '../../api';
import {
  Sparkles,
  Trophy,
  Users,
  Cpu,
  Dumbbell,
  Palette,
  Globe,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Image as ImageIcon,
  Compass,
  Calendar,
  Award,
  BookOpen,
} from 'lucide-react';
import { SeoHead } from '../../components/common/SeoHead';
import { DEFAULT_STUDENT_LIFE_CONFIG, type StudentLifeFullConfig } from '../admin/AdminStudentLifePage';



export function StudentLifePage() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const [activeCategory, setActiveCategory] = useState<'all' | 'stem' | 'sports' | 'arts' | 'leadership'>('all');

  const { data: cmsConfig = {} } = useQuery({
    queryKey: ['cms-config'],
    queryFn: () => cmsApi.getConfig().then((r) => r.data),
  });

  const cmsData: StudentLifeFullConfig = (() => {
    if (cmsConfig.student_life_config) {
      try {
        const parsed = JSON.parse(cmsConfig.student_life_config);
        return {
          ...DEFAULT_STUDENT_LIFE_CONFIG,
          ...parsed,
          clubs: parsed.clubs && parsed.clubs.length > 0 ? parsed.clubs : DEFAULT_STUDENT_LIFE_CONFIG.clubs,
          pillars: parsed.pillars && parsed.pillars.length > 0 ? parsed.pillars : DEFAULT_STUDENT_LIFE_CONFIG.pillars,
        };
      } catch (e) {
        console.error('Error parsing student_life_config', e);
      }
    }
    return DEFAULT_STUDENT_LIFE_CONFIG;
  })();

  const categoryIconMap: Record<string, typeof Cpu> = {
    stem: Cpu,
    sports: Dumbbell,
    arts: Palette,
    leadership: Globe,
  };

  const categoryColorMap: Record<string, string> = {
    stem: 'from-blue-500 to-indigo-600',
    sports: 'from-emerald-500 to-teal-600',
    arts: 'from-purple-500 to-pink-600',
    leadership: 'from-amber-500 to-orange-600',
  };

  const categoryBadgeMap: Record<string, string> = {
    stem: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    sports: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    arts: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
    leadership: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  };

  const filteredClubs = activeCategory === 'all'
    ? cmsData.clubs
    : cmsData.clubs.filter((club) => club.category === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-colors duration-300">
      <SeoHead
        title={t('studentLife.pageTitle')}
        description={t('studentLife.seoDesc')}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary-dark via-primary to-blue-900 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
        
        <div className="relative max-w-7xl mx-auto text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-semibold text-gold"
          >
            <Sparkles className="h-4 w-4" />
            <span>{isRtl ? cmsData.badgeAr : cmsData.badgeEn}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto"
          >
            {isRtl ? cmsData.heroTitleAr : cmsData.heroTitleEn}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed"
          >
            {isRtl ? cmsData.heroSubtitleAr : cmsData.heroSubtitleEn}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4 pt-4"
          >
            <a
              href="#clubs-section"
              className="px-6 py-3.5 rounded-xl bg-gold hover:bg-gold-light text-slate-950 font-bold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <span>{t('studentLife.clubs.title')}</span>
              <ArrowIcon className="h-4 w-4" />
            </a>
            <Link
              to="/gallery"
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white font-semibold transition-all flex items-center gap-2"
            >
              <ImageIcon className="h-4 w-4" />
              <span>{t('studentLife.cta.viewGallery')}</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Impact Stats Banner */}
      <section className="relative -mt-10 max-w-6xl mx-auto px-4 sm:px-6 z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-slate-800">
          <div className="text-center p-3 border-r border-gray-100 dark:border-slate-800 last:border-0">
            <div className="text-3xl sm:text-4xl font-extrabold text-primary dark:text-blue-400 mb-1">{cmsData.statClubs}</div>
            <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-slate-400">
              {t('studentLife.stats.clubs')}
            </div>
          </div>
          <div className="text-center p-3 border-r border-gray-100 dark:border-slate-800 last:border-0">
            <div className="text-3xl sm:text-4xl font-extrabold text-primary dark:text-blue-400 mb-1">{cmsData.statSports}</div>
            <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-slate-400">
              {t('studentLife.stats.sports')}
            </div>
          </div>
          <div className="text-center p-3 border-r border-gray-100 dark:border-slate-800 last:border-0">
            <div className="text-3xl sm:text-4xl font-extrabold text-primary dark:text-blue-400 mb-1">{cmsData.statEvents}</div>
            <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-slate-400">
              {t('studentLife.stats.events')}
            </div>
          </div>
          <div className="text-center p-3">
            <div className="text-3xl sm:text-4xl font-extrabold text-primary dark:text-blue-400 mb-1">{cmsData.statParticipation}</div>
            <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-slate-400">
              {t('studentLife.stats.participation')}
            </div>
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            {t('studentLife.pillars.title')}
          </h2>
          <p className="text-gray-600 dark:text-slate-400 text-base sm:text-lg">
            {t('studentLife.pillars.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cmsData.pillars.map((pillar, idx) => {
            const icons = [Dumbbell, Cpu, Palette, Globe, Trophy];
            const IconComp = icons[idx % icons.length];
            return (
              <motion.div
                key={pillar.id || idx}
                whileHover={{ y: -6 }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md border border-gray-100 dark:border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                    <IconComp className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {isRtl ? pillar.titleAr : pillar.titleEn}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">
                    {isRtl ? pillar.descAr : pillar.descEn}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Clubs Showcase Section */}
      <section id="clubs-section" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-100/70 dark:bg-slate-900/50 border-y border-gray-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              {t('studentLife.clubs.title')}
            </h2>
            <p className="text-gray-600 dark:text-slate-400 text-base sm:text-lg">
              {t('studentLife.clubs.subtitle')}
            </p>

            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
              {[
                { key: 'all', label: t('studentLife.clubs.all') },
                { key: 'stem', label: t('studentLife.clubs.stem') },
                { key: 'sports', label: t('studentLife.clubs.sports') },
                { key: 'arts', label: t('studentLife.clubs.arts') },
                { key: 'leadership', label: t('studentLife.clubs.leadership') },
              ].map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key as typeof activeCategory)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    activeCategory === cat.key
                      ? 'bg-primary text-white shadow-md scale-105'
                      : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Club Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClubs.map((club) => {
              const IconComp = categoryIconMap[club.category] || Cpu;
              const colorClass = categoryColorMap[club.category] || 'from-blue-500 to-indigo-600';
              const badgeClass = categoryBadgeMap[club.category] || 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
              return (
                <motion.div
                  key={club.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md border border-gray-100 dark:border-slate-800 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${colorClass} text-white shadow-sm`}>
                        <IconComp className="h-6 w-6" />
                      </div>
                      <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${badgeClass}`}>
                        {club.category.toUpperCase()}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {isRtl ? club.titleAr : club.titleEn}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-slate-400 mb-4 leading-relaxed">
                      {isRtl ? club.descAr : club.descEn}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-slate-800 space-y-2 text-xs text-gray-500 dark:text-slate-400 font-medium">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary dark:text-blue-400 shrink-0" />
                      <span>{t('studentLife.clubs.schedule')} {isRtl ? club.scheduleAr : club.scheduleEn}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Compass className="h-4 w-4 text-primary dark:text-blue-400 shrink-0" />
                      <span>{t('studentLife.clubs.location')} {isRtl ? club.locationAr : club.locationEn}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* A Day in Student Life Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            {t('studentLife.dayInLife.title')}
          </h2>
          <p className="text-gray-600 dark:text-slate-400 text-base sm:text-lg">
            {t('studentLife.dayInLife.subtitle')}
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Central Line for timeline */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-slate-800 -translate-x-1/2" />

          <div className="space-y-8 relative">
            {[
              {
                time: t('studentLife.dayInLife.step1Time'),
                title: t('studentLife.dayInLife.step1Title'),
                desc: t('studentLife.dayInLife.step1Desc'),
                icon: Calendar,
              },
              {
                time: t('studentLife.dayInLife.step2Time'),
                title: t('studentLife.dayInLife.step2Title'),
                desc: t('studentLife.dayInLife.step2Desc'),
                icon: BookOpen,
              },
              {
                time: t('studentLife.dayInLife.step3Time'),
                title: t('studentLife.dayInLife.step3Title'),
                desc: t('studentLife.dayInLife.step3Desc'),
                icon: Users,
              },
              {
                time: t('studentLife.dayInLife.step4Time'),
                title: t('studentLife.dayInLife.step4Title'),
                desc: t('studentLife.dayInLife.step4Desc'),
                icon: Cpu,
              },
              {
                time: t('studentLife.dayInLife.step5Time'),
                title: t('studentLife.dayInLife.step5Title'),
                desc: t('studentLife.dayInLife.step5Desc'),
                icon: CheckCircle2,
              },
            ].map((step, idx) => {
              const StepIcon = step.icon;
              const isEven = idx % 2 === 0;
              return (
                <div
                  key={idx}
                  className={`flex flex-col md:flex-row items-center gap-6 ${
                    isEven ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  <div className="w-full md:w-1/2 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md border border-gray-100 dark:border-slate-800">
                    <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary dark:text-blue-400 mb-2">
                      {step.time}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                  </div>

                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shrink-0 z-10 shadow-lg ring-4 ring-white dark:ring-slate-950">
                    <StepIcon className="h-5 w-5" />
                  </div>

                  <div className="w-full md:w-1/2 hidden md:block" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Student Achievements */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 to-primary-dark text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-gold text-xs font-bold">
              <Trophy className="h-4 w-4" />
              <span>{t('studentLife.excellenceHeader')}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              {t('studentLife.achievements.title')}
            </h2>
            <p className="text-blue-100 text-base sm:text-lg">
              {t('studentLife.achievements.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-3">
              <Award className="h-8 w-8 text-gold" />
              <h3 className="text-lg font-bold text-white">
                {t('studentLife.achievements.item1Title')}
              </h3>
              <p className="text-sm text-blue-100 leading-relaxed">
                {t('studentLife.achievements.item1Desc')}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-3">
              <Trophy className="h-8 w-8 text-gold" />
              <h3 className="text-lg font-bold text-white">
                {t('studentLife.achievements.item2Title')}
              </h3>
              <p className="text-sm text-blue-100 leading-relaxed">
                {t('studentLife.achievements.item2Desc')}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-3">
              <Sparkles className="h-8 w-8 text-gold" />
              <h3 className="text-lg font-bold text-white">
                {t('studentLife.achievements.item3Title')}
              </h3>
              <p className="text-sm text-blue-100 leading-relaxed">
                {t('studentLife.achievements.item3Desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-primary to-blue-800 text-white rounded-3xl p-8 sm:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl text-center md:text-start">
            <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight">
              {t('studentLife.cta.title')}
            </h2>
            <p className="text-blue-100 text-base sm:text-lg">
              {t('studentLife.cta.subtitle')}
            </p>
          </div>

          <div className="flex flex-wrap gap-4 shrink-0 justify-center">
            <Link
              to="/gallery"
              className="px-6 py-3.5 rounded-xl bg-gold hover:bg-gold-light text-slate-950 font-bold transition-all shadow-lg flex items-center gap-2 text-sm"
            >
              <ImageIcon className="h-4 w-4" />
              <span>{t('studentLife.cta.viewGallery')}</span>
            </Link>
            <Link
              to="/admissions"
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold transition-all flex items-center gap-2 text-sm"
            >
              <span>{t('studentLife.cta.applyNow')}</span>
              <ArrowIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
