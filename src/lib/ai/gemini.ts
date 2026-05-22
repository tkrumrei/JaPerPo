import type { UserId } from '@/types';
import { supabase } from '@/lib/supabase/client';
import type {
  AIProvider,
  GeneratedCloze,
  GeneratedDialogue,
  GeneratedGrammar,
  GeneratedReading,
  GeneratedSentenceOfTheDay,
  GeneratedTest,
  GeneratedVocabulary,
} from './index';

type Action =
  | 'vocab'
  | 'dialogue'
  | 'reading'
  | 'cloze'
  | 'chat'
  | 'grammar'
  | 'test'
  | 'sentence_of_day';

async function callEdgeFunction<T>(
  userId: UserId,
  action: Action,
  payload: unknown,
): Promise<T> {
  if (!supabase) {
    throw new Error('Supabase nicht konfiguriert — KI-Aufrufe sind nicht moeglich.');
  }
  const { data, error } = await supabase.functions.invoke('ai-generate', {
    body: { userId, action, payload },
  });
  if (error) {
    throw new Error(`Edge Function fehlgeschlagen: ${error.message}`);
  }
  const result = data as { ok: boolean; data?: T; error?: string };
  if (!result.ok) {
    throw new Error(result.error ?? 'Unbekannter KI-Fehler');
  }
  return result.data as T;
}

export function createGeminiProvider(userId: UserId): AIProvider {
  return {
    async generateVocabulary(input) {
      return callEdgeFunction<GeneratedVocabulary[]>(userId, 'vocab', input);
    },
    async generateDialogue(input) {
      return callEdgeFunction<GeneratedDialogue>(userId, 'dialogue', input);
    },
    async generateReading(input) {
      return callEdgeFunction<GeneratedReading>(userId, 'reading', input);
    },
    async generateCloze(input) {
      return callEdgeFunction<GeneratedCloze>(userId, 'cloze', input);
    },
    async explainGrammar(input) {
      return callEdgeFunction<GeneratedGrammar>(userId, 'grammar', input);
    },
    async generateTest(input) {
      return callEdgeFunction<GeneratedTest>(userId, 'test', input);
    },
    async generateSentenceOfTheDay() {
      return callEdgeFunction<GeneratedSentenceOfTheDay>(userId, 'sentence_of_day', {
        language: 'pt', // Sprache wird im Prompt ignoriert (alle drei werden generiert)
      });
    },
    async chat(input) {
      return callEdgeFunction<string>(userId, 'chat', input);
    },
  };
}
