import { useCallback, useMemo, useState, type ReactNode } from 'react';
import type { UiLanguage } from '@/types';
import { dictionaries, translate, type TranslationKey } from '@/lib/i18n';
import { I18nContext, type I18nContextValue } from './I18nContext';

interface I18nProviderProps {
  children: ReactNode;
  defaultLanguage?: UiLanguage;
}

export function I18nProvider({ children, defaultLanguage = 'de' }: I18nProviderProps) {
  const [language, setLanguage] = useState<UiLanguage>(defaultLanguage);
  const dict = useMemo(() => dictionaries[language], [language]);
  const t = useCallback((key: TranslationKey) => translate(dict, key), [dict]);
  const value: I18nContextValue = { language, setLanguage, dict, t };
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
