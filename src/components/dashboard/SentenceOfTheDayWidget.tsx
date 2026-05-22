import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useI18n } from '@/hooks/useI18n';

export function SentenceOfTheDayWidget() {
  const { t } = useI18n();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.sentenceOfTheDay')}</CardTitle>
        <Badge tone="accent">In Arbeit</Badge>
      </CardHeader>
      <CardDescription>
        Taeglich ein neuer Satz — in allen drei Sprachen gleichzeitig. Der Leaderboard-Sieger des
        Vortags darf den naechsten Satz aussuchen.
      </CardDescription>
      <div className="mt-4 space-y-2 text-sm">
        <div className="rounded-2xl border border-dashed border-border bg-surface p-3">
          <span className="text-text-muted">🇯🇵</span>{' '}
          <span className="text-text-secondary">— Folgt mit KI-Anbindung.</span>
        </div>
        <div className="rounded-2xl border border-dashed border-border bg-surface p-3">
          <span className="text-text-muted">🇮🇷</span>{' '}
          <span className="text-text-secondary">— Folgt mit KI-Anbindung.</span>
        </div>
        <div className="rounded-2xl border border-dashed border-border bg-surface p-3">
          <span className="text-text-muted">🇵🇹</span>{' '}
          <span className="text-text-secondary">— Folgt mit KI-Anbindung.</span>
        </div>
      </div>
    </Card>
  );
}
