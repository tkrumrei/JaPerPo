import type { ClozeText, LanguageCode } from '@/types';
import type { KeyValueDriver } from '../localStorageDriver';
import { STORAGE_KEYS } from '../keys';
import { type CrudRepository, createCrudRepository } from '../repository';

export interface ClozeRepository extends CrudRepository<ClozeText> {
  findByLanguage(language: LanguageCode): Promise<ClozeText[]>;
}

export function createClozeRepository(driver: KeyValueDriver): ClozeRepository {
  const base = createCrudRepository<ClozeText>(driver, STORAGE_KEYS.cloze);
  return {
    ...base,
    async findByLanguage(language) {
      const all = await base.findAll();
      return all.filter((item) => item.language === language);
    },
  };
}
