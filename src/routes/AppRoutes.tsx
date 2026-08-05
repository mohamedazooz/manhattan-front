import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../lib/auth';
import { PublicLayout } from '../components/layout/PublicLayout';
import { PortalLayout } from '../components/layout/PortalLayout';
import { AdminLayout } from '../components/layout/AdminLayout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { PortalRedirect } from '../components/auth/PortalRedirect';
import { RoleRoute } from '../components/auth/RoleRoute';
import { HomePage } from '../pages/public/HomePage';
import { AboutPage } from '../pages/public/AboutPage';
import { AcademicsPage } from '../pages/public/AcademicsPage';
import { ProgramDetailPage } from '../pages/public/ProgramDetailPage';
import { AdmissionsPage } from '../pages/public/AdmissionsPage';
import { StudentLifePage } from '../pages/public/StudentLifePage';
import { NewsPage } from '../pages/public/NewsPage';
import { NewsDetailPage } from '../pages/public/NewsDetailPage';
import { CareersPage } from '../pages/public/CareersPage';
import { CareerDetailPage } from '../pages/public/CareerDetailPage';
import { JobTrackPage } from '../pages/public/JobTrackPage';
import { AdmissionTrackPage } from '../pages/public/AdmissionTrackPage';
import { ContactPage } from '../pages/public/ContactPage';
import { StaticParentPage } from '../pages/public/StaticParentPage';
import { FormsAndDocumentsPage } from '../pages/public/FormsAndDocumentsPage';
import { SearchPage } from '../pages/public/SearchPage';
import { GlobalBackButton } from '../components/common/GlobalBackButton';
import { GalleryPage } from '../pages/public/GalleryPage';
import { NotFoundPage } from '../pages/public/NotFoundPage';

// Lazy-loaded routes for optimal bundle code-splitting
const LoginPage = lazy(() => import('../pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const AdminLoginPage = lazy(() => import('../pages/auth/LoginPage').then((m) => ({ default: m.AdminLoginPage })));
const ForgotPasswordPage = lazy(() => import('../pages/auth/PasswordResetPages').then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('../pages/auth/PasswordResetPages').then((m) => ({ default: m.ResetPasswordPage })));

const ParentPortalDashboard = lazy(() => import('../pages/portal/parent/ParentPortalDashboard').then((m) => ({ default: m.ParentPortalDashboard })));
const AdmissionWizard = lazy(() => import('../pages/portal/parent/AdmissionWizard').then((m) => ({ default: m.AdmissionWizard })));
const ParentAdmissionDetailPage = lazy(() => import('../pages/portal/parent/ParentAdmissionDetailPage').then((m) => ({ default: m.ParentAdmissionDetailPage })));

const ApplicantPortalDashboard = lazy(() => import('../pages/portal/applicant/ApplicantPortalDashboard').then((m) => ({ default: m.ApplicantPortalDashboard })));
const ApplicationWizard = lazy(() => import('../pages/portal/applicant/ApplicationWizard').then((m) => ({ default: m.ApplicationWizard })));
const ApplicantApplicationDetailPage = lazy(() => import('../pages/portal/applicant/ApplicantApplicationDetailPage').then((m) => ({ default: m.ApplicantApplicationDetailPage })));

const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })));
const AdminHeroPage = lazy(() => import('../pages/admin/LandingAdminPages').then((m) => ({ default: m.AdminHeroPage })));
const AdminSectionsPage = lazy(() => import('../pages/admin/LandingAdminPages').then((m) => ({ default: m.AdminSectionsPage })));
const AdminAboutPage = lazy(() => import('../pages/admin/ContentAdminPages').then((m) => ({ default: m.AdminAboutPage })));
const AdminPagesPage = lazy(() => import('../pages/admin/ContentAdminPages').then((m) => ({ default: m.AdminPagesPage })));
const AdminSettingsPage = lazy(() => import('../pages/admin/ContentAdminPages').then((m) => ({ default: m.AdminSettingsPage })));
const AdminStudentLifePage = lazy(() => import('../pages/admin/AdminStudentLifePage').then((m) => ({ default: m.AdminStudentLifePage })));
const SeoAdminPage = lazy(() => import('../pages/admin/SeoAdminPage').then((m) => ({ default: m.SeoAdminPage })));
const NotificationsAdminPage = lazy(() => import('../pages/admin/NotificationsAdminPage').then((m) => ({ default: m.NotificationsAdminPage })));

