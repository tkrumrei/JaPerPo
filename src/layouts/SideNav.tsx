import { NavLink } from 'react-router-dom';
import { getLanguageConfig } from '@/languages';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/hooks/useI18n';
import { cn } from '@/lib/utils/cn';

const MAIN_ITEMS = [
  { to: '/dashboard', labelKey: 'nav.dashboard' as const, icon: '🏠' },
  { to: '/profile', labelKey: 'nav.profile' as const, icon: '👤' },
  { to: '/settings', labelKey: 'nav.settings' as const, icon: '⚙' },
];

export function SideNav() {
  const { t } = useI18n();
  const { currentUser } = useAuth();
  const myLang = currentUser ? getLanguageConfig(currentUser.primaryLanguage) : null;

  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-56 shrink-0 border-r border-border bg-bg/60 px-3 py-4 md:block">
      <nav aria-label="Hauptnavigation">
        <ul className="space-y-1">
          {MAIN_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-accent/10 text-accent'
                      : 'text-text-secondary hover:bg-surface hover:text-text-primary',
                  )
                }
              >
                <span aria-hidden>{item.icon}</span>
                {t(item.labelKey)}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {myLang && (
        <div className="mt-6">
          <p className="px-3 pb-2 text-xs uppercase tracking-wide text-text-muted">Meine Sprache</p>
          <NavLink
            to={`/lang/${myLang.code}`}
            data-lang={myLang.code}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-accent/10 text-accent'
                  : 'text-text-secondary hover:bg-surface hover:text-text-primary',
              )
            }
          >
            <span aria-hidden>{myLang.flag}</span>
            {myLang.germanName}
          </NavLink>
        </div>
      )}
    </aside>
  );
}
