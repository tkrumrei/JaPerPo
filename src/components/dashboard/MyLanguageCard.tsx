import { Link } from 'react-router-dom';
import { getLanguageConfig } from '@/languages';
import { languageAccents } from '@/theme/languageAccents';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/hooks/useI18n';

export function MyLanguageCard() {
  const { currentUser } = useAuth();
  const { t } = useI18n();
  if (!currentUser) return null;

  const config = getLanguageConfig(currentUser.primaryLanguage);
  const accent = languageAccents[currentUser.primaryLanguage];

  return (
    <section aria-labelledby="my-lang" className="space-y-3">
      <h2 id="my-lang" className="text-lg font-semibold tracking-tight">
        {t('dashboard.pickLanguage')}
      </h2>
      <Link
        to={`/lang/${config.code}`}
        data-lang={config.code}
        className="group block overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-lg"
      >
        <div className="relative h-32 w-full" style={{ background: accent.gradient }} aria-hidden>
          <span className="absolute right-4 top-4 text-5xl drop-shadow-sm">{config.flag}</span>
        </div>
        <div className="space-y-2 p-5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xl font-semibold tracking-tight">
              {config.germanName}{' '}
              <span className="text-text-muted">· {config.nativeName}</span>
            </h3>
            <div className="flex gap-2">
              <Badge tone="accent">Du: {currentUser.currentLevel}</Badge>
              <Badge>
                {config.levels.min}–{config.levels.max}
              </Badge>
            </div>
          </div>
          <p className="text-sm text-text-secondary">{config.tagline}</p>
          <div className="pt-2 text-sm font-medium text-accent">
            Weiter zum Lernbereich →
          </div>
        </div>
      </Link>
    </section>
  );
}
