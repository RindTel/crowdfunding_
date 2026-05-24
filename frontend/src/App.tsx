import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/auth.store';

import { AppShell, PublicLayout, ProtectedRoute } from './components/layout/AppShell';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { LandingPage } from './pages/LandingPage';
import { CampaignsPage, CampaignDetailPage, CreateCampaignPage, CampaignEditPage } from './pages';
import { DashboardOverviewPage, DashboardCampaignsPage, DashboardSettingsPage } from './pages/DashboardPages';
import { AdminUsersPage, AdminDonationsPage, AdminReportsPage, AdminAnalyticsPage, AnalyticsRouterPage } from './pages/AdminPages';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000, refetchOnWindowFocus: false } },
});

function AppInit({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, fetchProfile } = useAuthStore();
  useEffect(() => { if (isAuthenticated) fetchProfile().catch(() => {}); }, []);
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppInit>
          <Routes>
            {/* Public */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/campaigns" element={<CampaignsPage />} />
              <Route path="/campaigns/:slug" element={<CampaignDetailPage />} />
            </Route>

            {/* Auth */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected dashboard */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route path="/dashboard" element={<DashboardOverviewPage />} />
                <Route path="/dashboard/campaigns" element={<DashboardCampaignsPage />} />
                <Route path="/dashboard/campaigns/new" element={<CreateCampaignPage />} />
                <Route path="/dashboard/campaigns/:id/edit" element={<CampaignEditPage />} />
                <Route path="/dashboard/analytics" element={<AnalyticsRouterPage />} />
                <Route path="/dashboard/settings" element={<DashboardSettingsPage />} />
                {/* Admin-only */}
                <Route element={<ProtectedRoute roles={['ADMIN']} />}>
                  <Route path="/dashboard/users" element={<AdminUsersPage />} />
                  <Route path="/dashboard/donations" element={<AdminDonationsPage />} />
                  <Route path="/dashboard/reports" element={<AdminReportsPage />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppInit>
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#1e2030', color: '#e2e8f0', fontSize: '13px',
            borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </QueryClientProvider>
  );
}
