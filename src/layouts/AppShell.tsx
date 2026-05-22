import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { SideNav } from './SideNav';
import { BottomNav } from './BottomNav';
import { Container } from '@/components/ui/Container';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export function AppShell() {
  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <div className="mx-auto flex w-full max-w-screen-xl">
        <SideNav />
        <main className="flex-1 pb-24 md:pb-12">
          <Container size="xl" className="py-6">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </Container>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
