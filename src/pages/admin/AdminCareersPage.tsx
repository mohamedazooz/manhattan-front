import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Briefcase,
  Plus,
  Edit2,
  Eye,
  Users,
  MapPin,
  CheckCircle,
  XCircle,
  X,
  Search,
  Download,
  FileText,
  ExternalLink,
  GraduationCap,
  Award,
  Mail,
  Phone,
  Calendar,
  Filter,
} from 'lucide-react';
import { careersApi } from '../../api';
import { Button } from '../../components/ui/Button';
import { StatusBadge, LoadingSpinner, PageHeader } from '../../components/ui/Badge';
import { DataTable } from '../../components/ui/DataTable';
import { useAppLanguage } from '../../i18n';
import type { Job, JobApplication } from '../../types';
import { mediaUrl } from '../../lib/utils';

export function AdminCareersPage() {
  const lang = useAppLanguage();
  const isAr = lang === 'ar';
  const queryClient = useQueryClient();

  // Active Tab: 'JOBS' or 'APPLICANTS'
  const [activeTab, setActiveTab] = useState<'JOBS' | 'APPLICANTS'>('JOBS');

  // Job Search & Filters
  const [jobSearchTerm, setJobSearchTerm] = useState('');
  const [jobStatusFilter, setJobStatusFilter] = useState<'ALL' | 'OPEN' | 'CLOSED'>('ALL');

  // Applicants Search & Filters
  const [appSearchTerm, setAppSearchTerm] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState<string>('ALL');
  const [appJobFilter, setAppJobFilter] = useState<string>('ALL');

  // Create / Edit Job Modal State
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [savingJob, setSavingJob] = useState(false);

  // Applicant Detail Modal State
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [isAppDetailModalOpen, setIsAppDetailModalOpen] = useState(false);
  const [updatingAppStatus, setUpdatingAppStatus] = useState(false);

  // Job Form State
  const [jobForm, setJobForm] = useState({
    title: '',
    titleAr: '',
    location: 'Manhattan School Campus, Cairo',
    locationAr: 'مدرسة منهاتن للغات، القاهرة',
    employmentType: 'FULL_TIME',
    status: 'OPEN',
    description: '',
    descriptionAr: '',
    requirements: '',
    requirementsAr: '',
  });

  // Queries
  const { data: jobs = [], isLoading: isLoadingJobs } = useQuery({
    queryKey: ['jobs-admin'],
    queryFn: () => careersApi.admin().then((r) => r.data),
  });

  const { data: allApplications = [], isLoading: isLoadingApps } = useQuery({
    queryKey: ['job-apps-all'],
    queryFn: () => careersApi.allApplications().then((r) => r.data),
  });

  // Metrics
  const totalJobs = jobs.length;
  const openJobs = jobs.filter((j: Job) => j.status === 'OPEN').length;
  const closedJobs = jobs.filter((j: Job) => j.status === 'CLOSED').length;
  const totalApps = allApplications.length;
  const submittedApps = allApplications.filter(
    (a: JobApplication) => a.status === 'SUBMITTED' || a.status === 'REVIEWING'
  ).length;

  // Handlers for Jobs
  const openCreateJobModal = () => {
    setEditingJob(null);
    setJobForm({
      title: '',
      titleAr: '',
      location: 'Manhattan School Campus, Cairo',
      locationAr: 'مدرسة منهاتن للغات، القاهرة',
      employmentType: 'FULL_TIME',
      status: 'OPEN',
      description: '',
      descriptionAr: '',
      requirements: '',
      requirementsAr: '',
    });
    setIsJobModalOpen(true);
  };

  const openEditJobModal = (job: Job) => {
    setEditingJob(job);
    setJobForm({
      title: job.title || '',
      titleAr: job.titleAr || '',
      location: job.location || '',
      locationAr: job.locationAr || '',
      employmentType: job.employmentType || 'FULL_TIME',
      status: job.status || 'OPEN',
      description: job.description || '',
      descriptionAr: job.descriptionAr || '',
      requirements: job.requirements || '',
      requirementsAr: job.requirementsAr || '',
    });
    setIsJobModalOpen(true);
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingJob(true);
    try {
      if (editingJob) {
        await careersApi.update(editingJob.id, jobForm);
      } else {
        await careersApi.create(jobForm);
      }
      queryClient.invalidateQueries({ queryKey: ['jobs-admin'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setIsJobModalOpen(false);
    } catch (err) {
      console.error('Failed to save job', err);
      alert(isAr ? 'حدث خطأ أثناء حفظ الوظيفة' : 'Failed to save job position');
    } finally {
      setSavingJob(false);
    }
  };

  const handleToggleJobStatus = async (job: Job) => {
    const newStatus = job.status === 'OPEN' ? 'CLOSED' : 'OPEN';
    try {
      await careersApi.updateStatus(job.id, newStatus);
      queryClient.invalidateQueries({ queryKey: ['jobs-admin'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    } catch (err) {
      console.error(err);
      alert(isAr ? 'فشل تغيير حالة الوظيفة' : 'Failed to update job status');
    }
  };

  // Handlers for Application Status
  const handleAppStatusChange = async (appId: string, newStatus: string) => {
    setUpdatingAppStatus(true);
    try {
      await careersApi.updateApplicationStatus(appId, newStatus);
      queryClient.invalidateQueries({ queryKey: ['job-apps-all'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['my-job-applications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp({ ...selectedApp, status: newStatus });
      }
    } catch (err: any) {
      console.error(err);
      const serverMsg = err?.response?.data?.message;
      const errorText = Array.isArray(serverMsg) ? serverMsg.join(', ') : serverMsg;
      alert(errorText || (isAr ? 'فشل تحديث حالة الطلب' : 'Failed to update application status'));
    } finally {
      setUpdatingAppStatus(false);
    }
  };

  const openAppDetailsModal = (app: JobApplication) => {
    setSelectedApp(app);
    setIsAppDetailModalOpen(true);
  };

  const handleViewApplicantsForJob = (jobId: string) => {
    setAppJobFilter(jobId);
    setActiveTab('APPLICANTS');
  };

  // Filters
  const filteredJobs = jobs.filter((job: Job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
      (job.titleAr && job.titleAr.toLowerCase().includes(jobSearchTerm.toLowerCase())) ||
      job.location.toLowerCase().includes(jobSearchTerm.toLowerCase());
    const matchesStatus = jobStatusFilter === 'ALL' || job.status === jobStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredApplications = allApplications.filter((app: JobApplication) => {
    const jobTitle = app.job ? (isAr && app.job.titleAr ? app.job.titleAr : app.job.title) : '';
    const matchesSearch =
      app.fullName.toLowerCase().includes(appSearchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(appSearchTerm.toLowerCase()) ||
      app.phone.includes(appSearchTerm) ||
      jobTitle.toLowerCase().includes(appSearchTerm.toLowerCase());

    const matchesStatus = appStatusFilter === 'ALL' || app.status === appStatusFilter;
    const matchesJob = appJobFilter === 'ALL' || app.job?.id === appJobFilter || (app as any).jobId === appJobFilter;

    return matchesSearch && matchesStatus && matchesJob;
  });

  if (isLoadingJobs || isLoadingApps) return <LoadingSpinner />;

  return (
    <div className="space-y-8 p-2 sm:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title={isAr ? 'إدارة التوظيف والوظائف' : 'Careers & Job Management'}
          subtitle={
            isAr
              ? 'إدارة وظائف المدرسة الشاغرة، تعديل المسميات والشروط، ومراجعة سير المتقدمين ومستنداتهم.'
              : 'Post vacancies, edit details, review applications, and manage uploaded resumes.'
          }
        />
        <Button onClick={openCreateJobModal} showArrow className="shadow-lg py-2.5 px-6">
          <Plus className="w-5 h-5 mr-1" />
          {isAr ? 'إضافة وظيفة جديدة' : 'Post New Job'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{totalJobs}</div>
            <div className="text-xs text-slate-500 font-medium">{isAr ? 'إجمالي الوظائف' : 'Total Job Positions'}</div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{openJobs}</div>
            <div className="text-xs text-slate-500 font-medium">{isAr ? 'الوظائف المتاحة حالياً' : 'Open Positions'}</div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{closedJobs}</div>
            <div className="text-xs text-slate-500 font-medium">{isAr ? 'الوظائف المغلقة' : 'Closed Vacancies'}</div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{totalApps}</div>
            <div className="text-xs text-slate-500 font-medium">
              {isAr ? `إجمالي المتقدمين (${submittedApps} قيد المراجعة)` : `Total Applicants (${submittedApps} pending)`}
            </div>
          </div>
        </div>
      </div>

      {/* Main Section Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('JOBS')}
          className={`flex items-center gap-2 px-6 py-3 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'JOBS'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>{isAr ? 'الوظائف المعروضة والتعديل' : 'Job Openings & Management'}</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold">
            {jobs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('APPLICANTS')}
          className={`flex items-center gap-2 px-6 py-3 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'APPLICANTS'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{isAr ? 'طلبات المتقدمين والسير الذاتية' : 'Applicants & Resumes'}</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-extrabold">
            {allApplications.length}
          </span>
        </button>
      </div>

      {/* TAB 1: JOBS MANAGEMENT */}
      {activeTab === 'JOBS' && (
        <div className="space-y-6">
          {/* Search & Status Filter */}
          <div className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={isAr ? 'بحث بمسمى الوظيفة أو المكان...' : 'Search position title or location...'}
                value={jobSearchTerm}
                onChange={(e) => setJobSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={jobStatusFilter}
                onChange={(e) => setJobStatusFilter(e.target.value as any)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold"
              >
                <option value="ALL">{isAr ? 'كل حالات الوظائف' : 'All Job Statuses'}</option>
                <option value="OPEN">{isAr ? 'المفتوحة فقط' : 'Open Only'}</option>
                <option value="CLOSED">{isAr ? 'المغلقة فقط' : 'Closed Only'}</option>
              </select>
            </div>
          </div>

          {/* Jobs Table */}
          <div className="glass-card rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <DataTable
              data={filteredJobs}
              columns={[
                {
                  key: 'title',
                  header: isAr ? 'المسمى الوظيفي' : 'Job Position',
                  render: (r: Job) => (
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-base">
                        {isAr && r.titleAr ? r.titleAr : r.title}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{isAr && r.locationAr ? r.locationAr : r.location}</span>
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'type',
                  header: isAr ? 'نوع الدوام' : 'Employment Type',
                  render: (r: Job) => (
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold uppercase">
                      {r.employmentType.replace('_', ' ')}
                    </span>
                  ),
                },
                {
                  key: 'applicantsCount',
                  header: isAr ? 'المتقدمون' : 'Applicants',
                  render: (r: Job) => {
                    const count = (r as any)._count?.applications ?? allApplications.filter((a: any) => a.jobId === r.id || a.job?.id === r.id).length;
                    return (
                      <button
                        onClick={() => handleViewApplicantsForJob(r.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-bold hover:bg-purple-100 transition-colors"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>{count} {isAr ? 'متقدم' : 'candidates'}</span>
                      </button>
                    );
                  },
                },
                {
                  key: 'status',
                  header: isAr ? 'حالة الوظيفة' : 'Status',
                  render: (r: Job) => <StatusBadge status={r.status} />,
                },
                {
                  key: 'actions',
                  header: isAr ? 'الإجراءات والتعديل' : 'Actions',
                  render: (r: Job) => (
                    <div className="flex items-center gap-2">
                      <button
                        title={isAr ? 'تعديل بيانات الوظيفة' : 'Edit Job Position'}
                        onClick={() => openEditJobModal(r)}
                        className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 hover:bg-amber-100 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        title={isAr ? 'عرض طلبات المتقدمين لهذه الوظيفة' : 'View Job Applicants'}
                        onClick={() => handleViewApplicantsForJob(r.id)}
                        className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <Button
                        variant="secondary"
                        className="py-1 px-3 text-xs"
                        onClick={() => handleToggleJobStatus(r)}
                      >
                        {r.status === 'OPEN' ? (isAr ? 'إغلاق التقديم' : 'Close') : (isAr ? 'فتح التقديم' : 'Open')}
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </div>
      )}

      {/* TAB 2: APPLICANTS & CVs MANAGEMENT */}
      {activeTab === 'APPLICANTS' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={isAr ? 'بحث باسم المتقدم، البريد، الهاتف، الوظيفة...' : 'Search by name, email, phone, job...'}
                value={appSearchTerm}
                onChange={(e) => setAppSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Filter by Job */}
            <div className="w-full md:w-auto">
              <select
                value={appJobFilter}
                onChange={(e) => setAppJobFilter(e.target.value)}
                className="w-full md:w-auto px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold"
              >
                <option value="ALL">{isAr ? 'جميع الوظائف' : 'All Positions'}</option>
                {jobs.map((job: Job) => (
                  <option key={job.id} value={job.id}>
                    {isAr && job.titleAr ? job.titleAr : job.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Status */}
            <div className="w-full md:w-auto">
              <select
                value={appStatusFilter}
                onChange={(e) => setAppStatusFilter(e.target.value)}
                className="w-full md:w-auto px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold"
              >
                <option value="ALL">{isAr ? 'كل حالات الطلبات' : 'All Application Statuses'}</option>
                <option value="SUBMITTED">{isAr ? 'تم التقديم (SUBMITTED)' : 'SUBMITTED'}</option>
                <option value="REVIEWING">{isAr ? 'قيد المراجعة (REVIEWING)' : 'REVIEWING'}</option>
                <option value="SHORTLISTED">{isAr ? 'القائمة القصيرة (SHORTLISTED)' : 'SHORTLISTED'}</option>
                <option value="ACCEPTED">{isAr ? 'مقبول (ACCEPTED)' : 'ACCEPTED'}</option>
                <option value="REJECTED">{isAr ? 'مرفوض (REJECTED)' : 'REJECTED'}</option>
                <option value="DRAFT">{isAr ? 'مسودة (DRAFT)' : 'DRAFT'}</option>
              </select>
            </div>
          </div>

          {/* Applicants Table */}
          <div className="glass-card rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            {filteredApplications.length > 0 ? (
              <DataTable
                data={filteredApplications}
                columns={[
                  {
                    key: 'applicant',
                    header: isAr ? 'المتقدم' : 'Candidate',
                    render: (app: JobApplication) => (
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-base">{app.fullName}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {app.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {app.phone}
                          </span>
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: 'jobTitle',
                    header: isAr ? 'الوظيفة المتقدم لها' : 'Applied Position',
                    render: (app: JobApplication) => {
                      const title = app.job ? (isAr && app.job.titleAr ? app.job.titleAr : app.job.title) : '-';
                      return (
                        <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                          {title}
                        </div>
                      );
                    },
                  },
                  {
                    key: 'experience',
                    header: isAr ? 'الخبرة والمؤهل' : 'Exp & Qualification',
                    render: (app: JobApplication) => (
                      <div className="text-xs text-slate-700 dark:text-slate-300">
                        <div>
                          <span className="font-bold text-primary">{app.yearsExperience || 0}</span> {isAr ? 'سنوات خبرة' : 'yrs exp'}
                        </div>
                        <div className="text-slate-500 font-medium">{app.highestQualification || '-'}</div>
                      </div>
                    ),
                  },
                  {
                    key: 'documents',
                    header: isAr ? 'السيرة الذاتية والمستندات' : 'CV & Documents',
                    render: (app: JobApplication) => (
                      <div className="flex flex-wrap gap-1.5">
                        {app.documents && app.documents.length > 0 ? (
                          app.documents.map((doc) => (
                            <a
                              key={doc.id}
                              href={mediaUrl(doc.fileUrl)}
                              target="_blank"
                              rel="noreferrer"
                              title={doc.fileName || doc.documentType}
                              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-100 transition-colors border border-blue-200 dark:border-blue-800"
                            >
                              <FileText className="w-3.5 h-3.5 shrink-0" />
                              <span className="max-w-[120px] truncate">{doc.fileName || doc.documentType}</span>
                              <ExternalLink className="w-3 h-3 opacity-70 shrink-0" />
                            </a>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">{isAr ? 'لا توجد مرفقات' : 'No CV uploaded'}</span>
                        )}
                      </div>
                    ),
                  },
                  {
                    key: 'status',
                    header: isAr ? 'حالة الطلب' : 'Status',
                    render: (app: JobApplication) => (
                      <select
                        value={app.status}
                        onChange={(e) => handleAppStatusChange(app.id, e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                      >
                        <option value="DRAFT">DRAFT</option>
                        <option value="SUBMITTED">SUBMITTED</option>
                        <option value="REVIEWING">REVIEWING</option>
                        <option value="SHORTLISTED">SHORTLISTED</option>
                        <option value="ACCEPTED">ACCEPTED</option>
                        <option value="REJECTED">REJECTED</option>
                      </select>
                    ),
                  },
                  {
                    key: 'actions',
                    header: isAr ? 'التفاصيل' : 'Details',
                    render: (app: JobApplication) => (
                      <Button
                        variant="secondary"
                        className="py-1.5 px-3 text-xs"
                        onClick={() => openAppDetailsModal(app)}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        {isAr ? 'معاينة الطلب' : 'View Full Details'}
                      </Button>
                    ),
                  },
                ]}
              />
            ) : (
              <div className="text-center py-16 text-slate-500">
                <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <p className="font-bold text-lg">{isAr ? 'لا توجد طلبات متقدمين مطابقة للبحث' : 'No candidate applications found'}</p>
                <p className="text-xs text-slate-400 mt-1">{isAr ? 'جرب تغيير خيارات التصفية والبحث' : 'Try adjusting your search filters'}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE / EDIT JOB MODAL */}
      {isJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs overflow-hidden">
          <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    {editingJob
                      ? isAr
                        ? 'تعديل بيانات الوظيفة'
                        : 'Edit Job Vacancy'
                      : isAr
                      ? 'إضافة وظيفة جديدة'
                      : 'Post New Job Vacancy'}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {isAr
                      ? 'قم بملء كافة تفاصيل وشروط الوظيفة'
                      : 'Fill in job details and requirements'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsJobModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveJob} className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-5">
              {/* Section 1: Basic Titles and Locations */}
              <div className="bg-slate-50/60 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {isAr ? 'بيانات الوظيفة العامة' : 'General Position Details'}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Job Title (English) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Senior English Teacher"
                      value={jobForm.title}
                      onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      المسمى الوظيفي (بالعربية)
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: معلم لغة إنجليزية أول"
                      value={jobForm.titleAr}
                      onChange={(e) => setJobForm({ ...jobForm, titleAr: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Location (English) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Manhattan School Campus, Cairo"
                      value={jobForm.location}
                      onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      الموقع (بالعربية)
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: مدرسة منهاتن للغات، القاهرة"
                      value={jobForm.locationAr}
                      onChange={(e) => setJobForm({ ...jobForm, locationAr: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isAr ? 'نوع دوام الوظيفة' : 'Employment Type'}
                    </label>
                    <select
                      value={jobForm.employmentType}
                      onChange={(e) => setJobForm({ ...jobForm, employmentType: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold"
                    >
                      <option value="FULL_TIME">FULL_TIME (دوام كامل)</option>
                      <option value="PART_TIME">PART_TIME (دوام جزئي)</option>
                      <option value="CONTRACT">CONTRACT (عقد)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isAr ? 'حالة الوظيفة' : 'Status'}
                    </label>
                    <select
                      value={jobForm.status}
                      onChange={(e) => setJobForm({ ...jobForm, status: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold"
                    >
                      <option value="OPEN">OPEN (مفتوحة)</option>
                      <option value="CLOSED">CLOSED (مغلقة)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Descriptions & Requirements */}
              <div className="bg-slate-50/60 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {isAr ? 'تفاصيل الوصف والمهام والمؤهلات' : 'Description & Requirements'}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Job Description (English) *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Enter job description..."
                      value={jobForm.description}
                      onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      الوصف الوظيفي (بالعربية)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="اكتب الوصف الوظيفي..."
                      value={jobForm.descriptionAr}
                      onChange={(e) => setJobForm({ ...jobForm, descriptionAr: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Requirements & Qualifications (English) *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Enter qualifications..."
                      value={jobForm.requirements}
                      onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      المتطلبات والشروط (بالعربية)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="اكتب الشروط والمؤهلات المطلوبة..."
                      value={jobForm.requirementsAr}
                      onChange={(e) => setJobForm({ ...jobForm, requirementsAr: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
                <Button type="button" variant="outline" onClick={() => setIsJobModalOpen(false)}>
                  {isAr ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button type="submit" disabled={savingJob}>
                  {savingJob ? (isAr ? 'جاري الحفظ...' : 'Saving...') : isAr ? 'حفظ الوظيفة' : 'Save Position'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPLICANT DETAIL & DOCUMENTS PREVIEW MODAL */}
      {isAppDetailModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs overflow-hidden">
          <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl">
                  {selectedApp.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {selectedApp.fullName}
                  </h2>
                  <p className="text-sm font-semibold text-primary mt-0.5">
                    {selectedApp.job ? (isAr && selectedApp.job.titleAr ? selectedApp.job.titleAr : selectedApp.job.title) : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <StatusBadge status={selectedApp.status} />
                <button
                  onClick={() => setIsAppDetailModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content Grid (Scrollable) */}
            <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-6">
              {/* Quick Status Bar */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? 'تغيير حالة طلب التوظيف:' : 'Update Candidate Application Status:'}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {['SUBMITTED', 'REVIEWING', 'SHORTLISTED', 'ACCEPTED', 'REJECTED'].map((st) => (
                    <button
                      key={st}
                      disabled={updatingAppStatus}
                      onClick={() => handleAppStatusChange(selectedApp.id, st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        selectedApp.status === st
                          ? 'bg-primary text-white shadow-md'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Personal & Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-semibold text-slate-400 flex items-center gap-1 mb-1">
                    <Mail className="w-3.5 h-3.5" />
                    {isAr ? 'البريد الإلكتروني' : 'Email Address'}
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm break-all">
                    {selectedApp.email}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-semibold text-slate-400 flex items-center gap-1 mb-1">
                    <Phone className="w-3.5 h-3.5" />
                    {isAr ? 'رقم الهاتف' : 'Phone Number'}
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">
                    {selectedApp.phone}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-semibold text-slate-400 flex items-center gap-1 mb-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {isAr ? 'تاريخ تقديم الطلب' : 'Submitted Date'}
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">
                    {selectedApp.createdAt ? new Date(selectedApp.createdAt).toLocaleDateString() : '-'}
                  </div>
                </div>
              </div>

              {/* Academic & Experience Details */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-gold" />
                  {isAr ? 'الخبرات والتفاصيل الاكاديمية' : 'Qualifications & Experience'}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-slate-400 font-semibold block">{isAr ? 'سنوات الخبرة' : 'Years of Exp'}</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm mt-0.5 block">
                      {selectedApp.yearsExperience ?? 0} {isAr ? 'سنوات' : 'years'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-slate-400 font-semibold block">{isAr ? 'أعلى مؤهل تعليمي' : 'Highest Qualification'}</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm mt-0.5 block">
                      {selectedApp.highestQualification || '-'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-slate-400 font-semibold block">{isAr ? 'المواد المَدرّسة' : 'Subjects Taught'}</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm mt-0.5 block">
                      {selectedApp.subjectsTaught || '-'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-slate-400 font-semibold block">{isAr ? 'خبرة المناهج' : 'Curriculum Experience'}</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm mt-0.5 block">
                      {selectedApp.curriculumExperience || '-'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-slate-400 font-semibold block">{isAr ? 'رقم ترخيص التدريس' : 'License No.'}</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm mt-0.5 block">
                      {selectedApp.teachingLicenseNo || '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cover Letter */}
              {selectedApp.coverLetter && (
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    {isAr ? 'خطاب التغطية / الرسالة التعريفية' : 'Cover Letter'}
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                    {selectedApp.coverLetter}
                  </p>
                </div>
              )}

              {/* Uploaded Documents Section */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    {isAr ? 'المستندات والسيرة الذاتية المرفوعة' : 'Uploaded Documents & CV'}
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                    {selectedApp.documents?.length || 0} {isAr ? 'ملف' : 'files'}
                  </span>
                </div>

                {selectedApp.documents && selectedApp.documents.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedApp.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between gap-3 hover:border-primary transition-all"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="overflow-hidden">
                            <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                              {doc.fileName || doc.documentType}
                            </div>
                            <div className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">
                              {doc.documentType || 'CV_RESUME'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <a
                            href={mediaUrl(doc.fileUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-primary shadow-xs border border-slate-200 dark:border-slate-700 transition-colors"
                            title={isAr ? 'معاينة / فتح الملف' : 'Open / View File'}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>

                          <a
                            href={mediaUrl(doc.fileUrl)}
                            download
                            className="p-2 rounded-lg bg-primary text-white hover:bg-primary-dark shadow-xs transition-colors"
                            title={isAr ? 'تحميل الملف' : 'Download File'}
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-slate-400 text-xs">
                    {isAr ? 'لم يقم المتقدم برفع سيرته الذاتية أو أي مستندات.' : 'No uploaded CV or documents attached to this application.'}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 flex items-center justify-end border-t border-slate-100 dark:border-slate-800 shrink-0">
              <Button onClick={() => setIsAppDetailModalOpen(false)}>
                {isAr ? 'إغلاق المعاينة' : 'Close Details'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
