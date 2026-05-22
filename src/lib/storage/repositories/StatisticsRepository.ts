import type { Statistics, UserId } from '@/types';
import type { KeyValueDriver } from '../localStorageDriver';
import { STORAGE_KEYS } from '../keys';

export interface StatisticsRepository {
  findAll(): Promise<Statistics[]>;
  findByUserId(userId: UserId): Promise<Statistics | null>;
  upsert(stats: Statistics): Promise<void>;
}

export function createStatisticsRepository(driver: KeyValueDriver): StatisticsRepository {
  const key = STORAGE_KEYS.statistics;
  return {
    async findAll() {
      return driver.read<Statistics[]>(key, []);
    },
    async findByUserId(userId) {
      const all = await driver.read<Statistics[]>(key, []);
      return all.find((s) => s.userId === userId) ?? null;
    },
    async upsert(stats) {
      const all = await driver.read<Statistics[]>(key, []);
      const idx = all.findIndex((s) => s.userId === stats.userId);
      if (idx >= 0) all[idx] = stats;
      else all.push(stats);
      await driver.write(key, all);
    },
  };
}
