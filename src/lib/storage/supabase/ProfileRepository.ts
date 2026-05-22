import type { AppSupabaseClient } from '@/lib/supabase/client';
import type { ProfileRepository } from '../repositories/ProfileRepository';
import { profileFromRow, profileToRow } from './mappers';

export function createSupabaseProfileRepository(client: AppSupabaseClient): ProfileRepository {
  return {
    async findAll() {
      const { data, error } = await client.from('profiles').select('*');
      if (error) throw error;
      return (data ?? []).map(profileFromRow);
    },
    async findByUserId(userId) {
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw error;
      return data ? profileFromRow(data) : null;
    },
    async upsert(profile) {
      const { error } = await client
        .from('profiles')
        .upsert(profileToRow(profile), { onConflict: 'user_id' });
      if (error) throw error;
    },
  };
}
