import { NavLink } from 'react-router-dom';
import type { LanguageConfig } from '@/languages';
import { useI18n } from '@/hooks/useI18n';
import { cn } from '@/lib/utils/cn';

interface LanguageSubNavProps {
  config: LanguageConfig;
}

export function LanguageSubNav({ config }: LanguageSubNavProps) {
  const { t } = useI18n();
  const items = [
    { to: ``, end: true, labelKey: 'nav.overview' as const, enabled: true },
    { to: 'vocab', labelKey: 'nav.vocab' as const, enabled: config.features.vocabulary },
    { to: 'dialogues', labelKey: 'nav.dialogues' as const, enabled: config.features.dialogues },
    { to: 'chat', labelKey: 'nav.chat' as const, enabled: config.features.freeChat },
    { to: 'reading', labelKey: 'nav.reading' as const, enabled: config.features.reading },
    { to: 'grammar', labelKey: 'nav.grammar' as const, enabled: config.features.grammar },
    { to: 'tests', labelKey: 'nav.tests' as const, enabled: config.features.tests },
  ];

  return (
    <div
      data-lang={config.code}
      className="sticky top-14 z-30 -mx-4 mb-4 overflow-x-auto border-b border-border bg-bg/85 px-4 backdrop-blur sm:-mx-6 sm:px-6"
    >
      <nav aria-label={`Bereiche fuer ${config.germanName}`} className="flex min-w-max gap-1 py-2">
        {items
          .filter((item) => item.enabled)
          .map((item) => (
            <NavLink
              key={item.to || 'overview'}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent text-accent-contrast shadow-card'
                    : 'text-text-secondary hover:bg-surface hover:text-text-primary',
                )
              }
            >
              {t(item.labelKey)}
            </NavLink>
          ))}
      </nav>
    </div>
  );
}
