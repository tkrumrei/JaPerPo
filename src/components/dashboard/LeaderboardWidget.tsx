import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { useI18n } from '@/hooks/useI18n';
import { useEffect, useState } from 'react';
import { useRepository } from '@/hooks/useRepository';
import type { User } from '@/types';

export function LeaderboardWidget() {
  const { t } = useI18n();
  const users = useRepository('users');
  const [list, setList] = useState<User[]>([]);

  useEffect(() => {
    void users.findAll().then(setList);
  }, [users]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.leaderboard')}</CardTitle>
        <Badge tone="accent">Live folgt</Badge>
      </CardHeader>
      <CardDescription>
        Vergleicht den Fleiss von Luca, Darian und Tobi. Echte Werte folgen, sobald die KI-
        und Persistenz-Anbindung steht.
      </CardDescription>
      <ul className="mt-4 space-y-2">
        {list.map((user, idx) => (
          <li
            key={user.id}
            className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3"
          >
            <span className="w-6 text-center text-sm font-semibold text-text-muted">
              {idx + 1}
            </span>
            <Avatar name={user.displayName} color={user.avatarColor} size="sm" />
            <span className="flex-1 text-sm font-medium">{user.displayName}</span>
            <span className="text-xs text-text-muted">—&nbsp;XP</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
