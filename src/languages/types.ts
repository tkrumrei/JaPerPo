import type { AccentToken, CefrLevel, LanguageCode } from '@/types';

export interface LanguageFeatures {
  vocabulary: boolean;
  dialogues: boolean;
  freeChat: boolean;
  reading: boolean;
  cloze: boolean;
  grammar: boolean;
  tests: boolean;
  writing: boolean;
  transliterationToggle: boolean;
}

export interface LanguageConfig {
  code: LanguageCode;
  nativeName: string;
  germanName: string;
  flag: string;
  accentToken: AccentToken;
  levels: { min: CefrLevel; max: CefrLevel };
  variant?: 'europe' | 'brazil';
  rtl?: boolean;
  features: LanguageFeatures;
  tagline: string;
}
