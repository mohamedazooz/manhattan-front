import { api, langParam } from './client';
import type {
  Admission,
  BlogPost,
  DashboardStats,
  EducationProgram,
  Job,
  LandingHero,
  LandingSection,
  SeoConfig,
  StaticPage,
  User,
} from '../types';

export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post<{ accessToken: string; user: User }>('/auth/login', data),
  register: (data: { email: string; password: string; fullName: string; accountType?: 'parent' | 'applicant' }) =>
    api.post<{ accessToken: string; user: User }>('/auth/register', data),
  requestPasswordReset: (data: { email: string }) =>
    api.post('/auth/password-reset/request', data),
  resetPassword: (data: { token: string; password: string }) =>
    api.post('/auth/password-reset/confirm', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get<User>('/users/me'),
};

export const landingApi = {
  get: (lang: string) =>
    api.get<{ hero: LandingHero | null; heroes?: LandingHero[]; sections: LandingSection[]; announcements: string }>(
      '/landing',
      { params: { lang: langParam(lang) } },
    ),
  heroes: () => api.get<LandingHero[]>('/landing/hero'),
  createHero: (data: FormData | object) =>
    data instanceof FormData ? api.post('/landing/hero', data) : api.post('/landing/hero', data),
  updateHero: (id: string, data: FormData | object) =>
    data instanceof FormData
      ? api.patch(`/landing/hero/${id}`, data)
      : api.patch(`/landing/hero/${id}`, data),
  deleteHero: (id: string) => api.delete(`/landing/hero/${id}`),
  sections: () => api.get<LandingSection[]>('/landing/sections/admin'),
  createSection: (data: FormData | object) =>
    data instanceof FormData ? api.post('/landing/sections', data) : api.post('/landing/sections', data),
  updateSection: (id: string, data: FormData | object) =>
    data instanceof FormData
      ? api.patch(`/landing/sections/${id}`, data)
      : api.patch(`/landing/sections/${id}`, data),
  updateSectionStatus: (id: string, status: string) =>
    api.patch(`/landing/sections/${id}/status`, { status }),
  deleteSection: (id: string) => api.delete(`/landing/sections/${id}`),
};

export const cmsApi = {
  getConfig: () => api.get<Record<string, string>>('/cms/config'),
  updateConfig: (key: string, value: string) => api.patch('/cms/config', { key, value }),
  updateBulkConfig: (configs: Record<string, string>) => api.patch('/cms/bulk-config', configs),
};

export const aboutApi = {
  get: (lang: string) => api.get('/about-us', { params: { lang: langParam(lang) } }),
  admin: () => api.get('/about-us/admin'),
  create: (data: FormData | object) =>
    data instanceof FormData ? api.post('/about-us', data) : api.post('/about-us', data),
  update: (id: string, data: FormData | object) =>
    data instanceof FormData
      ? api.patch(`/about-us/${id}`, data)
      : api.patch(`/about-us/${id}`, data),
  updateStatus: (id: string, status: string) => api.patch(`/about-us/${id}/status`, { status }),
  remove: (id: string) => api.delete(`/about-us/${id}`),
};

export const pagesApi = {
  list: (lang: string) => api.get<StaticPage[]>('/pages', { params: { lang: langParam(lang) } }),
  get: (slug: string, lang: string) =>
    api.get<StaticPage>(`/pages/${slug}`, { params: { lang: langParam(lang) } }),
  admin: () => api.get<StaticPage[]>('/pages/admin'),
  create: (data: object) => api.post('/pages', data),
  update: (id: string, data: object) => api.patch(`/pages/${id}`, data),
  updateStatus: (id: string, status: string) => api.patch(`/pages/${id}/status`, { status }),
  remove: (id: string) => api.delete(`/pages/${id}`),
};

export const educationApi = {
  list: (lang: string, level?: string) =>
    api.get<EducationProgram[]>('/education', {
      params: { lang: langParam(lang), level },
    }),
  get: (slug: string, lang: string) =>
    api.get<EducationProgram>(`/education/programs/${slug}`, {
      params: { lang: langParam(lang) },
    }),
  getById: (id: string) => api.get<EducationProgram>(`/education/${id}`),
  admin: () => api.get<EducationProgram[]>('/education/admin'),
  create: (data: object) => api.post('/education', data),
  update: (id: string, data: object) => api.patch(`/education/${id}`, data),
  updateStatus: (id: string, status: string) =>
    api.patch(`/education/${id}/status`, { status }),
};

export const galleryApi = {
  list: (lang: string, category?: string) =>
    api.get('/gallery', { params: { lang: langParam(lang), category } }),
  admin: () => api.get('/gallery/admin'),
  create: (form: FormData) => api.post('/gallery', form),
  update: (id: string, form: FormData) => api.patch(`/gallery/${id}`, form),
  updateStatus: (id: string, status: string) =>
    api.patch(`/gallery/${id}/status`, { status }),
  delete: (id: string) => api.delete(`/gallery/${id}`),
};

