import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DemoProvider } from './context/DemoContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Public Auth Page
import { AuthPage } from './pages/AuthPage';

// Protected Pages
import { PatientDashboard } from './pages/PatientDashboard';
import { ConsultationsPage } from './pages/ConsultationsPage';
import { NewConsultationPage } from './pages/NewConsultationPage';
import { CasesPage } from './pages/CasesPage';
import { CaseDetailPage } from './pages/CaseDetailPage';
import { TriagePage } from './pages/TriagePage';
import { ConnectionSimulatorPage } from './pages/ConnectionSimulatorPage';
import { DoctorDashboardPage } from './pages/DoctorDashboardPage';
import { DoctorQueuePage } from './pages/DoctorQueuePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { FeedbackPage } from './pages/FeedbackPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { AccountPage } from './pages/AccountPage';
import { SettingsPage } from './pages/SettingsPage';
import { CommunicationsPage } from './pages/CommunicationsPage';
import { AssistanceDashboardPage } from './pages/AssistanceDashboardPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <DemoProvider>
        <BrowserRouter>
          <Routes>
            {/* 1. Public Authentication Routes */}
            <Route path="/login" element={<AuthPage />} />
            <Route path="/signup" element={<AuthPage />} />

            {/* 2. Protected Application Routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Routes>
                      {/* Root redirect to dashboard */}
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />

                      {/* Patient Workspace */}
                      <Route path="/dashboard" element={<PatientDashboard />} />
                      <Route path="/assistance" element={<AssistanceDashboardPage />} />
                      <Route path="/consultations" element={<ConsultationsPage />} />
                      <Route path="/consultations/new" element={<NewConsultationPage />} />
                      <Route path="/cases" element={<CasesPage />} />
                      <Route path="/cases/:id" element={<CaseDetailPage />} />
                      <Route path="/triage" element={<TriagePage />} />

                      {/* Network & Resilience Simulator */}
                      <Route path="/connection" element={<ConnectionSimulatorPage />} />
                      <Route path="/communications" element={<CommunicationsPage />} />

                      {/* Doctor Clinical Workspace */}
                      <Route path="/doctor" element={<DoctorDashboardPage />} />
                      <Route path="/doctor/queue" element={<DoctorQueuePage />} />

                      {/* Analytics & Feedback */}
                      <Route path="/analytics" element={<AnalyticsPage />} />
                      <Route path="/feedback" element={<FeedbackPage />} />
                      <Route path="/notifications" element={<NotificationsPage />} />

                      {/* Profile & Settings */}
                      <Route path="/account" element={<AccountPage />} />
                      <Route path="/settings" element={<SettingsPage />} />

                      {/* 404 Fallback */}
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </AppLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </DemoProvider>
    </AuthProvider>
  );
};

export default App;
