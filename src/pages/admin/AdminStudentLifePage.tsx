import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cmsApi } from '../../api';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { DataTable, Modal } from '../../components/ui/DataTable';
import { PageHeader } from '../../components/ui/Badge';
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
      titleEn: 'Robotics & AI Club',
      descAr: 'تصميم وبرمجة الروبوتات الذكية والمشاركة في المسابقات التكنولوجية المحلية والإقليمية.',
      descEn: 'Design and program smart robots, competing in national and regional tech challenges.',
      scheduleAr: 'الأحد والأربعاء - 02:30 م',
      scheduleEn: 'Sun & Wed - 02:30 PM',
      locationAr: 'معمل التكنولوجيا المتقدم',
      locationEn: 'Advanced Tech Lab',
    },
    {
      id: 'football',
      category: 'sports',
      titleAr: 'أكاديمية كرة القدم والرياضات الميدانية',
      titleEn: 'Football & Field Sports Academy',
      descAr: 'تدريبات للياقة البدنية والمهارات التكتيكية تحت إشراف كادر مدربين معتمدين.',
      descEn: 'Fitness training and tactical skills led by certified professional sports coaches.',
      scheduleAr: 'الاثنين والخميس - 03:00 م',
      scheduleEn: 'Mon & Thu - 03:00 PM',
      locationAr: 'الملعب الرياضي الرئيسي',
      locationEn: 'Main Sports Turf',
    },
    {
      id: 'fine-arts',
      category: 'arts',
      titleAr: 'مرسم الفنون التشكيلية والتصميم',
      titleEn: 'Fine Arts & Design Studio',
      descAr: 'تنمية مهارات الرسم والترميم والتصميم الرقمي وإقامة المعارض السنوية للطلاب.',
      descEn: 'Developing painting, sculpture, and digital art skills with annual student gallery exhibitions.',
      scheduleAr: 'الثلاثاء - 02:30 م',
      scheduleEn: 'Tuesday - 02:30 PM',
      locationAr: 'استوديو الفنون الجميل',
      locationEn: 'Arts & Crafts Studio',
    },
    {
      id: 'mun',
      category: 'leadership',
      titleAr: 'نموذج الأمم المتحدة والقيادة الشابة (MUN)',
      titleEn: 'Model United Nations (MUN)',
      descAr: 'تدريب الطلاب على التناظر والدبلوماسية وحل القضايا العالمية وصقل مهارات الخطابة.',
      descEn: 'Training students in debate, diplomacy, resolving global issues, and public speaking.',
      scheduleAr: 'الأربعاء - 03:00 م',
      scheduleEn: 'Wednesday - 03:00 PM',
      locationAr: 'قاعة المؤتمرات الرئيسية',
      locationEn: 'Main Conference Hall',
    },
  ],
  pillars: [
    {
      id: 'p-1',
      titleAr: 'الأنشطة الميدانية والبطولات الرياضية',
      titleEn: 'Athletics & Sports Championships',
      descAr: 'برامج رياضية متكاملة تشمل الملاعب المكشوفة والصالات المغطاة لبناء الجسم والتفكير السليم.',
      descEn: 'Comprehensive physical education and competitive leagues developing health and teamwork.',
    },
    {
      id: 'p-2',
      titleAr: 'الابتكار العلمي والبرمجة',
      titleEn: 'STEM Innovation & Coding',
      descAr: 'معامل روبوتات وذكاء اصطناعي تفاعلية تتيح لكل طالب ابتكار المشاريع وحل المشكلات.',
      descEn: 'Hands-on robotics and coding labs sparking curiosity and scientific exploration.',
    },
    {
      id: 'p-3',
      titleAr: 'الفنون والإبداع البصري',
      titleEn: 'Arts & Creative Expression',
      descAr: 'مرسم فني ومسرح مجهز لاستكشاف المواهب التمثيلية والموسيقية والتشكيلية.',
      descEn: 'Dedicated studios and auditoriums celebrating student theatrical, musical, and visual arts.',
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
        title={isAr ? 'إدارة صفحة حياة الطالب (Student Life)' : 'Student Life Page Management'}
        subtitle={
          isAr
            ? 'التحكم في أنشطة الطلاب، النوادي الرياضية والتكنولوجية، الإحصائيات، والركائز الأساسية للحياة الطلابية بمدرسة مانهاتن.'
            : 'Manage student clubs, sports academies, STEM activities, stats, and campus life pillars.'
        }
      />

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