const AdminEducationPage = lazy(() => import('../pages/admin/OpsAdminPages').then((m) => ({ default: m.AdminEducationPage })));
const AdminGalleryPage = lazy(() => import('../pages/admin/OpsAdminPages').then((m) => ({ default: m.AdminGalleryPage })));
const AdminBlogPage = lazy(() => import('../pages/admin/OpsAdminPages').then((m) => ({ default: m.AdminBlogPage })));
const AdminAdmissionsPage = lazy(() => import('../pages/admin/OpsAdminPages').then((m) => ({ default: m.AdminAdmissionsPage })));
const AdminRequirementsPage = lazy(() => import('../pages/admin/OpsAdminPages').then((m) => ({ default: m.AdminRequirementsPage })));
const AdminInquiriesPage = lazy(() => import('../pages/admin/OpsAdminPages').then((m) => ({ default: m.AdminInquiriesPage })));
const AdminUsersPage = lazy(() => import('../pages/admin/OpsAdminPages').then((m) => ({ default: m.AdminUsersPage })));
const AdminRolesPage = lazy(() => import('../pages/admin/OpsAdminPages').then((m) => ({ default: m.AdminRolesPage })));
const AdminEmailPage = lazy(() => import('../pages/admin/OpsAdminPages').then((m) => ({ default: m.AdminEmailPage })));

const AdminCareersPage = lazy(() => import('../pages/admin/AdminCareersPage').then((m) => ({ default: m.AdminCareersPage })));
const AdminJobRequirementsPage = lazy(() => import('../pages/admin/AdminJobRequirementsPage').then((m) => ({ default: m.AdminJobRequirementsPage })));
const AdminFormDocumentsPage = lazy(() => import('../pages/admin/AdminFormDocumentsPage').then((m) => ({ default: m.AdminFormDocumentsPage })));
const AdminAdmissionDetailRoute = lazy(() => import('../pages/admin/AdminDetailRoutes').then((m) => ({ default: m.AdminAdmissionDetailRoute })));
const AdminJobApplicationsRoute = lazy(() => import('../pages/admin/AdminDetailRoutes').then((m) => ({ default: m.AdminJobApplicationsRoute })));
const AuditLogPage = lazy(() => import('../pages/admin/AuditLogPage').then((m) => ({ default: m.AuditLogPage })));

