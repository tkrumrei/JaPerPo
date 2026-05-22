import type { AppSupabaseClient } from '@/lib/supabase/client';
import type { ReadingRepository } from '../repositories/ReadingRepository';
import { readingFromRow, readingToRow } from './mappers';

export function createSupabaseReadingRepository(
  client: AppSupabaseClient,
): ReadingRepository {
  return {
    async findAll() {
      const { data, error } = await client.from('reading_texts').select('*');
      if (error) throw error;
      return (data ?? []).map(readingFromRow);
    },
    async findById(id) {
      const { data, error } = await client
        .from('reading_texts')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data ? readingFromRow(data) : null;
    },
    async upsert(text) {
      const { error } = await client.from('reading_texts').upsert(readingToRow(text));
      if (error) throw error;
    },
    async delete(id) {
      const { error } = await client.from('reading_texts').delete().eq('id', id);
      if (error) throw error;
    },
    async findByLanguage(language) {
      const { data, error } = await client
        .from('reading_texts')
        .select('*')
        .eq('language', language);
      if (error) throw error;
      return (data ?? []).map(readingFromRow);
    },
  };
}
