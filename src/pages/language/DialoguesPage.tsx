import { useEffect, useState } from 'react';
import type { Dialogue } from '@/types';
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

const SCENARIO_SUGGESTIONS = [
  'Restaurant',
  'Bahnhof',
  'Baecker',
  'Universitaet',
  'Nachbarn',
  'Supermarkt',
  'Hotel',
  'Wegbeschreibung',
];

export function DialoguesPage() {
  const { currentUser } = useAuth();
  const langCtx = useCurrentLanguage();
  const ai = useAI();
  const dialogueRepo = useRepository('dialogues');
  const [items, setItems] = useState<Dialogue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Dialogue | null>(null);
  const [revealedSteps, setRevealedSteps] = useState(0);
  const [scenario, setScenario] = useState('Restaurant');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!langCtx) return;
    setLoading(true);
    void dialogueRepo.findByLanguage(langCtx.code).then((list) => {
      setItems(list);
      setLoading(false);
    });
  }, [langCtx, dialogueRepo]);

  const handleGenerate = async () => {
    if (!ai || !langCtx || !currentUser) {
      setError('KI nicht verfuegbar — bitte Supabase-Anbindung pruefen.');
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const result = await ai.generateDialogue({
        language: langCtx.code,
        scenario,
        level: currentUser.currentLevel,
      });
      const item: Dialogue = {
        id: uuid(),
        language: langCtx.code,
        title: result.title,
        scenario: result.scenario,
        steps: result.steps,
        level: currentUser.currentLevel,
        aiGenerated: true,
        createdAt: nowIso(),
      };
      await dialogueRepo.upsert(item);
      setItems((prev) => [item, ...prev]);
      setSelected(item);
      setRevealedSteps(1);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  if (!langCtx) return null;

  if (selected) {
    const total = selected.steps.length;
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => {
            setSelected(null);
            setRevealedSteps(0);
          }}
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
            Szenario: {selected.scenario} · {total} Schritte
          </CardDescription>

          <ol className="mt-4 space-y-3">
            {selected.steps.slice(0, revealedSteps).map((step, idx) => (
              <li
                key={idx}
                className={cn(
                  'flex',
                  step.speaker === 'user' ? 'justify-end' : 'justify-start',
                )}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-card',
                    step.speaker === 'user'
                      ? 'bg-accent text-accent-contrast'
                      : 'bg-surface text-text-primary',
                  )}
                >
                  <div
                    className="font-medium"
                    dir={langCtx.code === 'fa' ? 'rtl' : 'ltr'}
                  >
                    {step.text}
                  </div>
                  {step.transcription && (
                    <div className="mt-0.5 text-xs opacity-80">{step.transcription}</div>
                  )}
                  {step.translation && (
                    <div className="mt-1 border-t border-border/40 pt-1 text-xs opacity-80">
                      {step.translation}
                    </div>
                  )}
                  {step.hints && step.hints.length > 0 && step.speaker === 'user' && (
                    <div className="mt-1 text-[11px] opacity-70">
                      💡 {step.hints.join(' · ')}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              onClick={() => setRevealedSteps((s) => Math.min(total, s + 1))}
              disabled={revealedSteps >= total}
            >
              Naechster Schritt
            </Button>
            <Button
              variant="secondary"
              onClick={() => setRevealedSteps(total)}
              disabled={revealedSteps >= total}
            >
              Alle anzeigen
            </Button>
            <Button
              variant="ghost"
              onClick={() => setRevealedSteps(1)}
              disabled={revealedSteps <= 1}
            >
              Zuruecksetzen
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Neues Dialog-Szenario</CardTitle>
          {ai ? null : <Badge tone="warning">KI offline</Badge>}
        </CardHeader>
        <CardDescription>
          Gemini baut acht aufeinander aufbauende Schritte fuer das gewaehlte Szenario auf Stufe{' '}
          {currentUser?.currentLevel}.
        </CardDescription>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {SCENARIO_SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScenario(s)}
              className={cn(
                'rounded-full border px-2.5 py-1 text-xs transition-colors',
                scenario === s
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border text-text-secondary hover:border-accent/40',
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            placeholder="Szenario"
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
      ) : items.length === 0 ? (
        <EmptyState
          icon="💬"
          title="Noch keine Dialoge"
          description="Waehle oben ein Szenario und lass dir den ersten Dialog generieren."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((d) => (
            <Card
              key={d.id}
              interactive
              onClick={() => {
                setSelected(d);
                setRevealedSteps(1);
              }}
            >
              <CardHeader>
                <CardTitle className="truncate">{d.title}</CardTitle>
                <Badge tone="accent">{d.level}</Badge>
              </CardHeader>
              <CardDescription className="line-clamp-2">{d.scenario}</CardDescription>
              <div className="mt-3 text-xs text-text-muted">{d.steps.length} Schritte</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
