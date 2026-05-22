import type { LanguageCode, VocabularyItem } from '@/types';
import type { KeyValueDriver } from '../localStorageDriver';
import { STORAGE_KEYS } from '../keys';
import { type CrudRepository, createCrudRepository } from '../repository';

export interface VocabularyRepository extends CrudRepository<VocabularyItem> {
  findByLanguage(language: LanguageCode): Promise<VocabularyItem[]>;
}

export function createVocabularyRepository(driver: KeyValueDriver): VocabularyRepository {
  const base = createCrudRepository<VocabularyItem>(driver, STORAGE_KEYS.vocabulary);
  return {
    ...base,
    async findByLanguage(language) {
      const all = await base.findAll();
      return all.filter((item) => item.language === language);
    },
  };
}
