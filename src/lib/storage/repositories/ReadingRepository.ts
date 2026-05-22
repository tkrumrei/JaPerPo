import type { LanguageCode, ReadingText } from '@/types';
import type { KeyValueDriver } from '../localStorageDriver';
import { STORAGE_KEYS } from '../keys';
import { type CrudRepository, createCrudRepository } from '../repository';

export interface ReadingRepository extends CrudRepository<ReadingText> {
  findByLanguage(language: LanguageCode): Promise<ReadingText[]>;
}

export function createReadingRepository(driver: KeyValueDriver): ReadingRepository {
  const base = createCrudRepository<ReadingText>(driver, STORAGE_KEYS.reading);
  return {
    ...base,
    async findByLanguage(language) {
      const all = await base.findAll();
      return all.filter((item) => item.language === language);
    },
  };
}
