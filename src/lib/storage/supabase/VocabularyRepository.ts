import type { AppSupabaseClient } from '@/lib/supabase/client';
import type { VocabularyRepository } from '../repositories/VocabularyRepository';
import { vocabularyFromRow, vocabularyToRow } from './mappers';

export function createSupabaseVocabularyRepository(
  client: AppSupabaseClient,
): VocabularyRepository {
  return {
    async findAll() {
      const { data, error } = await client.from('vocabulary_items').select('*');
      if (error) throw error;
      return (data ?? []).map(vocabularyFromRow);
    },
    async findById(id) {
      const { data, error } = await client
        .from('vocabulary_items')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data ? vocabularyFromRow(data) : null;
    },
    async upsert(item) {
      const { error } = await client.from('vocabulary_items').upsert(vocabularyToRow(item));
      if (error) throw error;
    },
    async delete(id) {
      const { error } = await client.from('vocabulary_items').delete().eq('id', id);
      if (error) throw error;
    },
    async findByLanguage(language) {
      const { data, error } = await client
        .from('vocabulary_items')
        .select('*')
        .eq('language', language);
      if (error) throw error;
      return (data ?? []).map(vocabularyFromRow);
    },
  };
}