export const blogApi = {
  list: (lang: string, categoryId?: string) =>
    api.get<BlogPost[]>('/posts', { params: { lang: langParam(lang), categoryId } }),
  get: (slug: string, lang: string) =>
    api.get<BlogPost>(`/posts/${slug}`, { params: { lang: langParam(lang) } }),
  admin: () => api.get<BlogPost[] | { data: BlogPost[] }>('/posts/admin'),
  getById: (id: string) => api.get<BlogPost>(`/posts/${id}`),
  getPost(id: string) {
    return this.getById(id);
  },
  create: (data: object) => api.post('/posts', data),
  update: (id: string, data: object) => api.patch(`/posts/${id}`, data),
  updateStatus: (id: string, status: string) => api.patch(`/posts/${id}/status`, { status }),
  comments: () => api.get('/posts/comments/admin'),
  moderateComment: (id: string, status: string) =>
    api.patch(`/posts/comments/${id}`, { status }),
  createComment: (postId: string, content: string) =>
    api.post(`/posts/${postId}/comments`, { content }),
  categories: (lang: string) =>
    api.get('/categories', { params: { lang: langParam(lang) } }),
  createCategory: (data: object) => api.post('/categories', data),
  updateCategory: (id: string, data: object) => api.patch(`/categories/${id}`, data),
  deleteCategory: (id: string) => api.delete(`/categories/${id}`),
};

export const careersApi = {
  list: (lang: string) => api.get<Job[]>('/jobs', { params: { lang: langParam(lang) } }),
  get: (id: string, lang: string) =>
    api.get<Job>(`/jobs/${id}`, { params: { lang: langParam(lang) } }),
  admin: () => api.get('/jobs/admin'),
  create: (data: object) => api.post('/jobs', data),
  update: (id: string, data: object) => api.patch(`/jobs/${id}`, data),
  updateStatus: (id: string, status: string) => api.patch(`/jobs/${id}/status`, { status }),
  applications: (id: string) => api.get(`/jobs/${id}/applications`),
  myApplications: () => api.get('/jobs/my-applications'),
  getApplication: (id: string) => api.get(`/jobs/applications/${id}`),
  updateApplication: (id: string, data: object) => api.patch(`/jobs/applications/${id}`, data),
  submitApplication: (id: string) => api.post(`/jobs/applications/${id}/submit`),
  allApplications: () => api.get('/jobs/admin/all-applications'),
  adminGetApplication: (id: string) => api.get(`/jobs/admin/applications/${id}`),
  updateApplicationStatus: (
    id: string,
    status: string,
    note?: string,
    interviewDate?: string,
    interviewLocation?: string,
    interviewNotes?: string,
  ) =>
    api.patch(`/jobs/applications/${id}/status`, {
      status,
      note,
      interviewDate,
      interviewLocation,
      interviewNotes,
    }),
  evaluateApplication: (
    id: string,
    data: { rating?: number; interviewDate?: string; interviewLocation?: string; interviewNotes?: string; comment?: string },
  ) => api.patch(`/jobs/applications/${id}/evaluate`, data),
  trackApplication: (referenceNumber: string, phone: string) =>
    api.get('/jobs/track-application', { params: { referenceNumber, phone } }),
  exportApplications: (jobId?: string) =>
    api.get('/jobs/admin/export-applications', { params: { jobId } }),
  uploadDocument: (applicationId: string, form: FormData) =>
    api.post(`/jobs/applications/${applicationId}/documents`, form),
  apply: (id: string, form: FormData) => api.post(`/jobs/${id}/apply`, form),
};

export const jobRequirementsApi = {
  list: (all?: boolean, lang?: string) =>
    all
      ? api.get('/job-requirements/admin')
      : api.get('/job-requirements', { params: { lang: langParam(lang) } }),
  byType: (employmentType?: string, lang?: string) =>
    api.get('/job-requirements/by-type', { params: { employmentType, lang: langParam(lang) } }),
  create: (data: object) => api.post('/job-requirements', data),
  update: (id: string, data: object) => api.patch(`/job-requirements/${id}`, data),
  remove: (id: string) => api.delete(`/job-requirements/${id}`),
};

export const admissionsApi = {
  create: (data: object) => api.post<Admission>('/admissions', data),
  update: (id: string, data: object) => api.patch<Admission>(`/admissions/${id}`, data),
  myStatus: () => api.get('/admissions/my-status'),
  myAdmissions: () => api.get<Admission[]>('/admissions/my-admissions'),
  get: (id: string) => api.get<Admission>(`/admissions/${id}`),
  list: (status?: string) => api.get<Admission[]>('/admissions', { params: { status } }),
  track: (referenceNumber: string, email: string) =>
    api.get('/admissions/track', { params: { referenceNumber, email } }),
  uploadDocument: (id: string, form: FormData) =>
    api.post(`/admissions/${id}/documents`, form),
  submit: (id: string) => api.post(`/admissions/${id}/submit`),
  completeDocuments: (id: string) => api.post(`/admissions/${id}/complete-documents`),
  updateStatus: (id: string, status: string) =>
    api.patch(`/admissions/${id}/status`, { status }),
  addNote: (id: string, noteContent: string) =>
    api.post(`/admissions/${id}/notes`, { noteContent }),
};

