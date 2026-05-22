import type { AppSupabaseClient } from '@/lib/supabase/client';
import type { TestRepository } from '../repositories/TestRepository';
import { testFromRow, testToRow } from './mappers';

export function createSupabaseTestRepository(client: AppSupabaseClient): TestRepository {
  return {
    async findAll() {
      const { data, error } = await client.from('tests').select('*');
      if (error) throw error;
      return (data ?? []).map(testFromRow);
    },
    async findById(id) {
      const { data, error } = await client
        .from('tests')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data ? testFromRow(data) : null;
    },
    async upsert(test) {
      const { error } = await client.from('tests').upsert(testToRow(test));
      if (error) throw error;
    },
    async delete(id) {
      const { error } = await client.from('tests').delete().eq('id', id);
      if (error) throw error;
    },
    async findByUser(userId) {
      const { data, error } = await client.from('tests').select('*').eq('user_id', userId);
      if (error) throw error;
      return (data ?? []).map(testFromRow);
    },
    async findByUserAndLanguage(userId, language) {
      const { data, error } = await client
        .from('tests')
        .select('*')
        .eq('user_id', userId)
        .eq('language', language);
      if (error) throw error;
      return (data ?? []).map(testFromRow);
    },
  };
}
