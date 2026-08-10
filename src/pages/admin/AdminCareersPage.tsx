import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Briefcase,
  Plus,
  Edit2,
  Eye,
  Users,
  MapPin,
  CheckCircle,
  X,
  Search,
  Download,
  FileText,
  ExternalLink,
  Mail,
  Phone,
  Filter,
  Star,
  MessageSquare,
  Sparkles,
  Bell,
} from 'lucide-react';
import { careersApi } from '../../api';
import { getApiErrorMessage } from '../../lib/formData';
import { Button } from '../../components/ui/Button';
import { StatusBadge, LoadingSpinner, PageHeader } from '../../components/ui/Badge';
import { AdminDataTable } from '../../components/admin/AdminDataTable';
import { AdminOpsCounters } from '../../components/admin/AdminOpsCounters';
import { useAppLanguage } from '../../i18n';
import type { Job, JobApplication } from '../../types';
import { mediaUrl } from '../../lib/utils';
import { JobApplicationAdminDetails } from '../../components/careers/JobApplicationAdminDetails';

export function AdminCareersPage() {
  const { t } = useTranslation();
  const lang = useAppLanguage();
  const isAr = lang === 'ar';
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const deepLinkApplicationId = searchParams.get('applicationId');
  const deepLinkJobId = searchParams.get('jobId');
  const handledApplicationDeepLink = useRef<string | null>(null);
  const allApplicationsSectionRef = useRef<HTMLDivElement>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Job Search & Filters
  const [jobSearchTerm, setJobSearchTerm] = useState('');
  const [jobStatusFilter, setJobStatusFilter] = useState<'ALL' | 'OPEN' | 'CLOSED'>('ALL');

  // Applicants Search & Filters
  const [appSearchTerm, setAppSearchTerm] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState<string>('ALL');
  const [appJobFilter, setAppJobFilter] = useState<string>(deepLinkJobId || 'ALL');

  // Create / Edit Job Modal State
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [savingJob, setSavingJob] = useState(false);

  // Applicant Detail Modal State
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [isAppDetailModalOpen, setIsAppDetailModalOpen] = useState(false);
  const [loadingAppDetails, setLoadingAppDetails] = useState(false);
  const [updatingAppStatus, setUpdatingAppStatus] = useState(false);

  // Evaluation & Interview State
  const [evalRating, setEvalRating] = useState<number>(0);
  const [evalComment, setEvalComment] = useState<string>('');
  const [interviewDateInput, setInterviewDateInput] = useState<string>('');
  const [interviewLocationInput, setInterviewLocationInput] = useState<string>('');
  const [submittingEval, setSubmittingEval] = useState<boolean>(false);

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

  const { data: jobs = [], isLoading: isLoadingJobs } = useQuery({
    queryKey: ['jobs-admin'],
    queryFn: () => careersApi.admin().then((r) => r.data),
  });

  const { data: allApplications = [], isLoading: isLoadingApps } = useQuery({
    queryKey: ['job-apps-all'],
    queryFn: () => careersApi.allApplications().then((r) => r.data),
  });

  const totalJobs = jobs.length;
  const openJobs = jobs.filter((job: Job) => job.status === 'OPEN').length;
  const closedJobs = jobs.filter((job: Job) => job.status === 'CLOSED').length;
  const totalApps = allApplications.length;

  useEffect(() => {
    if (deepLinkJobId) {
      setAppJobFilter(deepLinkJobId);
      allApplicationsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [deepLinkJobId]);

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
      setActionError(getApiErrorMessage(err, t('admin.careersCrud.saveJobError', 'Failed to save job position')));
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
      setActionError(getApiErrorMessage(err, t('admin.careersCrud.statusError', 'Failed to update job status')));
    }
  };

  // Handlers for Application Status
  const handleAppStatusChange = async (appId: string, newStatus: string) => {
    setUpdatingAppStatus(true);
    try {
      await careersApi.updateApplicationStatus(
        appId,
        newStatus,
        undefined,
        interviewDateInput || undefined,
        interviewLocationInput || undefined,
      );
      queryClient.invalidateQueries({ queryKey: ['job-apps-all'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['my-job-applications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp({ ...selectedApp, status: newStatus });
      }
    } catch (err) {
      setActionError(
        getApiErrorMessage(err, t('admin.careersCrud.appStatusError', 'Failed to update application status')),
      );
    } finally {
      setUpdatingAppStatus(false);
    }
  };

  const openAppDetailsModal = async (app: JobApplication) => {
    setIsAppDetailModalOpen(true);
    setLoadingAppDetails(true);
    setSelectedApp(app);
    setEvalRating(app.rating || 0);
    setEvalComment('');
    setInterviewDateInput(app.interviewDate ? new Date(app.interviewDate).toISOString().slice(0, 16) : '');
    setInterviewLocationInput(app.interviewLocation || 'مدرسة مانهاتن للغات، مدينة الشيخ زايد');

    try {
      const res = await careersApi.adminGetApplication(app.id);
      const fullApp = res.data as JobApplication;
      setSelectedApp(fullApp);
      setEvalRating(fullApp.rating || 0);
      setInterviewDateInput(
        fullApp.interviewDate ? new Date(fullApp.interviewDate).toISOString().slice(0, 16) : '',
      );
      setInterviewLocationInput(fullApp.interviewLocation || 'مدرسة مانهاتن للغات، مدينة الشيخ زايد');
    } catch {
      // Keep list row data if full fetch fails
    } finally {
      setLoadingAppDetails(false);
    }
  };

  const clearApplicationDeepLink = () => {
    if (!searchParams.get('applicationId')) return;
    const next = new URLSearchParams(searchParams);
    next.delete('applicationId');
    setSearchParams(next, { replace: true });
    handledApplicationDeepLink.current = null;
  };

  const closeAppDetailModal = () => {
    setIsAppDetailModalOpen(false);
    clearApplicationDeepLink();
  };

  useEffect(() => {
    if (!deepLinkApplicationId) {
      handledApplicationDeepLink.current = null;
      return;
    }
    if (handledApplicationDeepLink.current === deepLinkApplicationId) return;

    const openFromApplication = (app: JobApplication) => {
      handledApplicationDeepLink.current = deepLinkApplicationId;
      openAppDetailsModal(app);
    };

    const fromList = allApplications.find((app: JobApplication) => app.id === deepLinkApplicationId);
    if (fromList) {
      openFromApplication(fromList);
      return;
    }

    if (!isLoadingApps) {
      careersApi
        .adminGetApplication(deepLinkApplicationId)
        .then((res) => openFromApplication(res.data as JobApplication))
        .catch(() => undefined);
    }
  }, [deepLinkApplicationId, allApplications, isLoadingApps]);

  const handleExportCsv = async () => {
    try {
      const res = await careersApi.exportApplications(appJobFilter);
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `mls_job_applications_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setActionError(getApiErrorMessage(err, t('admin.careersCrud.exportError', 'Failed to export data')));
    }
  };

  const handleSaveEvaluation = async () => {
    if (!selectedApp) return;
    setSubmittingEval(true);
    try {
      const res = await careersApi.evaluateApplication(selectedApp.id, {
        rating: evalRating || undefined,
        interviewDate: interviewDateInput || undefined,
        interviewLocation: interviewLocationInput || undefined,
        comment: evalComment.trim() || undefined,
      });
      setSelectedApp(res.data);
      setEvalComment('');
      queryClient.invalidateQueries({ queryKey: ['job-apps-all'] });
    } catch (err) {
      setActionError(getApiErrorMessage(err, t('admin.careersCrud.evalError', 'Failed to save evaluation')));
    } finally {
      setSubmittingEval(false);
    }
  };

  const handleViewApplicantsForJob = (jobId: string) => {
    setAppJobFilter(jobId);
    setAppStatusFilter('ALL');
    allApplicationsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const isNewApplication = (app: JobApplication) => app.status === 'SUBMITTED';

  const getJobIdForApp = (app: JobApplication) => app.job?.id ?? (app as JobApplication & { jobId?: string }).jobId;

  const newApplications = allApplications
    .filter(isNewApplication)
    .sort((a: JobApplication, b: JobApplication) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  const newApplicationsCount = newApplications.length;

  const countNewApplicationsForJob = (jobId: string) =>
    allApplications.filter((app: JobApplication) => isNewApplication(app) && getJobIdForApp(app) === jobId).length;

  const NewCountBadge = ({ count, className = '' }: { count: number; className?: string }) => {
    if (count <= 0) return null;
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold shadow-sm animate-pulse ${className}`}
      >
        <Bell className="w-3 h-3" />
        {count}
      </span>
    );
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
        title={t('admin.careersCrud.title', 'Job postings & hiring')}
        subtitle={t(
          'admin.careersCrud.subtitle',
          'Post open teaching positions and review incoming job applications.',
        )}
      />
        <Button onClick={openCreateJobModal} showArrow className="shadow-lg py-2.5 px-6">
          <Plus className="w-5 h-5 mr-1" />
          {t('admin.careersCrud.addNew', 'Create job posting')}
        </Button>
      </div>

      {actionError && (
        <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
          {actionError}
          <button type="button" className="ml-3 underline" onClick={() => setActionError(null)}>
            {t('common.close', 'Close')}
          </button>
        </div>
      )}

      <AdminOpsCounters
        items={[
          { id: 'jobs', label: t('admin.careersCrud.totalJobs', 'Total positions'), value: totalJobs },
          { id: 'open', label: t('admin.openJobs', 'Open positions'), value: openJobs, highlight: openJobs > 0 },
          { id: 'closed', label: t('admin.careersCrud.closedJobs', 'Closed vacancies'), value: closedJobs },
          {
            id: 'apps',
            label: t('admin.careersCrud.newApps', 'New applications'),
            value: newApplicationsCount,
            highlight: newApplicationsCount > 0,
            onClick: () => {
              setAppStatusFilter('SUBMITTED');
              allApplicationsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            },
          },
          { id: 'total-apps', label: t('admin.totalApplications', 'Total applicants'), value: totalApps },
        ]}
      />

      {/* New Applications */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-500" />
              {isAr ? 'طلبات جديدة' : 'New Applications'}
            </h2>
            <NewCountBadge count={newApplicationsCount} className="!animate-pulse" />
          </div>
          <p className="text-xs text-slate-500">
            {isAr ? 'طلبات تم تقديمها ولم تُراجع بعد (SUBMITTED)' : 'Submitted applications awaiting first review'}
          </p>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden border border-amber-200/80 dark:border-amber-900/50 bg-white dark:bg-slate-900">
          {newApplications.length > 0 ? (
            <AdminDataTable
              data={newApplications}
              emptyTitle={t('admin.careersCrud.noNewApps', 'No new applications')}
              columns={[
                {
                  key: 'applicant',
                  header: isAr ? 'المتقدم' : 'Candidate',
                  render: (app: JobApplication) => (
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{app.fullName}</div>
                      <div className="text-xs text-slate-500">{app.email}</div>
                      {app.referenceNumber && (
                        <div className="text-[10px] font-mono text-primary mt-0.5">{app.referenceNumber}</div>
                      )}
                    </div>
                  ),
                },
                {
                  key: 'job',
                  header: isAr ? 'الوظيفة / القسم' : 'Position',
                  render: (app: JobApplication) => (
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {app.job ? (isAr && app.job.titleAr ? app.job.titleAr : app.job.title) : '—'}
                    </span>
                  ),
                },
                {
                  key: 'date',
                  header: isAr ? 'تاريخ التقديم' : 'Submitted',
                  render: (app: JobApplication) => (
                    <span className="text-xs text-slate-500">
                      {app.createdAt ? new Date(app.createdAt).toLocaleString(isAr ? 'ar-EG' : 'en-US') : '—'}
                    </span>
                  ),
                },
                {
                  key: 'actions',
                  header: isAr ? 'الإجراءات' : 'Actions',
                  render: (app: JobApplication) => (
                    <Button
                      variant="primary"
                      className="py-1 px-2.5 text-xs flex items-center gap-1"
                      onClick={() => openAppDetailsModal(app)}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {isAr ? 'معاينة الطلب' : 'View Details'}
                    </Button>
                  ),
                },
              ]}
            />
          ) : (
            <div className="text-center py-10 text-slate-500">
              <CheckCircle className="w-10 h-10 mx-auto text-emerald-400 mb-2" />
              <p className="font-semibold">{isAr ? 'لا توجد طلبات جديدة حالياً' : 'No new applications right now'}</p>
            </div>
          )}
        </div>
      </section>

      {/* Job Departments / Positions */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            {isAr ? 'الأقسام والوظائف' : 'Departments & Positions'}
          </h2>
          <Button onClick={openCreateJobModal} variant="outline" className="text-xs py-1.5 px-3">
            <Plus className="w-3.5 h-3.5 me-1" />
            {isAr ? 'إضافة وظيفة' : 'Add Position'}
          </Button>
        </div>

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
            <AdminDataTable
              data={filteredJobs}
              emptyTitle={t('admin.careersCrud.noJobs', 'No job positions')}
              columns={[
                {
                  key: 'title',
                  header: isAr ? 'المسمى الوظيفي' : 'Job Position',
                  render: (r: Job) => {
                    const newCount = countNewApplicationsForJob(r.id);
                    return (
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2 flex-wrap">
                          <span>{isAr && r.titleAr ? r.titleAr : r.title}</span>
                          <NewCountBadge count={newCount} />
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span>{isAr && r.locationAr ? r.locationAr : r.location}</span>
                        </div>
                      </div>
                    );
                  },
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
                    const count = (r as Job & { _count?: { applications?: number } })._count?.applications ?? allApplications.filter((a: JobApplication) => getJobIdForApp(a) === r.id).length;
                    const newCount = countNewApplicationsForJob(r.id);
                    return (
                      <button
                        onClick={() => handleViewApplicantsForJob(r.id)}
                        className="relative inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-bold hover:bg-purple-100 transition-colors"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>{count} {isAr ? 'متقدم' : 'candidates'}</span>
                        <NewCountBadge count={newCount} className="!static !animate-pulse ms-1" />
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
                        className="relative p-2 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        {countNewApplicationsForJob(r.id) > 0 && (
                          <span className="absolute -top-1 -right-1 min-w-[1rem] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                            {countNewApplicationsForJob(r.id)}
                          </span>
                        )}
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
      </section>

      {/* All Applications */}
      <section ref={allApplicationsSectionRef} className="space-y-4 scroll-mt-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            {isAr ? 'جميع طلبات المتقدمين' : 'All Applications'}
          </h2>
          <NewCountBadge count={newApplicationsCount} />
          <span className="text-xs text-slate-500 font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
            {allApplications.length} {isAr ? 'طلب' : 'total'}
          </span>
        </div>

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

            {/* Export CSV Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleExportCsv}
              className="w-full md:w-auto text-xs py-2 px-3 flex items-center justify-center gap-2 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950"
            >
              <Download className="w-4 h-4" />
              {isAr ? 'تصدير إلى Excel (CSV)' : 'Export CSV'}
            </Button>
          </div>

          {/* Applicants Table */}
          <div className="glass-card rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            {filteredApplications.length > 0 ? (
              <AdminDataTable
                data={filteredApplications}
                emptyTitle={t('admin.careersCrud.noApps', 'No applications match filters')}
                columns={[
                  {
                    key: 'applicant',
                    header: isAr ? 'المتقدم والرقم المرجعي' : 'Candidate & Ref',
                    render: (app: JobApplication) => (
                      <div>
                        {app.referenceNumber && (
                          <div className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md inline-block mb-1 border border-amber-200 dark:border-amber-800">
                            {app.referenceNumber}
                          </div>
                        )}
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
                    header: isAr ? 'الوظيفة والمطابقة' : 'Position & Score',
                    render: (app: JobApplication) => {
                      const title = app.job ? (isAr && app.job.titleAr ? app.job.titleAr : app.job.title) : '-';
                      return (
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                            {title}
                          </div>
                          {app.matchScore !== undefined && app.matchScore !== null && (
                            <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              <Sparkles className="w-3 h-3 text-gold" />
                              {app.matchScore}% {isAr ? 'مطابقة' : 'Match'}
                            </div>
                          )}
                        </div>
                      );
                    },
                  },
                  {
                    key: 'rating',
                    header: isAr ? 'التقييم (Rating)' : 'Rating',
                    render: (app: JobApplication) => (
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              (app.rating || 0) >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    ),
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
      </section>

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
                  {selectedApp.referenceNumber && (
                    <p className="text-xs font-mono text-slate-500 mt-1">{selectedApp.referenceNumber}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <StatusBadge status={selectedApp.status} />
                <button
                  onClick={closeAppDetailModal}
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

              {loadingAppDetails ? (
                <div className="py-12 flex justify-center">
                  <LoadingSpinner />
                </div>
              ) : (
                <JobApplicationAdminDetails app={selectedApp} isAr={isAr} />
              )}

              {/* HR Assessment & Interview Scorecard */}
              <div className="p-5 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/20 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    {isAr ? 'تقييم HR وجدولة المقابلة (Assessment & Scorecard)' : 'HR Candidate Evaluation & Interview'}
                  </h3>
                  {selectedApp.matchScore !== undefined && selectedApp.matchScore !== null && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300">
                      {isAr ? `نسبة المطابقة الأكاديمية: ${selectedApp.matchScore}%` : `Match Score: ${selectedApp.matchScore}%`}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Rating Stars Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {isAr ? 'التقييم العام (Star Rating):' : 'Candidate Rating:'}
                    </label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setEvalRating(star)}
                          className="p-1 transition-transform hover:scale-110 focus:outline-hidden"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              evalRating >= star
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300 dark:text-slate-700 hover:text-amber-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Interview Date Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isAr ? 'تاريخ ووقت المقابلة الشخصية (Interview Date):' : 'Interview Date & Time:'}
                    </label>
                    <input
                      type="datetime-local"
                      value={interviewDateInput}
                      onChange={(e) => setInterviewDateInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'مقر المقابلة (Interview Location):' : 'Interview Location:'}
                  </label>
                  <input
                    type="text"
                    placeholder="مدرسة مانهاتن للغات، الشيخ زايد"
                    value={interviewLocationInput}
                    onChange={(e) => setInterviewLocationInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                  />
                </div>

                {/* Internal Comment Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'إضافة ملاحظة إدارية داخلية جديدة (Internal HR Note):' : 'Add Internal HR Comment:'}
                  </label>
                  <textarea
                    rows={2}
                    placeholder={isAr ? 'اكتب ملاحظات التقييم أو الانترفيو...' : 'Enter internal evaluation notes...'}
                    value={evalComment}
                    onChange={(e) => setEvalComment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                  />
                </div>

                <div className="flex items-center justify-end">
                  <Button
                    type="button"
                    disabled={submittingEval}
                    onClick={handleSaveEvaluation}
                    className="text-xs py-1.5 px-4 bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    {submittingEval ? (isAr ? 'جاري الحفظ...' : 'Saving...') : isAr ? 'حفظ التقييم والملاحظات' : 'Save Scorecard & Rating'}
                  </Button>
                </div>

                {/* Previous HR Comments List */}
                {selectedApp.comments && selectedApp.comments.length > 0 && (
                  <div className="pt-3 border-t border-amber-200/60 dark:border-amber-900/40 space-y-2">
                    <div className="text-xs font-bold text-slate-500 flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                      {isAr ? 'سجل الملاحظات الداخلية:' : 'Internal Comments Log:'}
                    </div>
                    <div className="space-y-2 max-h-36 overflow-y-auto">
                      {selectedApp.comments.map((cm) => (
                        <div key={cm.id} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mb-1">
                            <span>{cm.author?.fullName || 'HR Officer'}</span>
                            <span>{new Date(cm.createdAt).toLocaleString(isAr ? 'ar-EG' : 'en-US')}</span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300">{cm.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 flex items-center justify-end border-t border-slate-100 dark:border-slate-800 shrink-0">
              <Button onClick={closeAppDetailModal}>
                {isAr ? 'إغلاق المعاينة' : 'Close Details'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
