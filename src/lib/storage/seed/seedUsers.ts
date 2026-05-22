import type { Profile, User } from '@/types';
import { defaultSettings } from '@/types';
import { nowIso } from '@/lib/utils/date';
import type { ProfileRepository } from '../repositories/ProfileRepository';
import type { UserRepository } from '../repositories/UserRepository';

const SEED_USERS: User[] = [
  {
    id: 'luca',
    displayName: 'Luca',
    avatarColor: '#1f9c9d',
    primaryLanguage: 'fa',
    currentLevel: 'B1',
    createdAt: nowIso(),
  },
  {
    id: 'darian',
    displayName: 'Darian',
    avatarColor: '#7a1f2b',
    primaryLanguage: 'pt',
    currentLevel: 'A1',
    createdAt: nowIso(),
  },
  {
    id: 'tobi',
    displayName: 'Tobi',
    avatarColor: '#ed1d59',
    primaryLanguage: 'ja',
    currentLevel: 'A1',
    createdAt: nowIso(),
  },
];

function needsUpgrade(existing: Partial<User>): boolean {
  return (
    !existing.primaryLanguage ||
    !existing.currentLevel ||
    !existing.displayName ||
    !existing.avatarColor
  );
}

export async function seedUsers(
  users: UserRepository,
  profiles: ProfileRepository,
): Promise<void> {
  for (const seed of SEED_USERS) {
    const existing = await users.findById(seed.id);
    if (!existing || needsUpgrade(existing)) {
      await users.upsert({ ...seed, createdAt: existing?.createdAt ?? seed.createdAt });
    }

    const profile = await profiles.findByUserId(seed.id);
    if (!profile) {
      const fresh: Profile = {
        userId: seed.id,
        settings: { ...defaultSettings },
        updatedAt: nowIso(),
      };
      await profiles.upsert(fresh);
    }
  }
}
