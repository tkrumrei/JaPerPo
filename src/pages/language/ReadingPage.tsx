import { useEffect, useState } from 'react';
import type { ReadingText } from '@/types';
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

export function ReadingPage() {
  const { currentUser } = useAuth();
  const langCtx = useCurrentLanguage();
  const ai = useAI();
  const readingRepo = useRepository('reading');
  const [texts, setTexts] = useState<ReadingText[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ReadingText | null>(null);
  const [topic, setTopic] = useState('Alltag');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!langCtx) return;
    setLoading(true);
    void readingRepo.findByLanguage(langCtx.code).then((list) => {
      setTexts(list);
      setLoading(false);
    });
  }, [langCtx, readingRepo]);

  const handleGenerate = async () => {
    if (!ai || !langCtx || !currentUser) {
      setError('KI nicht verfuegbar — bitte Supabase-Anbindung pruefen.');
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const result = await ai.generateReading({
        language: langCtx.code,
        level: currentUser.currentLevel,
        topic,
        minWords: 120,
      });
      const item: ReadingText = {
        id: uuid(),
        language: langCtx.code,
        title: result.title,
        content: result.content,
        level: currentUser.currentLevel,
        wordCount: result.wordCount,
        aiGenerated: true,
        createdAt: nowIso(),
      };
      await readingRepo.upsert(item);
      setTexts((prev) => [item, ...prev]);
      setSelected(item);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  if (!langCtx) return null;

  if (selected) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setSelected(null)}
          className="text-sm text-text-secondary underline-offset-2 hover:underline"
        >
          ← Zurueck zur Liste
        </button>
        <Card>
          <CardHeader>
            <CardTitle>{selected.title}</CardTitle>
            <Badge tone="accent">{selected.level}</Badge>
          </CardHeader>
          <CardDescription>
            {selected.wordCount} Woerter · {new Date(selected.createdAt).toLocaleDateString('de')}
          </CardDescription>
          <article
            className="prose mt-4 max-w-none whitespace-pre-wrap text-base leading-relaxed text-text-primary"
            dir={langCtx.code === 'fa' ? 'rtl' : 'ltr'}
          >
            {selected.content}
          </article>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Neuen Lesetext generieren</CardTitle>
          {ai ? null : <Badge tone="warning">KI offline</Badge>}
        </CardHeader>
        <CardDescription>
          Gemini erzeugt einen kurzen, niveaugerechten Text auf Stufe {currentUser?.currentLevel}.
        </CardDescription>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Thema (z. B. Markt, Reise, Familie)"
            className="flex-1 rounded-2xl border border-border bg-surface px-4 py-2 text-sm focus:border-accent focus:outline-none"
          />
          <Button onClick={() => void handleGenerate()} disabled={!ai || generating}>
            {generating ? <Spinner size={18} /> : '+ Generieren'}
          </Button>
        </div>
        {error && <p className="mt-3 text-sm text-tinto-600">{error}</p>}
      </Card>

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : texts.length === 0 ? (
        <EmptyState
          icon="📖"
          title="Noch keine Lesetexte"
          description="Generiere oben deinen ersten Text — die KI passt Laenge und Wortschatz auf dein Niveau an."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {texts.map((text) => (
            <Card
              key={text.id}
              interactive
              onClick={() => setSelected(text)}
            >
              <CardHeader>
                <CardTitle className="truncate">{text.title}</CardTitle>
                <Badge tone="accent">{text.level}</Badge>
              </CardHeader>
              <CardDescription className="line-clamp-3">
                {text.content.slice(0, 120)}…
              </CardDescription>
              <div className="mt-3 text-xs text-text-muted">{text.wordCount} Woerter</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
