import type { Dialogue, LanguageCode } from '@/types';
import type { KeyValueDriver } from '../localStorageDriver';
import { STORAGE_KEYS } from '../keys';
import { type CrudRepository, createCrudRepository } from '../repository';

export interface DialogueRepository extends CrudRepository<Dialogue> {
  findByLanguage(language: LanguageCode): Promise<Dialogue[]>;
}

export function createDialogueRepository(driver: KeyValueDriver): DialogueRepository {
  const base = createCrudRepository<Dialogue>(driver, STORAGE_KEYS.dialogues);
  return {
    ...base,
    async findByLanguage(language) {
      const all = await base.findAll();
      return all.filter((item) => item.language === language);
    },
  };
}
