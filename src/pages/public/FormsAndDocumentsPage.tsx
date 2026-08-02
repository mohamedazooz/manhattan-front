import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  UserCheck,
  Briefcase,
  Download,
  CheckCircle2,
  Circle,
  Search,
  PhoneCall,
  Info,
  ShieldCheck,
  Stethoscope,
  GraduationCap,
  FolderDown,
  ArrowLeft,
  ArrowRight,
  ClipboardList,
} from 'lucide-react';
import { SeoHead } from '../../components/common/SeoHead';
import { useAppLanguage } from '../../i18n';

interface DocumentItem {
  id: string;
  category: 'STUDENT' | 'STAFF';
  subCategory?: string; // e.g. 'GENERAL', 'KG', 'TRANSFER', 'TEACHING', 'ADMIN'
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  requiredStatus: 'REQUIRED' | 'TRANSFER' | 'OPTIONAL';
  downloadUrl?: string;
  downloadName?: string;
  iconType?: 'file' | 'shield' | 'medical' | 'grad' | 'user' | 'briefcase';
}

const DOCUMENT_ITEMS: DocumentItem[] = [
  // --- Student Documents ---
  {
    id: 'stu-birth-cert',
    category: 'STUDENT',
    subCategory: 'GENERAL',
    titleAr: 'شهادة الميلاد الكمبيوتر الرقمية',
    titleEn: 'Digital Computerized Birth Certificate',
    descAr: 'الأصل مصدق عليه + 3 صور ضوئية حديثة واضحة مدون عليها الرقم القومي للطالب.',
    descEn: 'Original certified copy + 3 clear photocopies with the student national ID number.',
    requiredStatus: 'REQUIRED',
    iconType: 'file',
  },
  {
    id: 'stu-parents-id',
    category: 'STUDENT',
    subCategory: 'GENERAL',
    titleAr: 'بطاقة الرقم القومي للأبوين (الأب والأم)',
    titleEn: 'Parents National ID Copies',
    descAr: 'صورة ضوئية طبق الأصل لبطاقة الرقم القومي لكل من الأب والأم سارية المفعول.',
    descEn: 'Valid national ID photocopies for both father and mother.',
    requiredStatus: 'REQUIRED',
    iconType: 'user',
  },
  {
    id: 'stu-photos',
    category: 'STUDENT',
    subCategory: 'GENERAL',
    titleAr: 'الصور الشخصية للطالب',
    titleEn: 'Student Passport Photos',
    descAr: 'عدد 6 صور شخصية حديثة (مقاس 4×6) بخلفية بيضاء مدون عليها اسم الطالب خلف كل صورة.',
    descEn: '6 recent passport photos (4x6) with white background and student name written on back.',
    requiredStatus: 'REQUIRED',
    iconType: 'user',
  },
  {
    id: 'stu-medical-report',
    category: 'STUDENT',
    subCategory: 'GENERAL',
    titleAr: 'البطاقة الصحية والتقرير الطبي الشامل',
    titleEn: 'Health Card & Comprehensive Medical Form',
    descAr: 'البطاقة الصحية المدرسية مختومة من التأمين الصحي ورعاة الصحة المدرسية، بالإضافة لنموذج اللياقة الطبية وتاريخ التطعيمات.',
    descEn: 'Official stamped school health card and health assessment form with vaccination history.',
    requiredStatus: 'REQUIRED',
    downloadUrl: '/forms/MLS-Medical-Form.pdf',
    downloadName: 'نموذج الفحص الطبي - Medical Form.pdf',
    iconType: 'medical',
  },
  {
    id: 'stu-admission-app',
    category: 'STUDENT',
    subCategory: 'GENERAL',
    titleAr: 'استمارة طلب التحاق طالب جديد',
    titleEn: 'New Student Admission Application Form',
    descAr: 'تعبئة استمارة التقديم الرسمية المعتمدة وتوقيع ولي الأمر على كل الإقرارات المرفقة.',
    descEn: 'Complete official application form with guardian signatures on all attached declarations.',
    requiredStatus: 'REQUIRED',
    downloadUrl: '/forms/MLS-Student-Admission-Form.pdf',
    downloadName: 'نموذج الالتحاق بالمدرسة - Admission Form.pdf',
    iconType: 'file',
  },
  {
    id: 'stu-guardian-pledge',
    category: 'STUDENT',
    subCategory: 'GENERAL',
    titleAr: 'إقرار ولي الأمر والالتزام باللوائح',
    titleEn: 'Guardian Pledge & Policy Agreement',
    descAr: 'نموذج موافقة ولي الأمر على اللائحة الداخلية للمدرسة، والالتزام بالمصروفات والسلوك والزي المدرسي.',
    descEn: 'Signed consent agreeing to school code of conduct, tuition terms, and dress code.',
    requiredStatus: 'REQUIRED',
    downloadUrl: '/forms/MLS-Guardian-Pledge.pdf',
    downloadName: 'تعهد ولي الأمر - Guardian Pledge.pdf',
    iconType: 'shield',
  },
  {
    id: 'stu-transfer-cert',
    category: 'STUDENT',
    subCategory: 'TRANSFER',
    titleAr: 'بيان نجاح وشفرة التحويل الإلكتروني',
    titleEn: 'Academic Progress & Electronic Transfer Code',
    descAr: 'للطلاب المحولين: بيان نجاح معتمد من الإدارة التعليمية لشفرة التحويل الإلكتروني بين المدارس.',
    descEn: 'For transfer students: Certified transcript & transfer tracking clearance from educational authority.',
    requiredStatus: 'TRANSFER',
    iconType: 'grad',
  },
  {
    id: 'stu-academic-records',
    category: 'STUDENT',
    subCategory: 'TRANSFER',
    titleAr: 'كشف الدرجات والشهادات الأكاديمية للسنتين السابقتين',
    titleEn: 'Academic Report Cards (Previous 2 Years)',
    descAr: 'أصل أو صورة طبق الأصل من كروت التقييم الأكاديمي والشهادات الدراسية السابقة للمراحل أعلى من KG.',
    descEn: 'Official previous grade report cards and transcripts (for grades Primary 1 and above).',
    requiredStatus: 'TRANSFER',
    iconType: 'grad',
  },

  // --- Staff Documents ---
  {
    id: 'staff-job-app',
    category: 'STAFF',
    subCategory: 'GENERAL',
    titleAr: 'نموذج طلب التوظيف والالتحاق بالعمل',
    titleEn: 'Employment Application Form',
    descAr: 'تعبئة استمارة التوظيف المعتمدة لدى إدارة الموارد البشرية باللغتين العربية والإنجليزية.',
    descEn: 'Fully completed official employment application for administrative & academic hiring.',
    requiredStatus: 'REQUIRED',
    downloadUrl: '/forms/MLS-Staff-Employment-Application.pdf',
    downloadName: 'نموذج طلب التوظيف - Staff Application.pdf',
    iconType: 'briefcase',
  },
  {
    id: 'staff-degree-cert',
    category: 'STAFF',
    subCategory: 'GENERAL',
    titleAr: 'أصل المؤهل الدراسي والشهادات الأكاديمية',
    titleEn: 'University Degree & Educational Certificates',
    descAr: 'أصل شهادة التخرج (مؤهل عالي مناسب) + الدبلوم التربوي أو شهادات الدراسات العليا للمعلمين.',
    descEn: 'Original Bachelor/Master degree certificate plus pedagogical diploma for teaching faculty.',
    requiredStatus: 'REQUIRED',
    iconType: 'grad',
  },
  {
    id: 'staff-national-id',
    category: 'STAFF',
    subCategory: 'GENERAL',
    titleAr: 'بطاقة الرقم القومي سارية المفعول',
    titleEn: 'Valid National Identification Card',
    descAr: 'صورة ضوئية حديثة لبطاقة الرقم القومي (سارية) + الأصل للاطلاع.',
    descEn: 'Clear photocopy of valid national ID + original for verification.',
    requiredStatus: 'REQUIRED',
    iconType: 'user',
  },
  {
    id: 'staff-criminal-record',
    category: 'STAFF',
    subCategory: 'GENERAL',
    titleAr: 'صحيفة الحالة الجنائية (فيش وتشبيه)',
    titleEn: 'Criminal Record Clearance Certificate',
    descAr: 'أصل صحيفة الحالة الجنائية حديثة موجهة باسم "مدرسة مانهاتن اللغات".',
    descEn: 'Recent official criminal record check issued specifically to Manhattan Language School.',
    requiredStatus: 'REQUIRED',
    iconType: 'shield',
  },
  {
    id: 'staff-military-cert',
    category: 'STAFF',
    subCategory: 'GENERAL',
    titleAr: 'شهادة التجنيد أو الموقف التأجيلي (للذكور)',
    titleEn: 'Military Service Status Certificate (Male Applicants)',
    descAr: 'أصل شهادة تأدية الخدمة العسكرية أو الإعفاء النهائي/المؤقت سارية المفعول.',
    descEn: 'Original military completion or legal exemption certificate for male applicants.',
    requiredStatus: 'REQUIRED',
    iconType: 'file',
  },
  {
    id: 'staff-medical-fitness',
    category: 'STAFF',
    subCategory: 'GENERAL',
    titleAr: 'شهادة اللياقة الطبية وكشف القوميون الطبي',
    titleEn: 'Medical Fitness Certificate & Health Check',
    descAr: 'شهادة لياقة طبية من مستشفى حكومي أو كشف القوميون الطبي المعتمد لخلو العاهات والأمراض السارية.',
    descEn: 'Official medical fitness clearance issued by authorized healthcare institution.',
    requiredStatus: 'REQUIRED',
    downloadUrl: '/forms/MLS-Staff-Medical-Clearance.pdf',
    downloadName: 'نموذج الفحص الطبي للموظفين - Staff Medical.pdf',
    iconType: 'medical',
  },
  {
    id: 'staff-insurance-form',
    category: 'STAFF',
    subCategory: 'GENERAL',
    titleAr: 'كعب العمل والبرينت التأميني (نموذج 1)',
    titleEn: 'Work Permit (Kaeb Amall) & Social Security Printout',
    descAr: 'كعب العمل الصادر من مكتب العمل التابع له سكن الموظف + الرقم التأميني المعتمد.',
    descEn: 'Official labor office work permit stub and insurance registration printout.',
    requiredStatus: 'REQUIRED',
    iconType: 'file',
  },
  {
    id: 'staff-experience-letters',
    category: 'STAFF',
    subCategory: 'GENERAL',
    titleAr: 'شهادات الخبرة السابقة وإخلاء الطرف',
    titleEn: 'Experience Certificates & Clearance Letters',
    descAr: 'شهادات الخبرة العملية السابقة في جهات التعليم أو الإدارة وتوصيات جهات العمل السابقة.',
    descEn: 'Letters of recommendation and prior work experience certificates.',
    requiredStatus: 'OPTIONAL',
    iconType: 'briefcase',
  },
  {
    id: 'staff-photos',
    category: 'STAFF',
    subCategory: 'GENERAL',
    titleAr: 'الصور الشخصية للموظف',
    titleEn: 'Employee Personal Photos',
    descAr: 'عدد 6 صور شخصية حديثة (مقاس 4×6) بخلفية بيضاء.',
    descEn: '6 recent personal photographs with plain white background.',
    requiredStatus: 'REQUIRED',
    iconType: 'user',
  },
];

