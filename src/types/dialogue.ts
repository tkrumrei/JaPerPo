import type { CefrLevel, LanguageCode } from './language';

export interface DialogueStep {
  speaker: 'ai' | 'user';
  text: string;
  transcription?: string;
  translation?: string;
  expectedAnswers?: string[];
  hints?: string[];
}

export interface Dialogue {
  id: string;
  language: LanguageCode;
  title: string;
  scenario: string;
  steps: DialogueStep[];
  level: CefrLevel;
  aiGenerated: boolean;
  createdAt: string;
}