export const requirementsApi = {
  list: (all?: boolean, lang?: string) =>
    all
      ? api.get('/admission-requirements/admin')
      : api.get('/admission-requirements', { params: { lang: langParam(lang) } }),
  create: (data: object) => api.post('/admission-requirements', data),
  update: (id: string, data: object) => api.patch(`/admission-requirements/${id}`, data),
  remove: (id: string) => api.delete(`/admission-requirements/${id}`),
};

export const contactApi = {
  submit: (data: object) => api.post('/contact', data),
  admin: (status?: string) => api.get('/contact/admin', { params: { status } }),
  updateStatus: (id: string, status: string) => api.patch(`/contact/${id}/status`, { status }),
  reply: (id: string, data: { subject?: string; message: string }) =>
    api.post(`/contact/${id}/reply`, data),
};


export const usersApi = {
  list: () => api.get('/users'),
  create: (data: { email: string; password: string; fullName: string; roleId: string }) =>
    api.post('/users', data),
  delete: (id: string) => api.delete(`/users/${id}`),
  updateStatus: (id: string, status: string) => api.patch(`/users/${id}/status`, { status }),
  updateRole: (id: string, roleId: string) => api.patch(`/users/${id}/role`, { roleId }),
};

export const rolesApi = {
  list: () => api.get('/roles'),
  get: (id: string) => api.get(`/roles/${id}`),
  permissions: () => api.get('/roles/permissions'),
  create: (data: { name: string; description?: string; permissionNames?: string[] }) =>
    api.post('/roles', data),
  update: (id: string, data: { name?: string; description?: string; permissionNames?: string[] }) =>
    api.patch(`/roles/${id}`, data),
  updatePermissions: (id: string, permissionNames: string[]) =>
    api.patch(`/roles/${id}/permissions`, { permissionNames }),
  updateDescription: (id: string, description: string) =>
    api.patch(`/roles/${id}`, { description }),
  delete: (id: string) => api.delete(`/roles/${id}`),
};

export const emailApi = {
  templates: () => api.get('/email/templates'),
  createTemplate: (data: object) => api.post('/email/templates', data),
  updateTemplate: (id: string, data: object) => api.patch(`/email/templates/${id}`, data),
  deleteTemplate: (id: string) => api.delete(`/email/templates/${id}`),
  logs: () => api.get('/email/logs'),
};

export const healthApi = {
  ping: () => api.get<{ status: string; service?: string }>('/health'),
};

export const dashboardApi = {
  stats: () => api.get<DashboardStats>('/dashboard/stats'),
  modules: () => api.get('/dashboard/modules'),
  activity: (params?: {
    limit?: number;
    module?: string;
    category?: string;
    lang?: 'ar' | 'en';
  }) => api.get('/dashboard/activity', { params }),
  audit: (params?: {
    page?: number;
    limit?: number;
    action?: string;
    userId?: string;
    category?: string;
    lang?: 'ar' | 'en';
  }) => api.get('/dashboard/audit', { params }),
};

export const notificationsApi = {
  list: (status?: string, limit?: number) =>
    api.get('/notifications', { params: { status, limit } }),
  unreadCount: () => api.get<{ count: number }>('/notifications/unread-count'),
  create: (data: { title: string; message: string; type?: string; userId?: string }) =>
    api.post('/notifications', data),
  updateStatus: (id: string, status: string) =>
    api.patch(`/notifications/${id}/status`, { status }),
  markAllRead: () => api.patch('/notifications/mark-all-read'),
};

export const seoApi = {
  getGlobal: () => api.get<SeoConfig>('/seo/global'),
  updateGlobal: (data: Partial<SeoConfig>) => api.put<SeoConfig>('/seo/global', data),
};

export const storageApi = {
  upload: (file: File, folder: string = 'blog') => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', folder);
    return api.post<{ url: string; fileUrl: string }>('/storage/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const newsletterApi = {
  subscribe: (email: string) => api.post('/newsletter/subscribe', { email }),
};

export const formDocumentsApi = {
  list: (lang: string, category?: string) =>
    api.get('/form-documents', {
      params: { lang: langParam(lang), category },
    }),
  admin: () => api.get('/form-documents/admin'),
  create: (data: object) => api.post('/form-documents', data),
  update: (id: string, data: object) => api.patch(`/form-documents/${id}`, data),
  updateStatus: (id: string, status: string) =>
    api.patch(`/form-documents/${id}/status`, { status }),
  remove: (id: string) => api.delete(`/form-documents/${id}`),
};

