import type { AppSupabaseClient } from '@/lib/supabase/client';
import type { LeaderboardRepository } from '../repositories/LeaderboardRepository';
import { leaderboardFromRow, leaderboardToRow } from './mappers';

export function createSupabaseLeaderboardRepository(
  client: AppSupabaseClient,
): LeaderboardRepository {
  return {
    async findAll() {
      const { data, error } = await client
        .from('leaderboard')
        .select('*')
        .order('rank');
      if (error) throw error;
      return (data ?? []).map(leaderboardFromRow);
    },
    async findByUserId(userId) {
      const { data, error } = await client
        .from('leaderboard')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw error;
      return data ? leaderboardFromRow(data) : null;
    },
    async upsert(entry) {
      const { error } = await client
        .from('leaderboard')
        .upsert(leaderboardToRow(entry), { onConflict: 'user_id' });
      if (error) throw error;
    },
    async replaceAll(entries) {
      const { error } = await client
        .from('leaderboard')
        .upsert(entries.map(leaderboardToRow), { onConflict: 'user_id' });
      if (error) throw error;
    },
  };
}
