import { useEffect, useState } from 'react';
import type { LanguageCode, SentenceOfTheDay } from '@/types';
import { useAI } from '@/hooks/useAI';
import { useI18n } from '@/hooks/useI18n';
import { useRepository } from '@/hooks/useRepository';
import { todayIso } from '@/lib/utils/date';
import { uuid } from '@/lib/utils/id';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
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

  useEffect(() => {
    setLoading(true);
    void sotdRepo.findByDate(today).then((s) => {
      setSentence(s);
      setLoading(false);
    });
  }, [today, sotdRepo]);

  const handleGenerate = async () => {
    if (!ai) {
      setError('KI nicht verfuegbar.');
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const result = await ai.generateSentenceOfTheDay();
      const fresh: SentenceOfTheDay = {
        id: uuid(),
        date: today,
        texts: result.texts,
        explanation: result.explanation,
        highlightedWords: result.highlightedWords,
      };
      await sotdRepo.upsert(fresh);
      setSentence(fresh);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.sentenceOfTheDay')}</CardTitle>
        <Badge tone="accent">{new Date(today).toLocaleDateString('de')}</Badge>
      </CardHeader>
      <CardDescription>
        Taeglich ein neuer Satz — in allen drei Sprachen gleichzeitig.
      </CardDescription>

      {loading ? (
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
          <p className="text-sm text-text-secondary">
            Noch kein Satz fuer heute. Lass die KI einen erfinden.
          </p>
          <Button onClick={() => void handleGenerate()} disabled={!ai || generating}>
            {generating ? <Spinner size={18} /> : 'Satz des Tages generieren'}
          </Button>
          {error && <p className="text-xs text-tinto-600">{error}</p>}
        </div>
      )}
    </Card>
  );
}
