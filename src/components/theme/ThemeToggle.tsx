import type { ThemeMode } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import { useI18n } from '@/hooks/useI18n';
import { cn } from '@/lib/utils/cn';

const MODES: ThemeMode[] = ['light', 'system', 'dark'];

const ICONS: Record<ThemeMode, string> = {
  light: '☀',
  system: '◐',
  dark: '☾',
};

export function ThemeToggle() {
  const { mode, setMode } = useTheme();
  const { t } = useI18n();
  const labelFor = (m: ThemeMode) =>
    m === 'light'
      ? t('settings.theme.light')
      : m === 'dark'
        ? t('settings.theme.dark')
        : t('settings.theme.system');

  return (
    <div
      role="radiogroup"
      aria-label={t('settings.theme.label')}
      className="inline-flex items-center gap-0.5 rounded-full border border-border bg-surface p-0.5"
    >
      {MODES.map((m) => {
        const active = m === mode;
        return (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setMode(m)}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all',
              active
                ? 'bg-accent text-accent-contrast shadow-card'
                : 'text-text-secondary hover:text-text-primary',
            )}
          >
            <span aria-hidden>{ICONS[m]}</span>
            <span>{labelFor(m)}</span>
          </button>
        );
      })}
    </div>
  );
}
