import type { CefrLevel, LanguageCode } from './language';

export interface ClozePosition {
  index: number;
  answer: string;
  hint?: string;
}

export interface ClozeText {
  id: string;
  language: LanguageCode;
  title: string;
  contentText: string;
  positions: ClozePosition[];
  level: CefrLevel;
  aiGenerated: boolean;
  createdAt: string;
}
