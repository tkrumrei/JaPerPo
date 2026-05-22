import type { LanguageConfig } from '../types';

export const fa: LanguageConfig = {
  code: 'fa',
  nativeName: 'فارسی',
  germanName: 'Persisch',
  flag: '🇮🇷',
  accentToken: 'fa',
  levels: { min: 'B1', max: 'C2' },
  rtl: true,
  features: {
    vocabulary: true,
    dialogues: true,
    freeChat: true,
    reading: true,
    cloze: true,
    grammar: true,
    tests: true,
    writing: true,
    transliterationToggle: true,
  },
  tagline: 'KI-gestuetzter Aufbau von B1 bis C2 — mit lateinischer Lautschrift.',
};