const PageSpinner = () => (
  <div className="min-h-[400px] flex items-center justify-center p-8">
    <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

export function AppRoutes() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <GlobalBackButton />
          <Suspense fallback={<PageSpinner />}>
            <Routes>
              <Route element={<PublicLayout />}>
                <Route index element={<HomePage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="academics" element={<AcademicsPage />} />
                <Route path="academics/:slug" element={<ProgramDetailPage />} />
                <Route path="admissions" element={<AdmissionsPage />} />
                <Route path="parents/track" element={<AdmissionTrackPage />} />
                <Route path="student-life" element={<StudentLifePage />} />
                <Route path="gallery" element={<GalleryPage />} />
                <Route path="news" element={<NewsPage />} />
                <Route path="news/:slug" element={<NewsDetailPage />} />
                <Route path="careers" element={<CareersPage />} />
                <Route path="careers/track" element={<JobTrackPage />} />
                <Route path="careers/:id" element={<CareerDetailPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="parents/policies" element={<StaticParentPage />} />
                <Route path="parents/forms" element={<FormsAndDocumentsPage />} />
                <Route path="search" element={<SearchPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<Navigate to="/register/parent" replace />} />
                <Route path="register/parent" element={<RegisterPage accountType="parent" />} />
                <Route path="register/applicant" element={<RegisterPage accountType="applicant" />} />
                <Route path="forgot-password" element={<ForgotPasswordPage />} />
                <Route path="reset-password" element={<ResetPasswordPage />} />
              </Route>

              <Route element={<ProtectedRoute />}>
                <Route path="portal" element={<PortalRedirect />} />
                <Route element={<PortalLayout portalType="applicant" />}>
                  <Route path="portal/applicant/apply/:jobId" element={<ApplicationWizard />} />
                </Route>
                <Route element={<RoleRoute requiredRole="PARENT" />}>
                  <Route element={<PortalLayout portalType="parent" />}>
                    <Route path="portal/parent" element={<ParentPortalDashboard />} />
                    <Route path="portal/parent/admissions/new" element={<AdmissionWizard />} />
                    <Route path="portal/parent/admissions/:id" element={<ParentAdmissionDetailPage />} />
                  </Route>
                </Route>
                <Route element={<RoleRoute requiredRole="APPLICANT" />}>
                  <Route element={<PortalLayout portalType="applicant" />}>
                    <Route path="portal/applicant" element={<ApplicantPortalDashboard />} />
                    <Route path="portal/applicant/applications/:id" element={<ApplicantApplicationDetailPage />} />
                  </Route>
                </Route>
              </Route>

              <Route path="admin/login" element={<AdminLoginPage />} />

              <Route element={<ProtectedRoute adminOnly />}>
                <Route path="admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="landing/hero" element={<AdminHeroPage />} />
                  <Route path="landing/sections" element={<AdminSectionsPage />} />
                  <Route path="student-life" element={<AdminStudentLifePage />} />
                  <Route path="about" element={<AdminAboutPage />} />
                  <Route path="pages" element={<AdminPagesPage />} />
                  <Route path="form-documents" element={<AdminFormDocumentsPage />} />
                  <Route path="admissions" element={<AdminAdmissionsPage />} />
                  <Route path="admissions/:id" element={<AdminAdmissionDetailRoute />} />
                  <Route path="admission-requirements" element={<AdminRequirementsPage />} />
                  <Route path="careers" element={<AdminCareersPage />} />
                  <Route path="job-requirements" element={<AdminJobRequirementsPage />} />
                  <Route path="careers/:id/applications" element={<AdminJobApplicationsRoute />} />
                  <Route path="inquiries" element={<AdminInquiriesPage />} />
                  <Route path="notifications" element={<NotificationsAdminPage />} />
                  <Route path="education" element={<AdminEducationPage />} />
                  <Route path="education/:id" element={<AdminEducationPage />} />
                  <Route path="gallery" element={<AdminGalleryPage />} />
                  <Route path="blog" element={<AdminBlogPage />} />
                  <Route path="blog/:id" element={<AdminBlogPage />} />
                  <Route element={<ProtectedRoute permission="UPDATE_SYSTEM_CONFIG" />}>
                    <Route path="settings" element={<AdminSettingsPage />} />
                    <Route path="seo" element={<SeoAdminPage />} />
                  </Route>
                  <Route element={<ProtectedRoute permission="MANAGE_USERS" />}>
                    <Route path="users" element={<AdminUsersPage />} />
                  </Route>
                  <Route element={<ProtectedRoute permission="MANAGE_ROLES" />}>
                    <Route path="roles" element={<AdminRolesPage />} />
                    <Route path="audit" element={<AuditLogPage />} />
                  </Route>
                  <Route element={<ProtectedRoute permission="MANAGE_EMAIL_TEMPLATES" />}>
                    <Route path="email" element={<AdminEmailPage />} />
                  </Route>
                </Route>
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
