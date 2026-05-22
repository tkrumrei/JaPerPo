import type { AppSupabaseClient } from '@/lib/supabase/client';
import type { ProgressRepository } from '../repositories/ProgressRepository';
import { progressFromRow, progressToRow } from './mappers';

export function createSupabaseProgressRepository(
  client: AppSupabaseClient,
): ProgressRepository {
  return {
    async findAll() {
      const { data, error } = await client.from('progress').select('*');
      if (error) throw error;
      return (data ?? []).map(progressFromRow);
    },
    async findById(id) {
      const { data, error } = await client
        .from('progress')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data ? progressFromRow(data) : null;
    },
    async upsert(progress) {
      const { error } = await client.from('progress').upsert(progressToRow(progress));
      if (error) throw error;
    },
    async delete(id) {
      const { error } = await client.from('progress').delete().eq('id', id);
      if (error) throw error;
    },
    async findByUser(userId) {
      const { data, error } = await client.from('progress').select('*').eq('user_id', userId);
      if (error) throw error;
      return (data ?? []).map(progressFromRow);
    },
    async findByUserAndLanguage(userId, language) {
      const { data, error } = await client
        .from('progress')
        .select('*')
        .eq('user_id', userId)
        .eq('language', language);
      if (error) throw error;
      return (data ?? []).map(progressFromRow);
    },
  };
}
