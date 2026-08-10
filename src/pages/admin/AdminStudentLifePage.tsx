import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cmsApi } from '../../api';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { DataTable, Modal } from '../../components/ui/DataTable';
import { PageHeader } from '../../components/ui/Badge';
import { AdminPageGuide } from '../../components/admin/AdminPageGuide';
import { useAppLanguage } from '../../i18n';
import {
  Sparkles,
  Plus,
  Trash2,
  Edit,
  Save,
  CheckCircle,
  Compass,
  Trophy,
} from 'lucide-react';

export interface StudentLifeClubConfig {
  id: string;
  category: 'stem' | 'sports' | 'arts' | 'leadership';
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  scheduleAr: string;
  scheduleEn: string;
  locationAr: string;
  locationEn: string;
}

export interface StudentLifePillarConfig {
  id: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  iconName?: string;
}

export interface StudentLifeFullConfig {
  badgeAr: string;
  badgeEn: string;
  heroTitleAr: string;
  heroTitleEn: string;
  heroSubtitleAr: string;
  heroSubtitleEn: string;
  statClubs: string;
  statSports: string;
  statEvents: string;
  statParticipation: string;
  clubs: StudentLifeClubConfig[];
  pillars: StudentLifePillarConfig[];
}

export const DEFAULT_STUDENT_LIFE_CONFIG: StudentLifeFullConfig = {
  badgeAr: 'حياة طلابية مفعمة بالحيوية والابتكار',
  badgeEn: 'Vibrant & Innovative Student Life',
  heroTitleAr: 'اكتشف شغفك وابتكر مستقبلك في مدرسة مانهاتن للغات',
  heroTitleEn: 'Discover Your Passion & Build Your Future at MLS',
  heroSubtitleAr:
    'بيئة ترفيهية وتعليمية متكاملة تجمع بين التميز الأكاديمي، الأنشطة الرياضية، الفنون، ونوادي التكنولوجيا والقيادة لتأهيل قادة الغد.',
  heroSubtitleEn:
    'A holistic educational and extracurricular ecosystem empowering student talent through robotics, sports academies, fine arts, and leadership initiatives.',
  statClubs: '+15',
  statSports: '+10',
  statEvents: '+50',
  statParticipation: '100%',
  clubs: [
    {
      id: 'robotics',
      category: 'stem',
      titleAr: 'نادي الروبوتات والذكاء الاصطناعي',
      titleEn: 'Robotics & AI Lab',
      descAr: 'تصميم وبرمجة الروبوتات الذكية والانظمة المدمجة والمشاركة في المسابقات التكنولوجية الأولمبية.',
      descEn: 'Design and program smart robots, embedded systems, and compete in national tech olympiads.',
      scheduleAr: 'الأحد والأربعاء - 02:30 م',
      scheduleEn: 'Sun & Wed - 02:30 PM',
      locationAr: 'معمل التكنولوجيا والابتكار المتقدم',
      locationEn: 'Advanced Tech & Innovation Lab',
    },
    {
      id: 'football',
      category: 'sports',
      titleAr: 'أكاديمية كرة القدم والرياضات الميدانية',
      titleEn: 'Football & Athletics Academy',
      descAr: 'تدريبات اللياقة البدنية والمهارات التكتيكية وتحضير فرق المدرسة للبطولات المحلية والإقليمية.',
      descEn: 'Fitness training, tactical skills, and preparing school teams for regional leagues.',
      scheduleAr: 'الاثنين والخميس - 03:00 م',
      scheduleEn: 'Mon & Thu - 03:00 PM',
      locationAr: 'الملعب الرياضي الرئيسي والمجمع الأولمبي',
      locationEn: 'Main Sports Complex & Turf',
    },
    {
      id: 'theatre',
      category: 'arts',
      titleAr: 'استوديو المسرح المدرسي والدراما',
      titleEn: 'School Theatre & Performing Arts',
      descAr: 'تطوير مهارات الإلقاء والتعبير الجسدي والتمثيل المسرحي وتقديم العروض السنوية باللغتين العربية والإنجليزية.',
      descEn: 'Developing public speaking, acting, and theatrical expression through annual bilingual plays.',
      scheduleAr: 'الثلاثاء والسبت - 02:30 م',
      scheduleEn: 'Tue & Sat - 02:30 PM',
      locationAr: 'المسرح الرئيسي المجهز بأحدث أجهزة الصوت',
      locationEn: 'Grand Auditorium & Stage',
    },
    {
      id: 'fine-arts',
      category: 'arts',
      titleAr: 'مرسم الفنون التشكيلية والتصميم الرقمي',
      titleEn: 'Fine Arts & Digital Design Studio',
      descAr: 'تنمية مهارات الرسم والترميم والتصميم الجرافيكي وإقامة المعارض الفنية السنوية للطلاب.',
      descEn: 'Developing painting, sculpture, and graphic design skills with annual gallery exhibitions.',
      scheduleAr: 'الثلاثاء - 02:30 م',
      scheduleEn: 'Tuesday - 02:30 PM',
      locationAr: 'مرسم مانهاتن للفنون الجملية',
      locationEn: 'Manhattan Fine Arts Studio',
    },
    {
      id: 'mun',
      category: 'leadership',
      titleAr: 'نموذج الأمم المتحدة والقيادة الدبلوماسية (MUN)',
      titleEn: 'Model United Nations & Leadership',
      descAr: 'تدريب الطلاب على التناظر والدبلوماسية وحل القضايا الدولية والخطابة والتفاوض القيادي.',
      descEn: 'Training students in debate, global diplomacy, international relations, and negotiation skills.',
      scheduleAr: 'الأربعاء - 03:00 م',
      scheduleEn: 'Wednesday - 03:00 PM',
      locationAr: 'قاعة المؤتمرات الدولية والمحاكاة',
      locationEn: 'International Conference Hall',
    },
    {
      id: 'astronomy',
      category: 'stem',
      titleAr: 'نادي الفلك والأبحاث الفضائية',
      titleEn: 'Astronomy & Space Science Club',
      descAr: 'استكشاف الأجرام السماوية باستخدام التلسكوبات الحديثة، ودراسة علوم الفضاء وتجارب الفيزياء التطبيقية.',
      descEn: 'Observing celestial bodies using modern telescopes and exploring space physics experiments.',
      scheduleAr: 'الخميس - 03:30 م',
      scheduleEn: 'Thursday - 03:30 PM',
      locationAr: 'المرصد الفلكي وقبة العلوم بالمدرسة',
      locationEn: 'School Planetarium & Observatory',
    },
    {
      id: 'chess',
      category: 'leadership',
      titleAr: 'نادي الشطرنج والتفكير الاستراتيجي',
      titleEn: 'Chess & Strategic Mind Club',
      descAr: 'صقل مهارات التخطيط والتحليل المنطقي والتركيز الذهني من خلال دوريات الشطرنج والتحديات الفكرية.',
      descEn: 'Sharpening strategic planning, logical thinking, and focus through school chess leagues.',
      scheduleAr: 'الاثنين - 02:30 م',
      scheduleEn: 'Monday - 02:30 PM',
      locationAr: 'قاعة الأنشطة الذهنية والذكاء',
      locationEn: 'Mind Sports & Strategy Lounge',
    },
    {
      id: 'music',
      category: 'arts',
      titleAr: 'أكاديمية الموسيقى والكورال المدرسي',
      titleEn: 'Music & School Choir Academy',
      descAr: 'تعلم العزف على الآلات الموسيقية المتنوعة، وتنمية الحس الموسيقي للمشاركة في الحفلات القومية.',
      descEn: 'Instrumental training and vocal harmony preparing students for national music showcases.',
      scheduleAr: 'الأحد - 03:00 م',
      scheduleEn: 'Sunday - 03:00 PM',
      locationAr: 'استوديو الصوتيات والموسيقى المجهزة',
      locationEn: 'Sound & Music Recording Studio',
    },
  ],
  pillars: [
    {
      id: 'p-1',
      titleAr: 'التميز الرياضي والصحة البدنية',
      titleEn: 'Athletics & Physical Fitness',
      descAr: 'مجمعات رياضية متكاملة وملاعب أولمبية تشجع الطالب على ممارسة النشاط وصقل الروح الرياضية.',
      descEn: 'Olympic-grade athletic facilities fostering teamwork, stamina, and healthy habits.',
    },
    {
      id: 'p-2',
      titleAr: 'الابتكار العلمي والعلوم الحديثة',
      titleEn: 'STEM Innovation & Technology',
      descAr: 'معامل تفاعلية متطورة للروبوتات والتطبيقات الذكية تمنح الطالب الشغف بالاكتشاف وتطوير الحلول.',
      descEn: 'Hands-on tech labs empowering students to create software, robotics, and scientific models.',
    },
    {
      id: 'p-3',
      titleAr: 'التعبير الفني والدراما التفاعلية',
      titleEn: 'Arts & Creative Performing',
      descAr: 'مساحات إبداعية ومسارح حديثة تسمح للطلاب بالتعبير عن الذات واكتشاف المواهب الموسيقية والفنية.',
      descEn: 'Inspiring spaces for music, theatrical performance, fine arts, and visual storytelling.',
    },
    {
      id: 'p-4',
      titleAr: 'القيادة الشابة والمواطنة الفاعلة',
      titleEn: 'Leadership & Global Citizenship',
      descAr: 'نماذج محاكاة دولية، مجالس طلابية، ومبادرات مجتمعية تصنع شخصية قادرة على إحداث الفارق.',
      descEn: 'Student councils, MUN conferences, and community projects building responsible future leaders.',
    },
  ],
};

