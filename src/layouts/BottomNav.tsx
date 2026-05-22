import { NavLink } from 'react-router-dom';
import { useI18n } from '@/hooks/useI18n';
import { cn } from '@/lib/utils/cn';

const ITEMS = [
  { to: '/dashboard', labelKey: 'nav.dashboard' as const, icon: '🏠' },
  { to: '/profile', labelKey: 'nav.profile' as const, icon: '👤' },
  { to: '/settings', labelKey: 'nav.settings' as const, icon: '⚙' },
];

export function BottomNav() {
  const { t } = useI18n();
  return (
    <nav
      aria-label="Hauptnavigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg/95 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 backdrop-blur md:hidden"
    >
      <ul className="mx-auto flex max-w-screen-sm items-center justify-around">
        {ITEMS.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex min-w-[64px] flex-col items-center gap-0.5 rounded-2xl px-3 py-1.5 text-[11px] transition-colors',
                  isActive
                    ? 'bg-accent/10 text-accent'
                    : 'text-text-secondary hover:text-text-primary',
                )
              }
            >
              <span className="text-lg" aria-hidden>
                {item.icon}
              </span>
              <span>{t(item.labelKey)}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
