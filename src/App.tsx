import { RouterProvider } from 'react-router-dom';
import { StorageProvider } from '@/providers/StorageProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { I18nProvider } from '@/providers/I18nProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { router } from '@/routes';

export function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <StorageProvider>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </StorageProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
