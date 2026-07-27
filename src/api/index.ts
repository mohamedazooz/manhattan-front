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
  register: (data: { email: string; password: string; fullName: string }) =>
    api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get<User>('/users/me'),
};

export const landingApi = {
  get: (lang: string) =>
    api.get<{ hero: LandingHero | null; sections: LandingSection[]; announcements: string }>(
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
  createSection: (data: object) => api.post('/landing/sections', data),
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
};

export const aboutApi = {
  get: (lang: string) => api.get('/about-us', { params: { lang: langParam(lang) } }),
  admin: () => api.get('/about-us/admin'),
  create: (data: object) => api.post('/about-us', data),
  update: (id: string, data: object) => api.patch(`/about-us/${id}`, data),
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
};

export const blogApi = {
  list: (lang: string, categoryId?: string) =>
    api.get<BlogPost[]>('/posts', { params: { lang: langParam(lang), categoryId } }),
  get: (slug: string, lang: string) =>
    api.get<BlogPost>(`/posts/${slug}`, { params: { lang: langParam(lang) } }),
  admin: () => api.get<BlogPost[]>('/posts/admin'),
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
  allApplications: () => api.get('/jobs/admin/all-applications'),
  updateApplicationStatus: (id: string, status: string) =>
    api.patch(`/jobs/applications/${id}/status`, { status }),
  uploadDocument: (applicationId: string, form: FormData) =>
    api.post(`/jobs/applications/${applicationId}/documents`, form),
  apply: (id: string, form: FormData) => api.post(`/jobs/${id}/apply`, form),
};

export const admissionsApi = {
  create: (data: object) => api.post<Admission>('/admissions', data),
  myStatus: () => api.get('/admissions/my-status'),
  myAdmissions: () => api.get<Admission[]>('/admissions/my-admissions'),
  get: (id: string) => api.get<Admission>(`/admissions/${id}`),
  list: (status?: string) => api.get<Admission[]>('/admissions', { params: { status } }),
  uploadDocument: (id: string, form: FormData) =>
    api.post(`/admissions/${id}/documents`, form),
  submit: (id: string) => api.post(`/admissions/${id}/submit`),
  updateStatus: (id: string, status: string) =>
    api.patch(`/admissions/${id}/status`, { status }),
  addNote: (id: string, noteContent: string) =>
    api.post(`/admissions/${id}/notes`, { noteContent }),
};

export const requirementsApi = {
  list: (all?: boolean) => api.get('/admission-requirements', { params: { all } }),
  create: (data: object) => api.post('/admission-requirements', data),
  update: (id: string, data: object) => api.patch(`/admission-requirements/${id}`, data),
  remove: (id: string) => api.delete(`/admission-requirements/${id}`),
};

export const contactApi = {
  submit: (data: object) => api.post('/contact', data),
  admin: (status?: string) => api.get('/contact/admin', { params: { status } }),
  updateStatus: (id: string, status: string) => api.patch(`/contact/${id}/status`, { status }),
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
  permissions: () => api.get('/roles/permissions'),
  updatePermissions: (id: string, permissionNames: string[]) =>
    api.patch(`/roles/${id}/permissions`, { permissionNames }),
  updateDescription: (id: string, description: string) =>
    api.patch(`/roles/${id}`, { description }),
};

export const emailApi = {
  templates: () => api.get('/email/templates'),
  createTemplate: (data: object) => api.post('/email/templates', data),
  updateTemplate: (id: string, data: object) => api.patch(`/email/templates/${id}`, data),
  deleteTemplate: (id: string) => api.delete(`/email/templates/${id}`),
  logs: () => api.get('/email/logs'),
};

export const dashboardApi = {
  stats: () => api.get<DashboardStats>('/dashboard/stats'),
  activity: () => api.get('/dashboard/activity'),
};

export const seoApi = {
  getGlobal: () => api.get<SeoConfig>('/seo/global'),
  updateGlobal: (data: Partial<SeoConfig>) => api.put<SeoConfig>('/seo/global', data),
};
