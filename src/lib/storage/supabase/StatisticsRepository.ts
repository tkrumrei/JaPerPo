import type { AppSupabaseClient } from '@/lib/supabase/client';
import type { StatisticsRepository } from '../repositories/StatisticsRepository';
import { statisticsFromRow, statisticsToRow } from './mappers';

export function createSupabaseStatisticsRepository(
  client: AppSupabaseClient,
): StatisticsRepository {
  return {
    async findAll() {
      const { data, error } = await client.from('statistics').select('*');
      if (error) throw error;
      return (data ?? []).map(statisticsFromRow);
    },
    async findByUserId(userId) {
      const { data, error } = await client
        .from('statistics')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw error;
      return data ? statisticsFromRow(data) : null;
    },
    async upsert(stats) {
      const { error } = await client
        .from('statistics')
        .upsert(statisticsToRow(stats), { onConflict: 'user_id' });
      if (error) throw error;
    },
  };
}
