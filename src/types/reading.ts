import type { CefrLevel, LanguageCode } from './language';

export interface ReadingText {
  id: string;
  language: LanguageCode;
  title: string;
  content: string;
  level: CefrLevel;
  wordCount: number;
  aiGenerated: boolean;
  createdAt: string;
}
