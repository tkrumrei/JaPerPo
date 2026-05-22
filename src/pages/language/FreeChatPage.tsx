import { useEffect, useRef, useState } from 'react';
import { useAI } from '@/hooks/useAI';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';
import { Card, CardDescription, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function FreeChatPage() {
  const langCtx = useCurrentLanguage();
  const ai = useAI();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, pending]);

  const handleSend = async () => {
    if (!langCtx || !ai || pending) return;
    const message = input.trim();
    if (!message) return;
    const next: Message = { role: 'user', content: message };
    setMessages((prev) => [...prev, next]);
    setInput('');
    setPending(true);
    setError(null);
    try {
      const reply = await ai.chat({
        language: langCtx.code,
        history: messages,
        message,
      });
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPending(false);
    }
  };

  if (!langCtx) return null;

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle>Freier Chat</CardTitle>
            <CardDescription className="mt-1">
              Schreib in {langCtx.config.germanName} oder Deutsch — die KI antwortet in der
              Zielsprache plus kurze Erklaerung.
            </CardDescription>
          </div>
          {!ai && <Badge tone="warning">KI offline</Badge>}
        </div>
      </Card>

      <Card padded={false} className="flex flex-col overflow-hidden">
        <div
          ref={scrollRef}
          className="flex max-h-[55vh] min-h-[40vh] flex-col gap-3 overflow-y-auto p-4"
        >
          {messages.length === 0 && (
            <div className="my-auto text-center text-sm text-text-muted">
              Schreib einen Satz, eine Frage oder ein Wort — Gemini antwortet auf{' '}
              {langCtx.config.germanName}.
            </div>
          )}
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm shadow-card',
                  m.role === 'user'
                    ? 'bg-accent text-accent-contrast'
                    : 'bg-surface text-text-primary',
                )}
                dir={m.role === 'assistant' && langCtx.code === 'fa' ? 'rtl' : 'ltr'}
              >
                {m.content}
              </div>
            </div>
          ))}
          {pending && (
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <Spinner size={16} /> Gemini denkt nach...
            </div>
          )}
        </div>

        {error && (
          <div className="border-t border-border bg-tinto-50 px-4 py-2 text-sm text-tinto-700 dark:bg-tinto-900/40 dark:text-tinto-200">
            {error}
          </div>
        )}

        <div className="flex items-center gap-2 border-t border-border bg-surface p-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void handleSend();
              }
            }}
            placeholder={ai ? 'Nachricht eingeben…' : 'KI offline — siehe Einstellungen'}
            disabled={!ai || pending}
            className="flex-1 rounded-2xl border border-border bg-surface-elevated px-4 py-2 text-sm focus:border-accent focus:outline-none disabled:opacity-50"
          />
          <Button onClick={() => void handleSend()} disabled={!ai || pending || !input.trim()}>
            Senden
          </Button>
        </div>
      </Card>
    </div>
  );
}