const emptyClub: StudentLifeClubConfig = {
  id: '',
  category: 'stem',
  titleAr: '',
  titleEn: '',
  descAr: '',
  descEn: '',
  scheduleAr: '',
  scheduleEn: '',
  locationAr: '',
  locationEn: '',
};

export function AdminStudentLifePage() {
  const { t } = useTranslation();
  const lang = useAppLanguage();
  const isAr = lang === 'ar';
  const qc = useQueryClient();

  const [config, setConfig] = useState<StudentLifeFullConfig>(DEFAULT_STUDENT_LIFE_CONFIG);
  const [activeTab, setActiveTab] = useState<'hero' | 'clubs' | 'pillars'>('hero');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Modal State for Club Edit/Create
  const [clubModalOpen, setClubModalOpen] = useState(false);
  const [editClubId, setEditClubId] = useState<string | null>(null);
  const [clubForm, setClubForm] = useState<StudentLifeClubConfig>(emptyClub);

  // Fetch CMS Config
  const { data: cmsConfig = {} } = useQuery({
    queryKey: ['cms-config'],
    queryFn: () => cmsApi.getConfig().then((r) => r.data),
  });

  useEffect(() => {
    if (cmsConfig.student_life_config) {
      try {
        const parsed = JSON.parse(cmsConfig.student_life_config);
        setConfig({
          ...DEFAULT_STUDENT_LIFE_CONFIG,
          ...parsed,
          clubs: parsed.clubs || DEFAULT_STUDENT_LIFE_CONFIG.clubs,
          pillars: parsed.pillars || DEFAULT_STUDENT_LIFE_CONFIG.pillars,
        });
      } catch (err) {
        console.error('Failed to parse student_life_config:', err);
      }
    }
  }, [cmsConfig]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const serialized = JSON.stringify(config);
      return cmsApi.updateConfig('student_life_config', serialized);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cms-config'] });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  // Club Modal Handlers
  const handleOpenCreateClub = () => {
    setEditClubId(null);
    setClubForm({ ...emptyClub, id: `club-${Date.now()}` });
    setClubModalOpen(true);
  };

  const handleOpenEditClub = (club: StudentLifeClubConfig) => {
    setEditClubId(club.id);
    setClubForm({ ...club });
    setClubModalOpen(true);
  };

  const handleSaveClub = () => {
    if (!clubForm.titleAr.trim() || !clubForm.titleEn.trim()) return;

    if (editClubId) {
      setConfig((prev) => ({
        ...prev,
        clubs: prev.clubs.map((c) => (c.id === editClubId ? clubForm : c)),
      }));
    } else {
      setConfig((prev) => ({
        ...prev,
        clubs: [...prev.clubs, clubForm],
      }));
    }
    setClubModalOpen(false);
  };

  const handleDeleteClub = (clubId: string) => {
    setConfig((prev) => ({
      ...prev,
      clubs: prev.clubs.filter((c) => c.id !== clubId),
    }));
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <PageHeader
        title={t('admin.studentLifeCrud.title', 'Student Life Page Management')}
        subtitle={t(
          'admin.studentLifeCrud.subtitle',
          'Manage student clubs, sports academies, STEM activities, stats, and campus life pillars.',
        )}
      />

      <AdminPageGuide guideKey="studentLife" />

      {/* Action Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('hero')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'hero'
                ? 'bg-primary text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{isAr ? 'الواجهة والإحصائيات' : 'Hero & Stats'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('clubs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'clubs'
                ? 'bg-primary text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>{isAr ? 'النوادي والأنشطة الطلابية' : 'Clubs & Activities'}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 font-mono">
              {config.clubs.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pillars')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'pillars'
                ? 'bg-primary text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>{isAr ? 'ركائز الحياة الطلابية' : 'Student Life Pillars'}</span>
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {saveSuccess && (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-pulse">
              <CheckCircle className="w-4 h-4" />
              {isAr ? 'تم حفظ التغييرات بنجاح!' : 'Changes Saved Successfully!'}
            </span>
          )}

          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="py-2.5 px-6 font-bold shadow-lg flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>
              {saveMutation.isPending
                ? isAr
                  ? 'جاري الحفظ...'
                  : 'Saving...'
                : isAr
                ? 'حفظ التغييرات'
                : 'Save Changes'}
            </span>
          </Button>
        </div>
      </div>

      {/* Tab 1: Hero & Statistics */}
      {activeTab === 'hero' && (
        <div className="space-y-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold" />
            <span>{isAr ? 'إعدادات الواجهة الرئيسية لشاشة حياة الطالب' : 'Hero Section & Stats Settings'}</span>
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label={isAr ? 'الشارة العليا (بالعربي)' : 'Badge Label (Arabic)'}
              value={config.badgeAr}
              onChange={(e) => setConfig({ ...config, badgeAr: e.target.value })}
            />
            <Input
              label={isAr ? 'الشارة العليا (بالإنجليزي)' : 'Badge Label (English)'}
              value={config.badgeEn}
              onChange={(e) => setConfig({ ...config, badgeEn: e.target.value })}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label={isAr ? 'العنوان الرئيسي (بالعربي)' : 'Hero Title (Arabic)'}
              value={config.heroTitleAr}
              onChange={(e) => setConfig({ ...config, heroTitleAr: e.target.value })}
            />
            <Input
              label={isAr ? 'العنوان الرئيسي (بالإنجليزي)' : 'Hero Title (English)'}
              value={config.heroTitleEn}
              onChange={(e) => setConfig({ ...config, heroTitleEn: e.target.value })}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Textarea
              label={isAr ? 'الوصف التوضيحي (بالعربي)' : 'Hero Subtitle (Arabic)'}
              value={config.heroSubtitleAr}
              onChange={(e) => setConfig({ ...config, heroSubtitleAr: e.target.value })}
            />
            <Textarea
              label={isAr ? 'الوصف التوضيحي (بالإنجليزي)' : 'Hero Subtitle (English)'}
              value={config.heroSubtitleEn}
              onChange={(e) => setConfig({ ...config, heroSubtitleEn: e.target.value })}
            />
          </div>

          {/* Stats Bar Settings */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <h4 className="text-sm font-bold text-primary dark:text-blue-400">
              {isAr ? 'أرقام وإحصائيات التأثير' : 'Impact Statistics Numbers'}
            </h4>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Input
                label={isAr ? 'عدد الأنشطة والنوادي' : 'Clubs Count Stat'}
                value={config.statClubs}
                onChange={(e) => setConfig({ ...config, statClubs: e.target.value })}
              />
              <Input
                label={isAr ? 'عدد الرياضات الميدانية' : 'Sports Count Stat'}
                value={config.statSports}
                onChange={(e) => setConfig({ ...config, statSports: e.target.value })}
              />
              <Input
                label={isAr ? 'عدد الفعاليات السنوية' : 'Annual Events Stat'}
                value={config.statEvents}
                onChange={(e) => setConfig({ ...config, statEvents: e.target.value })}
              />
              <Input
                label={isAr ? 'نسبة مشاركة الطلاب' : 'Participation % Stat'}
                value={config.statParticipation}
                onChange={(e) => setConfig({ ...config, statParticipation: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Clubs & Activities List */}
      {activeTab === 'clubs' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {isAr ? 'قائمة الأنشطة والنوادي الطلابية' : 'Student Clubs & Activities List'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAr
                  ? 'قم بإضافة أو تعديل النوادي المتاحة للطلاب بالمدرسة وتحديد مواعيد وأماكن تجمعاتها.'
                  : 'Manage available school clubs, schedules, and locations for students.'}
              </p>
            </div>

            <Button
              onClick={handleOpenCreateClub}
              variant="gold"
              className="py-2 px-4 text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'إضافة نادي جديد' : 'Add New Club'}</span>
            </Button>
          </div>

          <DataTable
            data={config.clubs}
            columns={[
              {
                key: 'category',
                header: isAr ? 'التصنيف' : 'Category',
                render: (r: StudentLifeClubConfig) => (
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase bg-slate-100 dark:bg-slate-800 text-primary">
                    {r.category}
                  </span>
                ),
              },
              {
                key: 'title',
                header: isAr ? 'اسم النادي' : 'Club Title',
                render: (r: StudentLifeClubConfig) => (
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100">
                      {isAr ? r.titleAr : r.titleEn}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {isAr ? r.locationAr : r.locationEn} · {isAr ? r.scheduleAr : r.scheduleEn}
                    </div>
                  </div>
                ),
              },
              {
                key: 'desc',
                header: isAr ? 'الوصف' : 'Description',
                render: (r: StudentLifeClubConfig) => (
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 max-w-md">
                    {isAr ? r.descAr : r.descEn}
                  </p>
                ),
              },
              {
                key: 'actions',
                header: isAr ? 'الإجراءات' : 'Actions',
                render: (r: StudentLifeClubConfig) => (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditClub(r)}
                      className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 hover:bg-blue-100"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteClub(r.id)}
                      className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-300 hover:bg-rose-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ),
              },
            ]}
          />
        </div>
      )}

      {/* Tab 3: Student Life Pillars */}
      {activeTab === 'pillars' && (
        <div className="space-y-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-gold" />
                <span>{isAr ? 'ركائز ومحاور الحياة الطلابية' : 'Student Life Core Pillars'}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAr
                  ? 'المحاور الرئيسية التي تظهر للمحاور الرياضية والأكاديمية والفنية بشاشة حياة الطالب.'
                  : 'Main focus pillars displayed on the Student Life page.'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {config.pillars.map((pillar, idx) => (
              <div
                key={pillar.id || idx}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-800/30"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gold uppercase tracking-wider">
                    {isAr ? `الركيزة رقم #${idx + 1}` : `Pillar #${idx + 1}`}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <Input
                    label={isAr ? 'العنوان بالعربي' : 'Title (Arabic)'}
                    value={pillar.titleAr}
                    onChange={(e) => {
                      const val = e.target.value;
                      setConfig((prev) => ({
                        ...prev,
                        pillars: prev.pillars.map((p, i) => (i === idx ? { ...p, titleAr: val } : p)),
                      }));
                    }}
                  />
                  <Input
                    label={isAr ? 'العنوان بالإنجليزي' : 'Title (English)'}
                    value={pillar.titleEn}
                    onChange={(e) => {
                      const val = e.target.value;
                      setConfig((prev) => ({
                        ...prev,
                        pillars: prev.pillars.map((p, i) => (i === idx ? { ...p, titleEn: val } : p)),
                      }));
                    }}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <Textarea
                    label={isAr ? 'الوصف بالعربي' : 'Description (Arabic)'}
                    value={pillar.descAr}
                    onChange={(e) => {
                      const val = e.target.value;
                      setConfig((prev) => ({
                        ...prev,
                        pillars: prev.pillars.map((p, i) => (i === idx ? { ...p, descAr: val } : p)),
                      }));
                    }}
                  />
                  <Textarea
                    label={isAr ? 'الوصف بالإنجليزي' : 'Description (English)'}
                    value={pillar.descEn}
                    onChange={(e) => {
                      const val = e.target.value;
                      setConfig((prev) => ({
                        ...prev,
                        pillars: prev.pillars.map((p, i) => (i === idx ? { ...p, descEn: val } : p)),
                      }));
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal for Creating / Editing Club */}
      <Modal
        open={clubModalOpen}
        onClose={() => setClubModalOpen(false)}
        title={
          editClubId
            ? isAr
              ? 'تعديل بيانات النادي الطلابي'
              : 'Edit Student Club'
            : isAr
            ? 'إضافة نادي طلابي جديد'
            : 'Add New Student Club'
        }
      >
        <div className="space-y-4 text-slate-900 dark:text-slate-100">
          <div>
            <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">
              {isAr ? 'تصنيف النادي' : 'Club Category'}
            </label>
            <select
              value={clubForm.category}
              onChange={(e) =>
                setClubForm({
                  ...clubForm,
                  category: e.target.value as StudentLifeClubConfig['category'],
                })
              }
              className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 bg-white dark:bg-slate-800 text-xs font-semibold"
            >
              <option value="stem">STEM & AI (العلوم والتكنولوجيا والذكاء الاصطناعي)</option>
              <option value="sports">Sports & Fitness (الرياضة والألعاب البدنية)</option>
              <option value="arts">Fine Arts & Music (الفنون والمسرح والموسيقى)</option>
              <option value="leadership">Leadership & Public Speaking (القيادة والتناظر)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label={isAr ? 'اسم النادي (بالعربي)' : 'Club Title (Arabic)'}
              value={clubForm.titleAr}
              onChange={(e) => setClubForm({ ...clubForm, titleAr: e.target.value })}
              required
            />
            <Input
              label={isAr ? 'اسم النادي (بالإنجليزي)' : 'Club Title (English)'}
              value={clubForm.titleEn}
              onChange={(e) => setClubForm({ ...clubForm, titleEn: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Textarea
              label={isAr ? 'وصف النادي (بالعربي)' : 'Description (Arabic)'}
              value={clubForm.descAr}
              onChange={(e) => setClubForm({ ...clubForm, descAr: e.target.value })}
            />
            <Textarea
              label={isAr ? 'وصف النادي (بالإنجليزي)' : 'Description (English)'}
              value={clubForm.descEn}
              onChange={(e) => setClubForm({ ...clubForm, descEn: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label={isAr ? 'المواعيد (بالعربي)' : 'Schedule (Arabic)'}
              value={clubForm.scheduleAr}
              onChange={(e) => setClubForm({ ...clubForm, scheduleAr: e.target.value })}
              placeholder="مثال: الأحد - 02:30 م"
            />
            <Input
              label={isAr ? 'المواعيد (بالإنجليزي)' : 'Schedule (English)'}
              value={clubForm.scheduleEn}
              onChange={(e) => setClubForm({ ...clubForm, scheduleEn: e.target.value })}
              placeholder="e.g. Sunday - 02:30 PM"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label={isAr ? 'المكان / القاعة (بالعربي)' : 'Location (Arabic)'}
              value={clubForm.locationAr}
              onChange={(e) => setClubForm({ ...clubForm, locationAr: e.target.value })}
              placeholder="مثال: معمل التكنولوجيا المتقدم"
            />
            <Input
              label={isAr ? 'المكان / القاعة (بالإنجليزي)' : 'Location (English)'}
              value={clubForm.locationEn}
              onChange={(e) => setClubForm({ ...clubForm, locationEn: e.target.value })}
              placeholder="e.g. Advanced Tech Lab"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setClubModalOpen(false)}>
              {isAr ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleSaveClub} variant="gold">
              {isAr ? 'حفظ النادي' : 'Save Club'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
