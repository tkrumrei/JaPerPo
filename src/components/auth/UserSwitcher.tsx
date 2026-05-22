import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useRepository } from '@/hooks/useRepository';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils/cn';

export function UserSwitcher() {
  const { currentUser, switchUser, logout } = useAuth();
  const users = useRepository('users');
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void users.findAll().then(setAllUsers);
  }, [users]);

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  if (!currentUser) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-surface"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar name={currentUser.displayName} color={currentUser.avatarColor} size="sm" />
        <span className="hidden text-sm font-medium sm:inline">{currentUser.displayName}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-52 origin-top-right animate-slide-up rounded-2xl border border-border bg-surface-elevated p-2 shadow-card-lg"
        >
          <div className="px-2 pb-2 text-xs uppercase tracking-wide text-text-muted">
            Profil wechseln
          </div>
          {allUsers.map((user) => {
            const active = user.id === currentUser.id;
            return (
              <button
                key={user.id}
                type="button"
                onClick={() => {
                  setOpen(false);
                  if (!active) void switchUser(user.id);
                }}
                className={cn(
                  'flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left text-sm transition-colors',
                  active ? 'bg-accent/10 text-accent' : 'hover:bg-surface',
                )}
              >
                <Avatar name={user.displayName} color={user.avatarColor} size="sm" />
                <span className="flex-1">{user.displayName}</span>
                {active && <span className="text-xs">aktiv</span>}
              </button>
            );
          })}
          <div className="my-2 h-px bg-border" />
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              logout();
              navigate('/login');
            }}
            className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left text-sm text-text-secondary transition-colors hover:bg-surface"
          >
            Abmelden
          </button>
        </div>
      )}
    </div>
  );
}
