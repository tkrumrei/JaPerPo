import type { LanguageCode, Progress, UserId } from '@/types';
import type { KeyValueDriver } from '../localStorageDriver';
import { STORAGE_KEYS } from '../keys';
import { type CrudRepository, createCrudRepository } from '../repository';

export interface ProgressRepository extends CrudRepository<Progress> {
  findByUser(userId: UserId): Promise<Progress[]>;
  findByUserAndLanguage(userId: UserId, language: LanguageCode): Promise<Progress[]>;
}

export function createProgressRepository(driver: KeyValueDriver): ProgressRepository {
  const base = createCrudRepository<Progress>(driver, STORAGE_KEYS.progress);
  return {
    ...base,
    async findByUser(userId) {
      const all = await base.findAll();
      return all.filter((p) => p.userId === userId);
    },
    async findByUserAndLanguage(userId, language) {
      const all = await base.findAll();
      return all.filter((p) => p.userId === userId && p.language === language);
    },
  };
}