export function FormsAndDocumentsPage() {
  const lang = useAppLanguage();
  const isAr = lang === 'ar';

  const [activeTab, setActiveTab] = useState<'STUDENT' | 'STAFF' | 'DOWNLOADS'>('STUDENT');
  const [searchQuery, setSearchQuery] = useState('');
  const [subFilter, setSubFilter] = useState<'ALL' | 'REQUIRED' | 'TRANSFER' | 'OPTIONAL'>('ALL');
  
  // Interactive checklist stored in localStorage
  const [checkedIds, setCheckedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('mls_checked_docs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('mls_checked_docs', JSON.stringify(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  };

  const filteredDocs = useMemo(() => {
    return DOCUMENT_ITEMS.filter((item) => {
      if (activeTab === 'DOWNLOADS') {
        if (!item.downloadUrl) return false;
      } else if (item.category !== activeTab) {
        return false;
      }

      if (subFilter !== 'ALL' && item.requiredStatus !== subFilter) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = (isAr ? item.titleAr : item.titleEn).toLowerCase().includes(q);
        const descMatch = (isAr ? item.descAr : item.descEn).toLowerCase().includes(q);
        return titleMatch || descMatch;
      }

      return true;
    });
  }, [activeTab, subFilter, searchQuery, isAr]);

  // Progress stats
  const currentTabDocs = useMemo(() => {
    return DOCUMENT_ITEMS.filter((d) => (activeTab === 'DOWNLOADS' ? !!d.downloadUrl : d.category === activeTab));
  }, [activeTab]);

  const completedCount = useMemo(() => {
    return currentTabDocs.filter((d) => checkedIds.includes(d.id)).length;
  }, [currentTabDocs, checkedIds]);

  const progressPercentage = currentTabDocs.length > 0 ? Math.round((completedCount / currentTabDocs.length) * 100) : 0;

  const renderIcon = (type?: string) => {
    switch (type) {
      case 'shield':
        return <ShieldCheck className="h-6 w-6 text-primary dark:text-amber-400" />;
      case 'medical':
        return <Stethoscope className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />;
      case 'grad':
        return <GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-400" />;
      case 'user':
        return <UserCheck className="h-6 w-6 text-purple-600 dark:text-purple-400" />;
      case 'briefcase':
        return <Briefcase className="h-6 w-6 text-amber-600 dark:text-amber-400" />;
      default:
        return <FileText className="h-6 w-6 text-primary dark:text-amber-400" />;
    }
  };

  const renderStatusBadge = (status: DocumentItem['requiredStatus']) => {
    if (status === 'REQUIRED') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800">
          {isAr ? 'مستند إلزامي' : 'Mandatory'}
        </span>
      );
    }
    if (status === 'TRANSFER') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          {isAr ? 'عند التحويل فقط' : 'For Transfers'}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
        {isAr ? 'مستند داعم (إختياري)' : 'Optional'}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 transition-colors duration-300">
      <SeoHead
        title={isAr ? 'النماذج والمستندات الرسمية | مدرسة مانهاتن اللغات' : 'Forms & Official Documents | Manhattan Language School'}
        description={
          isAr
            ? 'دليل النماذج والمستندات الرسمية وأوراق القبول المطلوبة لالتحاق الطلاب الجدد وتوظيف الكادر التعليمي والإداري.'
            : 'Official forms, admission documents, and application requirements for student enrollment and staff recruitment.'
        }
      />

      <div className="mx-auto max-w-6xl px-4 space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 dark:bg-amber-400/10 text-primary dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
            <ClipboardList className="h-4 w-4" />
            <span>{isAr ? 'دليل المستندات والأوراق الرسمية' : 'Official Document Center'}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isAr ? 'النماذج والمستندات المطلوبة' : 'Forms & Required Documents'}
          </h1>

          <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            {isAr
              ? 'تجدون هنا قائمة كافة المستندات الرسمية وأوراق القبول والالتحاق المطلوبة للطلاب الجدد، بالإضافة لمسوغات التعيين للكادر التعليمي والإداري مع إمكانية تحميل النماذج الرسمية.'
              : 'Find complete checklists of required admission documents for new students, hiring credentials for faculty and staff, and downloadable official application forms.'}
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-3 p-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-2xl mx-auto">
          <button
            onClick={() => setActiveTab('STUDENT')}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 ${
              activeTab === 'STUDENT'
                ? 'bg-primary text-white shadow-md dark:bg-amber-500 dark:text-slate-950'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            <span>{isAr ? 'مستندات قبول الطلاب' : 'Student Admission'}</span>
          </button>

          <button
            onClick={() => setActiveTab('STAFF')}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 ${
              activeTab === 'STAFF'
                ? 'bg-primary text-white shadow-md dark:bg-amber-500 dark:text-slate-950'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Briefcase className="h-4 w-4" />
            <span>{isAr ? 'مسوغات توظيف الموظفين' : 'Staff & Employment'}</span>
          </button>

          <button
            onClick={() => setActiveTab('DOWNLOADS')}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 ${
              activeTab === 'DOWNLOADS'
                ? 'bg-primary text-white shadow-md dark:bg-amber-500 dark:text-slate-950'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FolderDown className="h-4 w-4" />
            <span>{isAr ? 'النماذج المطبوعة' : 'Downloadable Forms'}</span>
          </button>
        </div>

        {/* Progress Tracker Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-start">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-center md:justify-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>{isAr ? 'متابع تجهيز الأوراق والمستندات' : 'Preparation Checklist Progress'}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isAr
                ? `قمت بتجهيز ${completedCount} من أصل ${currentTabDocs.length} مستند مطلوب.`
                : `You have prepared ${completedCount} out of ${currentTabDocs.length} required items.`}
            </p>
          </div>

          <div className="w-full md:w-64 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>{isAr ? 'نسبة الجاهزية' : 'Readiness'}</span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'بحث في المستندات والنماذج...' : 'Search documents...'}
              className="w-full ps-9 pe-4 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-amber-400"
            />
          </div>

          {/* Sub Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSubFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                subFilter === 'ALL'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {isAr ? 'الكل' : 'All'}
            </button>
            <button
              onClick={() => setSubFilter('REQUIRED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                subFilter === 'REQUIRED'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {isAr ? 'مستندات إجبارية' : 'Mandatory'}
            </button>
            {activeTab === 'STUDENT' && (
              <button
                onClick={() => setSubFilter('TRANSFER')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  subFilter === 'TRANSFER'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {isAr ? 'للتحويل فقط' : 'Transfers Only'}
              </button>
            )}
          </div>
        </div>

        {/* Documents Grid */}
        {filteredDocs.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Info className="h-10 w-10 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
              {isAr ? 'لا توجد مستندات تطابق شروط البحث الحالية.' : 'No documents match your search criteria.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredDocs.map((doc) => {
              const isChecked = checkedIds.includes(doc.id);
              return (
                <div
                  key={doc.id}
                  className={`group relative bg-white dark:bg-slate-900 rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between ${
                    isChecked
                      ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/20 dark:bg-emerald-950/10'
                      : 'border-slate-200 dark:border-slate-800 hover:border-primary/40 dark:hover:border-amber-400/40 hover:shadow-md'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header: Icon + Checklist Checkbox + Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:scale-105 transition-transform duration-200">
                          {renderIcon(doc.iconType)}
                        </div>
                        <div>
                          {renderStatusBadge(doc.requiredStatus)}
                        </div>
                      </div>

                      {/* Interactive Checkbox */}
                      <button
                        onClick={() => toggleCheck(doc.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isChecked
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                        title={isAr ? 'تحديد كتم تجهيز هذا المستند' : 'Toggle item checked status'}
                      >
                        {isChecked ? (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            <span>{isAr ? 'تم التجهيز' : 'Ready'}</span>
                          </>
                        ) : (
                          <>
                            <Circle className="h-4 w-4 text-slate-400" />
                            <span>{isAr ? 'تحديد كجاهز' : 'Mark Ready'}</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Content Title & Description */}
                    <div className="space-y-1.5">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                        {isAr ? doc.titleAr : doc.titleEn}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {isAr ? doc.descAr : doc.descEn}
                      </p>
                    </div>
                  </div>

                  {/* Action / Download Section */}
                  {doc.downloadUrl && (
                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                        {isAr ? 'نموذج رسمى جاهز للطباعة' : 'Printable Template'}
                      </span>
                      <a
                        href={doc.downloadUrl}
                        download={doc.downloadName || true}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary-dark text-white dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-500 transition-colors shadow-sm"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>{isAr ? 'تحميل النموذج' : 'Download Form'}</span>
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* CTA Contact & Submission Info Box */}
        <div className="bg-gradient-to-r from-primary-dark via-primary to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            <div className="lg:col-span-2 space-y-3">
              <span className="inline-block text-amber-400 text-xs font-extrabold uppercase tracking-wider">
                {isAr ? 'ملاحظات وتوجيهات الهيئة الإدارية' : 'Important Submission Guidance'}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold leading-snug">
                {isAr ? 'هل لديك استفسار حول ملف القبول أو مسوغات التعيين؟' : 'Questions regarding document submission?'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                {isAr
                  ? 'يرجى تقديم أصل المستندات مع الصور المطلوبة مباشرة لمكتب شؤون الطلاب والقبول أو إدارة الموارد البشرية بالجامعة/المدرسة خلال مواعيد العمل الرسمية.'
                  : 'Please submit original documents along with required photocopies to the Admissions Office or HR Department during official working hours.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
              <Link
                to="/admissions"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-extrabold bg-amber-400 hover:bg-amber-500 text-slate-950 transition-colors shadow-md"
              >
                <span>{isAr ? 'تقديم طلب قبول جديد' : 'Submit Admission Request'}</span>
                {isAr ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors"
              >
                <PhoneCall className="h-4 w-4 text-amber-400" />
                <span>{isAr ? 'التواصل مع قسم القبول' : 'Contact Admissions'}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
