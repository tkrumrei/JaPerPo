import type {
  CefrLevel,
  ClozeText,
  Dialogue,
  LanguageCode,
  SentenceOfTheDay,
  Test,
  TestType,
  VocabularyItem,
} from '@/types';

export interface GeneratedVocabularyInput {
  language: LanguageCode;
  level: CefrLevel;
  topic?: string;
  count?: number;
}

export interface GeneratedVocabulary {
  word: string;
  translation: string;
  transcription?: string;
  exampleSentence: string;
  category?: string;
}

export interface GeneratedDialogue {
  title: string;
  scenario: string;
  steps: Dialogue['steps'];
}

export interface GeneratedReading {
  title: string;
  content: string;
  wordCount: number;
}

export interface GeneratedCloze {
  title: string;
  contentText: string;
  positions: ClozeText['positions'];
}

export interface GeneratedGrammarExample {
  text: string;
  transcription?: string;
  translation: string;
}

export interface GeneratedGrammar {
  title: string;
  explanation: string;
  examples: GeneratedGrammarExample[];
}

export interface GeneratedTest {
  title: string;
  questions: Test['questions'];
}

export interface GeneratedSentenceOfTheDay {
  texts: SentenceOfTheDay['texts'];
  explanation: string;
  highlightedWords?: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIProvider {
  generateVocabulary(input: GeneratedVocabularyInput): Promise<GeneratedVocabulary[]>;

  generateDialogue(input: {
    language: LanguageCode;
    scenario: string;
    level: CefrLevel;
  }): Promise<GeneratedDialogue>;

  generateReading(input: {
    language: LanguageCode;
    topic?: string;
    level: CefrLevel;
    minWords?: number;
  }): Promise<GeneratedReading>;

  generateCloze(input: {
    language: LanguageCode;
    source?: string;
    level: CefrLevel;
  }): Promise<GeneratedCloze>;

  explainGrammar(input: {
    language: LanguageCode;
    topic: string;
    level: CefrLevel;
  }): Promise<GeneratedGrammar>;

  generateTest(input: {
    language: LanguageCode;
    level: CefrLevel;
    type: TestType;
    count?: number;
  }): Promise<GeneratedTest>;

  generateSentenceOfTheDay(): Promise<GeneratedSentenceOfTheDay>;

  chat(input: {
    language: LanguageCode;
    history: ChatMessage[];
    message: string;
  }): Promise<string>;
}

// Re-export of the concrete provider so consumers don't need to know which one is active.
export { createGeminiProvider } from './gemini';

// Convenience helper: returns null when the backend (Supabase) is unavailable.
export type { VocabularyItem };
