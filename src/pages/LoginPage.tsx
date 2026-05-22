import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { User } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/hooks/useI18n';
import { useRepository } from '@/hooks/useRepository';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Card, CardDescription, CardTitle } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { getLanguageConfig } from '@/languages';

const HEADER_GIFS = [
  'https://media.giphy.com/media/mOY97EXNisstZqJht9/giphy.gif',
  'https://media.giphy.com/media/lHOFyVtAptGHFJehNU/giphy.gif',
];

export function LoginPage() {
  const navigate = useNavigate();
  const { switchUser } = useAuth();
  const { t } = useI18n();
  const users = useRepository('users');
  const [list, setList] = useState<User[]>([]);
  const [pending, setPending] = useState<string | null>(null);
  const [gifIdx, setGifIdx] = useState(0);

  useEffect(() => {
    void users.findAll().then(setList);
  }, [users]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setGifIdx((i) => (i + 1) % HEADER_GIFS.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, []);

  const handleSelect = async (user: User) => {
    setPending(user.id);
    try {
      await switchUser(user.id);
      navigate('/dashboard', { replace: true });
    } finally {
      setPending(null);
    }
  };

  return (
    <Card className="animate-slide-up overflow-hidden p-0">
      <div className="relative h-44 w-full overflow-hidden border-b border-border bg-surface sm:h-56">
        {HEADER_GIFS.map((src, idx) => (
          <img
            key={src}
            src={src}
            alt=""
            aria-hidden
            loading="eager"
            decoding="async"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
              idx === gifIdx ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface-elevated to-transparent"
        />
      </div>

      <div className="p-5 sm:p-6">
        <CardTitle className="text-center text-2xl">{t('login.title')}</CardTitle>
        <CardDescription className="text-center">{t('login.subtitle')}</CardDescription>

        <div className="mt-6 grid gap-3">
        {list.map((user) => {
          const isPending = pending === user.id;
          const lang = getLanguageConfig(user.primaryLanguage);
          return (
            <button
              key={user.id}
              type="button"
              onClick={() => void handleSelect(user)}
              disabled={pending !== null}
              data-lang={user.primaryLanguage}
              className="group flex items-center gap-3 rounded-2xl border border-border bg-surface-elevated p-3 text-left shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Avatar name={user.displayName} color={user.avatarColor} size="lg" />
              <div className="flex-1">
                <div className="text-lg font-semibold tracking-tight">{user.displayName}</div>
                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-text-muted">
                  <span aria-hidden>{lang.flag}</span>
                  <span>
                    {lang.germanName} · {user.currentLevel}
                  </span>
                </div>
              </div>
              <Badge tone="accent">{user.currentLevel}</Badge>
              {isPending ? <Spinner /> : <span aria-hidden>→</span>}
            </button>
          );
        })}
        </div>
      </div>
    </Card>
  );
}
