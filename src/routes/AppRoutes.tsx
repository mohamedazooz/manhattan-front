import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../lib/auth';
import { PublicLayout } from '../components/layout/PublicLayout';
import { AdminLayout } from '../components/layout/AdminLayout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
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
import { ContactPage } from '../pages/public/ContactPage';
import { StaticParentPage } from '../pages/public/StaticParentPage';
import { SearchPage } from '../pages/public/SearchPage';
import { LoginPage, AdminLoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { PortalDashboard } from '../pages/portal/PortalDashboard';
import { NewAdmissionPage } from '../pages/portal/NewAdmissionPage';
import { AdmissionDetailPage } from '../pages/portal/AdmissionDetailPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminHeroPage, AdminSectionsPage } from '../pages/admin/LandingAdminPages';
import { AdminAboutPage, AdminPagesPage, AdminSettingsPage } from '../pages/admin/ContentAdminPages';
import { SeoAdminPage } from '../pages/admin/SeoAdminPage';
import {
  AdminEducationPage,
  AdminGalleryPage,
  AdminBlogPage,
  AdminCommentsPage,
  AdminAdmissionsPage,
  AdminRequirementsPage,
  AdminCareersPage,
  AdminInquiriesPage,
  AdminUsersPage,
  AdminRolesPage,
  AdminEmailPage,
} from '../pages/admin/OpsAdminPages';
import { AdminAdmissionDetailRoute, AdminJobApplicationsRoute } from '../pages/admin/AdminDetailRoutes';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

export function AppRoutes() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="academics" element={<AcademicsPage />} />
              <Route path="academics/:slug" element={<ProgramDetailPage />} />
              <Route path="admissions" element={<AdmissionsPage />} />
              <Route path="student-life" element={<StudentLifePage />} />
              <Route path="news" element={<NewsPage />} />
              <Route path="news/:slug" element={<NewsDetailPage />} />
              <Route path="careers" element={<CareersPage />} />
              <Route path="careers/:id" element={<CareerDetailPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="parents/calendar" element={<StaticParentPage />} />
              <Route path="parents/policies" element={<StaticParentPage />} />
              <Route path="parents/forms" element={<StaticParentPage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path="portal" element={<PortalDashboard />} />
              <Route path="portal/admissions/new" element={<NewAdmissionPage />} />
              <Route path="portal/admissions/:id" element={<AdmissionDetailPage />} />
            </Route>

            <Route path="admin/login" element={<AdminLoginPage />} />

            <Route element={<ProtectedRoute adminOnly />}>
              <Route path="admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="landing/hero" element={<AdminHeroPage />} />
                <Route path="landing/sections" element={<AdminSectionsPage />} />
                <Route path="about" element={<AdminAboutPage />} />
                <Route path="pages" element={<AdminPagesPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
                <Route path="seo" element={<SeoAdminPage />} />
                <Route path="education" element={<AdminEducationPage />} />
                <Route path="education/:id" element={<AdminEducationPage />} />
                <Route path="gallery" element={<AdminGalleryPage />} />
                <Route path="blog" element={<AdminBlogPage />} />
                <Route path="blog/:id" element={<AdminBlogPage />} />
                <Route path="comments" element={<AdminCommentsPage />} />
                <Route path="admissions" element={<AdminAdmissionsPage />} />
                <Route path="admissions/:id" element={<AdminAdmissionDetailRoute />} />
                <Route path="admission-requirements" element={<AdminRequirementsPage />} />
                <Route path="careers" element={<AdminCareersPage />} />
                <Route path="careers/:id/applications" element={<AdminJobApplicationsRoute />} />
                <Route path="inquiries" element={<AdminInquiriesPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="roles" element={<AdminRolesPage />} />
                <Route path="email" element={<AdminEmailPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
