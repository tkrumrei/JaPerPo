import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useI18n } from '@/hooks/useI18n';

export function NextLessonsWidget() {
  const { t } = useI18n();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.nextLessons')}</CardTitle>
        <Badge>Spaced Repetition</Badge>
      </CardHeader>
      <CardDescription>
        Hier listet Spaced Repetition spaeter die naechsten faelligen Wiederholungen auf. Solange
        keine Vokabeln im System sind, bleibt die Liste leer.
      </CardDescription>
      <div className="mt-4 rounded-2xl border border-dashed border-border bg-surface p-4 text-center text-sm text-text-muted">
        Keine Wiederholungen geplant.
      </div>
    </Card>
  );
}
