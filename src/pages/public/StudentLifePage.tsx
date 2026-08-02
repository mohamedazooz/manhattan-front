import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Heart,
  Calendar,
  Award,
  BookOpen,
} from 'lucide-react';
import { SeoHead } from '../../components/common/SeoHead';

interface ClubItem {
  id: string;
  category: 'stem' | 'sports' | 'arts' | 'leadership';
  icon: typeof Cpu;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  scheduleAr: string;
  scheduleEn: string;
  locationAr: string;
  locationEn: string;
  color: string;
  badgeBg: string;
}

const clubList: ClubItem[] = [
  {
    id: 'robotics',
    category: 'stem',
    icon: Cpu,
    titleAr: 'نادي الروبوتات والذكاء الاصطناعي',
    titleEn: 'Robotics & AI Club',
    descAr: 'تصميم وبرمجة الروبوتات الذكية والمشاركة في المسابقات التكنولوجية المحاضرة والدولية.',
    descEn: 'Design and program smart robots, competing in national and international tech challenges.',
    scheduleAr: 'الأحد والأربعاء - 02:30 م',
    scheduleEn: 'Sun & Wed - 02:30 PM',
    locationAr: 'معمل التكنولوجيا المتقدم',
    locationEn: 'Advanced Tech Lab',
    color: 'from-blue-500 to-indigo-600',
    badgeBg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  },
  {
    id: 'football',
    category: 'sports',
    icon: Dumbbell,
    titleAr: 'أكاديمية كرة القدم والرياضات الميدانية',
    titleEn: 'Football & Field Sports Academy',
    descAr: 'تدريبات للياقة البدنية والمهارات التكتيكية تحت إشراف كادر مدربين معتمدين.',
    descEn: 'Fitness training and tactical skills led by certified professional sports coaches.',
    scheduleAr: 'الاثنين والخميس - 03:00 م',
    scheduleEn: 'Mon & Thu - 03:00 PM',
    locationAr: 'الملعب الرياضي الرئيسي',
    locationEn: 'Main Sports Turf',
    color: 'from-emerald-500 to-teal-600',
    badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
  {
    id: 'fine-arts',
    category: 'arts',
    icon: Palette,
    titleAr: 'مرسم الفنون التشكيلية والتصميم',
    titleEn: 'Fine Arts & Design Studio',
    descAr: 'تنمية مهارات الرسم والترميم والتصميم الرقمي وإقامة المعارض السنوية للطلاب.',
    descEn: 'Developing painting, sculpture, and digital art skills with annual student gallery exhibitions.',
    scheduleAr: 'الثلاثاء - 02:30 م',
    scheduleEn: 'Tuesday - 02:30 PM',
    locationAr: 'استوديو الفنون الجميل',
    locationEn: 'Arts & Crafts Studio',
    color: 'from-purple-500 to-pink-600',
    badgeBg: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  },
  {
    id: 'mun',
    category: 'leadership',
    icon: Globe,
    titleAr: 'نموذج الأمم المتحدة والقيادة الشابة (MUN)',
    titleEn: 'Model United Nations (MUN)',
    descAr: 'تدريب الطلاب على التناظر والدبلوماسية وحل القضايا العالمية وصقل مهارات الخطابة.',
    descEn: 'Training students in debate, diplomacy, resolving global issues, and public speaking.',
    scheduleAr: 'الأربعاء - 03:00 م',
    scheduleEn: 'Wednesday - 03:00 PM',
    locationAr: 'قاعة المؤتمرات الدولية',
    locationEn: 'International Conference Hall',
    color: 'from-amber-500 to-orange-600',
    badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  },
  {
    id: 'science-fair',
    category: 'stem',
    icon: BookOpen,
    titleAr: 'نادي البحث العلمي والتجارب البيئية',
    titleEn: 'Scientific Research & Eco Club',
    descAr: 'تجارب معملية ومشاريع الاستدامة البيئية وإعداد أبحاث المشاركة في معارض العلوم.',
    descEn: 'Laboratory experiments, eco-sustainability projects, and STEM research showcase.',
    scheduleAr: 'الأحد - 03:00 م',
    scheduleEn: 'Sunday - 03:00 PM',
    locationAr: 'مجمع المعامل المركزية',
    locationEn: 'Central Science Labs',
    color: 'from-cyan-500 to-blue-600',
    badgeBg: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300',
  },
  {
    id: 'theater',
    category: 'arts',
    icon: Heart,
    titleAr: 'الفرقة المسرحية والكورال الموسيقي',
    titleEn: 'School Theatre & Music Ensemble',
    descAr: 'الأداء المسرحي باللغتين العربية والإنجليزية والعروض الموسيقية في الحفلات الرسمية.',
    descEn: 'Bilingual theatrical performances and musical choir during official events.',
    scheduleAr: 'الخميس - 02:30 م',
    scheduleEn: 'Thursday - 02:30 PM',
    locationAr: 'المسرح المدرسي الكبير',
    locationEn: 'Grand School Auditorium',
    color: 'from-rose-500 to-red-600',
    badgeBg: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
  },
];

export function StudentLifePage() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const [activeCategory, setActiveCategory] = useState<'all' | 'stem' | 'sports' | 'arts' | 'leadership'>('all');

  const filteredClubs = activeCategory === 'all'
    ? clubList
    : clubList.filter((club) => club.category === activeCategory);

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
            <span>{t('studentLife.heroBadge')}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto"
          >
            {t('studentLife.heroTitle')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed"
          >
            {t('studentLife.heroSubtitle')}
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
            <div className="text-3xl sm:text-4xl font-extrabold text-primary dark:text-blue-400 mb-1">+15</div>
            <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-slate-400">
              {t('studentLife.stats.clubs')}
            </div>
          </div>
          <div className="text-center p-3 border-r border-gray-100 dark:border-slate-800 last:border-0">
            <div className="text-3xl sm:text-4xl font-extrabold text-primary dark:text-blue-400 mb-1">+10</div>
            <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-slate-400">
              {t('studentLife.stats.sports')}
            </div>
          </div>
          <div className="text-center p-3 border-r border-gray-100 dark:border-slate-800 last:border-0">
            <div className="text-3xl sm:text-4xl font-extrabold text-primary dark:text-blue-400 mb-1">+50</div>
            <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-slate-400">
              {t('studentLife.stats.events')}
            </div>
          </div>
          <div className="text-center p-3">
            <div className="text-3xl sm:text-4xl font-extrabold text-primary dark:text-blue-400 mb-1">100%</div>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* STEM */}
          <motion.div
            whileHover={{ y: -6 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md border border-gray-100 dark:border-slate-800 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                <Cpu className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {t('studentLife.pillars.stemTitle')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">
                {t('studentLife.pillars.stemDesc')}
              </p>
            </div>
          </motion.div>

          {/* Sports */}
          <motion.div
            whileHover={{ y: -6 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md border border-gray-100 dark:border-slate-800 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <Dumbbell className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {t('studentLife.pillars.sportsTitle')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">
                {t('studentLife.pillars.sportsDesc')}
              </p>
            </div>
          </motion.div>

          {/* Arts */}
          <motion.div
            whileHover={{ y: -6 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md border border-gray-100 dark:border-slate-800 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                <Palette className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {t('studentLife.pillars.artsTitle')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">
                {t('studentLife.pillars.artsDesc')}
              </p>
            </div>
          </motion.div>

          {/* Leadership */}
          <motion.div
            whileHover={{ y: -6 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md border border-gray-100 dark:border-slate-800 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {t('studentLife.pillars.leadershipTitle')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">
                {t('studentLife.pillars.leadershipDesc')}
              </p>
            </div>
          </motion.div>
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
              const IconComp = club.icon;
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
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${club.color} text-white shadow-sm`}>
                        <IconComp className="h-6 w-6" />
                      </div>
                      <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${club.badgeBg}`}>
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
              <span>MLS EXCELLENCE</span>
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
