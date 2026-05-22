import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/ui/Avatar';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getLanguageConfig } from '@/languages';
import { languageAccents } from '@/theme/languageAccents';

export function ProfilePage() {
  const { currentUser } = useAuth();
  if (!currentUser) return null;

  const config = getLanguageConfig(currentUser.primaryLanguage);
  const accent = languageAccents[currentUser.primaryLanguage];

  return (
    <div className="space-y-4">
      <Card className="flex items-center gap-4">
        <Avatar name={currentUser.displayName} color={currentUser.avatarColor} size="lg" />
        <div>
          <CardTitle className="text-xl">{currentUser.displayName}</CardTitle>
          <CardDescription>
            Lernt {config.germanName} · Startniveau {currentUser.currentLevel}
          </CardDescription>
        </div>
      </Card>

      <Card data-lang={config.code} padded={false} className="overflow-hidden">
        <div className="h-24 w-full" style={{ background: accent.gradient }} aria-hidden />
        <div className="space-y-2 p-5">
          <CardHeader>
            <CardTitle>
              {config.germanName}{' '}
              <span className="text-text-muted">· {config.nativeName}</span>
            </CardTitle>
            <Badge tone="accent">{currentUser.currentLevel}</Badge>
          </CardHeader>
          <CardDescription>{config.tagline}</CardDescription>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div className="rounded-2xl bg-surface p-3">
              <dt className="text-xs text-text-muted">Streak</dt>
              <dd className="font-semibold">—</dd>
            </div>
            <div className="rounded-2xl bg-surface p-3">
              <dt className="text-xs text-text-muted">XP</dt>
              <dd className="font-semibold">—</dd>
            </div>
            <div className="rounded-2xl bg-surface p-3">
              <dt className="text-xs text-text-muted">Woerter</dt>
              <dd className="font-semibold">—</dd>
            </div>
            <div className="rounded-2xl bg-surface p-3">
              <dt className="text-xs text-text-muted">Tests</dt>
              <dd className="font-semibold">—</dd>
            </div>
          </dl>
        </div>
      </Card>
    </div>
  );
}
