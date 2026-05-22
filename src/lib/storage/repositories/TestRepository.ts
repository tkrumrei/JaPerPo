import type { LanguageCode, Test, UserId } from '@/types';
import type { KeyValueDriver } from '../localStorageDriver';
import { STORAGE_KEYS } from '../keys';
import { type CrudRepository, createCrudRepository } from '../repository';

export interface TestRepository extends CrudRepository<Test> {
  findByUser(userId: UserId): Promise<Test[]>;
  findByUserAndLanguage(userId: UserId, language: LanguageCode): Promise<Test[]>;
}

export function createTestRepository(driver: KeyValueDriver): TestRepository {
  const base = createCrudRepository<Test>(driver, STORAGE_KEYS.tests);
  return {
    ...base,
    async findByUser(userId) {
      const all = await base.findAll();
      return all.filter((t) => t.userId === userId);
    },
    async findByUserAndLanguage(userId, language) {
      const all = await base.findAll();
      return all.filter((t) => t.userId === userId && t.language === language);
    },
  };
}
