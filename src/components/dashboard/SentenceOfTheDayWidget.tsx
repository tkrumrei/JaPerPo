import { useEffect, useRef, useState } from 'react';
import type { LanguageCode, SentenceOfTheDay } from '@/types';
import { useAI } from '@/hooks/useAI';
import { useI18n } from '@/hooks/useI18n';
import { useRepository } from '@/hooks/useRepository';
import { todayIso } from '@/lib/utils/date';
import { uuid } from '@/lib/utils/id';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';

const FLAGS: Record<LanguageCode, string> = { ja: '🇯🇵', fa: '🇮🇷', pt: '🇵🇹' };
const DIRS: Record<LanguageCode, 'ltr' | 'rtl'> = { ja: 'ltr', fa: 'rtl', pt: 'ltr' };

export function SentenceOfTheDayWidget() {
  const { t } = useI18n();
  const ai = useAI();
  const sotdRepo = useRepository('sentenceOfTheDay');
  const today = todayIso();
  const [sentence, setSentence] = useState<SentenceOfTheDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ensureInFlightRef = useRef(false);

  useEffect(() => {
    const ensureSentenceForToday = async () => {
      setLoading(true);
      setError(null);
      try {
        const existing = await sotdRepo.findByDate(today);
        if (existing) {
          setSentence(existing);
          return;
        }

        if (!ai) {
          setSentence(null);
          setError('KI nicht verfuegbar.');
          return;
        }

        if (ensureInFlightRef.current) {
          return;
        }

        ensureInFlightRef.current = true;
        setGenerating(true);
        const result = await ai.generateSentenceOfTheDay();
        const fresh: SentenceOfTheDay = {
          id: uuid(),
          date: today,
          texts: result.texts,
          explanation: result.explanation,
          highlightedWords: result.highlightedWords,
        };

        try {
          await sotdRepo.upsert(fresh);
          setSentence(fresh);
        } catch {
          // Parallel erzeugt: finalen Datensatz fuer den Tag nachladen.
          const afterConflict = await sotdRepo.findByDate(today);
          if (afterConflict) {
            setSentence(afterConflict);
          } else {
            throw new Error('Satz des Tages konnte nicht gespeichert werden.');
          }
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        ensureInFlightRef.current = false;
        setGenerating(false);
        setLoading(false);
      }
    };

    void ensureSentenceForToday();
  }, [ai, sotdRepo, today]);

  const utcDateLabel = new Intl.DateTimeFormat('de', {
    timeZone: 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(`${today}T00:00:00.000Z`));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.sentenceOfTheDay')}</CardTitle>
        <Badge tone="accent">{utcDateLabel} UTC</Badge>
      </CardHeader>
      <CardDescription>
        Taeglich ein neuer Satz - in allen drei Sprachen gleichzeitig.
      </CardDescription>

      {loading || generating ? (
        <div className="mt-4 flex justify-center py-4">
          <Spinner />
        </div>
      ) : sentence ? (
        <div className="mt-4 space-y-2 text-sm">
          {(['ja', 'fa', 'pt'] as LanguageCode[]).map((code) => (
            <div
              key={code}
              className="rounded-2xl border border-border bg-surface p-3"
              dir={DIRS[code]}
            >
              <span className="mr-2" aria-hidden>
                {FLAGS[code]}
              </span>
              <span>{sentence.texts[code]}</span>
            </div>
          ))}
          {sentence.explanation && (
            <p className="rounded-2xl bg-accent/5 p-3 text-xs text-text-secondary">
              💡 {sentence.explanation}
            </p>
          )}
        </div>
      ) : (
        <div className="mt-4 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-surface p-4 text-center">
          <p className="text-sm text-text-secondary">Der Satz des Tages wird automatisch erstellt.</p>
          {error && <p className="text-xs text-tinto-600">{error}</p>}
        </div>
      )}
    </Card>
  );
}
