import type { AppSupabaseClient } from '@/lib/supabase/client';
import type { ClozeRepository } from '../repositories/ClozeRepository';
import { clozeFromRow, clozeToRow } from './mappers';

export function createSupabaseClozeRepository(client: AppSupabaseClient): ClozeRepository {
  return {
    async findAll() {
      const { data, error } = await client.from('cloze_texts').select('*');
      if (error) throw error;
      return (data ?? []).map(clozeFromRow);
    },
    async findById(id) {
      const { data, error } = await client
        .from('cloze_texts')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data ? clozeFromRow(data) : null;
    },
    async upsert(item) {
      const { error } = await client.from('cloze_texts').upsert(clozeToRow(item));
      if (error) throw error;
    },
    async delete(id) {
      const { error } = await client.from('cloze_texts').delete().eq('id', id);
      if (error) throw error;
    },
    async findByLanguage(language) {
      const { data, error } = await client
        .from('cloze_texts')
        .select('*')
        .eq('language', language);
      if (error) throw error;
      return (data ?? []).map(clozeFromRow);
    },
  };
}
