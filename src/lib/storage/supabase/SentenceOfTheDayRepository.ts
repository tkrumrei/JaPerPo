import type { AppSupabaseClient } from '@/lib/supabase/client';
import type { SentenceOfTheDayRepository } from '../repositories/SentenceOfTheDayRepository';
import { sotdFromRow, sotdToRow } from './mappers';

export function createSupabaseSentenceOfTheDayRepository(
  client: AppSupabaseClient,
): SentenceOfTheDayRepository {
  return {
    async findAll() {
      const { data, error } = await client
        .from('sentence_of_the_day')
        .select('*')
        .order('date', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(sotdFromRow);
    },
    async findById(id) {
      const { data, error } = await client
        .from('sentence_of_the_day')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data ? sotdFromRow(data) : null;
    },
    async upsert(entry) {
      const { error } = await client
        .from('sentence_of_the_day')
        .upsert(sotdToRow(entry), { onConflict: 'date' });
      if (error) throw error;
    },
    async delete(id) {
      const { error } = await client.from('sentence_of_the_day').delete().eq('id', id);
      if (error) throw error;
    },
    async findByDate(date) {
      const { data, error } = await client
        .from('sentence_of_the_day')
        .select('*')
        .eq('date', date)
        .maybeSingle();
      if (error) throw error;
      return data ? sotdFromRow(data) : null;
    },
    async latest() {
      const { data, error } = await client
        .from('sentence_of_the_day')
        .select('*')
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data ? sotdFromRow(data) : null;
    },
  };
}
