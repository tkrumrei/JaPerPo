import { Link } from 'react-router-dom';
import { Container } from '@/components/ui/Container';
import { UserSwitcher } from '@/components/auth/UserSwitcher';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { APP_NAME } from '@/lib/constants';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-bg/85 backdrop-blur">
      <Container size="xl" className="flex h-14 items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold tracking-tight">
          <span
            aria-hidden
            className="inline-flex h-7 w-7 items-center justify-center rounded-xl text-xs font-bold text-white"
            style={{
              backgroundImage:
                'linear-gradient(135deg, #ed1d59 0%, #3fb6b5 55%, #7a1f2b 100%)',
            }}
          >
            JPP
          </span>
          <span>{APP_NAME}</span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="hidden sm:inline-flex">
            <ThemeToggle />
          </div>
          <UserSwitcher />
        </div>
      </Container>
    </header>
  );
}
