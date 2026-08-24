import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  Star,
  MessageCircle,
  X,
} from 'lucide-react';
import { SeoHead } from '../../components/common/SeoHead';
import { DEFAULT_STUDENT_LIFE_CONFIG, type StudentLifeFullConfig, type StudentLifeClubConfig } from '../../lib/studentLifeConfig';
import { Button } from '../../components/ui/Button';
import { logger } from '../../lib/logger';

export function StudentLifePage() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const [activeCategory, setActiveCategory] = useState<'all' | 'stem' | 'sports' | 'arts' | 'leadership'>('all');
  const [selectedClubModal, setSelectedClubModal] = useState<StudentLifeClubConfig | null>(null);

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
        logger.error('Error parsing student_life_config', e);
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
    stem: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    sports: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    arts: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    leadership: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  };

  const filteredClubs = activeCategory === 'all'
    ? cmsData.clubs
    : cmsData.clubs.filter((club) => club.category === activeCategory);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 select-none">
      <SeoHead
        title={t('studentLife.pageTitle', 'حياة الطالب في مدرسة مانهاتن للغات | MLS Student Life')}
        description={t('studentLife.seoDesc', 'استكشف تجربة مانهاتن الطلابية الشاملة: نوادي الروبوتات والذكاء الاصطناعي، الأكاديميات الرياضية، الفنون والمسرح، والقيادة الشابة.')}
      />

      {/* Hero Section with Vibrant Glassmorphism */}
      <section className="relative overflow-hidden bg-slate-950 text-white py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
        {/* Dynamic Glowing Light Orbs */}
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-blue-600/25 rounded-full blur-3xl animate-pulse pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[30rem] h-[30rem] bg-amber-500/15 rounded-full blur-3xl animate-pulse pointer-events-none" />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />

        <div className="relative max-w-7xl mx-auto text-center space-y-8 z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-semibold text-amber-300 shadow-xl"
          >
            <Sparkles className="h-4 w-4 text-amber-400 animate-spin" />
            <span>{isRtl ? cmsData.badgeAr : cmsData.badgeEn}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight max-w-5xl mx-auto drop-shadow-2xl"
          >
            {isRtl ? cmsData.heroTitleAr : cmsData.heroTitleEn}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-light"
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
              className="px-8 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold transition-all shadow-xl hover:scale-105 flex items-center gap-2.5 text-base"
            >
              <span>{isRtl ? 'استكشف الأندية والأنشطة' : 'Explore Student Clubs'}</span>
              <ArrowIcon className="h-5 w-5" />
            </a>
            <Link
              to="/gallery"
              className="px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-semibold transition-all hover:scale-105 flex items-center gap-2.5 text-base"
            >
              <ImageIcon className="h-5 w-5 text-blue-400" />
              <span>{t('studentLife.cta.viewGallery', 'معرض الصور والفعاليات')}</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Impact Stats Banner */}
      <section className="relative -mt-12 max-w-6xl mx-auto px-4 sm:px-6 z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800">
          <div className="text-center p-4 border-r border-slate-100 dark:border-slate-800 last:border-0 hover:scale-105 transition-transform">
            <div className="text-4xl sm:text-5xl font-black text-blue-600 dark:text-blue-400 mb-1 tracking-tight">{cmsData.statClubs}</div>
            <div className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">
              {t('studentLife.stats.clubs', 'نادٍ واستوديو طلابي')}
            </div>
          </div>
          <div className="text-center p-4 border-r border-slate-100 dark:border-slate-800 last:border-0 hover:scale-105 transition-transform">
            <div className="text-4xl sm:text-5xl font-black text-emerald-600 dark:text-emerald-400 mb-1 tracking-tight">{cmsData.statSports}</div>
            <div className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">
              {t('studentLife.stats.sports', 'أكاديميات رياضية')}
            </div>
          </div>
          <div className="text-center p-4 border-r border-slate-100 dark:border-slate-800 last:border-0 hover:scale-105 transition-transform">
            <div className="text-4xl sm:text-5xl font-black text-purple-600 dark:text-purple-400 mb-1 tracking-tight">{cmsData.statEvents}</div>
            <div className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">
              {t('studentLife.stats.events', 'فعالية وبطولة سنوياً')}
            </div>
          </div>
          <div className="text-center p-4 hover:scale-105 transition-transform">
            <div className="text-4xl sm:text-5xl font-black text-amber-500 dark:text-amber-400 mb-1 tracking-tight">{cmsData.statParticipation}</div>
            <div className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">
              {t('studentLife.stats.participation', 'مشاركة وتفاعل الطلاب')}
            </div>
          </div>
        </div>
      </section>

      {/* Core Pillars Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
            <Compass className="h-4 w-4" />
            <span>{isRtl ? 'محاور الرؤية والنمو' : 'Student Life Pillars'}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('studentLife.pillars.title', 'محاور التجربة الطلابية الشاملة')}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-xl font-light">
            {t('studentLife.pillars.subtitle', 'نبتكر بيئة متكاملة توازن بين التفوق الأكاديمي وصقل مهارات الشخصية الحياتية')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cmsData.pillars.map((pillar, idx) => {
            const icons = [Dumbbell, Cpu, Palette, Globe];
            const colorAccents = [
              'border-t-emerald-500 text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
              'border-t-blue-500 text-blue-500 bg-blue-50 dark:bg-blue-950/40',
              'border-t-purple-500 text-purple-500 bg-purple-50 dark:bg-purple-950/40',
              'border-t-amber-500 text-amber-500 bg-amber-50 dark:bg-amber-950/40',
            ];
            const IconComp = icons[idx % icons.length];
            const accent = colorAccents[idx % colorAccents.length];

            return (
              <motion.div
                key={pillar.id || idx}
                whileHover={{ y: -8 }}
                className={`bg-white dark:bg-slate-900 rounded-3xl p-7 shadow-lg border-t-4 border-slate-200 dark:border-slate-800 ${accent.split(' ')[0]} flex flex-col justify-between hover:shadow-2xl transition-all duration-300`}
              >
                <div>
                  <div className={`w-14 h-14 rounded-2xl ${accent.split(' ').slice(1).join(' ')} flex items-center justify-center mb-6 shadow-sm`}>
                    <IconComp className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                    {isRtl ? pillar.titleAr : pillar.titleEn}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-light">
                    {isRtl ? pillar.descAr : pillar.descEn}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Clubs Showcase Section */}
      <section id="clubs-section" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-100/80 dark:bg-slate-900/60 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
              {t('studentLife.clubs.title', 'استكشف الأندية والاستوديوهات الطلابية')}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg font-light">
              {t('studentLife.clubs.subtitle', 'اختر من بين تشكيلة مميزة تفتح آفاق الابتكار وتفجر طاقات الطلاب الإبداعية والقيادية')}
            </p>

            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 mt-8">
              {[
                { key: 'all', label: isRtl ? 'جميع الأنشطة' : 'All Activities' },
                { key: 'stem', label: isRtl ? 'العلوم والتكنولوجيا (STEM)' : 'STEM & Tech' },
                { key: 'sports', label: isRtl ? 'الرياضة واللياقة' : 'Sports & Athletics' },
                { key: 'arts', label: isRtl ? 'الفنون والمسرح' : 'Arts & Performing' },
                { key: 'leadership', label: isRtl ? 'القيادة والمناظرات' : 'Leadership & MUN' },
              ].map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key as typeof activeCategory)}
                  className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 ${
                    activeCategory === cat.key
                      ? 'bg-blue-600 text-white shadow-lg scale-105'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
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
                  className="bg-white dark:bg-slate-900 rounded-3xl p-7 shadow-md border border-slate-200/80 dark:border-slate-800 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className={`p-3.5 rounded-2xl bg-gradient-to-r ${colorClass} text-white shadow-md group-hover:scale-110 transition-transform`}>
                        <IconComp className="h-6 w-6" />
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${badgeClass}`}>
                        {club.category.toUpperCase()}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {isRtl ? club.titleAr : club.titleEn}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed font-light">
                      {isRtl ? club.descAr : club.descEn}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500 shrink-0" />
                        <span>{isRtl ? club.scheduleAr : club.scheduleEn}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Compass className="h-4 w-4 text-blue-500 shrink-0" />
                        <span>{isRtl ? club.locationAr : club.locationEn}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedClubModal(club)}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>{isRtl ? 'تفاصيل الانضمام للنادي' : 'Club Join Details'}</span>
                      <ArrowIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* A Day in Student Life Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Clock className="h-4 w-4" />
            <span>{isRtl ? 'البرنامج اليومي' : 'Daily Schedule'}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('studentLife.dayInLife.title', 'يوم مفعم بالحيوية في حياة طالب مانهاتن')}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-xl font-light">
            {t('studentLife.dayInLife.subtitle', 'جدول يومي متوازن يدمج التعلم الأكاديمي، الأنشطة العملية، والاستراحة الصحية')}
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Central Line for timeline */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-slate-200 dark:bg-slate-800 -translate-x-1/2 rounded-full" />

          <div className="space-y-10 relative">
            {[
              {
                time: t('studentLife.dayInLife.step1Time', '07:45 ص - 08:15 ص'),
                title: t('studentLife.dayInLife.step1Title', 'الطابور الصباحي والنشاط البدني'),
                desc: t('studentLife.dayInLife.step1Desc', 'بدء اليوم بالطاقة والإيجابية وتأدية تحية العلم والتمارين البدنية الصباحية المشتركة.'),
                icon: Calendar,
                badge: 'الافتتاحية',
              },
              {
                time: t('studentLife.dayInLife.step2Time', '08:15 ص - 11:30 ص'),
                title: t('studentLife.dayInLife.step2Title', 'الحصص التفاعلية بالفصول الذكية'),
                desc: t('studentLife.dayInLife.step2Desc', 'تعلم نشط يدمج مناهج اللغات الدولية بالتطبيقات الشاشة التفاعلية والأجهزة الرقمية.'),
                icon: BookOpen,
                badge: 'الأكاديميات',
              },
              {
                time: t('studentLife.dayInLife.step3Time', '11:30 ص - 12:30 م'),
                title: t('studentLife.dayInLife.step3Title', 'استراحة الغداء والأنشطة الاجتماعية'),
                desc: t('studentLife.dayInLife.step3Desc', 'تناول الوجبات المتوازنة والتواصل الاجتماعي المثمر في الكافيتريا والمساحات الخضراء.'),
                icon: Users,
                badge: 'الاستراحة',
              },
              {
                time: t('studentLife.dayInLife.step4Time', '12:30 م - 02:30 م'),
                title: t('studentLife.dayInLife.step4Title', 'النوادي الطلابية والورش التفاعلية'),
                desc: t('studentLife.dayInLife.step4Desc', 'المشاركة في معامل الروبوتات، تمارين الملاعب الرياضية، والتدريب على مسرح الدراما.'),
                icon: Cpu,
                badge: 'الأنشطة الإثرائية',
              },
              {
                time: t('studentLife.dayInLife.step5Time', '02:30 م - 03:00 م'),
                title: t('studentLife.dayInLife.step5Title', 'التلخيص والمراجعة اليومية'),
                desc: t('studentLife.dayInLife.step5Desc', 'مراجعة المخرجات التعليمية اليومية والاستعداد لليوم التالي بكل شغف ورغبة للتفوق.'),
                icon: CheckCircle2,
                badge: 'الختام',
              },
            ].map((step, idx) => {
              const StepIcon = step.icon;
              const isEven = idx % 2 === 0;
              return (
                <div
                  key={idx}
                  className={`flex flex-col md:flex-row items-center gap-8 ${
                    isEven ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  <div className="w-full md:w-1/2 bg-white dark:bg-slate-900 rounded-3xl p-7 shadow-lg border border-slate-200/80 dark:border-slate-800 hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="inline-block px-3.5 py-1 rounded-full text-xs font-extrabold bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                        {step.time}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        {step.badge}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-light">{step.desc}</p>
                  </div>

                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 z-10 shadow-xl ring-8 ring-slate-50 dark:ring-slate-950">
                    <StepIcon className="h-6 w-6" />
                  </div>

                  <div className="w-full md:w-1/2 hidden md:block" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Student Achievements */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Trophy className="h-4 w-4 text-amber-400" />
              <span>MLS EXCELLENCE & TROPHIES</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              {t('studentLife.achievements.title', 'إنجازات طلابنا وبطولاتهم')}
            </h2>
            <p className="text-slate-300 text-base sm:text-xl font-light">
              {t('studentLife.achievements.subtitle', 'نفخر بطلاب يرفعون اسم مدرسة مانهاتن للغات في كافة المحافل العلمية والرياضية والثقافية')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-800 space-y-4 hover:border-amber-500/40 transition-colors">
              <div className="p-3.5 rounded-2xl bg-amber-400/20 text-amber-400 w-fit">
                <Award className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-white">
                {t('studentLife.achievements.item1Title', 'المركز الأول في معرض العلوم والابتكار')}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed font-light">
                {t('studentLife.achievements.item1Desc', 'ابتكار مشروع الطاقة النظيفة وتنقية المياه الذكي وحصد الجائزة الأولى على مستوى المحافظة.')}
              </p>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-800 space-y-4 hover:border-amber-500/40 transition-colors">
              <div className="p-3.5 rounded-2xl bg-amber-400/20 text-amber-400 w-fit">
                <Trophy className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-white">
                {t('studentLife.achievements.item2Title', 'كأس البطولة المدرسية لكرة القدم')}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed font-light">
                {t('studentLife.achievements.item2Desc', 'تتويج فريق مدرسة مانهاتن بالميدالية الذهبية وكأس البطولة للمدارس الخاصة.')}
              </p>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-800 space-y-4 hover:border-amber-500/40 transition-colors">
              <div className="p-3.5 rounded-2xl bg-amber-400/20 text-amber-400 w-fit">
                <Sparkles className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-white">
                {t('studentLife.achievements.item3Title', 'جائزة التميز في نموذج الأمم المتحدة (MUN)')}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed font-light">
                {t('studentLife.achievements.item3Desc', 'فوز وفد الطلاب بجائزة أفضل مندوب وأفضل صياغة للقرارات الدولية باللغة الإنجليزية.')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Student Voices & Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider">
            <MessageCircle className="h-4 w-4" />
            <span>{isRtl ? 'أصوات طلابنا' : 'Student Voices'}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isRtl ? 'ماذا يقول طلاب مانهاتن عن تجربتهم؟' : 'What Students Say About Life at MLS'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              quoteAr: 'الانضمام لنادي الروبوتات في المدرسة فتح لي آفاقاً واسعة لم تكن في مخيلتي، وصممت أول مشروع ذكاء اصطناعي بنفسي.',
              quoteEn: 'Joining the Robotics Club opened horizons I never imagined. I programmed my first AI project here.',
              name: 'علي حسن',
              gradeAr: 'طالب الصف الثالث الإعدادي',
              gradeEn: 'Grade 9 Student',
              club: 'Robotics & AI',
            },
            {
              quoteAr: 'التدريبات الرياضية والدعم الفني في أكاديمية كرة القدم جعلتني أحقق التوازن الكامل بين التميز الأكاديمي والرياضي.',
              quoteEn: 'Sports academy coaching helped me achieve perfect balance between academic excellence and athletics.',
              name: 'سارة محمد',
              gradeAr: 'طالبة المرحلة الثانوية',
              gradeEn: 'Secondary School Student',
              club: 'Sports Academy',
            },
            {
              quoteAr: 'تجربة نموذج الأمم المتحدة صقلت مهاراتي في الخطابة باللغة الإنجليزية وحسن التفاوض بكل ثقة أمام الجميع.',
              quoteEn: 'Participating in MUN boosted my confidence in public speaking and international diplomacy.',
              name: 'عمر خالد',
              gradeAr: 'رئيس اتحاد الطلاب',
              gradeEn: 'Student Council President',
              club: 'MUN Leadership',
            },
          ].map((item, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-lg border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed font-light">
                  "{isRtl ? item.quoteAr : item.quoteEn}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">{item.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{isRtl ? item.gradeAr : item.gradeEn}</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-bold">
                  {item.club}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-slate-900 text-white rounded-3xl p-10 sm:p-16 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden">
          <div className="space-y-4 max-w-2xl text-center md:text-start relative z-10">
            <h2 className="text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight">
              {t('studentLife.cta.title', 'هل أنت جاهز لخوض هذه التجربة الاستثنائية؟')}
            </h2>
            <p className="text-blue-100 text-base sm:text-xl font-light">
              {t('studentLife.cta.subtitle', 'سجل طفلك الآن في مدرسة مانهاتن للغات ليحظى بنمو أكاديمي وتربوي متكامل.')}
            </p>
          </div>

          <div className="flex flex-wrap gap-4 shrink-0 justify-center relative z-10">
            <Link
              to="/gallery"
              className="px-8 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold transition-all shadow-xl hover:scale-105 flex items-center gap-2.5 text-base"
            >
              <ImageIcon className="h-5 w-5" />
              <span>{t('studentLife.cta.viewGallery', 'تصفح معرض الصور')}</span>
            </Link>
            <Link
              to="/admissions"
              className="px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold transition-all hover:scale-105 flex items-center gap-2.5 text-base backdrop-blur-md"
            >
              <span>{t('studentLife.cta.applyNow', 'التسجيل والقبول')}</span>
              <ArrowIcon className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Modal: Club Join Details & Inquiry */}
      <AnimatePresence>
        {selectedClubModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative space-y-6"
            >
              <button
                onClick={() => setSelectedClubModal(null)}
                className="absolute top-6 left-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="space-y-3">
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 text-xs font-bold uppercase">
                  {selectedClubModal.category}
                </span>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {isRtl ? selectedClubModal.titleAr : selectedClubModal.titleEn}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {isRtl ? selectedClubModal.descAr : selectedClubModal.descEn}
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-2 text-xs text-slate-700 dark:text-slate-300 font-medium border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500 shrink-0" />
                  <span><strong>{isRtl ? 'الموعد: ' : 'Schedule: '}</strong> {isRtl ? selectedClubModal.scheduleAr : selectedClubModal.scheduleEn}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Compass className="h-4 w-4 text-blue-500 shrink-0" />
                  <span><strong>{isRtl ? 'المكان: ' : 'Location: '}</strong> {isRtl ? selectedClubModal.locationAr : selectedClubModal.locationEn}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setSelectedClubModal(null)}>
                  {isRtl ? 'إغلاق' : 'Close'}
                </Button>
                <Button to="/admissions" variant="primary" showArrow className="py-2.5 px-6">
                  {isRtl ? 'الانضمام للمدرسة والتسجيل' : 'Apply to Join MLS'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
