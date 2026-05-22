import type {
  CefrLevel,
  ClozeText,
  Dialogue,
  LanguageCode,
  ReadingText,
  VocabularyItem,
} from '@/types';

export interface AIProvider {
  generateVocabulary(input: {
    language: LanguageCode;
    level: CefrLevel;
    topic?: string;
    count?: number;
  }): Promise<VocabularyItem[]>;

  generateDialogue(input: {
    language: LanguageCode;
    scenario: string;
    level: CefrLevel;
  }): Promise<Dialogue>;

  generateReading(input: {
    language: LanguageCode;
    topic?: string;
    level: CefrLevel;
    minWords?: number;
  }): Promise<ReadingText>;

  generateCloze(input: {
    language: LanguageCode;
    source?: string;
    level: CefrLevel;
  }): Promise<ClozeText>;

  chat(input: {
    language: LanguageCode;
    history: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
    message: string;
  }): Promise<string>;
}

// TODO: Provider-Auswahl (OpenAI / Anthropic / Gemini / Open-Source) erfolgt
// spaeter — Implementierungen in src/lib/ai/<provider>.ts.
export const ai: AIProvider | null = null;
