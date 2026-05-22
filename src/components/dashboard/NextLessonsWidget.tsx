import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useI18n } from '@/hooks/useI18n';
import { useAuth } from '@/hooks/useAuth';
import { useRepository } from '@/hooks/useRepository';
import { useEffect, useState } from 'react';
import { isDue } from '@/features/vocabulary/srs';
import { Link } from 'react-router-dom';

export function NextLessonsWidget() {
  const { t } = useI18n();
  const { currentUser } = useAuth();
  const progressRepo = useRepository('progress');
  const [dueCount, setDueCount] = useState(0);
  const [newCount, setNewCount] = useState(0);
  const [vocabCount, setVocabCount] = useState(0);
  const vocabRepo = useRepository('vocabulary');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    void Promise.all([
      progressRepo.findByUser(currentUser.id),
      vocabRepo.findByLanguage(currentUser.primaryLanguage),
    ]).then(([progress, vocab]) => {
      setVocabCount(vocab.length);
      const progressMap = new Map(progress.map((p) => [p.vocabularyId, p]));
      let due = 0;
      let news = 0;
      for (const v of vocab) {
        const p = progressMap.get(v.id);
        if (!p) news++;
        else if (p.srs.status !== 'mastered' && isDue(p.srs)) due++;
      }
      setDueCount(due);
      setNewCount(news);
      setLoading(false);
    });
  }, [currentUser, progressRepo, vocabRepo]);

  const total = dueCount + newCount;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.nextLessons')}</CardTitle>
        <Badge tone={total > 0 ? 'accent' : 'neutral'}>
          {total > 0 ? `${total} bereit` : 'Aktuell'}
        </Badge>
      </CardHeader>
      <CardDescription>
        Faellige Spaced-Repetition-Karten fuer deine Sprache.
      </CardDescription>
      <div className="mt-4">
        {loading ? (
          <div className="flex justify-center py-4">
            <Spinner />
          </div>
        ) : vocabCount === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-4 text-center text-sm text-text-muted">
            Noch keine Vokabeln im System.{' '}
            <Link
              to={`/lang/${currentUser?.primaryLanguage}/vocab`}
              className="text-accent underline-offset-2 hover:underline"
            >
              Vokabeln generieren
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-2xl bg-surface p-3">
                <div className="text-2xl font-semibold text-accent">{dueCount}</div>
                <div className="text-[10px] uppercase tracking-wide text-text-muted">Faellig</div>
              </div>
              <div className="rounded-2xl bg-surface p-3">
                <div className="text-2xl font-semibold">{newCount}</div>
                <div className="text-[10px] uppercase tracking-wide text-text-muted">Neu</div>
              </div>
              <div className="rounded-2xl bg-surface p-3">
                <div className="text-2xl font-semibold">{vocabCount}</div>
                <div className="text-[10px] uppercase tracking-wide text-text-muted">Gesamt</div>
              </div>
            </div>
            {currentUser && total > 0 && (
              <Link to={`/lang/${currentUser.primaryLanguage}/vocab`}>
                <Button fullWidth>Wiederholung starten</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
