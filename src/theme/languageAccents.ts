import type { LanguageCode } from '@/types';

export interface LanguageAccent {
  name: string;
  primary: string;
  primarySoft: string;
  gradient: string;
}

export const languageAccents: Record<LanguageCode, LanguageAccent> = {
  ja: {
    name: 'Sakura',
    primary: '#ed1d59',
    primarySoft: '#ffe4ea',
    gradient: 'linear-gradient(135deg, #ff6f8b 0%, #ed1d59 100%)',
  },
  fa: {
    name: 'Tuerkis',
    primary: '#1f9c9d',
    primarySoft: '#d3f7f5',
    gradient: 'linear-gradient(135deg, #3fb6b5 0%, #156268 100%)',
  },
  pt: {
    name: 'Tinto',
    primary: '#7a1f2b',
    primarySoft: '#f5dfe2',
    gradient: 'linear-gradient(135deg, #c95e6c 0%, #7a1f2b 100%)',
  },
};
