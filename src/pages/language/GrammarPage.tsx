import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAI } from '@/hooks/useAI';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';
import type { GeneratedGrammar } from '@/lib/ai';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils/cn';

const TOPIC_SUGGESTIONS: Record<string, string[]> = {
  ja: ['Höflichkeitsformen', 'て-Form', 'Partikel は vs が', 'Vergangenheitsform'],
  fa: ['Ezāfe', 'Konjugation Präsens', 'Konjugation Vergangenheit', 'Negation'],
  pt: ['Pretérito Perfeito', 'Conjuntivo', 'Pronomen-Stellung', 'Ser vs Estar'],
};

export function GrammarPage() {
  const { currentUser } = useAuth();
  const langCtx = useCurrentLanguage();
  const ai = useAI();
  const [topic, setTopic] = useState('');
  const [result, setResult] = useState<GeneratedGrammar | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExplain = async (queryTopic?: string) => {
    const finalTopic = (queryTopic ?? topic).trim();
    if (!ai || !langCtx || !currentUser || !finalTopic) {
      if (!finalTopic) setError('Bitte ein Thema eingeben.');
      else setError('KI nicht verfuegbar — bitte Supabase-Anbindung pruefen.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await ai.explainGrammar({
        language: langCtx.code,
        topic: finalTopic,
        level: currentUser.currentLevel,
      });
      setResult(data);
      setTopic(finalTopic);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!langCtx) return null;
  const suggestions = TOPIC_SUGGESTIONS[langCtx.code] ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Grammatik erklaeren</CardTitle>
          {ai ? null : <Badge tone="warning">KI offline</Badge>}
        </CardHeader>
        <CardDescription>
          Stell eine Frage oder waehle ein Thema. Gemini erklaert es auf Deutsch und liefert drei
          Beispiele auf {langCtx.config.germanName}.
        </CardDescription>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => void handleExplain(s)}
              className={cn(
                'rounded-full border px-2.5 py-1 text-xs transition-colors',
                'border-border text-text-secondary hover:border-accent/40 hover:text-accent',
              )}
              disabled={!ai || loading}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void handleExplain();
            }}
            placeholder="Thema oder Frage"
            className="flex-1 rounded-2xl border border-border bg-surface px-4 py-2 text-sm focus:border-accent focus:outline-none"
          />
          <Button onClick={() => void handleExplain()} disabled={!ai || loading}>
            {loading ? <Spinner size={18} /> : 'Erklaeren'}
          </Button>
        </div>

        {error && <p className="mt-3 text-sm text-tinto-600">{error}</p>}
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>{result.title}</CardTitle>
            <Badge tone="accent">{currentUser?.currentLevel}</Badge>
          </CardHeader>
          <p className="mt-2 whitespace-pre-wrap text-sm text-text-secondary">
            {result.explanation}
          </p>

          {result.examples.length > 0 && (
            <div className="mt-4 space-y-2">
              <h3 className="text-xs uppercase tracking-wide text-text-muted">Beispiele</h3>
              <ul className="space-y-2">
                {result.examples.map((ex, idx) => (
                  <li
                    key={idx}
                    className="rounded-2xl border border-border bg-surface p-3 text-sm"
                  >
                    <div
                      className="font-medium"
                      dir={langCtx.code === 'fa' ? 'rtl' : 'ltr'}
                    >
                      {ex.text}
                    </div>
                    {ex.transcription && (
                      <div className="mt-0.5 text-xs text-text-muted">{ex.transcription}</div>
                    )}
                    <div className="mt-1 text-xs text-text-secondary">{ex.translation}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
