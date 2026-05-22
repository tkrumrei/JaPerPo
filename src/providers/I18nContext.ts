import { createContext } from 'react';
import type { UiLanguage } from '@/types';
import type { Dictionary } from '@/lib/i18n/de';
import type { TranslationKey } from '@/lib/i18n';

export interface I18nContextValue {
  language: UiLanguage;
  setLanguage: (language: UiLanguage) => void;
  dict: Dictionary;
  t: (key: TranslationKey) => string;
}

export const I18nContext = createContext<I18nContextValue | null>(null);
