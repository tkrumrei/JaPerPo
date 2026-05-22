import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Progress, VocabularyItem } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useAI } from '@/hooks/useAI';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';
import { useRepository } from '@/hooks/useRepository';
import { answerCard, initialState, isDue, type Quality } from '@/features/vocabulary/srs';
import { uuid } from '@/lib/utils/id';
import { nowIso } from '@/lib/utils/date';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';

const QUALITY_BUTTONS: Array<{
  label: string;
  description: string;
  quality: Quality;
  variant: 'danger' | 'secondary' | 'primary';
}> = [
  { label: 'Vergessen', description: 'Nochmal von vorn', quality: 0, variant: 'danger' },
  { label: 'Schwierig', description: 'Wusste, aber muehsam', quality: 3, variant: 'secondary' },
  { label: 'Gut', description: 'Solide gewusst', quality: 4, variant: 'secondary' },
  { label: 'Einfach', description: 'Sass perfekt', quality: 5, variant: 'primary' },
];

export function VocabularyTrainerPage() {
  const { currentUser } = useAuth();
  const langCtx = useCurrentLanguage();
  const ai = useAI();
  const vocabRepo = useRepository('vocabulary');
  const progressRepo = useRepository('progress');
  const profilesRepo = useRepository('profiles');

  const [vocab, setVocab] = useState<VocabularyItem[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [transliteration, setTransliteration] = useState(true);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'overview' | 'review'>('overview');
  const [reviewQueue, setReviewQueue] = useState<VocabularyItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [topic, setTopic] = useState('Alltag');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser || !langCtx) return;
    setLoading(true);
    void (async () => {
      const [v, p, profile] = await Promise.all([
        vocabRepo.findByLanguage(langCtx.code),
        progressRepo.findByUserAndLanguage(currentUser.id, langCtx.code),
        profilesRepo.findByUserId(currentUser.id),
      ]);
      setVocab(v);
      setProgress(p);
      setTransliteration(profile?.settings.persianTransliteration ?? true);
      setLoading(false);
    })();
  }, [currentUser, langCtx, vocabRepo, progressRepo, profilesRepo]);

  const progressMap = useMemo(
    () => new Map(progress.map((p) => [p.vocabularyId, p])),
    [progress],
  );

  const stats = useMemo(() => {
    let news = 0;
    let due = 0;
    let mastered = 0;
    for (const item of vocab) {
      const p = progressMap.get(item.id);
      if (!p) news++;
      else if (p.srs.status === 'mastered') mastered++;
      else if (isDue(p.srs)) due++;
    }
    return { total: vocab.length, news, due, mastered };
  }, [vocab, progressMap]);

  const startReview = useCallback(() => {
    const queue = vocab.filter((item) => {
      const p = progressMap.get(item.id);
      return !p || (p.srs.status !== 'mastered' && isDue(p.srs));
    });
    if (queue.length === 0) return;
    const shuffled = [...queue].sort(() => Math.random() - 0.5).slice(0, 20);
    setReviewQueue(shuffled);
    setCurrentIdx(0);
    setShowAnswer(false);
    setMode('review');
  }, [vocab, progressMap]);

  const handleAnswer = useCallback(
    async (quality: Quality) => {
      if (!currentUser || !langCtx) return;
      const card = reviewQueue[currentIdx];
      if (!card) return;
      const existing = progressMap.get(card.id);
      const srs = answerCard(existing?.srs ?? initialState(), quality);
      const next: Progress = existing
        ? { ...existing, srs, updatedAt: nowIso() }
        : {
            id: uuid(),
            userId: currentUser.id,
            vocabularyId: card.id,
            language: langCtx.code,
            srs,
            updatedAt: nowIso(),
          };
      await progressRepo.upsert(next);
      setProgress((prev) => {
        const others = prev.filter((p) => p.vocabularyId !== card.id);
        return [...others, next];
      });
      if (currentIdx + 1 >= reviewQueue.length) {
        setMode('overview');
        setReviewQueue([]);
      } else {
        setCurrentIdx((i) => i + 1);
        setShowAnswer(false);
      }
    },
    [currentUser, langCtx, reviewQueue, currentIdx, progressMap, progressRepo],
  );

  const handleGenerate = async () => {
    if (!ai || !langCtx || !currentUser) {
      setError('KI nicht verfuegbar — bitte Supabase-Anbindung pruefen.');
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const generated = await ai.generateVocabulary({
        language: langCtx.code,
        level: currentUser.currentLevel,
        topic,
        count: 8,
      });
      const items: VocabularyItem[] = generated.map((g) => ({
        id: uuid(),
        language: langCtx.code,
        word: g.word,
        translation: g.translation,
        transcription: g.transcription,
        exampleSentence: g.exampleSentence,
        category: g.category,
        level: currentUser.currentLevel,
        difficulty: 1,
        aiGenerated: true,
        createdAt: nowIso(),
      }));
      for (const item of items) {
        await vocabRepo.upsert(item);
      }
      setVocab((prev) => [...prev, ...items]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  if (!langCtx) return null;
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size={28} />
      </div>
    );
  }

  const showTranscription = (item: VocabularyItem | undefined) => {
    if (!item?.transcription) return false;
    if (langCtx.code === 'fa') return transliteration;
    return true;
  };

  if (mode === 'review') {
    const card = reviewQueue[currentIdx];
    if (!card) return null;
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <header className="flex items-center justify-between text-sm text-text-secondary">
          <span>
            Karte {currentIdx + 1} / {reviewQueue.length}
          </span>
          <button
            type="button"
            onClick={() => setMode('overview')}
            className="text-text-muted underline-offset-2 hover:underline"
          >
            Abbrechen
          </button>
        </header>

        <Card className="text-center">
          <div className="py-8">
            <div className="text-3xl font-semibold tracking-tight sm:text-4xl" dir={langCtx.code === 'fa' ? 'rtl' : 'ltr'}>
              {card.word}
            </div>
            {showTranscription(card) && (
              <div className="mt-2 text-sm text-text-muted">{card.transcription}</div>
            )}
          </div>

          {showAnswer ? (
            <div className="border-t border-border pt-4">
              <div className="text-xl font-medium">{card.translation}</div>
              {card.exampleSentence && (
                <div className="mt-3 rounded-2xl bg-surface p-3 text-sm text-text-secondary">
                  <span className="text-xs uppercase tracking-wide text-text-muted">
                    Beispiel
                  </span>
                  <p className="mt-1" dir={langCtx.code === 'fa' ? 'rtl' : 'ltr'}>
                    {card.exampleSentence}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <Button
              variant="secondary"
              onClick={() => setShowAnswer(true)}
              className="mt-4"
              fullWidth
            >
              Antwort anzeigen
            </Button>
          )}
        </Card>

        {showAnswer && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {QUALITY_BUTTONS.map((btn) => (
              <Button
                key={btn.quality}
                variant={btn.variant}
                onClick={() => void handleAnswer(btn.quality)}
                className="flex h-auto flex-col items-center gap-0.5 py-2.5"
              >
                <span className="text-sm font-semibold">{btn.label}</span>
                <span className="text-[10px] font-normal opacity-80">{btn.description}</span>
              </Button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <Card className="text-center">
          <div className="text-3xl font-semibold">{stats.total}</div>
          <div className="text-xs uppercase tracking-wide text-text-muted">Vokabeln</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-semibold text-accent">{stats.due}</div>
          <div className="text-xs uppercase tracking-wide text-text-muted">Faellig</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-semibold">{stats.news}</div>
          <div className="text-xs uppercase tracking-wide text-text-muted">Neu</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-semibold">{stats.mastered}</div>
          <div className="text-xs uppercase tracking-wide text-text-muted">Gemeistert</div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Wiederholung</CardTitle>
          {stats.due + stats.news > 0 ? (
            <Badge tone="accent">{stats.due + stats.news} Karten bereit</Badge>
          ) : (
            <Badge tone="success">Keine Karten faellig</Badge>
          )}
        </CardHeader>
        <CardDescription>
          Spaced Repetition (SM-2). Faellige und neue Karten werden gemischt — pro Runde
          maximal 20 Karten.
        </CardDescription>
        <div className="mt-4">
          <Button onClick={startReview} disabled={stats.due + stats.news === 0} fullWidth>
            {stats.due + stats.news > 0 ? 'Runde starten' : 'Heute alles erledigt 🎉'}
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Neue Vokabeln generieren</CardTitle>
          {ai ? null : <Badge tone="warning">KI offline</Badge>}
        </CardHeader>
        <CardDescription>
          Gemini generiert 8 neue Vokabeln auf deinem Niveau ({currentUser?.currentLevel}) zum
          gewaehlten Thema.
        </CardDescription>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Thema (z. B. Essen, Reisen)"
            className="flex-1 rounded-2xl border border-border bg-surface px-4 py-2 text-sm focus:border-accent focus:outline-none"
          />
          <Button onClick={() => void handleGenerate()} disabled={!ai || generating}>
            {generating ? <Spinner size={18} /> : '+ Generieren'}
          </Button>
        </div>
        {error && <p className="mt-3 text-sm text-tinto-600">{error}</p>}
      </Card>

      {vocab.length === 0 ? (
        <EmptyState
          icon="🃏"
          title="Noch keine Vokabeln"
          description="Generiere oben deine erste Vokabel-Runde — das ist der Startschuss fuer Spaced Repetition."
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Alle Vokabeln</CardTitle>
            <Badge>{vocab.length}</Badge>
          </CardHeader>
          <ul className="mt-3 max-h-96 space-y-2 overflow-y-auto">
            {vocab.slice(0, 50).map((item) => {
              const p = progressMap.get(item.id);
              return (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-2 rounded-2xl border border-border bg-surface p-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium" dir={langCtx.code === 'fa' ? 'rtl' : 'ltr'}>
                      {item.word}
                    </div>
                    <div className="truncate text-xs text-text-muted">{item.translation}</div>
                  </div>
                  {p && (
                    <Badge tone={p.srs.status === 'mastered' ? 'success' : 'neutral'}>
                      {p.srs.status}
                    </Badge>
                  )}
                </li>
              );
            })}
            {vocab.length > 50 && (
              <li className="text-center text-xs text-text-muted">
                ... und {vocab.length - 50} weitere
              </li>
            )}
          </ul>
        </Card>
      )}
    </div>
  );
}
