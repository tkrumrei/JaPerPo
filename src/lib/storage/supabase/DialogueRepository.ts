import type { AppSupabaseClient } from '@/lib/supabase/client';
import type { DialogueRepository } from '../repositories/DialogueRepository';
import { dialogueFromRow, dialogueToRow } from './mappers';

export function createSupabaseDialogueRepository(
  client: AppSupabaseClient,
): DialogueRepository {
  return {
    async findAll() {
      const { data, error } = await client.from('dialogues').select('*');
      if (error) throw error;
      return (data ?? []).map(dialogueFromRow);
    },
    async findById(id) {
      const { data, error } = await client
        .from('dialogues')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data ? dialogueFromRow(data) : null;
    },
    async upsert(dialogue) {
      const { error } = await client.from('dialogues').upsert(dialogueToRow(dialogue));
      if (error) throw error;
    },
    async delete(id) {
      const { error } = await client.from('dialogues').delete().eq('id', id);
      if (error) throw error;
    },
    async findByLanguage(language) {
      const { data, error } = await client
        .from('dialogues')
        .select('*')
        .eq('language', language);
      if (error) throw error;
      return (data ?? []).map(dialogueFromRow);
    },
  };
}
