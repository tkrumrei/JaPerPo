import type { LeaderboardEntry, UserId } from '@/types';
import type { KeyValueDriver } from '../localStorageDriver';
import { STORAGE_KEYS } from '../keys';

export interface LeaderboardRepository {
  findAll(): Promise<LeaderboardEntry[]>;
  findByUserId(userId: UserId): Promise<LeaderboardEntry | null>;
  upsert(entry: LeaderboardEntry): Promise<void>;
  replaceAll(entries: LeaderboardEntry[]): Promise<void>;
}

export function createLeaderboardRepository(driver: KeyValueDriver): LeaderboardRepository {
  const key = STORAGE_KEYS.leaderboard;
  return {
    async findAll() {
      return driver.read<LeaderboardEntry[]>(key, []);
    },
    async findByUserId(userId) {
      const all = await driver.read<LeaderboardEntry[]>(key, []);
      return all.find((e) => e.userId === userId) ?? null;
    },
    async upsert(entry) {
      const all = await driver.read<LeaderboardEntry[]>(key, []);
      const idx = all.findIndex((e) => e.userId === entry.userId);
      if (idx >= 0) all[idx] = entry;
      else all.push(entry);
      await driver.write(key, all);
    },
    async replaceAll(entries) {
      await driver.write(key, entries);
    },
  };
}
