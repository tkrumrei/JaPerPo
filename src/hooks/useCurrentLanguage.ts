import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import type { LanguageCode } from '@/types';
import { isLanguageCode } from '@/lib/constants';
import { getLanguageConfig } from '@/languages';

export function useCurrentLanguage(): { code: LanguageCode; config: ReturnType<typeof getLanguageConfig> } | null {
  const params = useParams<{ lang?: string }>();
  return useMemo(() => {
    if (!params.lang || !isLanguageCode(params.lang)) return null;
    const code = params.lang as LanguageCode;
    return { code, config: getLanguageConfig(code) };
  }, [params.lang]);
}
