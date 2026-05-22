import { Outlet } from 'react-router-dom';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Container } from '@/components/ui/Container';
import { APP_NAME } from '@/lib/constants';

export function AuthLayout() {
  return (
    <div className="relative flex min-h-screen flex-col bg-bg">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 opacity-60"
        style={{
          backgroundImage:
            'radial-gradient(60% 60% at 50% 0%, rgb(255 111 139 / 0.25) 0%, transparent 60%), ' +
            'radial-gradient(40% 40% at 80% 30%, rgb(63 182 181 / 0.2) 0%, transparent 70%), ' +
            'radial-gradient(40% 40% at 20% 30%, rgb(122 31 43 / 0.18) 0%, transparent 70%)',
        }}
      />
      <header className="relative z-10 flex h-14 items-center justify-between px-4 sm:px-6">
        <span className="font-semibold tracking-tight">{APP_NAME}</span>
        <ThemeToggle />
      </header>
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-10">
        <Container size="sm">
          <Outlet />
        </Container>
      </main>
    </div>
  );
}
