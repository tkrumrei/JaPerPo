import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { useI18n } from '@/hooks/useI18n';
import { useEffect, useState } from 'react';
import { useRepository } from '@/hooks/useRepository';
import type { LeaderboardEntry, User } from '@/types';

interface Row {
  user: User;
  entry: LeaderboardEntry | null;
}

export function LeaderboardWidget() {
  const { t } = useI18n();
  const usersRepo = useRepository('users');
  const lbRepo = useRepository('leaderboard');
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    void Promise.all([usersRepo.findAll(), lbRepo.findAll()]).then(([users, lb]) => {
      const lbMap = new Map(lb.map((entry) => [entry.userId, entry]));
      const joined: Row[] = users.map((user) => ({ user, entry: lbMap.get(user.id) ?? null }));
      joined.sort((a, b) => {
        const xpA = a.entry?.xp ?? 0;
        const xpB = b.entry?.xp ?? 0;
        if (xpA !== xpB) return xpB - xpA;
        const rankA = a.entry?.rank ?? 99;
        const rankB = b.entry?.rank ?? 99;
        return rankA - rankB;
      });
      setRows(joined);
    });
  }, [usersRepo, lbRepo]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.leaderboard')}</CardTitle>
        <Badge>{rows.length}</Badge>
      </CardHeader>
      <CardDescription>
        Vergleicht den Fleiss von Luca, Darian und Tobi — Werte aktualisieren sich, sobald
        Vokabeln gelernt und Tests bestanden werden.
      </CardDescription>
      <ul className="mt-4 space-y-2">
        {rows.map((row, idx) => (
          <li
            key={row.user.id}
            className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3"
          >
            <span className="w-6 text-center text-sm font-semibold text-text-muted">{idx + 1}</span>
            <Avatar name={row.user.displayName} color={row.user.avatarColor} size="sm" />
            <span className="flex-1 text-sm font-medium">{row.user.displayName}</span>
            <span className="text-right text-xs text-text-muted">
              <div>{row.entry?.xp ?? 0} XP</div>
              {row.entry?.streakDays != null && (
                <div className="opacity-80">🔥 {row.entry.streakDays} Tage</div>
              )}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
