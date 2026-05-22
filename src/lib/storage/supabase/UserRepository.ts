import type { AppSupabaseClient } from '@/lib/supabase/client';
import type { UserRepository } from '../repositories/UserRepository';
import { userFromRow, userToRow } from './mappers';

export function createSupabaseUserRepository(client: AppSupabaseClient): UserRepository {
  return {
    async findAll() {
      const { data, error } = await client.from('users').select('*').order('id');
      if (error) throw error;
      return (data ?? []).map(userFromRow);
    },
    async findById(id) {
      const { data, error } = await client
        .from('users')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data ? userFromRow(data) : null;
    },
    async upsert(user) {
      const { error } = await client.from('users').upsert(userToRow(user));
      if (error) throw error;
    },
    async delete(id) {
      const { error } = await client.from('users').delete().eq('id', id);
      if (error) throw error;
    },
  };
}
