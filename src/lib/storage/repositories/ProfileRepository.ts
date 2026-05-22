import type { Profile, UserId } from '@/types';
import type { KeyValueDriver } from '../localStorageDriver';
import { STORAGE_KEYS } from '../keys';

export interface ProfileRepository {
  findAll(): Promise<Profile[]>;
  findByUserId(userId: UserId): Promise<Profile | null>;
  upsert(profile: Profile): Promise<void>;
}

export function createProfileRepository(driver: KeyValueDriver): ProfileRepository {
  const key = STORAGE_KEYS.profiles;
  return {
    async findAll() {
      return driver.read<Profile[]>(key, []);
    },
    async findByUserId(userId) {
      const all = await driver.read<Profile[]>(key, []);
      return all.find((p) => p.userId === userId) ?? null;
    },
    async upsert(profile) {
      const all = await driver.read<Profile[]>(key, []);
      const idx = all.findIndex((p) => p.userId === profile.userId);
      if (idx >= 0) all[idx] = profile;
      else all.push(profile);
      await driver.write(key, all);
    },
  };
}
