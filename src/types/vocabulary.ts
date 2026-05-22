import type { CefrLevel, LanguageCode } from './language';

export interface VocabularyItem {
  id: string;
  language: LanguageCode;
  word: string;
  translation: string;
  transcription?: string;
  contextSentence?: string;
  exampleSentence?: string;
  difficulty: number;
  level: CefrLevel;
  category?: string;
  aiGenerated: boolean;
  createdAt: string;
}
