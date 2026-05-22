import { useEffect, useState } from 'react';
import type { Test, TestType } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useAI } from '@/hooks/useAI';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';
import { useRepository } from '@/hooks/useRepository';
import { uuid } from '@/lib/utils/id';
import { nowIso } from '@/lib/utils/date';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils/cn';

const TYPE_LABELS: Record<TestType, string> = {
  mixed: 'Gemischt',
  multiple_choice: 'Multiple Choice',
  cloze: 'Lueckentext',
  grammar: 'Grammatik',
  conversation: 'Konversation',
};

const ATTEMPTS_ALLOWED = 3;

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function TestsPage() {
  const { currentUser } = useAuth();
  const langCtx = useCurrentLanguage();
  const ai = useAI();
  const testRepo = useRepository('tests');

  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<TestType>('mixed');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [active, setActive] = useState<Test | null>(null);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [results, setResults] = useState<boolean[]>([]);
  const [revealing, setRevealing] = useState(false);

  useEffect(() => {
    if (!currentUser || !langCtx) return;
    setLoading(true);
    void testRepo.findByUserAndLanguage(currentUser.id, langCtx.code).then((list) => {
      setTests(list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)));
      setLoading(false);
    });
  }, [currentUser, langCtx, testRepo]);

  const handleGenerate = async () => {
    if (!ai || !langCtx || !currentUser) {
      setError('KI nicht verfuegbar — bitte Supabase-Anbindung pruefen.');
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const result = await ai.generateTest({
        language: langCtx.code,
        level: currentUser.currentLevel,
        type,
        count: 8,
      });
      const test: Test = {
        id: uuid(),
        userId: currentUser.id,
        language: langCtx.code,
        title: result.title,
        type,
        questions: result.questions,
        attemptsAllowed: ATTEMPTS_ALLOWED,
        attemptsUsed: 0,
        completed: false,
        createdAt: nowIso(),
      };
      await testRepo.upsert(test);
      setTests((prev) => [test, ...prev]);
      startTest(test);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  const startTest = (test: Test) => {
    setActive(test);
    setQuestionIdx(0);
    setAnswer('');
    setResults([]);
    setRevealing(false);
  };

  const handleSubmit = async () => {
    if (!active) return;
    const q = active.questions[questionIdx];
    if (!q) return;
    const isCorrect = normalize(answer) === normalize(q.answer);
    setResults((prev) => [...prev, isCorrect]);
    setRevealing(true);
  };

  const handleNext = async () => {
    if (!active) return;
    setRevealing(false);
    setAnswer('');
    if (questionIdx + 1 >= active.questions.length) {
      const correct = results.filter(Boolean).length;
      const total = active.questions.length;
      const attemptsUsed = active.attemptsUsed + 1;
      const baseScore = (correct / total) * 100;
      const bonus = Math.max(0, ATTEMPTS_ALLOWED - attemptsUsed) * 5;
      const finalScore = Math.round(baseScore + bonus);
      const completed = active.completed || correct === total || attemptsUsed >= ATTEMPTS_ALLOWED;
      const updated: Test = {
        ...active,
        attemptsUsed,
        completed,
        score: finalScore,
        completedAt: completed ? nowIso() : undefined,
      };
      await testRepo.upsert(updated);
      setTests((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setActive(updated);
      // Stay on summary
      setQuestionIdx(active.questions.length);
    } else {
      setQuestionIdx((i) => i + 1);
    }
  };

  if (!langCtx) return null;

  if (active) {
    const total = active.questions.length;
    const isSummary = questionIdx >= total;

    if (isSummary) {
      const correct = results.filter(Boolean).length;
      return (
        <div className="space-y-4">
          <Card className="text-center">
            <div className="text-5xl">{correct === total ? '🏆' : '✨'}</div>
            <CardTitle className="mt-2 text-2xl">{active.title}</CardTitle>
            <CardDescription className="mt-1">
              {correct} von {total} richtig · Versuche {active.attemptsUsed} / {active.attemptsAllowed}
            </CardDescription>
            <div className="mt-4 text-5xl font-bold text-accent">{active.score}</div>
            <div className="mt-1 text-xs text-text-muted">Punkte</div>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {!active.completed && (
                <Button onClick={() => startTest(active)}>Nochmal versuchen</Button>
              )}
              <Button variant="secondary" onClick={() => setActive(null)}>
                Zurueck zur Liste
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    const q = active.questions[questionIdx]!;
    const wasCorrect = results[questionIdx];
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <header className="flex items-center justify-between text-sm text-text-secondary">
          <span>
            Frage {questionIdx + 1} / {total}
          </span>
          <button
            type="button"
            onClick={() => setActive(null)}
            className="text-text-muted underline-offset-2 hover:underline"
          >
            Abbrechen
          </button>
        </header>

        <Card>
          <div className="text-xs uppercase tracking-wide text-text-muted">
            {TYPE_LABELS[q.type]}
          </div>
          <p className="mt-2 text-base font-medium" dir={langCtx.code === 'fa' ? 'rtl' : 'ltr'}>
            {q.prompt}
          </p>

          {q.options && q.options.length > 0 ? (
            <div className="mt-4 grid gap-2">
              {q.options.map((opt) => {
                const selected = answer === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={revealing}
                    onClick={() => setAnswer(opt)}
                    className={cn(
                      'rounded-2xl border px-3 py-2 text-left text-sm transition-colors',
                      selected
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border hover:border-accent/40',
                      revealing && opt === q.answer && 'border-emerald-500 bg-emerald-500/10',
                      revealing && selected && opt !== q.answer && 'border-tinto-500 bg-tinto-500/10',
                    )}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          ) : (
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !revealing) void handleSubmit();
              }}
              disabled={revealing}
              placeholder="Antwort eingeben…"
              dir={langCtx.code === 'fa' ? 'rtl' : 'ltr'}
              className="mt-4 w-full rounded-2xl border border-border bg-surface px-4 py-2 text-sm focus:border-accent focus:outline-none"
            />
          )}

          {revealing && (
            <div
              className={cn(
                'mt-4 rounded-2xl p-3 text-sm',
                wasCorrect
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                  : 'bg-tinto-500/10 text-tinto-700 dark:text-tinto-200',
              )}
            >
              {wasCorrect ? '✓ Richtig!' : `✗ Korrekt waere: ${q.answer}`}
              {q.hint && <div className="mt-1 text-xs opacity-80">💡 {q.hint}</div>}
            </div>
          )}

          <div className="mt-4 flex justify-end gap-2">
            {!revealing ? (
              <Button onClick={() => void handleSubmit()} disabled={!answer.trim()}>
                Antworten
              </Button>
            ) : (
              <Button onClick={() => void handleNext()}>
                {questionIdx + 1 >= total ? 'Auswerten' : 'Naechste'}
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Neuen Test generieren</CardTitle>
          {ai ? null : <Badge tone="warning">KI offline</Badge>}
        </CardHeader>
        <CardDescription>
          {ATTEMPTS_ALLOWED} Versuche pro Test — wer beim ersten Versuch fertig ist, kassiert
          Extra-Punkte.
        </CardDescription>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {(Object.entries(TYPE_LABELS) as Array<[TestType, string]>).map(([t, label]) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={cn(
                'rounded-full border px-2.5 py-1 text-xs transition-colors',
                type === t
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border text-text-secondary hover:border-accent/40',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          <Button onClick={() => void handleGenerate()} disabled={!ai || generating} fullWidth>
            {generating ? <Spinner size={18} /> : `+ ${TYPE_LABELS[type]}-Test generieren`}
          </Button>
        </div>
        {error && <p className="mt-3 text-sm text-tinto-600">{error}</p>}
      </Card>

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : tests.length === 0 ? (
        <EmptyState
          icon="🎯"
          title="Noch keine Tests"
          description="Lass dir oben einen Test generieren — danach erscheint er hier."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {tests.map((t) => (
            <Card key={t.id} interactive onClick={() => startTest({ ...t })}>
              <CardHeader>
                <CardTitle className="truncate">{t.title}</CardTitle>
                {t.completed ? (
                  <Badge tone="success">{t.score} Pkt</Badge>
                ) : (
                  <Badge tone="accent">{TYPE_LABELS[t.type]}</Badge>
                )}
              </CardHeader>
              <CardDescription>
                {t.questions.length} Fragen · Versuche {t.attemptsUsed}/{t.attemptsAllowed}
                {t.score != null && ` · letzter Score: ${t.score}`}
              </CardDescription>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
