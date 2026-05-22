import type { LanguageConfig } from '../types';

export const pt: LanguageConfig = {
  code: 'pt',
  nativeName: 'Português',
  germanName: 'Portugiesisch',
  flag: '🇵🇹',
  accentToken: 'pt',
  levels: { min: 'A1', max: 'C1' },
  variant: 'europe',
  rtl: false,
  features: {
    vocabulary: true,
    dialogues: true,
    freeChat: true,
    reading: true,
    cloze: true,
    grammar: true,
    tests: true,
    writing: true,
    transliterationToggle: false,
  },
  tagline: 'Alltag in Portugal — Dialoge, Lueckentexte und Grammatik im Fokus.',
};
