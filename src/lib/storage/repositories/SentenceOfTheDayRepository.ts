import type { SentenceOfTheDay } from '@/types';
import type { KeyValueDriver } from '../localStorageDriver';
import { STORAGE_KEYS } from '../keys';
import { type CrudRepository, createCrudRepository } from '../repository';

export interface SentenceOfTheDayRepository extends CrudRepository<SentenceOfTheDay> {
  findByDate(date: string): Promise<SentenceOfTheDay | null>;
  latest(): Promise<SentenceOfTheDay | null>;
}

export function createSentenceOfTheDayRepository(
  driver: KeyValueDriver,
): SentenceOfTheDayRepository {
  const base = createCrudRepository<SentenceOfTheDay>(driver, STORAGE_KEYS.sentenceOfTheDay);
  return {
    ...base,
    async findByDate(date) {
      const all = await base.findAll();
      return all.find((entry) => entry.date === date) ?? null;
    },
    async latest() {
      const all = await base.findAll();
      if (all.length === 0) return null;
      return [...all].sort((a, b) => (a.date < b.date ? 1 : -1))[0] ?? null;
    },
  };
}
