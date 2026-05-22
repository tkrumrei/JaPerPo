import type { LanguageConfig } from '../types';

export const ja: LanguageConfig = {
  code: 'ja',
  nativeName: '日本語',
  germanName: 'Japanisch',
  flag: '🇯🇵',
  accentToken: 'ja',
  levels: { min: 'A1', max: 'A2' },
  rtl: false,
  features: {
    vocabulary: true,
    dialogues: true,
    freeChat: true,
    reading: true,
    cloze: false,
    grammar: true,
    tests: true,
    writing: false, // bewusst keine Schreibuebungen — Fokus auf Hoeren & Sprechen
    transliterationToggle: false,
  },
  tagline: 'Reisetaugliche Konversation — Hoeren & Sprechen, keine Schreibuebungen.',
};
