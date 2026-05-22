import { Navigate, createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/layouts/AppShell';
import { AuthLayout } from '@/layouts/AuthLayout';
import { LanguageLayout } from '@/layouts/LanguageLayout';
import { ProtectedRoute, RedirectIfAuthenticated } from '@/components/auth/ProtectedRoute';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SettingsPage } from '@/pages/SettingsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { LanguageHubPage } from '@/pages/language/LanguageHubPage';
import { VocabularyTrainerPage } from '@/pages/language/VocabularyTrainerPage';
import { DialoguesPage } from '@/pages/language/DialoguesPage';
import { FreeChatPage } from '@/pages/language/FreeChatPage';
import { ReadingPage } from '@/pages/language/ReadingPage';
import { GrammarPage } from '@/pages/language/GrammarPage';
import { TestsPage } from '@/pages/language/TestsPage';

export const router = createBrowserRouter(
  [
    {
      path: '/login',
      element: (
        <RedirectIfAuthenticated>
          <AuthLayout />
        </RedirectIfAuthenticated>
      ),
      children: [{ index: true, element: <LoginPage /> }],
    },
    {
      path: '/',
      element: (
        <ProtectedRoute>
          <AppShell />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <Navigate to="/dashboard" replace /> },
        { path: 'dashboard', element: <DashboardPage /> },
        { path: 'profile', element: <ProfilePage /> },
        { path: 'settings', element: <SettingsPage /> },
        {
          path: 'lang/:lang',
          element: <LanguageLayout />,
          children: [
            { index: true, element: <LanguageHubPage /> },
            { path: 'vocab', element: <VocabularyTrainerPage /> },
            { path: 'dialogues', element: <DialoguesPage /> },
            { path: 'chat', element: <FreeChatPage /> },
            { path: 'reading', element: <ReadingPage /> },
            { path: 'grammar', element: <GrammarPage /> },
            { path: 'tests', element: <TestsPage /> },
          ],
        },
        { path: '*', element: <NotFoundPage /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL },
);
